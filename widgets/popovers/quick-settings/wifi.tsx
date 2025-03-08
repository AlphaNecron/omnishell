import {bind, Variable} from 'astal';
import Network from 'gi://AstalNetwork';
import {b, BasePage, List} from './common';
import {netWirelessSubstitutes} from '@utils/icons';
import {Gtk} from 'astal/gtk4';
import Adw from 'gi://Adw';
import Status from '@widget/status';
import {tryExec} from '@utils/index';

const net = Network.get_default();

export const qsTile = {
	icon: b(bind(net, 'wifi').prop('enabled').as(e => e ? 'network_wifi' : 'signal_wifi_off')),
	text: b(bind(net, 'wifi').prop('activeAccessPoint').as(ap => ap ? bind(ap, 'ssid') : 'WiFi')),
	active: b(bind(net, 'wifi').prop('enabled')),
	tag: 'wifi'
};

export function Page() {
	;
	const canScan = Variable.derive([
		bind(net, 'wifi').prop('enabled'),
		bind(net, 'wifi').prop('scanning')
	], (enabled, scanning) => enabled && !scanning);
	const state = Variable.derive([
		bind(net, 'wifi').prop('enabled'),
		bind(net, 'wifi').prop('scanning')
	], (enabled, scanning) => enabled ? scanning ? 'scanning' : 'enabled' : 'disabled');
	return (
			<BasePage title='WiFi' tag='wifi' actions={[
				<button cssClasses={['icon']} sensitive={canScan()}
				        onClicked={() => net.wifi.scan()}>
					{bind(net, 'wifi').prop('scanning').as(s => s
							? <Adw.Spinner halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER} widthRequest={16} heightRequest={16}/>
							: 'refresh'
					)}
				</button>,
				<switch active={bind(net, 'wifi').prop('enabled')} valign={Gtk.Align.CENTER}
				        onNotifyActive={self => net.wifi.enabled = self.active}/>
			]} onDestroy={() => {
				canScan.drop();
				state.drop();
			}}>
				<stack visibleChildName={state()}>
					<Status icon='wifi_off' name='disabled'
					        title='WiFi is disabled'/>
					<Adw.Spinner name='scanning' valign={Gtk.Align.CENTER} heightRequest={48}/>
					<List name='enabled' items={bind(net.wifi, 'accessPoints')} render={ap => (
							<box spacing={8}>
								<label cssClasses={['icon']}>{bind(ap, 'iconName').as(ic => netWirelessSubstitutes[ic])}</label>
								<box vertical hexpand
								     halign={Gtk.Align.START}>
									<label useMarkup>{bind(ap, 'ssid').as(ssid => ssid || '<i>???</i>')}</label>
									{bind(net.wifi, 'activeAccessPoint').as(active => active?.bssid === ap.bssid ? (
											<label halign={Gtk.Align.START} cssClasses={['status']}>Active</label>
									) : <></>)}
								</box>
								<box spacing={4} cssClasses={['actions', 'icon']}>
									{bind(net.wifi, 'activeAccessPoint').as(active => active?.bssid === ap.bssid ? (
											<>
												<button valign={Gtk.Align.CENTER} tooltipText='Disconnect'
												        onClicked={async () => await tryExec(['nmcli', 'device', 'disconnect', net.wifi.device.ipInterface])}>
													link_off
												</button>
											</>
									) : (
											<>
												<button valign={Gtk.Align.CENTER} tooltipText='Connect'
												        onClicked={async () => await tryExec(['nmcli', 'device', 'wifi', 'connect', ap.bssid])}>
												link
												</button>
											</>
									))}
								</box>
							</box>
					)}/>
				</stack>
			</BasePage>
	);
}