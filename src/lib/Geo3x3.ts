// SPDX-License-Identifier: CC0-1.0
// Original Author: taisukef
// Original Source: https://raw.githubusercontent.com/taisukef/Geo3x3/fdb91874025bb35ed5c754a1a462774f37c35dc9/Geo3x3.ts
class Geo3x3 {
	static encode(lat: number, lng: number, level: number): string {
		if (level < 1) {
			return "";
		}
		let res = "E";
		if (lng < 0) {
			res = "W";
			lng += 180;
		}
		lat += 90; // 180:the North Pole, 0:the South Pole
		let unit = 180;
		for (let i = 1; i < level; i++) {
			unit /= 3;
			const x = Math.floor(lng / unit);
			const y = Math.floor(lat / unit);
			res += x + y * 3 + 1;
			lng -= x * unit;
			lat -= y * unit;
		}
		return res;
	}
	static decode(code: string): { lat: number, lng: number, level: number, unit: number } {
		const ncode = parseInt(code);
		if (ncode.toString() == code) {
			if (ncode < 0) {
				code = "W" + -ncode;
			} else {
				code = "E" + ncode;
			}
		}
		const flg = code.charAt(0) == "W";
		let unit = 180;
		let lat = 0;
		let lng = 0;
		let level = 1;
		for (let i = 1; i < code.length; i++) {
			let n = "0123456789".indexOf(code.charAt(i));
			if (n == 0) {
				break;
			}
			unit /= 3;
			n--;
			lng += (n % 3) * unit;
			lat += Math.floor(n / 3) * unit;
			level++;
		}
		lat += unit / 2;
		lng += unit / 2;
		lat -= 90;
		if (flg) {
			lng -= 180;
		}
		return { lat, lng, level, unit };
	}
	static getCoords(code: string): [ { lat: number, lng: number }, { lat: number, lng: number }, { lat: number, lng: number }, { lat: number, lng: number }, ] {
		const pos = this.decode(code);
		const x = pos.lng;
		const y = pos.lat;
		const u2 = pos.unit / 2;
		return [
			{ "lat" : y - u2, "lng" : x - u2 },
			{ "lat" : y - u2, "lng" : x + u2 },
			{ "lat" : y + u2, "lng" : x + u2 },
			{ "lat" : y + u2, "lng" : x - u2 }
		];
	}
	static getMeshSize(code: string): object { // m
		const lls = this.getCoords(code);
		const xy = new Array(4);
		for (let i = 0; i < xy.length; i++) {
			xy[i] = this.ll2xy(lls[i].lat, lls[i].lng);
		}
		const x = xy[1].x - xy[0].x;
		const y = xy[2].y - xy[1].y;
		return { x, y };
	}
	static R2_EARTH = 12756274; // m from https://ja.wikipedia.org/wiki/%E5%9C%B0%E7%90%83
	static RPI_EARTH = Geo3x3.R2_EARTH * Math.PI / 2 / 180;
	static ll2xy(lat: number, lng: number): { x: number, y: number } {
		const x = this.RPI_EARTH * lng;
		const y = this.RPI_EARTH * Math.log(Math.tan((90 + lat) * Math.PI / 360)) / (Math.PI / 180);
		return { x, y };
	}
	static xy2ll(x: number, y: number): { lat: number, lng: number } {
		const lng = x / this.RPI_EARTH;
		let lat = y / this.RPI_EARTH;
		lat = 180 / Math.PI * (2 * Math.atan(Math.exp(lat * Math.PI / 180)) - Math.PI / 2);
		return { lat, lng };
	}
}

export { Geo3x3 };
