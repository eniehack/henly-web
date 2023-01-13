import { sveltekit } from '@sveltejs/kit/vite';
import type { UserConfig } from 'vite';
//import inject from "@rollup/plugin-inject";
import path from 'path';
//import nodeStdlibBrowser from "node-stdlib-browser";
import { NodeGlobalsPolyfillPlugin } from "@esbuild-plugins/node-globals-polyfill";
import { NodeModulesPolyfillPlugin } from "@esbuild-plugins/node-modules-polyfill";
import rollupNodePolyFill from "rollup-plugin-node-polyfills";

const polyfills = []
polyfills.push(path.resolve(__dirname, './utils/Buffer.js'))
polyfills.push(path.resolve(__dirname, './utils/process.js'))

const config: UserConfig = {
	plugins: [
        sveltekit(),
    ],
	//test: {
	//	include: ['src/**/*.{test,spec}.{js,ts}']
	//},
    resolve: {
		alias: {
			//"@": path.resolve(__dirname, "src"),
			util: 'rollup-plugin-node-polyfills/polyfills/util',
			stream: "rollup-plugin-node-polyfills/polyfills/stream",
            _stream_duplex:
                'rollup-plugin-node-polyfills/polyfills/readable-stream/duplex',
            _stream_passthrough:
                'rollup-plugin-node-polyfills/polyfills/readable-stream/passthrough',
            _stream_readable:
                'rollup-plugin-node-polyfills/polyfills/readable-stream/readable',
            _stream_writable:
                'rollup-plugin-node-polyfills/polyfills/readable-stream/writable',
            _stream_transform:
                'rollup-plugin-node-polyfills/polyfills/readable-stream/transform',
		},
	},
    optimizeDeps: {
        //include: ["buffer", "process"],
		esbuildOptions: {
			define: {
				global: "globalThis",
			},
			plugins: [
                /*
				NodeGlobalsPolyfillPlugin({
                    process: true,
					buffer: true,
				}),
                */
		        NodeModulesPolyfillPlugin(),
			],
            inject: [...polyfills]
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
};

export default config;
