import ScreenRecord from '@utils/screen-record';
import {bind} from 'astal';
import {Gtk} from 'astal/gtk4';

const sr = ScreenRecord.get_default();

export default function ScreenRecModule() {
	return (
			<revealer revealChild={bind(sr, 'recording')} transitionType={Gtk.RevealerTransitionType.SLIDE_UP}>
				<box cssClasses={['module-screenrec']} spacing={4} marginTop={8}
				     tooltipText={bind(sr, 'fps').as(f => `${f} FPS`)} orientation={Gtk.Orientation.VERTICAL}>
					<button cssClasses={['icon']} onClicked={() => sr.stop()}>
						screen_record
					</button>
					<box cssClasses={['timer']} orientation={Gtk.Orientation.VERTICAL} valign={Gtk.Align.BASELINE_FILL}>
						<label halign={Gtk.Align.CENTER}>
							{bind(sr, 'timer').as(t =>
									Math.trunc(t / 60).toString().padStart(2, '0'))}
						</label>
						<label halign={Gtk.Align.CENTER}>
							{bind(sr, 'timer').as(t => (t % 60).toString().padStart(2, '0'))}
						</label>
					</box>
				</box>
			</revealer>
	);
}