import { writable, type Writable } from "svelte/store";
import type { JID } from "@xmpp/jid";
import type { Marker } from "leaflet";

export const myJID: Writable<JID> = writable(undefined);

type Location = {
    lat: number;
    lng: number;
    acc: number;
};
type Locations = Map<string, Location>;
export const locations: Writable<Locations> = writable(new Map<string, Location>());

export const mylocation: Writable<Locations> = writable(Location);

type Markers = Map<string, Marker>;
export const markers: Writable<Markers> = writable(new Map<string, Marker>());

export const key = Symbol();
