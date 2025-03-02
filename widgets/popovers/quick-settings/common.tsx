import {bind, type Binding, Variable} from 'astal';
import {astalify, type ConstructProps, Gtk} from 'astal/gtk4';
import GObject from 'astal/gobject';
import Adw from 'gi://Adw';
import {DummyBinding} from 'astal/binding';

const ScrolledWindow = astalify<Gtk.ScrolledWindow, Gtk.ScrolledWindow.ConstructorProps>(Gtk.ScrolledWindow);

export function List<T extends GObject.Object>({items, render, renderContent, ...props}: {
	items: Binding<T[]>,
	render(it: T): JSX.Element,
	renderContent(it: T): JSX.Element
} & Partial<ConstructProps<Gtk.ScrolledWindow, Gtk.ScrolledWindow.ConstructorProps>>) {
	return ScrolledWindow({
		...props,
		hexpand: true,
		child: new Adw.Clamp({
			child: (
					<box orientation={Gtk.Orientation.VERTICAL} cssClasses={['qs-content-list']}>
						{items.as(_items => _items.map(it => (
								<box cssClasses={['item']} orientation={Gtk.Orientation.VERTICAL}>
									<button cssClasses={['trigger']}
									        onClicked={self => {
										        const r = self.get_next_sibling() as Gtk.Revealer;
										        r.revealChild = !r.revealChild;
									        }}>
										{render(it)}
									</button>
									<revealer>
										{renderContent(it)}
									</revealer>
								</box>
						)))}
					</box>
					// <ListView factory={new Gtk.BuilderListItemFactory({
					//
					// })} setup={self => {
					//
					// }}>
					//
					// </ListView>
			)
		})
	});
}

export function BasePage({
	                  tag,
	                  title,
	                  child,
	                  actions
                  }: {
	tag: string
	title: string
	toggleState?: Binding<boolean>
	child?: JSX.Element
	actions?: JSX.Element[]
}) {
	const toolbar = new Adw.ToolbarView({
		content: child,
		cssClasses: ['qs-toolbar']
	});
	toolbar.add_top_bar(
			<Adw.HeaderBar titleWidget={
				<box>
					<label hexpand halign={Gtk.Align.START} cssClasses={['qs-page-title']}>{title}</label>
					{(actions?.length || 0) > 0 && (
							<box halign={Gtk.Align.END} valign={Gtk.Align.CENTER} cssClasses={['qs-page-actions']} spacing={8}>
								{actions}
							</box>
					)}
				</box>
			}/>
	);
	return new Adw.NavigationPage({
		cssClasses: ['qs-page', tag],
		title,
		tag,
		child: toolbar
	});
}

export function b<T extends string | number | bigint | boolean>(v: Variable<T> | Binding<T> | T) {
	return typeof v === 'function' ? {
		destroy: () => v.drop(),
		val: bind(v)
	} : typeof v === 'object' ? {
		destroy: undefined,
		val: v
	} : {
		destroy: undefined,
		val: new DummyBinding(v)
	};
}

export function chunkify<T>(arr: T[], sz: number): T[][] {
	return Array.from({length: Math.ceil(arr.length / sz)}, (_, i) => arr.slice(i * sz, i * sz + sz));
}