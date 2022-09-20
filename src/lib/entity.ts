import xml from "@xmpp/xml";
import type { Element } from "@xmpp/xml";
import type { JID } from "@xmpp/jid";
import type { ServiceIdentity } from "./ServiceIdentity";
//import { createHash, type Hash } from "crypto";
import sha1 from "crypto-js/sha1";
import Base64 from "crypto-js/enc-base64";

const bufferToBase64Str = (buf: ArrayBuffer) : string => {
    // ref: https://memo.appri.me/programming/arraybuffer-to-blob-etc#ArrayBuffer__Base64
    let binary = "";
    const bytes = new Uint8Array(buf);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary)
}

export class Entity {
    //private hash: Hash;

    constructor(public id: ServiceIdentity,
                public features: string[]) {
        //this.hash = createHash("sha1");
    }

    encode_identity(): string {
        var id_str = (this.id.category ?? "") + "/";
        id_str += (this.id.type ?? "") + "/";
        id_str += (this.id.lang ?? "") + "/";
        id_str += this.id.name + "<";
        this.features.sort();
        this.features.forEach((elem) => {
            id_str += (elem + "<");
        });
        return id_str;
    }

        /*
    ver(): Promise<string> {
        const txt = new TextEncoder().encode(this.encode_identity());
        let ver = window.crypto.subtle.digest("SHA-1", txt)
            .then((buf) => bufferToBase64Str(buf))
        return ver;
        //return "QgayPKawpkPSDYmwT/WM94uAlu0=";
    }
     */

    ver(): string {
        //this.hash.update(this.encode_identity());
        //let ver = this.hash.digest("base64");
        return Base64.stringify(sha1(this.encode_identity()));
        //return "QgayPKawpkPSDYmwT/WM94uAlu0=";
    }

    getQuery(to: JID, from: JID, id: string, node: string): Element {
        let features_xml: Element[] = [];
        this.features.forEach((elem) => {
            features_xml.push(
                xml("feature", {var: elem})
            );
        });
        return xml("iq", {from: from.toString(), to: to.toString(), type: "result", id: id},
            xml("query",
                { xmlns: "http://jabber.org/protocol/disco#info", node: node },
                this.id.to_xml(),
                ...features_xml
            )
           );
    }
}
