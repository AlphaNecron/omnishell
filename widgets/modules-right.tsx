import {type Gdk, Gtk} from 'astal/gtk4';
import SystemModule from '@widget/modules/system';
import TrayModule from '@widget/modules/tray';
import AudioModule from '@widget/modules/audio';
import ScreenRecModule from '@widget/modules/screen-rec';
import TimeModule from '@widget/modules/time';

export default function ModulesRight({mon}: { mon: Gdk.Monitor }) {
	// use nested box to avoid reserved space when screen-rec isn't revealed
	return (
			<box orientation={Gtk.Orientation.VERTICAL}>
				<box spacing={8} orientation={Gtk.Orientation.VERTICAL}>
					<SystemModule/>
					<AudioModule/>
					<TimeModule/>
					<TrayModule/>
				</box>
				<ScreenRecModule/>
			</box>
	);
}