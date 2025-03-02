// skidded from ezerinz/epik-shell/utils/brightness.ts

import GObject, {property, register} from 'astal/gobject';
import {monitorFile, readFileAsync} from 'astal/file';
import {exec, execAsync} from 'astal/process';

const get = (args: string) => Number(exec(`brightnessctl ${args}`));
const screen = exec(`bash -c "ls -w1 /sys/class/backlight | head -1"`);
const kbd = exec(`bash -c "ls -w1 /sys/class/leds | head -1"`);

@register({GTypeName: 'Brightness'})
export default class Brightness extends GObject.Object {
	static instance: Brightness;
	
	static get_default() {
		if (!this.instance) this.instance = new Brightness();
		return this.instance;
	}
	
	#kbdMax = get(`--device ${kbd} max`);
	#kbd = get(`--device ${kbd} get`);
	#screenMax = get('max');
	#screen = get('get');
	
	@property(Number)
	get kbdMax() {
		return this.#kbdMax;
	}
	
	@property(Number)
	get kbd() {
		return this.#kbd;
	}
	
	set kbd(value) {
		if (value < 0 || value > this.#kbdMax) return;
		
		execAsync(`brightnessctl -d ${kbd} s ${value} -q`).then(() => {
			this.#kbd = value;
			this.notify('kbd');
		});
	}
	
	@property(Number)
	get screenMax() {
		return this.#screenMax;
	}
	
	@property(Number)
	get screen() {
		return this.#screen;
	}
	
	set screen(value) {
		value = Math.min(Math.max(value, 0), this.#screenMax);
		execAsync(`brightnessctl set ${value} -q`).then(() => {
			this.#screen = value;
			this.notify('screen');
		});
	}
	
	constructor() {
		super();
		
		const screenPath = `/sys/class/backlight/${screen}/brightness`;
		const kbdPath = `/sys/class/leds/${kbd}/brightness`;
		
		monitorFile(screenPath, async (f) => {
			const v = await readFileAsync(f);
			this.#screen = Number(v);
			this.notify('screen');
		});
		
		monitorFile(kbdPath, async (f) => {
			const v = await readFileAsync(f);
			this.#kbd = Number(v);
			this.notify('kbd');
		});
	}
}