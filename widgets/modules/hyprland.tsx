import Hyprland from 'gi://AstalHyprland';
import {Gdk, Gtk} from 'astal/gtk4';
import {bind, Variable} from 'astal';
import {workspaceIcons} from '@utils/icons';

const hypr = Hyprland.get_default();

export default function HyprlandModule({mon}: { mon: Gdk.Monitor }) {
	const curMonWorkspaces = Variable.derive([
		bind(hypr, 'workspaces'),
		bind(hypr, 'focusedWorkspace')
	], (wss, fws) =>
			wss.filter(ws => ws.monitor?.name === mon.connector)
					.sort((a, b) => a.id - b.id)
					.map(ws => ({
						id: ws.id,
						occupied: bind(ws, 'clients').as(c => c.length > 0),
						focused: ws.id === fws.id
					})));
	return (
			<box vertical cssClasses={['module-hyprland']} spacing={6}
			     onDestroy={() => curMonWorkspaces.drop()}>
				{curMonWorkspaces().as(wss => wss
						.map(ws =>
								<button onClicked={() => hypr.dispatch('workspace', ws.id.toString())}
								        cssClasses={bind(ws.occupied).as(occupied => ['workspace', 'icon', ws.focused ? 'focused' : '', occupied ? 'occupied' : ''])}>
									{workspaceIcons[ws.id] || workspaceIcons['default']}
								</button>
						))}
			</box>
	);
}