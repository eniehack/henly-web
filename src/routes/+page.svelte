<Header />
<main>
{#if ! $signin_done}
    <div>
        <label for="jid">JID: </label>
        <input type="text" bind:value={user_id} placeholder="JID" autocomplete="username" required />
    </div>
    <div>
        <label for="password">Password: </label>
        <input type="password" bind:value={password} placeholder="password" autocomplete="current-password" required />
    </div>
    <button id="signin" on:click={signin}>sign in</button>
{:else}
    <Map />
{/if}
</main>
<script lang="ts">
    import Map from "$lib/Map.svelte";
    import Header from "$lib/Header.svelte";
    import { client, xml, type Client } from "@xmpp/client";
    import { jid } from "@xmpp/jid";
    import debug from "@xmpp/debug";
    import { Entity } from "$lib/entity";
    import { ServiceIdentity } from "$lib/ServiceIdentity";
    import { myJID, locations, signin_done, mylocation } from "$lib/store";
    import { findGeolocStanza, Location } from "$lib/xmpp/xep-0080";
    import { generateResourceRandomPart } from "$lib/util";
    import { HostMeta } from "$lib/xmpp/xep-0156";
    let user_id: string;
    let password: string;
    let conn: Client;
    let ping_interval: NodeJS.Timer;
    let HENLY_NODE = "http://github.com/eniehack/henly-web";
    let id = new ServiceIdentity("Henly! Web Viewer (Beta) v0.1.0", "client", "ja", "web");
    let entity = new Entity(id, ["http://jabber.org/protocol/caps", "http://jabber.org/protocol/disco#items", "http://jabber.org/protocol/disco#info", "http://jabber.org/protocol/geoloc+notify", "http://jabber.org/protocol/geoloc"]);
    const signin = async () => {
        let addr = jid(user_id);
        console.debug(addr);
        let resource: string;
        let localStorage_jid = localStorage.getItem("jid")
        if (localStorage_jid === null) {
            resource = "henly-web." + generateResourceRandomPart();
            localStorage.setItem("jid", resource);
        } else {
            resource = localStorage_jid;
        }
        let hostmeta = await fetch(`https://${addr.domain}/.well-known/host-meta`, {
            method: "GET",
            redirect: "follow"
        }).then(resp => resp.text())
            .then(body => new HostMeta(body))
            .then(meta => meta.getWebSocketEndpoint());
        conn = client({
            service: hostmeta,
            domain: addr.domain,
            resource: resource,
            username: addr.local,
            password: password
        });
        console.debug(conn);
        if (import.meta.env.DEV === true) debug(conn, true);
             conn.on("error", (err) => {
            console.error(err);
        });
        conn.on("online", async (address) => {
            console.debug("online as", address.toString());
            let ver = entity.ver();
            conn.send(
                xml("presence",
                    {from: address.toString()},
                    xml("c", {xmlns: "http://jabber.org/protocol/caps", hash: "sha-1", node: HENLY_NODE, ver: ver})
                )
            );
            myJID.set(address);
            ping_interval = setInterval(() => {
               if (typeof $myJID === "undefined") return;
                conn.iqCaller.get(
                    xml("ping", "urn:xmpp:ping"),
                    $myJID.domain
                );
            }, 1000 * 60);
            $signin_done = true;
        });
        conn.on("stanza", async (stanza) => {
            let disco_info: Element | undefined
            let geoloc: Element | undefined
            if (stanza.is("iq") &&
                stanza.attrs.type == "get" &&
                typeof (disco_info = stanza.getChildByAttr("xmlns", "http://jabber.org/protocol/disco#info")) !== "undefined") {
                    let info = entity.getQuery(jid(stanza.attrs.from), jid(stanza.attrs.to), stanza.attrs.id, disco_info.attrs.node);
                    console.debug(info);
                    console.debug(conn.iqCaller.entity);
                    conn.send(info);
            } else if (typeof (geoloc = findGeolocStanza(stanza)) !== "undefined") {
                let loc = new Location();

                let lat = geoloc.getChild("lat")
                if (typeof lat !== "undefined") loc.lat = Number(lat.text());
                else return;

                let lon = geoloc.getChild("lon");
                if (typeof lon !== "undefined") loc.lng = Number(lon.text());
                else return;

                let acc = geoloc.getChild("accuracy");
                if (typeof acc !== "undefined") loc.acc = Number(acc.text());
                else return;

                let ts = geoloc.getChild("timestamp");
                if (typeof ts !== "undefined") {
                   loc.timestamp = ts.text();
                }
                locations.update((m) => {
                   //console.log(m)
                   m.set(stanza.attrs.from, loc);
                   return m;
                });
            }
            console.debug(stanza);
        });
        conn.on("offline", () => {
            console.debug("offline");
            clearInterval(ping_interval);
        });
        conn.start().catch(console.error);
    }

</script>

<Header />
<main>
    <Signin />
</main>

<style>
</style>