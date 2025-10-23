
// this file is generated — do not edit it


declare module "svelte/elements" {
	export interface HTMLAttributes<T> {
		'data-sveltekit-keepfocus'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-noscroll'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-preload-code'?:
			| true
			| ''
			| 'eager'
			| 'viewport'
			| 'hover'
			| 'tap'
			| 'off'
			| undefined
			| null;
		'data-sveltekit-preload-data'?: true | '' | 'hover' | 'tap' | 'off' | undefined | null;
		'data-sveltekit-reload'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-replacestate'?: true | '' | 'off' | undefined | null;
	}
}

export {};


declare module "$app/types" {
	export interface AppTypes {
		RouteId(): "/" | "/callback";
		RouteParams(): {
			
		};
		LayoutParams(): {
			"/": Record<string, never>;
			"/callback": Record<string, never>
		};
		Pathname(): "/" | "/callback" | "/callback/";
		ResolvedPathname(): `${"" | `/${string}`}${ReturnType<AppTypes['Pathname']>}`;
		Asset(): "/fonts/SF-Pro/SF-Pro-Text-Black.otf" | "/fonts/SF-Pro/SF-Pro-Text-Bold.otf" | "/fonts/SF-Pro/SF-Pro-Text-Heavy.otf" | "/fonts/SF-Pro/SF-Pro-Text-Medium.otf" | "/fonts/SF-Pro/SF-Pro-Text-Regular.otf" | "/fonts/SF-Pro/SF-Pro-Text-Semibold.otf" | "/fonts/SF-Pro/SF-Pro.ttf" | "/robots.txt" | string & {};
	}
}