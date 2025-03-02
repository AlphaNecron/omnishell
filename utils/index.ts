import Noti from 'gi://Notify';
import {Gio, GLib, Variable} from 'astal';

Noti.init('omnishell');

export function ensureDirectory(path: string) {
	if (!GLib.file_test(path, GLib.FileTest.EXISTS))
		Gio.File.new_for_path(path).make_directory_with_parents(null);
}

export function notifySend({
	                           appName,
	                           appIcon,
	                           urgency = Noti.Urgency.NORMAL,
	                           image,
	                           icon,
	                           summary,
	                           body,
	                           actions
                           }: {
	appName?: string;
	appIcon?: string;
	urgency?: Noti.Urgency;
	image?: string;
	icon?: string;
	summary: string;
	body: string;
	actions?: {
		[label: string]: () => void;
	};
}) {
	const noti = new Noti.Notification({
		appName,
		appIcon,
		summary,
		body
	});
	if (icon || image)
		noti.set_hint_string('image-path', (icon || image)!);
	noti.set_urgency(urgency);
	if (actions)
		for (const [label, action] of Object.entries(actions))
			noti.add_action(label, label, action);
	noti.show();
	return;
}

export const now = () =>
		GLib.DateTime.new_now_local().format('%Y-%m-%d_%H-%M-%S');

export const time = Variable(GLib.DateTime.new_now_local()).poll(1000, () => GLib.DateTime.new_now_local());

export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));