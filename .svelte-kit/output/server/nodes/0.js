

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export const imports = ["_app/immutable/nodes/0.dyukih40.js","_app/immutable/chunks/DsnmJJEf.js","_app/immutable/chunks/Bx2BwwXG.js","_app/immutable/chunks/Dfm8iPyl.js"];
export const stylesheets = ["_app/immutable/assets/0.D7CmOlve.css"];
export const fonts = [];
