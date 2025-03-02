import {b, BasePage} from './common';
import PowerProfiles from 'gi://AstalPowerProfiles';
import {bind} from 'astal';
import {powerProfileIcons} from '@utils/icons';

const powProf = PowerProfiles.get_default();

const powerProfiles: Record<string, string> = {
	'power-saver': 'Power saver',
	'balanced': 'Balanced',
	'performance': 'Performance',
}

export const qsTile = {
	text: b(bind(powProf, 'activeProfile').as(p => powerProfiles[p])),
	icon: b(bind(powProf, 'activeProfile').as(p => powerProfileIcons[p])),
	active: b(true),
	action: () => {
		const profs = powProf.get_profiles();
		const curProf = profs.findIndex(p => p.profile === powProf.activeProfile);
		powProf.activeProfile = profs[(curProf + 1) % profs.length].profile;
	}
}