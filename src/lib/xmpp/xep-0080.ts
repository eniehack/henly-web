import { xml } from "@xmpp/client";
import type { JID } from "@xmpp/jid";
import type { Element } from "@xmpp/xml";

export const isGeolocStanza = (stanza: Element): boolean => {
    if (stanza.is("message") &&
        stanza.getChild("event") !== undefined &&
        stanza.getChild("event").getChildByAttr("node", "http://jabber.org/protocol/geoloc") !== undefined &&
        stanza.getChild("event").getChildByAttr("node", "http://jabber.org/protocol/geoloc").getChild("item") !== undefined &&
        stanza.getChild("event").getChildByAttr("node", "http://jabber.org/protocol/geoloc").getChild("item").getChildByAttr("xmlns", "http://jabber.org/protocol/geoloc") !== undefined) {
        return true;
    } else {
        return false;
    }
}

export class Location {
    constructor(
        public lat?: number,
        public lng?: number,
        public acc?: number,
        public timestamp?: string
    ) {

    }

    toEventStanza(from: JID, id: string): Element {
        return xml("iq", {type: "set", from: from.toString(), id: id},
                   xml("pubsub", "http://jabber.org/protocol/pubsub",
                       xml("publish", {node: "http://jabber.org/protocol/geoloc"},
                           xml("item", {},
                               xml("geoloc", {xmlns: "http://jabber.org/protocol/geoloc"},
                                   xml("accuracy", {}, String(this.acc)),
                                   xml("lat", {}, String(this.lat)),
                                   xml("lon", {}, String(this.lng)),
                                   xml("timestamp", {}, this.timestamp),
                                  )
                              )
                          )
                      )
                  );
    }
}
