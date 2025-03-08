#!/usr/bin/gjs -m

import {App, Astal, Gdk} from 'astal/gtk4';
import style from './styles/main.scss';
import Bar from '@widget/windows/bar';
import ScreenRecord from '@utils/screen-record';
import Hyprland from 'gi://AstalHyprland';
import {Container as NotiContainer} from '@widget/windows/notifications';

const hypr = Hyprland.get_default();

function initMon(m?: Gdk.Monitor): Astal.Window[] {
	if (!m) return [];
	return [
		new Bar(m),
		new NotiContainer(m)
	];
}

App.start({
	css: style,
	instanceName: 'omnishell',
	main() {
		const mons = new Map<number, Astal.Window[]>();
		const gdkMons = App.get_monitors();
		for (const mon of hypr.monitors) mons.set(mon.id, initMon(gdkMons.find(d => d.connector === mon.name)));
		hypr.connect('monitor-added', (_, mon) => {
			const m = App.get_monitors().find(m => m.connector === mon.name);
			if (!m) return;
			return mons.set(mon.id, initMon(m));
		});
		hypr.connect('monitor-removed', (_, mon) => {
			mons.get(mon)?.forEach(m => m?.destroy());
			mons.delete(mon);
		});
	},
	async requestHandler(req: string, res: (response: any) => void) {
		const sr = ScreenRecord.get_default();
		console.log(req);
		switch (req) {
			case 'screenrec':
				await sr.start(true).catch();
				res('ok');
				break;
			case 'screenshot':
				await sr.screenshot().finally(() => res('ok'));
				break;
			default:
				res('okn\'t');
				break;
		}
	}
});
