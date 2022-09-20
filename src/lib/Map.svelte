<svelte:head>
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.8.0/dist/leaflet.css"
   integrity="sha512-hoalWLoI8r4UszCkZ5kL8vayOGVae1oxXe/2A4AO6J9+580uKHDO3JdHb7NzwwzK5xr/Fs0W40kiNHxM9vyTtQ=="
   crossorigin=""/>
</svelte:head>

<div id="map"></div>

<style>
 #map {
     width: 750px;
     height: 750px;
 }
</style>


<script lang="ts">
 import L from "leaflet";
 import type { Map as LFMap } from "leaflet";
 import { onMount, onDestroy } from "svelte";
 import { myJID, locations, markers } from "./store";

 let map: LFMap;
 let coordWatchID: number;
 //let geolocationErr: GeolocationPositionError;
 onMount(() => {
     map = L.map("map").setView([0, 0], 13);
     L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
         maxZoom: 19,
         attribution: '&copy; <a href="https://osm.org">OpenStreetMap</a> contributors'
     }).addTo(map);

     if ("geolocation" in navigator) {
         navigator.geolocation.getCurrentPosition((pos) => {
             locations.update((loc) => {
                 return loc.set($myJID.toString(), {lat: pos.coords.latitude, lng: pos.coords.longitude, acc: pos.coords.accuracy})
             });
         }, (err) => {
             console.log(err.message);
         });

         coordWatchID = navigator.geolocation.watchPosition((pos) => {
             locations.update((loc) => {
                 return loc.set($myJID.toString(), {lat: pos.coords.latitude, lng: pos.coords.longitude, acc: pos.coords.accuracy})
             });
         });
     }

     locations.subscribe((pos) => {
         let mypos = pos.get($myJID.toString());
         if (typeof mypos !== "undefined") map.flyTo([mypos.lat, mypos.lng]);
         pos.forEach((v,k) => {
             if (typeof $markers.get(k) != "undefined") {
                 $markers.get(k).setLatLng([v.lat, v.lng]);
             } else {
                 let marker = L.marker([v.lat, v.lng])
                               .addTo(map);
                 $markers.set(k, marker);
             }
         });
     });
 });

 onDestroy(() => {
     if (typeof coordWatchID === "number") {
         navigator.geolocation.clearWatch(coordWatchID);
     }
 });

</script>
