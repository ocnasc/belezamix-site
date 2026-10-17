import { test, before } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { COMPLETO, REAL, gerar, tags } from "./helpers.js";

const CSS = readFileSync("src/assets/site.css", "utf8");
const TOKENS = ["#EF018D", "#FFFFFF", "#B5006A", "#FFF0F7", "#1A1A1A", "#5C5560"];
const HOVER_BOTAO = "#D9007F";

test("C33 só os tokens de cor e as fontes Nunito/Nunito Sans aprovadas", () => {
  const cores = [...CSS.matchAll(/#[0-9a-fA-F]{3,8}\b/g)].map((m) => m[0].toUpperCase());
  assert.ok(cores.length > 0);
  for (const c of cores) assert.ok([...TOKENS, HOVER_BOTAO].includes(c), `cor fora dos tokens: ${c}`);
  assert.doesNotMatch(CSS, /\b(rgba?|hsla?|hwb|lab|lch|oklch|color-mix)\(/, "cor fora de hex");
  const hover = [...CSS.matchAll(/var\(--brand-hover\)/g)];
  assert.equal(hover.length, 1, "--brand-hover só no hover do botão");
  assert.match(CSS, /\.btn-whats:hover \{ background: var\(--brand-hover\); \}/);

  const faces = [...CSS.matchAll(/@font-face \{ font-family: "([^"]+)"; font-weight: (\d+);/g)].map((m) => `${m[1]} ${m[2]}`);
  assert.deepEqual(faces.sort(), ["Nunito 700", "Nunito 800", "Nunito Sans 400", "Nunito Sans 600", "Nunito Sans 700"]);
  const familias = [...CSS.matchAll(/font-family: ([^;]+);/g)].map((m) => m[1]);
  for (const f of familias) assert.match(f, /^"Nunito( Sans)?"$/);
  assert.match(CSS, /--font-heading: "Nunito", system-ui, sans-serif;/);
  assert.match(CSS, /--font-body: "Nunito Sans", system-ui, sans-serif;/);
});

let builds;
before(async () => {
  builds = [await gerar(REAL), await gerar(COMPLETO), await gerar(COMPLETO, { modo: "lancamento" })];
});

const externo = (u) => /^(https?:)?\/\//.test(u);

test("C35 nenhuma página carrega recurso de outro domínio", () => {
  assert.doesNotMatch(CSS, /@import/);
  for (const m of CSS.matchAll(/url\("?([^")]+)"?\)/g)) assert.ok(!externo(m[1]), `site.css → ${m[1]}`);
  for (const r of builds) {
    for (const url of r.paginas()) {
      const html = readFileSync(path.join(r.saida, url, "index.html"), "utf8");
      const recursos = [
        ...tags(html, "link").filter((l) => l.rel !== "canonical").map((l) => l.href),
        ...tags(html, "script").map((s) => s.src),
        ...tags(html, "img").map((i) => i.src),
        ...tags(html, "source").map((s) => s.srcset),
        ...tags(html, "iframe").map((i) => i.src),
        ...tags(html, "video").map((v) => v.src),
      ].filter(Boolean);
      assert.ok(recursos.length > 0, url);
      for (const u of recursos) assert.ok(!externo(u), `${url} carrega ${u}`);
      assert.doesNotMatch(html, /style="[^"]*url\(/, url);
    }
  }
});
