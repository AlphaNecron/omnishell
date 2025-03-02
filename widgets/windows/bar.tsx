import {App, Astal, Gdk, Gtk} from 'astal/gtk4';
import ModulesLeft from '@widget/modules-left';
import ModulesRight from '@widget/modules-right';
import {register} from 'astal/gobject';

const {TOP, LEFT, BOTTOM} = Astal.WindowAnchor;

@register({GTypeName: 'Bar'})
export default class Bar extends Astal.Window {
	constructor(mon: Gdk.Monitor) {
		super({
			visible: true,
			application: App,
			gdkmonitor: mon,
			exclusivity: Astal.Exclusivity.EXCLUSIVE,
			anchor: TOP | BOTTOM | LEFT,
			cssClasses: ['bar'],
			widthRequest: 48,
			child:
					<centerbox orientation={Gtk.Orientation.VERTICAL} marginTop={8} marginBottom={8}>
						<ModulesLeft mon={mon}/>
						<box/>
						<ModulesRight mon={mon}/>
					</centerbox>
		});
	}
}