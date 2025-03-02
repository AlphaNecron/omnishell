import GObject, {GLib, property, register} from 'astal/gobject';
import {Gio, interval, Process, Time} from 'astal';
import {ensureDirectory, now, sleep} from '@utils/index';
import Hyprland from 'gi://AstalHyprland';

const HOME = GLib.get_home_dir();

@register({GTypeName: 'ScreenRecord'})
export default class ScreenRecord extends GObject.Object {
	static instance: ScreenRecord;
	hypr = Hyprland.get_default();
	
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
		const dimensions = this.hypr.monitors.map(m => m.activeWorkspace.clients).flat().map(c => `${c.x},${c.y} ${c.width}x${c.height}`);
		const p = Gio.Subprocess.new([
			'slurp',
			'-c', '#00000000',
			// '#cba6f7',
			'-d',
			'-F', 'Fantasque Sans Mono',
			'-o'
		], Gio.SubprocessFlags.STDOUT_PIPE | Gio.SubprocessFlags.STDERR_MERGE | Gio.SubprocessFlags.STDIN_PIPE);
		const r = p.communicate_utf8(dimensions.join('\n'), null);
		return r[1].trim();
	}
	
	async freeze() {
		try {
			Process.exec('killall -w wayfreeze');
		} catch {
		}
		const p = Process.subprocessv(['wayfreeze', '--hide-cursor']);
		await sleep(100);
		return () => p.kill();
	}
	
	async screenshot() {
		const defreeze = await this.freeze();
		const region = await this.getRegion();
		if (!region) return;
		const file = `${this.#screenshots}/${now()}.png`;
		const out = Process.execv([
			'grim',
			'-g', region,
			'-o',
			file
		]);
		defreeze();
		// notifySend();
	}
	
	async start() {
		if (this.recording) return;
		new Process({});
		ensureDirectory(this.#recordings);
		this.#file = `${this.#recordings}/${now()}.mp4`;
		const region = await this.getRegion();
		if (!region) return;
		
		this.#proc = Process.subprocessv([
			'wl-screenrec',
			'-g',
			`${region}`,
			'--low-power=off',
			'--codec=hevc',
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
		Process.exec('killall -INT wl-screenrec');
		this.dispose();
	}
	
	private dispose() {
		this.#proc?.run_dispose();
		this.#proc = null;
		this.#interval?.cancel();
		this.#fps = 0;
		this.notify('recording');
	}
}