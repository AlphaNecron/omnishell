import {bind, Variable} from 'astal';
import {b, BasePage, List} from './common';
import Bluetooth from 'gi://AstalBluetooth';
import {Gtk} from 'astal/gtk4';
import {batIcons} from '@utils/icons';
import Adw from 'gi://Adw';
import Status from '@widget/status';

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
	const state = Variable.derive([
		bind(bt, 'adapter').prop('powered'),
		bind(bt, 'adapter').prop('discovering')
	], (powered, discovering) => powered ? discovering ? 'discovering' : 'enabled' : 'disabled');
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
				        onNotifyActive={self => bt.adapter.powered = self.active}/>
			]} onDestroy={() => {
				canDiscover.drop();
				state.drop();
			}}>
				<stack visibleChildName={state()}>
					<Status icon='bluetooth_disabled' name='disabled'
					        title='Bluetooth is disabled'/>
					<Adw.Spinner name='scanning' valign={Gtk.Align.CENTER} heightRequest={48}/>
					<List name='enabled'
					      items={bind(bt, 'devices').as(devs => devs.sort((a, b) => (a.connected && a.connected === b.connected) ? a.alias.localeCompare(b.alias) : a.connected ? -1 : 1))}
					      render={dev => {
						      return (
								      <box spacing={12}>
									      {bind(dev, 'connecting').as(connecting => connecting ? (
											      <Adw.Spinner cssClasses={['device-icon']} valign={Gtk.Align.CENTER}/>
									      ) : (
											      <image iconName={bind(dev, 'icon')} valign={Gtk.Align.CENTER}
											             cssClasses={bind(dev, 'connected').as(c => ['device-icon', c ? 'connected' : ''])}/>
									      ))}
									      <box vertical valign={Gtk.Align.CENTER}>
										      <label hexpand halign={Gtk.Align.START}>
											      {bind(dev, 'alias')}
										      </label>
										      <box visible={bind(dev, 'connected')} spacing={4} cssClasses={['battery']}>
											      <label
													      cssClasses={['icon']}>{bind(dev, 'batteryPercentage').as(perc => batIcons[Math.round(perc * 10)])}</label>
											      {bind(dev, 'batteryPercentage').as(perc => `${Math.round(perc * 100)}%`)}
										      </box>
									      </box>
								      </box>
						      );
					      }}/>
				</stack>
			</BasePage>
	);
}