import {type Gdk} from 'astal/gtk4';
import SystemModule from '@widget/modules/system';
import TrayModule from '@widget/modules/tray';
import AudioModule from '@widget/modules/audio';
import ScreenRecModule from '@widget/modules/screen-rec';
import TimeModule from '@widget/modules/time';
import {Page as PageBluetooth} from '@widget/popovers/quick-settings/wifi';

export default function ModulesRight({mon}: { mon: Gdk.Monitor }) {
	// use nested box to avoid reserved space when screen-rec isn't revealed
	return (
			<box vertical>
				<box spacing={8} vertical>
					<SystemModule/>
					<AudioModule/>
					<TimeModule/>
					<TrayModule/>
					{/*<box cssClasses={['popover-quick-settings']}>*/}
					{/*	<box cssClasses={['page']}>*/}
					{/*		<PageBluetooth/>*/}
					{/*	</box>*/}
					{/*</box>*/}
				</box>
				<ScreenRecModule/>
			</box>
	);
}