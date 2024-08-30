<script lang="ts">
	import Map from '$lib/Map.svelte';
	import { connection } from '$lib/store';
</script>

<Map conn={connection} />
