<script lang="ts">
	import { initializeClient } from '$lib/client';
	import { jid } from '@xmpp/jid';
	import { connection } from '$lib/store';
	import { goto } from '$app/navigation';
	import { generateResourceRandomPart } from '$lib/util';
	import { HENLYWEB_USER_STORAGE_ID, serialize } from '$lib/localstorage';
	import Header from '$lib/Header.svelte';

	export let user_id: string;
	export let password: string;
	const signin = async () => {
		let addr = jid(user_id);
		addr.setResource('henly-web.' + generateResourceRandomPart());
		const item = serialize({
			jid: addr.toString(),
			password,
		});
		connection.set(await initializeClient(addr, password));
		localStorage.setItem(HENLYWEB_USER_STORAGE_ID, item);
		goto('/');
	};
</script>

<div>
	<label for="jid">JID: </label>
	<input type="text" bind:value={user_id} placeholder="JID" autocomplete="username" required />
</div>
<div>
	<label for="password">Password: </label>
	<input
		type="password"
		bind:value={password}
		placeholder="password"
		autocomplete="current-password"
		required
	/>
</div>
<button id="signin" on:click={signin}>sign in</button>
