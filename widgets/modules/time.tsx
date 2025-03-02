import {time} from '@utils/index';
import {Gtk} from 'astal/gtk4';

export default function TimeModule() {
	return (
			<menubutton cssClasses={['module-time']} setup={self => self.popover.position = Gtk.PositionType.RIGHT}>
				<box orientation={Gtk.Orientation.VERTICAL} spacing={4} halign={Gtk.Align.CENTER} marginStart={2}>
					{time().as(t => (
							<>
								<label>
									{t.get_hour().toString().padStart(2, '0')}
								</label>
								<label>
									{t.get_minute().toString().padStart(2, '0')}
								</label>
								{/*<label>*/}
								{/*	{t.get_second().toString().padStart(2, '0')}*/}
								{/*</label>*/}
							</>
					))}
				</box>
				<popover>
					<Gtk.Calendar/>
				</popover>
			</menubutton>
	);
}