import { y as attr_class, z as stringify } from "../../chunks/index2.js";
import { a as ssr_context, e as escape_html } from "../../chunks/context.js";
import "node-vibrant/browser";
function onDestroy(fn) {
  /** @type {SSRContext} */
  ssr_context.r.on_destroy(fn);
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let track;
    let authorized = false;
    let nowPlaying = null;
    let trackExtra = null;
    onDestroy(() => {
    });
    track = nowPlaying?.item;
    track?.album?.images?.[0]?.url || "";
    track?.popularity ?? trackExtra?.popularity ?? null;
    $$renderer2.push(`<div${attr_class("status svelte-1uha8ag", void 0, { "connected": authorized, "disconnected": !authorized })}><span${attr_class(`dot ${stringify("red")}`, "svelte-1uha8ag")}></span> <span>Status: ${escape_html("Disconnected")}</span> `);
    {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<button class="svelte-1uha8ag">Sign In</button>`);
    }
    $$renderer2.push(`<!--]--></div> `);
    {
      $$renderer2.push("<!--[!-->");
      {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--> <div class="zero-state svelte-1uha8ag" role="region" aria-label="Sign in to Sonora"><div class="zero-card svelte-1uha8ag"><h2 class="svelte-1uha8ag">You’re signed out</h2> <p class="lead svelte-1uha8ag">Sign in with Spotify to show currently playing tracks, album art and the vinyl visualizer.</p> <button class="btn svelte-1uha8ag">Sign in with Spotify</button> <p class="hint svelte-1uha8ag">No account? Visit <a href="https://spotify.com" target="_blank" rel="noopener noreferrer" class="svelte-1uha8ag">spotify.com</a>.</p></div></div>`);
    }
    $$renderer2.push(`<!--]-->`);
  });
}
export {
  _page as default
};
