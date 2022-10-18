import { writable, type Writable } from "svelte/store";
import type { JID } from "@xmpp/jid";
import type { Marker } from "leaflet";
import { Location } from "./xmpp/xep-0080";

export const myJID: Writable<JID> = writable(undefined);

type Locations = Map<string, Location>;
export const locations: Writable<Locations> = writable(new Map<string, Location>());

export const mylocation: Writable<Location> = writable(new Location());

type Markers = Map<string, Marker>;
export const markers: Writable<Markers> = writable(new Map<string, Marker>());

export const key = Symbol();
