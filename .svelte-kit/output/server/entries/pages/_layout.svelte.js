import { w as head, x as attr } from "../../chunks/index2.js";
const favicon = "/_app/immutable/assets/favicon.Fer-DQoJ.svg";
function _layout($$renderer, $$props) {
  let { children } = $$props;
  head($$renderer, ($$renderer2) => {
    $$renderer2.title(($$renderer3) => {
      $$renderer3.push(`<title>Sonora 🎧</title>`);
    });
    $$renderer2.push(`<link rel="icon"${attr("href", favicon)}/> <meta name="description" content="SPA For showing your Music Status via the spotify web API"/> <meta property="og:title" content="Sonora 🎧"/> <meta property="og:description" content="SPA For showing your Music Status via the spotify web API"/> <meta property="og:image" content="https://sonora.stream/og-image.png"/> <meta property="og:url" content="https://sonora.stream/"/> <meta property="og:type" content="website"/> <meta name="twitter:card" content="summary_large_image"/> <meta name="twitter:title" content="Sonora 🎧"/> <meta name="twitter:description" content="SPA For showing your Music Status via the spotify web API"/> <meta name="twitter:image" content="https://sonora.stream/og-image.png"/>`);
  });
  children?.($$renderer);
  $$renderer.push(`<!---->`);
}
export {
  _layout as default
};
