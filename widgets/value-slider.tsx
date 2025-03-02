import {type Binding} from 'astal/binding';
import {type SliderProps} from 'astal/gtk4/widget';
import {Gtk} from 'astal/gtk4';

export default function ValueSlider({icon, min, max, handleChange, ...props}: {
	icon: string | Binding<string>,
	min: number,
	max: number,
	handleChange(v: number): void
} & SliderProps) {
	return (
			<box spacing={6} cssClasses={['value-slider']}>
				<label cssClasses={['icon']} valign={Gtk.Align.CENTER}>
					{icon}
				</label>
				<slider {...props} hexpand setup={self => {
					self.max = max;
					self.min = min;
				}} onChangeValue={self => {
					handleChange(self.value);
				}} />
			</box>
	);
}