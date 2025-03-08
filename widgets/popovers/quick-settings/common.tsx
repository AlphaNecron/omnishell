import {bind, type Binding, Variable} from 'astal';
import {astalify, type ConstructProps, Gtk} from 'astal/gtk4';
import GObject from 'astal/gobject';
import Adw from 'gi://Adw';
import {DummyBinding} from 'astal/binding';

const ScrolledWindow = astalify<Gtk.ScrolledWindow, Gtk.ScrolledWindow.ConstructorProps>(Gtk.ScrolledWindow);

export function List<T extends GObject.Object>({items, render, ...props}: {
	items: Binding<T[]>,
	render(it: T): JSX.Element
} & Partial<ConstructProps<Gtk.ScrolledWindow, Gtk.ScrolledWindow.ConstructorProps>>) {
	return ScrolledWindow({
		...props,
		hexpand: true,
		child: new Adw.Clamp({
			child: (
					<box vertical cssClasses={['content-list']}>
						{items.as(_items => _items.map(it => (
								<box cssClasses={['item']} vertical>
									{render(it)}
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
	                         actions,
	                         onDestroy
                         }: {
	tag: string
	title: string
	toggleState?: Binding<boolean>
	child?: JSX.Element
	actions?: JSX.Element[],
	onDestroy?(): void;
}) {
	const toolbar = new Adw.ToolbarView({
		content: child,
		cssClasses: ['toolbar'],
		heightRequest: 240
	});
	if (onDestroy)
		toolbar.connect('destroy', onDestroy);
	const hb = new Adw.HeaderBar();
	if (actions && actions.length > 0)
		hb.pack_end(
				<box halign={Gtk.Align.END} valign={Gtk.Align.CENTER} cssClasses={['page-actions']} spacing={8}>
					{actions}
				</box>
		);
	toolbar.add_top_bar(
			hb
			// <Adw.HeaderBar titleWidget={
			// 	<box>
			// 		<label hexpand halign={Gtk.Align.START} cssClasses={['page-title']}>{title}</label>
			// }/>
	);
	return new Adw.NavigationPage({
		cssClasses: ['page', tag],
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

export enum ConnState {
	CONNECTED,
	CONNECTING,
	DISCONNECTED
}

export function ConnectionState({state, icons, ...props}: {
	state: Binding<ConnState>,
	icons: Record<ConnState, Gtk.Widget | Binding<Gtk.Widget>>,
} & Partial<ConstructProps<Gtk.Stack, Gtk.Stack.ConstructorProps>>) {
	return (
			<stack {...props} visibleChildName={state.as(s => s.toString())}>
				<label>
					{Object.entries(icons).map(([k, v]) => (
							<box name={k}>
								{v}
							</box>
					))}
				</label>
			</stack>
	);
}