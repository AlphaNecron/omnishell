import {type Binding} from 'astal/binding';
import {type SliderProps} from 'astal/gtk4/widget';
import {Gtk} from 'astal/gtk4';

export default function ValueSlider({icon, handleChange, ...props}: {
	icon: string | Binding<string>,
	handleChange(v: number): void
} & SliderProps) {
	return (
			<box spacing={8} cssClasses={['value-slider']}>
				<label cssClasses={['icon']} valign={Gtk.Align.CENTER}>
					{icon}
				</label>
				<slider {...props} hexpand onChangeValue={self => {
					handleChange(self.value);
				}}/>
			</box>
	);
}