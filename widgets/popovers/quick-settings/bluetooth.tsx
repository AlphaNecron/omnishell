import {bind, Variable} from 'astal';
import {b, BasePage, List} from './common';
import Bluetooth from 'gi://AstalBluetooth';
import {Gtk} from 'astal/gtk4';
import {batIcons} from '@utils/icons';

const bt = Bluetooth.get_default();

export const qsTile = {
	icon: b(Variable.derive([
		bind(bt, 'isPowered'),
		bind(bt, 'isConnected')
	], (powered, connected) => powered ? connected ? 'bluetooth_connected' : 'bluetooth' : 'bluetooth_disabled')),
	active: b(bind(bt, 'isPowered')),
	text: b('Bluetooth'),
	// text: Variable.derive([
	// 	bind(bt, 'isConnected'),
	// 	bind(bt, 'devices').as(devs => devs.find(d => d.connected)).as(dev => dev ? bind(dev, 'name') : null)
	// ], (connected, dev) => (connected && dev) ? dev : 'Bluetooth'),
	tag: 'bluetooth'
};

export function Page() {
	const canDiscover = Variable.derive([
		bind(bt, 'adapter').prop('powered'),
		bind(bt, 'adapter').prop('discovering')
	], (powered, discovering) => powered && !discovering);
	return (
			<BasePage title='Bluetooth' tag='bluetooth' actions={[
				<button cssClasses={['icon']}
				        sensitive={canDiscover()}
				        onClicked={() => {
					        if (bt.adapter.discovering)
						        bt.adapter.stop_discovery();
					        else bt.adapter.start_discovery();
				        }}>
					{bind(bt, 'adapter').prop('discovering').as(d => d
							? 'stop_circle'
							: 'bluetooth_searching'
					)}
				</button>,
				<switch active={bind(bt, 'isPowered')} valign={Gtk.Align.CENTER}
				        onNotifyActive={self => {
					        if (self.active !== bt.adapter.powered)
						        bt.adapter.powered = self.active;
				        }}/>
			]}>
				<List items={bind(bt, 'devices').as(devs => devs.sort((a, b) => a.connected ? 1 : b.connected ? -1 : 0))}
				      onDestroy={() => {
					      canDiscover.drop();
				      }}
				      render={dev => (
						      <box spacing={8}>
							      <image iconName={bind(dev, 'icon')} cssClasses={['device-icon']}/>
							      <label hexpand halign={Gtk.Align.START}>
								      {dev.name}
							      </label>
							      <box halign={Gtk.Align.END} visible={bind(dev, 'connected')} spacing={4}
							           tooltipText={bind(dev, 'batteryPercentage').as(perc => `${Math.round(perc * 100)}%`)}>
								      <label cssClasses={['icon']}>
									      {bind(dev, 'batteryPercentage').as(perc => batIcons[Math.round(perc * 10)])}
								      </label>
							      </box>
						      </box>
				      )} renderContent={dev => (<button>connect</button>)}
				      heightRequest={bind(bt, 'devices').as(devs => Math.min(240, devs.length * 40))}/>
			</BasePage>
	);
}