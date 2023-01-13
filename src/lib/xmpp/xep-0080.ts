import { xml } from "@xmpp/client";
import type { JID } from "@xmpp/jid";
import type { Element } from "@xmpp/xml";

export const findGeolocStanza = (stanza: Element): Element | undefined => {
    if (! stanza.is("message"))
        return undefined;
    
    let event = stanza.getChild("event");
    if (typeof event === "undefined") {
        return undefined;
    }

    let node = event.getChildByAttr("node", "http://jabber.org/protocol/geoloc");
    if (typeof node === "undefined") {
        return undefined;
    }

    let item = node.getChild("item")
    if (typeof item === "undefined") {
        return undefined;
    }

    let geoloc = item.getChildByAttr("xmlns", "http://jabber.org/protocol/geoloc")
    if (typeof geoloc === "undefined") { 
        return undefined;
    }

    return geoloc;
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
                                   //xml("timestamp", {}, this.timestamp),
                                  )
                              )
                          )
                      )
                  );
    }
}
