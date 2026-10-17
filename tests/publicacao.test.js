import { test, before } from "node:test";
import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import os from "node:os";
import path from "node:path";
import { COMPLETO, REAL, URL_PREVIA, ehInterno, gerar, meta, referencias, tags } from "./helpers.js";

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
      for (const ref of referencias(html)) assert.ok(!ref.startsWith(URL_PREVIA), `${url}: link absoluto para o próprio site ${ref}`);
    }
  }
});

test("C28 lançamento: indexável, canônica no domínio e sitemap exato", () => {
  const canonicas = [];
  for (const url of lancamento.paginas()) {
    const html = lancamento.html(url);
    assert.ok(!noindex(html), url);
    const canonical = tags(html, "link").find((l) => l.rel === "canonical")?.href;
    assert.equal(canonical, "https://belezamixjundiai.com.br" + url);
    assert.equal(meta(html, "og:url"), "https://belezamixjundiai.com.br" + url);
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

test("C30 o CLI de build não aceita --saida", () => {
  // hazard: se a opção voltar, o build apaga o caminho recebido; por isso o alvo é uma pasta temporária com sentinela, nunca a raiz
  const dir = mkdtempSync(path.join(os.tmpdir(), "belezamix-saida-"));
  const sentinela = path.join(dir, "sentinela.txt");
  writeFileSync(sentinela, "não apagar");
  const r = spawnSync(process.execPath, ["scripts/build.js", "--saida", dir], { encoding: "utf8" });
  assert.notEqual(r.status, 0);
  assert.match(r.stderr, /saida/);
  assert.ok(existsSync(sentinela), "o build apagou a pasta passada em --saida");
});

test("C30 npm test roda o test runner nativo sobre tests/", () => {
  const pkg = JSON.parse(readFileSync("package.json", "utf8"));
  assert.equal(pkg.scripts.test, 'node --test "tests/**/*.test.js"');
});

