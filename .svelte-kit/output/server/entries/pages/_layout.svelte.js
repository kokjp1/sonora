import { w as head, x as attr } from "../../chunks/index2.js";
const favicon = "/_app/immutable/assets/favicon.Fer-DQoJ.svg";
function _layout($$renderer, $$props) {
  let { children } = $$props;
  head($$renderer, ($$renderer2) => {
    $$renderer2.push(`<link rel="icon"${attr("href", favicon)}/>`);
  });
  children?.($$renderer);
  $$renderer.push(`<!---->`);
}
export {
  _layout as default
};
