<script lang="ts">
 import { client, xml, type Client } from "@xmpp/client";
 import { jid } from "@xmpp/jid";
 import debug from "@xmpp/debug";
 import { Entity } from "./entity";
import { ServiceIdentity } from "./ServiceIdentity";

 let signin_done = false;
 let user_id: string;
 let password: string;
 let conn: Client;
 let ping_interval: NodeJS.Timer;
 let HENLY_NODE = "http://github.com/eniehack/henly-web";
let id = new ServiceIdentity("Henly! Web Viewer (Beta) v0.1.0", "client", "ja", "web");
let entity = new Entity(id, ["http://jabber.org/protocol/caps", "http://jabber.org/protocol/disco#items", "http://jabber.org/protocol/disco#info", "http://jabber.org/protocol/geoloc+notify", "http://jabber.org/protocol/geoloc"]);

 const signin = async () => {
     let addr = jid(user_id);
     console.log(addr);

     conn = client({
         service: `wss://${addr.domain}/xmpp-websocket`,
         domain: addr.domain,
         resource: "henly-web." + (new Date()).getTime().toString(),
         username: addr.local,
         password: password
     });
     console.log(conn);
     debug(conn, true);

     conn.on("error", (err) => {
         console.error(err);
     });

     conn.on("online", async (address) => {
         console.log("online as", address.toString());
         /*
         let disco_info = await conn.iqCaller.get(
             xml("query", "http://jabber.org/protocol/disco#info"),
             addr.bare().toString()
         );

         console.log(disco_info);
         */

         let ver = entity.ver();
         conn.send(
             xml("presence",
                 {from: addr.toString()},
                 xml("c", {xmlns: "http://jabber.org/protocol/caps", hash: "sha-1", node: HENLY_NODE, ver: ver})
             )
         );

         ping_interval = setInterval(() => {
             conn.iqCaller.get(
                 xml("ping", "urn:xmpp:ping"),
                 addr.domain
             );
         }, 1000 * 60);
         signin_done = true;
     });

     conn.on("stanza", async (stanza) => {
         let query = stanza.getChild("query")
         if (query != undefined && stanza.attrs.type == "get" && query.attrs.xmlns == "http://jabber.org/protocol/disco#info") {
             let info = entity.getQuery(jid(stanza.attrs.from), jid(stanza.attrs.to), stanza.attrs.id, query.attrs.node);
             console.log(info);
             conn.send(info);
         }
         console.log(stanza);
     });

     conn.on("offline", () => {
         console.log("offline");
         clearInterval(ping_interval);
     });

     conn.start().catch(console.error);
 }

</script>

{#if !signin_done}
    <div>
        <label for="jid">JID: </label>
        <input type="text" bind:value={user_id} placeholder="JID" autocomplete="username" required />
    </div>
    <div>
        <label for="password">Password: </label>
        <input type="password" bind:value={password} placeholder="password" autocomplete="current-password" required />
    </div>
    <button id="signin" on:click={signin}>sign in</button>
{/if}
