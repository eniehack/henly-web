import { browser } from '$app/environment';
import type { PageLoad } from './$types';
import { HENLYWEB_USER_STORAGE_ID, parseAsUserStorage } from '$lib/localstorage';
import { redirect } from '@sveltejs/kit';

export const ssr = false;
export const csr = true;

export const load = (async ({}) => {
	if (browser) {
		let user_str = localStorage.getItem(HENLYWEB_USER_STORAGE_ID);
		if (user_str === null) {
			throw redirect(303, '/signin');
		}

		let user = parseAsUserStorage(user_str);
		if (typeof user === 'undefined') {
			throw redirect(303, '/signin');
		}

		return {
			user
		};
	}
}) satisfies PageLoad;
