import { HostMeta } from '$lib/xmpp/xep-0156';
import { client, xml, type Client } from '@xmpp/client';
import type { JID } from '@xmpp/jid';
import type { Element } from '@xmpp/xml';
import debug from '@xmpp/debug';

import { Entity } from '$lib/entity';
import { ServiceIdentity } from '$lib/ServiceIdentity';

import { myJID, locations, signin_done, key } from '$lib/store';
import { findGeolocStanza, Location } from '$lib/xmpp/xep-0080';

const HENLY_NODE = 'http://github.com/eniehack/henly-web';
const id = new ServiceIdentity('Henly! Web Viewer (Beta) v0.1.0', 'client', 'ja', 'web');
const entity = new Entity(id, [
	'http://jabber.org/protocol/caps',
	'http://jabber.org/protocol/disco#items',
	'http://jabber.org/protocol/disco#info',
	'http://jabber.org/protocol/geoloc+notify',
	'http://jabber.org/protocol/geoloc'
]);

export const initializeClient = async (addr: JID, password: string): Promise<Client> => {
	let hostmeta = await fetch(`https://${addr.domain}/.well-known/host-meta`, {
		method: 'GET',
		redirect: 'follow'
	})
		.then((resp) => resp.text())
		.then((body) => new HostMeta(body))
		.then((meta) => meta.getWebSocketEndpoint());
	let ping_interval: NodeJS.Timer;
	let conn = client({
		service: hostmeta,
		resource: addr.resource,
		password,
		domain: addr.domain,
		username: addr.local
	});
	console.debug(conn);
	if (import.meta.env.DEV === true) debug(conn, true);
	conn.on('error', (err) => {
		console.error(err);
	});
	conn.on('online', async (address) => {
		console.debug('online as', address.toString());
		let ver = entity.ver();
		conn.send(
			xml(
				'presence',
				{ from: address.toString() },
				xml('c', {
					xmlns: 'http://jabber.org/protocol/caps',
					hash: 'sha-1',
					node: HENLY_NODE,
					ver: ver
				})
			)
		);
		myJID.set(address);
		ping_interval = setInterval(() => {
			conn.iqCaller.get(xml('ping', 'urn:xmpp:ping'), addr.domain);
		}, 1000 * 60);
		conn.iqCallee.get('http://jabber.org/protocol/disco#info', 'query', (ctx) => {
			if (ctx.from === null || ctx.to === null) return;
			let info = entity.getQuery(ctx.from, ctx.to, ctx.id, ctx.stanza.attrs.node);
			//console.debug(info);
			return info;
		});
	});
	conn.on('stanza', async (stanza) => {
		let geoloc: Element | undefined;
		if (typeof (geoloc = findGeolocStanza(stanza)) !== 'undefined') {
			let loc = new Location();

			let lat = geoloc.getChild('lat');
			if (typeof lat !== 'undefined') loc.lat = Number(lat.text());
			else return;

			let lon = geoloc.getChild('lon');
			if (typeof lon !== 'undefined') loc.lng = Number(lon.text());
			else return;

			let acc = geoloc.getChild('accuracy');
			if (typeof acc !== 'undefined') loc.acc = Number(acc.text());
			else return;

			let ts = geoloc.getChild('timestamp');
			if (typeof ts !== 'undefined') {
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
	conn.on('offline', () => {
		console.debug('offline');
		clearInterval(ping_interval);
	});
	conn.start().catch(console.error);
	return conn;
};
