<svelte:head>
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.8.0/dist/leaflet.css"
   integrity="sha512-hoalWLoI8r4UszCkZ5kL8vayOGVae1oxXe/2A4AO6J9+580uKHDO3JdHb7NzwwzK5xr/Fs0W40kiNHxM9vyTtQ=="
   crossorigin=""/>
</svelte:head>

<div id="map"></div>

<style>
 #map {
     width: 85vw;
     height: 85vh;
 }
</style>

<script lang="ts">
 import L from "leaflet";
 import type { Map as LFMap } from "leaflet";
 import { onMount, onDestroy, getContext } from "svelte";
 import type { Unsubscriber } from "svelte/store";
 import { myJID, mylocation, locations, markers, key } from "./store";
 import type { Client } from "@xmpp/client";
 import { datetime } from "@xmpp/time";
 import { Location } from "./xmpp/xep-0080";
 import { v4 as uuidv4 } from "uuid";

 const { getConn } = getContext(key);
 const conn: Client = getConn();

 let map: LFMap;
 let coordWatchID: number;
  let locationUnsubscriber: Unsubscriber;
  let mylocationMapUnsubscriber: Unsubscriber;
  let mylocationXMPPUnsubscriber: Unsubscriber;
 //let geolocationErr: GeolocationPositionError;
 onMount(() => {
     map = L.map("map").setView([0, 0], 13);
     L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
         maxZoom: 19,
         attribution: '&copy; <a href="https://osm.org">OpenStreetMap</a> contributors'
     }).addTo(map);

     if ("geolocation" in navigator) {
         navigator.geolocation.getCurrentPosition((pos) => {
             mylocation.set(new Location(pos.coords.latitude, pos.coords.longitude, pos.coords.accuracy));
         }, (err) => {
             console.log(err.message);
         });

         coordWatchID = navigator.geolocation.watchPosition((pos) => {
            mylocation.set(new Location(pos.coords.latitude, pos.coords.longitude, pos.coords.accuracy));
         });
     }

    mylocationXMPPUnsubscriber = mylocation.subscribe((pos) => {
      if (pos.lat === undefined || pos.lng === undefined) return;
      console.debug(pos)
      conn.send(pos.toEventStanza($myJID, datetime(), uuidv4()));
    })

    mylocationMapUnsubscriber = mylocation.subscribe((pos) => {
      if (pos.lat !== undefined || pos.lng !== undefined) map.flyTo([pos.lat, pos.lng]);
    });

     locationUnsubscriber = locations.subscribe((pos) => {
       console.debug(`location subscribe: ${pos}`)
        pos.forEach((v,k) => {
            if ($markers.get(k) == undefined) {
                let marker = L.marker([v.lat, v.lng])
                              .bindPopup(k)
                              .addTo(map);
                $markers.set(k, marker);
            } else {
                $markers.get(k).setLatLng([v.lat, v.lng]);
            }
        });
     });
 });

 onDestroy(() => {
     if (typeof coordWatchID === "number") {
         navigator.geolocation.clearWatch(coordWatchID);
     }
   mylocationXMPPUnsubscriber;
   mylocationMapUnsubscriber;
   locationUnsubscriber;
 });

</script>
