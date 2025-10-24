export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["fonts/SF-Pro/SF-Pro-Text-Black.otf","fonts/SF-Pro/SF-Pro-Text-Bold.otf","fonts/SF-Pro/SF-Pro-Text-Heavy.otf","fonts/SF-Pro/SF-Pro-Text-Medium.otf","fonts/SF-Pro/SF-Pro-Text-Regular.otf","fonts/SF-Pro/SF-Pro-Text-Semibold.otf","fonts/SF-Pro/SF-Pro.ttf","robots.txt"]),
	mimeTypes: {".otf":"font/otf",".ttf":"font/ttf",".txt":"text/plain"},
	_: {
		client: {start:"_app/immutable/entry/start.5nCvNSWy.js",app:"_app/immutable/entry/app.BvODeX6J.js",imports:["_app/immutable/entry/start.5nCvNSWy.js","_app/immutable/chunks/HDT4UPvz.js","_app/immutable/chunks/CHmOn01Q.js","_app/immutable/chunks/DQBhV38n.js","_app/immutable/entry/app.BvODeX6J.js","_app/immutable/chunks/DQBhV38n.js","_app/immutable/chunks/CHmOn01Q.js","_app/immutable/chunks/DsnmJJEf.js","_app/immutable/chunks/tt7bTpbt.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
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
