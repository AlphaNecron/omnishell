import Wp from 'gi://AstalWp';
import {bind} from 'astal';
import {Gtk} from 'astal/gtk4';
import Adw from 'gi://Adw';

const wp = Wp.get_default();

export default function MediaPanel() {
	if (!wp) return null;
	return (
			<box widthRequest={480} heightRequest={360} vertical>
				{/*<Adw.Carousel>*/}
				{/*	<Adw.CarouselIndicatorDots/>*/}
				{/*</Adw.Carousel>*/}
				{/*{bind(wp, 'endpoints').as(eps => eps.map(ep => {*/}
				{/*	return (*/}
				{/*			<box hexpand vertical>*/}
				{/*				<label>*/}
				{/*					{bind(ep, 'name')}*/}
				{/*				</label>*/}
				{/*				<slider hexpand value={bind(ep, 'volume')} onChangeValue={self => {*/}
				{/*					ep.volume = self.value;*/}
				{/*				}}/>*/}
				{/*			</box>*/}
				{/*	);*/}
				{/*}))}*/}
			</box>
	);
}