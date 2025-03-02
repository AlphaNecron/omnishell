#!/usr/bin/gjs -m

import {App, Astal} from 'astal/gtk4';
import style from './styles/main.scss';
import Bar from '@widget/windows/bar';
import ScreenRecord from '@utils/screen-record';
import Hyprland from 'gi://AstalHyprland';

const hypr = Hyprland.get_default();

App.start({
	css: style,
	instanceName: 'omnishell',
	main() {
		const bars = new Map<number, Astal.Window>();
		const gdkMons = App.get_monitors();
		for (const mon of hypr.monitors) bars.set(mon.id, new Bar(gdkMons.find(d => d.connector === mon.name)!));
		hypr.connect('monitor-added', (_, mon) => {
			const m = App.get_monitors().find(m => m.connector === mon.name);
			if (!m) return;
			return bars.set(mon.id, new Bar(m));
		});
		hypr.connect('monitor-removed', (_, mon) => {
			bars.get(mon)?.destroy();
			bars.delete(mon);
		});
	},
	async requestHandler(request: string, res: (response: any) => void) {
		const sr = ScreenRecord.get_default();
		switch (request) {
			case 'screenrec':
				res('ok');
				await sr.start().catch();
				break;
			case 'screenshot':
				res('ok');
				await sr.screenshot();
				break;
				// case 'screenshot-select':
				// 	res('ok');
				// 	await sr.screenshot();
				// 	break;
			default:
				res('okn\'t');
				break;
		}
	}
});
