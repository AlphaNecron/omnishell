import {Gio, GLib, Variable} from 'astal';
import {execAsync} from 'astal/process';

export function ensureDirectory(path: string) {
	if (!GLib.file_test(path, GLib.FileTest.EXISTS))
		Gio.File.new_for_path(path).make_directory_with_parents(null);
}

function getValueType(v: any) {
	switch (typeof v) {
		case 'string':
		case 'boolean':
			return typeof v;
		case 'number':
			return Math.floor(v) === v ? 'int' : 'double';
	}
}

export async function notifySend({
	                                 appName,
	                                 appIcon,
	                                 urgency = 'normal',
	                                 image,
	                                 icon,
	                                 summary,
	                                 body,
	                                 actions,
	                                 hints
                                 }: {
	appName?: string;
	appIcon?: string;
	urgency?: 'low' | 'normal' | 'critical';
	image?: string;
	icon?: string;
	summary: string;
	body: string;
	actions?: Record<string, () => void>;
	hints?: Record<string, any>;
}) {
	const _actions = Object.fromEntries(Object.entries(actions || {})
			.map(([k, v], i) => [i, {
				label: k,
				callback: v
			}]));
	await execAsync(
			[
				'notify-send',
				'-u', urgency,
				appIcon ? ['-i', appIcon] : [],
				'-h', `string:image-path:${icon || image}`,
				...Object.entries(hints || {}).map(([k, v]) => {
					const t = getValueType(v);
					return t ? ['-h', `${t}:${k}:${v}`] : [];
				}),
				`${summary ?? ''}`,
				`${body ?? ''}`,
				'-a', `${appName ?? ''}`,
				...Object.entries(_actions).map(([k, v]) =>
						['--action', `${k}=${v.label}`])
			].flat()
	)
			.then((out) => _actions[out.trim()]?.callback())
			.catch(console.error);
}

export const now = () =>
		GLib.DateTime.new_now_local().format('%Y-%m-%d_%H-%M-%S');

export const time = Variable(GLib.DateTime.new_now_local()).poll(1000, () => GLib.DateTime.new_now_local());

export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const showInFiles = (f: string) => execAsync(`gdbus call --session --dest org.freedesktop.FileManager1 --object-path /org/freedesktop/FileManager1 --method org.freedesktop.FileManager1.ShowItems "['file://${f}']" ""`);

export const tryExec = (cmd: string | string[]) => execAsync(cmd).then(() => true).catch(() => false);