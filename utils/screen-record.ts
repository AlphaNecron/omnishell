import GObject, {GLib, property, register} from 'astal/gobject';
import {Gio, interval, Process, Time} from 'astal';
import {ensureDirectory, notifySend, now, showInFiles, sleep, tryExec} from '.';
import Hyprland from 'gi://AstalHyprland';
import {execAsync} from 'astal/process';

const HOME = GLib.get_home_dir();

@register({GTypeName: 'ScreenRecord'})
export default class ScreenRecord extends GObject.Object {
	static instance: ScreenRecord;
	#hypr = Hyprland.get_default();
	
	static get_default() {
		if (!this.instance) this.instance = new ScreenRecord();
		return this.instance;
	}
	
	#recordings = `${HOME}/Videos/Recordings`;
	#screenshots = `${HOME}/Pictures/Screenshots`;
	#file = '';
	#interval?: Time;
	#timer = 0;
	#proc: Process | null = null;
	#fps = 0;
	
	@property(Boolean)
	get recording() {
		return this.#proc !== null;
	}
	
	@property(Number)
	get timer() {
		return this.#timer;
	}
	
	@property(Number)
	get fps() {
		return this.#fps;
	}
	
	private async getRegion() {
		return Gio.Subprocess.new([
					'slurp',
					'-c', '#00000000',
					// '#cba6f7',
					'-d',
					'-F', 'Fantasque Sans Mono',
					'-o'
				], Gio.SubprocessFlags.STDOUT_PIPE | Gio.SubprocessFlags.STDIN_PIPE)
				.communicate_utf8(
						this.#hypr.monitors
								.map(m => m.activeWorkspace.clients)
								.flat()
								.map(c => `${c.x},${c.y} ${c.width}x${c.height}`)
								.join('\n'), null)[1].trim();
	}
	
	async freeze() {
		await tryExec(['killall', '-w', 'wayfreeze']);
		const p = Process.subprocessv(['wayfreeze', '--hide-cursor']);
		await sleep(100);
		return () => p.kill();
	}
	
	async screenshot() {
		if (await tryExec(['pgrep', '-x', 'slurp|wayfreeze|satty']))
			return;
		console.log((await tryExec(['pgrep', '-x', 'slurp|wayfreeze|satty'])) ? 'true' : 'false');
		const defreeze = await this.freeze();
		const region = await this.getRegion();
		if (!region) return defreeze();
		const n = now();
		const file = `${this.#screenshots}/${n}.jpg`;
		await execAsync([
			'grim',
			'-g', region,
			'-t', 'jpeg',
			file
		]);
		defreeze();
		notifySend({
			appIcon: 'screenshot',
			summary: 'Screenie taken',
			body: `Copied to clipboard!\nSaved as <b>${file}</b>.`,
			image: file,
			actions: {
				'Annotate': () => execAsync(['satty', '-o', `${this.#screenshots}/${n}-annotated.png`, '-f', file]),
				'Show in Files': () => showInFiles(file)
			},
			hints: {
				'md-icon': 'photo_camera'
			}
		});
	}
	
	async start(stopIfRecording: boolean) {
		if (this.recording) {
			if (stopIfRecording) await this.stop();
			return;
		}
		await tryExec('killall -INT wl-screenrec');
		ensureDirectory(this.#recordings);
		this.#file = `${this.#recordings}/${now()}.mp4`;
		const region = await this.getRegion();
		if (!region) return;
		
		this.#proc = Process.subprocessv([
			'wl-screenrec',
			'-g',
			`${region}`,
			'--low-power=off',
			'-b', '1 MB',
			'--codec=avc',
			// '--audio',
			'-f',
			this.#file
		]);
		
		this.#proc.connect('exit', () => this.dispose());
		
		const fpsPattern = /[0-9]+ fps/i;
		
		this.#proc.connect('stderr', (_, err) => console.debug(err));
		
		this.#proc.connect('stdout', (_, out) => {
			console.debug(out);
			if (fpsPattern.test(out)) {
				this.#fps = Number(out.split(' ')[0]);
				this.notify('fps');
			}
		});
		
		this.notify('recording');
		
		this.#timer = 0;
		this.#interval = interval(1000, () => {
			this.notify('timer');
			this.#timer++;
		});
	}
	
	async stop() {
		if (!this.recording) return;
		// send SIGINT all wl-screenrec processes
		await tryExec('killall -INT wl-screenrec');
		const f = this.#file;
		this.dispose();
		await execAsync(['ffmpeg', '-ss', '00:00:01.00', '-i', f, '-vf', 'scale=200:200:force_original_aspect_ratio=decrease', '-vframes', '1', `${f}.jpg`]);
		await notifySend({
			appIcon: 'screenshot',
			summary: 'Recording saved',
			body: `Saved as <b>${f}</b>.`,
			image: `${f}.jpg`,
			actions: {
				'Show in Files': () => showInFiles(f)
			},
			hints: {
				'md-icon': 'videocam'
			}
		});
	}
	
	private dispose() {
		this.#proc?.run_dispose();
		this.#proc = null;
		this.#interval?.cancel();
		this.#fps = 0;
		this.#file = '';
		this.notify('recording');
	}
}