import Battery from 'gi://AstalBattery';
import {bind, Variable} from 'astal';
import Network from 'gi://AstalNetwork';
import Bluetooth from 'gi://AstalBluetooth';
import QuickSettings from '@widget/popovers/quick-settings';
import {batChargingIcons, batIcons, netWiredSubstitutes, netWirelessSubstitutes} from '@utils/icons';
import {Gtk} from 'astal/gtk4';
import type Adw from 'gi://Adw';

const {State, BatteryLevel} = Battery;

const batFullyCharged = '󰂄';
const batNone = '󱉝';

const battery = Battery.get_default();

function BatIcon() {
	const batPerc = bind(battery, 'percentage');
	const batIcon = Variable.derive([
		bind(battery, 'percentage'),
		bind(battery, 'isBattery'),
		bind(battery, 'state')
	], (perc, isBat, state) => {
		if (state === State.FULLY_CHARGED)
			return batFullyCharged;
		if (!isBat)
			return batNone;
		const lvl = Math.round(perc * 10);
		return state === State.CHARGING ? batChargingIcons[lvl] : batIcons[lvl];
	});
	return (
			<label onDestroy={() => batIcon.drop()} cssClasses={['icon']} widthRequest={16}
			       tooltipText={batPerc.as(perc => `${Math.round(perc * 100)}%`)}>
				{batIcon()}
			</label>
	);
}

const net = Network.get_default();

const {Connectivity, Primary} = Network;

function NetworkIcon() {
	const netIcon = Variable.derive([
		bind(net, 'primary'),
		bind(net, 'wifi').prop('iconName'),
		bind(net, 'wired').prop('iconName')
	], (mode, wfIcon, wrIcon) => {
		if (mode === Primary.WIFI)
			return netWirelessSubstitutes[wfIcon];
		if (mode === Primary.WIRED)
			return netWiredSubstitutes[wrIcon];
	});
	const netLabel = Variable.derive([
				bind(net, 'primary'),
				bind(net, 'wifi').prop('ssid'),
				bind(net, 'wired').prop('device').prop('physicalPortId')
			], (mode, wfSsid, wrPort) =>
					mode === Primary.WIFI
							? wfSsid
							: mode === Primary.WIRED
									? wrPort
									: ''
	);
	return (
			<label onDestroy={() => {
				netIcon.drop();
				netLabel.drop();
			}} cssClasses={['icon']} tooltipText={netLabel()}>
				{netIcon()}
			</label>
	);
}

const bluetooth = Bluetooth.get_default();

function BluetoothIcon() {
	const btIcon = Variable.derive([
		bind(bluetooth, 'isPowered'),
		bind(bluetooth, 'isConnected')
	], (powered, connected) => {
		if (connected)
			return 'bluetooth_connected';
		return powered ? 'bluetooth' : 'bluetooth_disabled';
	});
	return (
			<label cssClasses={['icon']} onDestroy={() => btIcon.drop()}>
				{btIcon()}
			</label>
	);
}

export default function SystemModule() {
	return (
			<menubutton direction={Gtk.ArrowType.RIGHT} cssClasses={['module-system']}>
				<box marginTop={2} marginBottom={2} spacing={6} vertical halign={Gtk.Align.CENTER}>
					<BluetoothIcon/>
					<NetworkIcon/>
					<BatIcon/>
				</box>
				<popover cssClasses={['popover-quick-settings']} onNotifyVisible={self => {
					(self.get_child() as Adw.NavigationView).pop_to_tag('main');
				}}>
					<QuickSettings/>
				</popover>
			</menubutton>
	);
}