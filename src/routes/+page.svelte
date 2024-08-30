<script lang="ts">
	import { initializeClient } from '$lib/client';
	import Map from '$lib/Map.svelte';
	import { connection } from '$lib/store';
	import { onMount } from 'svelte';
	import { HENLYWEB_USER_STORAGE_ID, parseAsUserStorage } from '$lib/localstorage';
	import { goto } from '$app/navigation';
    import { jid } from "@xmpp/jid";

	onMount(async () => {
		if (
			typeof $connection !== 'undefined' &&
			$connection.status !== 'close' &&
			$connection.status !== 'disconnect'
		) {
			return;
		}

		let user_str = localStorage.getItem(HENLYWEB_USER_STORAGE_ID);
		if (user_str === null) {
			throw goto('/signin');
		}

		let user = parseAsUserStorage(user_str);
		if (typeof user === 'undefined') {
			throw goto('/signin');
		}

		connection.set(await initializeClient(jid(user.jid), user.password));
	});
</script>

<Map conn={connection} />
