import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { NodeGlobalsPolyfillPlugin } from "@esbuild-plugins/node-globals-polyfill";
import { NodeModulesPolyfillPlugin } from "@esbuild-plugins/node-modules-polyfill";
import { fileURLToPath, URL } from "url";
import rollupNodePolyFill from 'rollup-plugin-node-polyfills';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte()],
	resolve: {
		alias: {
			"@": fileURLToPath(new URL("./src", import.meta.url)),
			stream: "rollup-plugin-node-polyfills/polyfills/stream",
			_stream_readable: 'rollup-plugin-node-polyfills/polyfills/readable-stream/readable',
            _stream_writable: 'rollup-plugin-node-polyfills/polyfills/readable-stream/writable',
			buffer: 'rollup-plugin-node-polyfills/polyfills/buffer-es6',
		},
	},
	optimizeDeps: {
		esbuildOptions: {
			define: {
				global: "globalThis"
			},
			plugins: [
				NodeGlobalsPolyfillPlugin({
					buffer: true
				}),
				NodeModulesPolyfillPlugin()
			]
		}
	},
	build: {
		target: "esnext",
		rollupOptions: {
			plugins: [
				rollupNodePolyFill()
			]
		}
	}
});
