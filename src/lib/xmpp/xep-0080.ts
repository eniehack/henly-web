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
