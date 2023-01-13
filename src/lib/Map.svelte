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
 import { myJID, mylocation, locations, markers, key } from "$lib/store";
 import type { Client } from "@xmpp/client";
 import { datetime } from "@xmpp/time";
 import { Location } from "$lib/xmpp/xep-0080";
 import { v4 as uuidv4 } from "uuid";

 const { getConn } = getContext(key);
 const conn: Client = getConn();

 let map: LFMap;
 let coordWatchID: number;
  let locationsCacheUnsubscriber: Unsubscriber;
  let locationsMarkerUnsubscriber: Unsubscriber;
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
           if (pos.coords.latitude !== undefined &&
               pos.coords.longitude !== undefined &&
               pos.coords.accuracy !== undefined) mylocation.set(new Location(pos.coords.latitude, pos.coords.longitude, pos.coords.accuracy, datetime()));
         }, (err) => {
             console.log(err.message);
         });

         coordWatchID = navigator.geolocation.watchPosition((pos) => {
           if (pos.coords.latitude !== undefined &&
               pos.coords.longitude !== undefined &&
               pos.coords.accuracy !== undefined) mylocation.set(new Location(pos.coords.latitude, pos.coords.longitude, pos.coords.accuracy, datetime()));
         });
     }

    mylocationXMPPUnsubscriber = mylocation.subscribe((pos) => {
        if (pos.lat === undefined || pos.lng === undefined) return;
        if (typeof $myJID === "undefined") return;
        conn.send(pos.toEventStanza($myJID, uuidv4()));
      //console.debug(pos)
    })

    mylocationMapUnsubscriber = mylocation.subscribe((pos) => {
        if (pos.lat === undefined || pos.lng === undefined) return;
        map.flyTo([pos.lat, pos.lng]);
    });

     locationsMarkerUnsubscriber = locations.subscribe((pos) => {
        pos.forEach((v,k) => {
            if (typeof v.lat === "undefined" || typeof v.lng === "undefined") return;

            let marker = $markers.get(k);
            if (typeof marker === "undefined") {
                let new_marker = L.marker([v.lat, v.lng])
                              .bindPopup(k)
                              .addTo(map);
                $markers.set(k, new_marker);
            } else {
                marker.setLatLng([v.lat, v.lng]);
            }
        });
     });
     locationsCacheUnsubscriber = locations.subscribe((pos) => {
        pos.forEach((v,k) => {
          let locs_json: Object;
          let locs = localStorage.getItem("locations");
          if (locs !== null) {
            locs_json = JSON.parse(locs);
          } else {
            locs_json = {};
          }
          locs_json[k] = {
            lat: v.lat,
            lng: v.lng,
            acc: v.acc,
            timestamp: v.timestamp,
          }
          localStorage.setItem("locations", JSON.stringify(locs_json));
        });
     });
 });

 onDestroy(() => {
     if (typeof coordWatchID === "number") {
         navigator.geolocation.clearWatch(coordWatchID);
     }
   mylocationXMPPUnsubscriber;
   mylocationMapUnsubscriber;
   locationsMarkerUnsubscriber;
   locationsCacheUnsubscriber;
 });

</script>
