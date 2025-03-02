import Adw from 'gi://Adw';
import {Gdk, Gtk} from 'astal/gtk4';
import {bind, GLib} from 'astal';
import ValueSlider from '@widget/value-slider';
import Brightness from '@utils/brightness';
import {brightnessIcons, kbdIcons} from '@utils/icons';
import {chunkify} from './common';
import {Page as PageBluetooth, qsTile as tileBluetooth} from './bluetooth';
import {Page as PageWiFi, qsTile as tileWifi} from './wifi';
import {qsTile as tilePowProf} from './power-profile';

const brightness = Brightness.get_default();

function MainPage() {
	const qsTiles = chunkify([
		tileWifi,
		tileBluetooth,
		tilePowProf
	], 2);
	return (
			<Adw.NavigationPage title='Quick settings' cssClasses={['qs-main-page']}>
				<box orientation={Gtk.Orientation.VERTICAL} spacing={8}>
					{qsTiles.map(chunk => (
							<box homogeneous spacing={8}>
								{chunk.map(tile => (
										<button heightRequest={48} cursor={Gdk.Cursor.new_from_name('pointer', null)}
										        cssClasses={tile.active.val.as(a => ['qs-tile', a ? 'active' : ''])}
										        {...(tile.tag ? {
											        actionName: 'navigation.push',
											        actionTarget: GLib.Variant.new_string(tile.tag)
										        } : {
											        onClicked: tile.action
										        })}
										        onDestroy={() => {
											        tile.icon.destroy?.();
											        tile.text.destroy?.();
											        tile.active.destroy?.();
										        }}>
											<box spacing={6}>
												<label cssClasses={['icon']}>
													{tile.icon.val}
												</label>
												<box orientation={Gtk.Orientation.VERTICAL} valign={Gtk.Align.CENTER}>
													{/*{typeof tile.text === 'function' ? (*/}
													{/*		<label cssClasses={['text']} onDestroy={() => {*/}
													{/*			if (typeof tile.text === 'function')*/}
													{/*				tile.text.drop();*/}
													{/*		}}>*/}
													{/*			{bind(tile.text())}*/}
													{/*		</label>*/}
													{/*) : (*/}
													<label cssClasses={['text']}>
														{tile.text.val}
													</label>
													{/*)}*/}
												</box>
											</box>
										</button>
								))}
							</box>
					))}
					<box orientation={Gtk.Orientation.VERTICAL} cssClasses={['qs-controls']} spacing={4}>
						<ValueSlider
								icon={bind(brightness, 'screen').as(s => brightnessIcons[Math.floor((s / brightness.screenMax) * (brightnessIcons.length - 1))])}
								max={brightness.screenMax} min={0} handleChange={v => brightness.screen = v}
								value={bind(brightness, 'screen')}/>
						<ValueSlider
								icon={bind(brightness, 'kbd').as(s => s === 0 ? kbdIcons.off : s === brightness.kbdMax ? kbdIcons.high : kbdIcons.normal)}
								max={brightness.kbdMax} min={0} roundDigits={0}
								handleChange={v => brightness.kbd = v} value={bind(brightness, 'kbd')}/>
					</box>
				</box>
			</Adw.NavigationPage>
	);
}

export default function QuickSettings() {
	const navView = new Adw.NavigationView({
		hexpand: true,
		widthRequest: 320
	});
	const pages = [
		MainPage(),
		PageWiFi(),
		PageBluetooth()
	];
	for (const page of pages)
		navView.add(page as Adw.NavigationPage);
	return navView;
}