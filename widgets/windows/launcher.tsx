import {App, Astal, Gdk} from 'astal/gtk4';

const {TOP, RIGHT, BOTTOM, LEFT} = Astal.WindowAnchor;

export default function AppLauncher({mon}: { mon: Gdk.Monitor }) {
	return (
			<window gdkmonitor={mon} application={App}
			        anchor={TOP | RIGHT | BOTTOM | LEFT}
			        exclusivity={Astal.Exclusivity.IGNORE}/>
	);
}