import {App, Astal, astalify, Gdk, Gtk} from 'astal/gtk4';
import {GLib, register, timeout} from 'astal';
import Notifd from 'gi://AstalNotifd';
import Pango from 'gi://Pango';
import GdkPixbuf from 'gi://GdkPixbuf';
import Hyprland from 'gi://AstalHyprland';

const
		Picture = astalify<Gtk.Picture, Gtk.Picture.ConstructorProps>(Gtk.Picture);

const {TOP, RIGHT, BOTTOM, LEFT} = Astal.WindowAnchor;

const noti = Notifd.get_default();
const hypr = Hyprland.get_default();

const DEFAULT_TIMEOUT = 20e3;
const TRANSITION_DURATION = 200;

const isIcon = (icon: string) => new Gtk.IconTheme().has_icon(icon);

const fileExists = (path: string) => GLib.file_test(path, GLib.FileTest.EXISTS);

const urgencies: Record<Notifd.Urgency, { c: string, ic: string }> = {
	[Notifd.Urgency.LOW]: {c: 'low', ic: 'low_priority'},
	[Notifd.Urgency.NORMAL]: {c: 'normal', ic: 'notifications'},
	[Notifd.Urgency.CRITICAL]: {c: 'critical', ic: 'release_alert'}
};

@register({GTypeName: 'Notification'})
export class Notification extends Gtk.Revealer {
	constructor(n: Notifd.Notification, floating: boolean, onExpired?: (self: Notification) => void) {
		console.log(n.image, n.desktopEntry);
		super({
			widthRequest: 240,
			cssClasses: ['notification', floating ? 'floating' : '', urgencies[n.urgency].c],
			transitionDuration: TRANSITION_DURATION,
			revealChild: !floating,
			child: (
					<box cssClasses={['content']} spacing={4} vertical>
						<box cssClasses={['header']} spacing={8}>
							{(n.appIcon || n.desktopEntry || (n.image && isIcon(n.image))) ? (
									<image pixelSize={16} valign={Gtk.Align.CENTER}
									       iconName={n.appIcon || n.desktopEntry || n.image} cssClasses={['app-icon']}/>
							) : (
									<label cssClasses={['app-icon', 'icon']}
									       valign={Gtk.Align.CENTER}>{n.get_str_hint('md-icon') || urgencies[n.urgency].ic}</label>
							)}
							<label valign={Gtk.Align.BASELINE} maxWidthChars={30}
							       ellipsize={Pango.EllipsizeMode.END} cssClasses={['summary']} hexpand
							       halign={Gtk.Align.START} useMarkup label={n.summary}/>
							<button cssClasses={['icon', 'dismiss-button']} onClicked={() => n.dismiss()}>
								close
							</button>
						</box>
						{n.image && fileExists(n.image) && (
								<Picture cssClasses={['image']} marginBottom={n.actions.length > 0 ? 0 : 10}
								         halign={Gtk.Align.CENTER}
								         valign={Gtk.Align.CENTER} setup={self => {
									const buf = GdkPixbuf.Pixbuf.new_from_file_at_scale(n.image, 200, 200, true);
									self.layoutManager = Gtk.FixedLayout.new();
									self.set_pixbuf(buf);
									self.set_size_request(buf.width, buf.height);
								}}/>
						)}
						<label cssClasses={['body']} wrap maxWidthChars={30}
						       valign={Gtk.Align.START}
						       halign={Gtk.Align.START} useMarkup label={n.body}/>
						{n.actions.length > 0 && (
								<box marginTop={4} spacing={4} homogeneous>
									{n.actions.map(a => (
											<button cssClasses={['action']} onClicked={() => {
												n.invoke(a.id);
												n.dismiss();
											}}>
												{n.actionIcons ? <image iconName={a.label}/> : a.label}
											</button>
									))}
								</box>
						)}
					</box>
			)
		});
		if (floating) {
			timeout(0, () => this.revealChild = true);
			timeout(TRANSITION_DURATION, () => this.transitionType = Gtk.RevealerTransitionType.SWING_LEFT);
			if (n.expireTimeout === -1 && n.urgency !== Notifd.Urgency.CRITICAL)
				timeout(DEFAULT_TIMEOUT, () => onExpired?.(this));
		}
	}
}

@register({GTypeName: 'NotificationContainer'})
export class Container extends Astal.Window {
	#registry: Map<number, Notification> = new Map();
	
	constructor(mon: Gdk.Monitor) {
		super({
			namespace: 'omnishell-notifications',
			gdkmonitor: mon,
			cssClasses: ['notification-container'],
			layer: Astal.Layer.OVERLAY,
			anchor: TOP | RIGHT,
			application: App,
			child: (
					<box vertical spacing={8} setup={self => {
						const nid = noti.connect('notified', (_, id, replaced) => {
							if (noti.dontDisturb) return console.log('dnd is on, ignoring notif');
							if (mon.connector !== hypr.focusedMonitor.name) return;
							this.show();
							const prev = this.#registry.get(id);
							if (prev)
								self.remove(prev);
							const n = new Notification(noti.get_notification(id), true, n => {
								n.revealChild = false;
								timeout(TRANSITION_DURATION, () => {
									self.remove(n);
									this.#registry.delete(id);
									if (!this.#registry.size)
										this.hide();
								});
							});
							this.#registry.set(id, n);
							self.prepend(n);
						});
						const rid = noti.connect('resolved', (_, id, reason) => {
							const n = this.#registry.get(id);
							if (n) {
								n.revealChild = false;
								timeout(
										reason === Notifd.ClosedReason.EXPIRED ? TRANSITION_DURATION : 0,
										() => {
											this.#registry.delete(id);
											self.remove(n);
											if (!this.#registry.size)
												this.hide();
										}
								);
							}
						});
						self.connect('destroy', () => [nid, rid].map(noti.disconnect));
					}}/>
			)
		});
	}
}