import { HostMeta } from "../src/lib/xmpp/xep-0156";
import { test, expect } from "vitest";

test("xep-0156#", () => {
    let text = `<XRD xmlns='http://docs.oasis-open.org/ns/xri/xrd-1.0'>
<Link rel="urn:xmpp:alt-connections:websocket" href="wss://xmpp.localhost:443/websocket" />
<Link rel="urn:xmpp:alt-connections:xbosh" href="https://xmpp.localhost/bosh" />
</XRD>
`
    let meta = new HostMeta(text);
    expect(meta.getWebSocketEndpoint()).toBe("wss://xmpp.localhost:443/websocket");
});
