<script lang="ts">
	//import L from 'leaflet';
	//import 'leaflet/dist/leaflet.css';
	//import type { Map as LFMap } from 'leaflet';
	import maplibre from 'maplibre-gl';
	import 'maplibre-gl/dist/maplibre-gl.css';
	import { onMount, onDestroy } from 'svelte';
	import type { Unsubscriber, Writable } from 'svelte/store';
	import { myJID, mylocation, locations, markers } from '$lib/store';
	import type { Client } from '@xmpp/client';
	import { datetime } from '@xmpp/time';
	import { Location } from '$lib/xmpp/xep-0080';
	import { v4 as uuidv4 } from 'uuid';
	import { browser } from '$app/environment';

	export let conn: Writable<Client>;
	let map: maplibre.Map;
	let coordWatchID: number;
	let locationsCacheUnsubscriber: Unsubscriber;
	let locationsMarkerUnsubscriber: Unsubscriber;
	let mylocationMapUnsubscriber: Unsubscriber;
	let mylocationXMPPUnsubscriber: Unsubscriber;
	//let geolocationErr: GeolocationPositionError;

	onMount(() => {
		if (browser) {
			//map = .map('map').setView([0, 0], 13);
			map = new maplibre.Map({
				container: 'map',
				style: 'https://tile.openstreetmap.jp/styles/osm-bright-ja/style.json',
				center: [0, 0], // starting position [lng, lat]
				zoom: 1 // starting zoom
			});
			map.addControl(
				new maplibre.GeolocateControl({
					positionOptions: {
						enableHighAccuracy: true
					},
					trackUserLocation: true
				})
			);
			map.addControl(new maplibre.NavigationControl());
			/*
			L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
				maxZoom: 19,
				attribution: '&copy; <a href="https://osm.org">OpenStreetMap</a> contributors'
			}).addTo(map);
			*/

			if ('geolocation' in navigator) {
				navigator.geolocation.getCurrentPosition(
					(pos) => {
						if (
							pos.coords.latitude !== undefined &&
							pos.coords.longitude !== undefined &&
							pos.coords.accuracy !== undefined
						)
							mylocation.set(
								new Location(
									pos.coords.latitude,
									pos.coords.longitude,
									pos.coords.accuracy,
									datetime()
								)
							);
					},
					(err) => {
						console.log(err.message);
					}
				);

				coordWatchID = navigator.geolocation.watchPosition((pos) => {
					if (
						pos.coords.latitude !== undefined &&
						pos.coords.longitude !== undefined &&
						pos.coords.accuracy !== undefined
					)
						mylocation.set(
							new Location(
								pos.coords.latitude,
								pos.coords.longitude,
								pos.coords.accuracy,
								datetime()
							)
						);
				});
			}

			mylocationXMPPUnsubscriber = mylocation.subscribe(async (pos) => {
				if (pos.lat === undefined || pos.lng === undefined) return;
				if (typeof $myJID === 'undefined') return;

				let stanza = pos.toEventStanza($myJID, uuidv4());
				let res = await $conn.iqCaller.set(stanza);
				console.debug('XMPP subscriber');
				console.debug(res);
				//conn.send(pos.toEventStanza($myJID, uuidv4()));
				//console.debug(pos)
			});

			/*
			mylocationMapUnsubscriber = mylocation.subscribe((pos) => {
				if (pos.lat === undefined || pos.lng === undefined) return;
				map.flyTo([pos.lat, pos.lng]);
			});
			*/

			locationsMarkerUnsubscriber = locations.subscribe((pos) => {
				pos.forEach((v, k) => {
					if (typeof v.lat === 'undefined' || typeof v.lng === 'undefined') return;

					let marker = $markers.get(k);
					if (typeof marker === 'undefined') {
						let popup = new maplibre.Popup().setHTML(k);
						let new_marker = new maplibre.Marker().setLngLat([v.lng, v.lat]).setPopup(popup).addTo(map);
						$markers.set(k, new_marker);
					} else {
						marker.setLngLat([v.lng, v.lat]);
					}
				});
			});
			locationsCacheUnsubscriber = locations.subscribe((pos) => {
				pos.forEach((v, k) => {
					let locs_json: Object;
					let locs = localStorage.getItem('locations');
					if (locs !== null) {
						locs_json = JSON.parse(locs);
					} else {
						locs_json = {};
					}
					locs_json[k] = {
						lat: v.lat,
						lng: v.lng,
						acc: v.acc,
						timestamp: v.timestamp
					};
					localStorage.setItem('locations', JSON.stringify(locs_json));
				});
			});
		}
	});

	onDestroy(() => {
		if (browser) {
			if (typeof coordWatchID === 'number') {
				navigator.geolocation.clearWatch(coordWatchID);
			}
			mylocationXMPPUnsubscriber;
			mylocationMapUnsubscriber;
			locationsMarkerUnsubscriber;
			locationsCacheUnsubscriber;
		}
	});
</script>

<!--<svelte:head>
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.8.0/dist/leaflet.css"
   integrity="sha512-hoalWLoI8r4UszCkZ5kL8vayOGVae1oxXe/2A4AO6J9+580uKHDO3JdHb7NzwwzK5xr/Fs0W40kiNHxM9vyTtQ=="
   crossorigin=""/>
</svelte:head>-->
<div id="map-container">
	<div id="map" />
</div>

<style>
	#map {
		height: 100%;
		width: 100vw;
	}
	#map-container {
		position: fixed;
		bottom: 0;
		top: 53px;
	}
</style>
