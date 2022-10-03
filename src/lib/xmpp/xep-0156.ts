import xml from "xml-js";

export class HostMeta {
    constructor(public body : String) {
    }

    getWebSocketEndpoint() : string | undefined {
        let json = xml.xml2js(this.body, {compact: false});

        let xrd = json["elements"].find(elem => elem["name"] === "XRD" &&
            elem["attributes"]["xmlns"] === "http://docs.oasis-open.org/ns/xri/xrd-1.0");

        if (xrd === undefined) {
            return undefined;
        }

        let links = xrd["elements"].filter(elem => elem["type"] === "element" && elem["name"] === "Link")
        let ws_elem = links.find(elem => elem["attributes"]["rel"] === "urn:xmpp:alt-connections:websocket");
        if (ws_elem === undefined) return undefined;
        let ws_uri = ws_elem["attributes"]["href"];

        return ws_uri;
    }

}
