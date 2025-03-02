import {bind, Variable} from 'astal';
import Network from 'gi://AstalNetwork';
import {b, BasePage, List} from './common';
import {netWirelessSubstitutes} from '@utils/icons';
import {Gtk} from 'astal/gtk4';
import Adw from 'gi://Adw';

const net = Network.get_default();

export const qsTile = {
	icon: b(bind(net, 'wifi').prop('enabled').as(e => e ? 'network_wifi' : 'signal_wifi_off')),
	text: b(bind(net, 'wifi').prop('activeAccessPoint').as(ap => ap ? bind(ap, 'ssid') : 'WiFi')),
	active: b(bind(net, 'wifi').prop('enabled')),
	tag: 'wifi'
};

export function Page() {
	const aps = Variable.derive([
		bind(net, 'wifi').prop('accessPoints'),
		bind(net, 'wifi').prop('activeAccessPoint')
	], (aps, active) => {
		return aps;
	});
	const canScan = Variable.derive([
		bind(net, 'wifi').prop('enabled'),
		bind(net, 'wifi').prop('scanning')
	], (enabled, scanning) => enabled && !scanning);
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
				        onNotifyActive={self => {
					        if (self.active !== net.wifi.enabled)
						        net.wifi.enabled = self.active;
				        }}/>
			]}>
				<List onDestroy={() => {
					aps.drop();
					canScan.drop();
				}} items={aps()} render={ap => (
						<box spacing={8}>
							<label cssClasses={['icon']}>{netWirelessSubstitutes[ap.iconName]}</label>
							<label>{ap.ssid}</label>
						</box>
				)} renderContent={ap => (
						<button>
							connect
						</button>
				)} heightRequest={bind(net, 'wifi').prop('accessPoints').as(aps => Math.min(240, aps.length * 40))}/>
			</BasePage>
	);
};