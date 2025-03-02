import Tray from 'gi://AstalTray';
import {bind} from 'astal';
import {Gtk} from 'astal/gtk4';

const tray = Tray.get_default();

export default function TrayModule() {
	return (
			<box cssClasses={['module-tray']} orientation={Gtk.Orientation.VERTICAL}>
				{bind(tray, 'items').as(items => items.map(it => (
						<menubutton tooltipMarkup={bind(it, 'tooltipMarkup')} menuModel={bind(it, 'menuModel')}
						            setup={self => self.insert_action_group('dbusmenu', it.actionGroup)} direction={Gtk.ArrowType.RIGHT}>
							<image gicon={bind(it, 'gicon')}>
								{bind(it, 'title')}
							</image>
						</menubutton>
				)))}
			</box>
	);
}