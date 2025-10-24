export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["fonts/SF-Pro/SF-Pro-Text-Black.otf","fonts/SF-Pro/SF-Pro-Text-Bold.otf","fonts/SF-Pro/SF-Pro-Text-Heavy.otf","fonts/SF-Pro/SF-Pro-Text-Medium.otf","fonts/SF-Pro/SF-Pro-Text-Regular.otf","fonts/SF-Pro/SF-Pro-Text-Semibold.otf","fonts/SF-Pro/SF-Pro.ttf","og-image.png","robots.txt"]),
	mimeTypes: {".otf":"font/otf",".ttf":"font/ttf",".png":"image/png",".txt":"text/plain"},
	_: {
		client: {start:"_app/immutable/entry/start.BUcFZChE.js",app:"_app/immutable/entry/app.DdYnXnvr.js",imports:["_app/immutable/entry/start.BUcFZChE.js","_app/immutable/chunks/Dmy4zvNC.js","_app/immutable/chunks/BAwLGipD.js","_app/immutable/chunks/Bx2BwwXG.js","_app/immutable/entry/app.DdYnXnvr.js","_app/immutable/chunks/Bx2BwwXG.js","_app/immutable/chunks/BAwLGipD.js","_app/immutable/chunks/DsnmJJEf.js","_app/immutable/chunks/BDAM0HAq.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js')),
			__memo(() => import('./nodes/3.js'))
		],
		remotes: {
			
		},
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			},
			{
				id: "/callback",
				pattern: /^\/callback\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 3 },
				endpoint: null
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
