import { isGeolocStanza, Location } from "../src/lib/xmpp/xep-0080";
import { expect, test } from "vitest";
import { xml } from "@xmpp/client";
import { jid } from "@xmpp/jid";

test("xep-0080#isGeolocStanza/1", () => {
    let stanza = xml("message", {from: "portia@merchantofvenice.lit", to: "bassanio@merchantofvenice.lit"},
                     xml("event", "http://jabber.org/protocol/pubsub#event",
                         xml("items", {node: "http://jabber.org/protocol/geoloc"},
                             xml("item", {id: "test"},
                                 xml("geoloc", "http://jabber.org/protocol/geoloc",
                                     xml("accuracy", {}, "20"),
                                     xml("lat", {}, "45.44"),
                                     xml("lon", {}, "12.33"))))));

    expect(isGeolocStanza(stanza)).toBe(true);
});

test("xep-0080#isGeolocStanza/2", () => {
    let stanza = xml("message", {from: "portia@merchantofvenice.lit", to: "bassanio@merchantofvenice.lit"},
                     xml("event", "http://jabber.org/protocol/pubsub#event",
                         xml("items", {node: "http://jabber.org/protocol/geoloc"},
                                 xml("geoloc", "http://jabber.org/protocol/geoloc",
                                     xml("accuracy", {}, "20"),
                                     xml("lat", {}, "45.44"),
                                     xml("lon", {}, "12.33")))));

    expect(isGeolocStanza(stanza)).toBe(false);
});

test("xep-0080/Location#toEventStanza/1", () => {
    let loc = new Location(45.44, 12.33, 20);

    let stanza = xml("iq", {type: "set", from: "portia@merchantofvenice.lit", id: "test"},
                     xml("pubsub", "http://jabber.org/protocol/pubsub",
                         xml("publish", {node: "http://jabber.org/protocol/geoloc"},
                             xml("item", {},
                                 xml("geoloc", "http://jabber.org/protocol/geoloc",
                                     xml("accuracy", {}, "20"),
                                     xml("lat", {}, "45.44"),
                                     xml("lon", {}, "12.33"))))));

    expect(
        loc.toEventStanza(jid("portia@merchantofvenice.lit"), "test")
    ).toEqual(stanza);
});
