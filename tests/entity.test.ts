import { test, expect } from "vitest";
import { Entity } from "../src/lib/entity";
import { jid } from "@xmpp/jid";
import { ServiceIdentity } from "../src/lib/ServiceIdentity";
import type { Element } from "@xmpp/xml";

test("Entity#encode_identity/1", () => {
    const features = ["http://jabber.org/protocol/caps", "http://jabber.org/protocol/disco#info", "http://jabber.org/protocol/disco#items", "http://jabber.org/protocol/muc"];
    const id = new ServiceIdentity("Exodus 0.9.1", "client", undefined, "pc");
    let entity = new Entity(id, features);
    expect(entity.encode_identity()).toBe(
        "client/pc//Exodus 0.9.1<http://jabber.org/protocol/caps<http://jabber.org/protocol/disco#info<http://jabber.org/protocol/disco#items<http://jabber.org/protocol/muc<"
    );
});

test("Entity#ver/1", () => {
    const features = ["http://jabber.org/protocol/caps", "http://jabber.org/protocol/disco#info", "http://jabber.org/protocol/disco#items", "http://jabber.org/protocol/muc"];
    const id = new ServiceIdentity("Exodus 0.9.1", "client", undefined, "pc");
    let entity = new Entity(id, features);
    expect(entity.ver()).toBe("QgayPKawpkPSDYmwT/WM94uAlu0=");
});

test("Entity#ver/2", () => {
    const features = ["http://jabber.org/protocol/caps", "http://jabber.org/protocol/disco#items", "http://jabber.org/protocol/disco#info", "http://jabber.org/protocol/muc"];
    const id = new ServiceIdentity("Exodus 0.9.1", "client", undefined, "pc");
    let entity = new Entity(id, features);
    expect(entity.ver()).toBe("QgayPKawpkPSDYmwT/WM94uAlu0=");
});

test("Entity#getQuery/1", () => {
    const features = ["http://jabber.org/protocol/caps", "http://jabber.org/protocol/disco#items", "http://jabber.org/protocol/disco#info", "http://jabber.org/protocol/muc"];
    const id = new ServiceIdentity("Exodus 0.9.1", "client", undefined, "pc");
    let entity = new Entity(id, features);
    let root_xml: Element = entity.getQuery(jid("alice","example.com", "test"), jid("bob", "example.com","test"), "test", "https://github.com/eniehack/henly-web-viewer#QgayPKawpkPSDYmwT/WM94uAlu0=");

    expect(root_xml.attrs.to).toBe("alice@example.com/test");
    expect(root_xml.attrs.from).toBe("bob@example.com/test");
    expect(root_xml.attrs.type).toBe("result");
    expect(root_xml.attrs.id).toBe("test");
    let query_xml = root_xml.getChild("query");
    expect(query_xml).toBeDefined();
    if (query_xml == undefined) return;
    expect(query_xml.attrs.xmlns).toBe("http://jabber.org/protocol/disco#info");
    expect(query_xml.attrs.node).toBe("https://github.com/eniehack/henly-web-viewer#QgayPKawpkPSDYmwT/WM94uAlu0=");

    let feature_elems = query_xml.getChildren("feature");
    let var_from_elems: string[] = [];
    feature_elems.forEach((elem) => {
        var_from_elems.push(elem.attrs.var)
    });
    expect(var_from_elems).toEqual(features);
});
