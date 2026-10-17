import { test, before } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { DOMINIO } from "../lib/build.js";
import { COMPLETO, REAL, ehInterno, gerar, meta, referencias, tags } from "./helpers.js";

let previa;
let lancamento;
before(async () => {
  previa = await gerar(REAL, { modo: "previa" });
  lancamento = await gerar(COMPLETO, { modo: "lancamento" });
  assert.equal(previa.codigo, 0, previa.linhas.join("\n"));
  assert.equal(lancamento.codigo, 0, lancamento.linhas.join("\n"));
});

const noindex = (html) => tags(html, "meta").some((m) => m.name === "robots" && m.content === "noindex");

test("C27 prévia por padrão: noindex, sem sitemap e links internos a partir da raiz", async () => {
  const padrao = await gerar(REAL);
  assert.equal(padrao.codigo, 0);
  for (const r of [previa, padrao]) {
    assert.ok(r.paginas().length >= 3);
    assert.ok(!r.existe("/sitemap.xml"));
    for (const url of r.paginas()) {
      const html = r.html(url);
      assert.ok(noindex(html), url);
      for (const ref of referencias(html).filter(ehInterno)) assert.ok(ref.startsWith("/"), `${url}: ${ref}`);
    }
  }
});

test("C28 lançamento: indexável, canônica no domínio e sitemap exato", () => {
  const canonicas = [];
  for (const url of lancamento.paginas()) {
    const html = lancamento.html(url);
    assert.ok(!noindex(html), url);
    const canonical = tags(html, "link").find((l) => l.rel === "canonical")?.href;
    assert.equal(canonical, DOMINIO + url);
    assert.equal(meta(html, "og:url"), DOMINIO + url);
    canonicas.push(canonical);
  }
  const sitemap = lancamento.html("/sitemap.xml");
  const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  assert.deepEqual([...locs].sort(), [...canonicas].sort());
  assert.equal(locs.length, 6);
});

test("C29 todo link interno aponta para um arquivo existente, nos dois modos", () => {
  for (const r of [previa, lancamento]) {
    for (const url of r.paginas()) {
      for (const ref of referencias(r.html(url)).filter(ehInterno)) assert.ok(r.existe(ref), `${url} → ${ref}`);
    }
    const css = readFileSync(path.join(r.saida, "assets/site.css"), "utf8");
    for (const m of css.matchAll(/url\("([^"]+)"\)/g)) assert.ok(r.existe(m[1]), `site.css → ${m[1]}`);
  }
});

test("C30 npm test roda o test runner nativo sobre tests/", () => {
  const pkg = JSON.parse(readFileSync("package.json", "utf8"));
  assert.equal(pkg.scripts.test, 'node --test "tests/**/*.test.js"');
});

test("C32 workflow anual: cron, disparo manual, secret e falha sem 2xx", () => {
  const f = ".github/workflows/regeracao-anual.yml";
  assert.ok(existsSync(f));
  const y = readFileSync(f, "utf8");
  assert.match(y, /- cron: "0 3 1 1 \*"/);
  assert.match(y, /^\s*workflow_dispatch:/m);
  assert.match(y, /\$\{\{ secrets\.CLOUDFLARE_DEPLOY_HOOK \}\}/);
  assert.match(y, /-X POST "\$DEPLOY_HOOK"/);
  assert.match(y, /case "\$codigo" in 2\?\?\) ;; \*\) exit 1 ;; esac/);
});
