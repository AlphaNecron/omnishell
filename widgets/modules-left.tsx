import HyprlandModule from '@widget/modules/hyprland';
import {Gdk, Gtk} from 'astal/gtk4';

export default function ModulesLeft({mon}: { mon: Gdk.Monitor }) {
	return (
			<box spacing={8} orientation={Gtk.Orientation.VERTICAL}>
				<HyprlandModule mon={mon}/>
			</box>
	);
}