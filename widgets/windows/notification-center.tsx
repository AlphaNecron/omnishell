import {Gtk} from 'astal/gtk4';
import Notifd from 'gi://AstalNotifd';
import {Notification} from '@widget/windows/notifications';
import {bind} from 'astal';

const noti = Notifd.get_default();

export default function NotificationCenter() {
	console.log(noti.notifications.map(d => d.summary));
	return (
			<window>
				<box homogeneous>
					<box vertical spacing={8}>
						{bind(noti, 'notifications').as(notis => notis.map(n => new Notification(n, false)))}
					</box>
					<box>
						<Gtk.Calendar/>
					</box>
				</box>
			</window>
	);
}