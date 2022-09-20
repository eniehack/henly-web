import xml from "@xmpp/xml";
import type { Element } from "@xmpp/xml";

export class ServiceIdentity {
    constructor (
        public name: string,
        public category?: string,
        public lang?: string,
        public type?: string
    ) {}

    to_xml(): Element {
        let identity_elem: Element = xml("identity");
        identity_elem.attrs.name = this.name;
        if (this.category != undefined) identity_elem.attrs.category = this.category;
        if (this.lang != undefined) identity_elem.attrs.lang = this.lang;
        if (this.type != undefined) identity_elem.attrs.type = this.type;
        return identity_elem;
    }
}
