import Wp from 'gi://AstalWp';
import {bind} from 'astal';
import MediaPanel from '@widget/popovers/media-panel';
import type {Binding} from 'astal/binding';
import {Gtk} from 'astal/gtk4';
import {audioIconSubstitutes} from '@utils/icons';

const audio = Wp.get_default();

function Endpoint({ep}: { ep: Binding<Wp.Endpoint> }) {
	return (
			<>
				{ep.as(_ep => (
						<box spacing={0} onScroll={(_, __, dy) => _ep.volume -= dy / 100}>
							<label cssClasses={['icon']}>
								{bind(_ep, 'volumeIcon').as(ic => audioIconSubstitutes[ic])}
							</label>
							<levelbar inverted maxValue={1.5} cssClasses={['volume']} orientation={Gtk.Orientation.VERTICAL}
							          value={bind(_ep, 'volume')} marginTop={4} marginBottom={4}/>
						</box>
				))}
			</>
	);
}

export default function AudioModule() {
	if (!audio) return null;
	return (
			<menubutton cssClasses={['module-audio']} direction={Gtk.ArrowType.RIGHT}>
				<box spacing={6} orientation={Gtk.Orientation.VERTICAL} halign={Gtk.Align.CENTER}>
					<Endpoint ep={bind(audio, 'defaultSpeaker')}/>
					<Endpoint ep={bind(audio, 'defaultMicrophone')}/>
				</box>
				<popover cssClasses={['popover-audio']}>
					<MediaPanel/>
				</popover>
			</menubutton>
	);
}