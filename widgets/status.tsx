import {Astal, Gtk} from 'astal/gtk4';

export default function Status({title, icon, ...props}: { title: string, icon: string } & Partial<Astal.Box.ConstructorProps>) {
	return (
			<box {...props} vertical spacing={8} cssClasses={['status']} valign={Gtk.Align.CENTER} halign={Gtk.Align.CENTER}>
				<label cssClasses={['icon']}>
					{icon}
				</label>
				<label cssClasses={['title']}>
					{title}
				</label>
			</box>
	);
}