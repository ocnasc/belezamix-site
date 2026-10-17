import { test, after } from "node:test";
import assert from "node:assert/strict";
import { chromium } from "playwright-core";
import { COMPLETO, gerar, servir } from "./helpers.js";

// why: playwright-core usa o Edge já instalado no Windows; não baixa navegador (Landing do checklist)
let navegador;
let servidor;
let paginas;
// hazard: em `test:ci` estes testes são pulados; um `before` subiria servidor e navegador que ninguém fecha
async function preparar() {
  if (navegador) return;
  const r = await gerar(COMPLETO);
  assert.equal(r.codigo, 0, r.linhas.join("\n"));
  paginas = r.paginas();
  servidor = await servir(r.saida);
  navegador = await chromium.launch({ channel: "msedge" });
}
after(async () => {
  await navegador?.close();
  servidor?.fechar();
});

async function abrir(url, largura = 360, altura = 640) {
  await preparar();
  const p = await navegador.newPage({ viewport: { width: largura, height: altura } });
  await p.goto(servidor.url + url);
  await p.evaluate(() => document.fonts.ready);
  return p;
}

test("C11 [navegador] primeira tela da Início em 360×640", async () => {
  const p = await abrir("/");
  const seletores = [".topo__logo", ".selo", ".topo h1"];
  for (const loja of ["anhangabau", "eloy-chaves"]) {
    for (const s of ["h2", ".loja__info", ".btn-whats", ".link-mapa"]) seletores.push(`[aria-labelledby="loja-${loja}"] ${s}`);
  }
  for (const s of seletores) {
    const caixa = await p.locator(s).first().boundingBox();
    assert.ok(caixa, `${s} não está visível`);
    assert.ok(caixa.y >= 0 && caixa.y + caixa.height <= 640, `${s}: y=${caixa.y} h=${caixa.height} passa de 640`);
  }
  const textoDe = async (s) => (await p.locator(s).first().innerText()).replace(/\s+/g, " ").trim();
  assert.equal(await textoDe('[aria-labelledby="loja-anhangabau"] h2'), "Anhangabaú");
  assert.equal(await textoDe('[aria-labelledby="loja-eloy-chaves"] h2'), "Eloy Chaves");
  assert.equal(await textoDe('[aria-labelledby="loja-anhangabau"] .loja__info'), "Av. Jundiaí, 376 Seg–Sex 8h–17h · Sáb 8h–12h");
  assert.equal(await textoDe('[aria-labelledby="loja-eloy-chaves"] .loja__info'), "Av. Benedicto Castilho de Andrade, 558 Seg–Sex 8h–19h · Sáb 9h–12h");
  assert.equal(await textoDe('[aria-labelledby="loja-anhangabau"] .btn-whats'), "Chamar no WhatsApp");
  assert.equal(await textoDe('[aria-labelledby="loja-anhangabau"] .link-mapa'), "Como chegar");
  assert.equal((await p.locator(".topo h1").textContent()).trim(), "Tudo para unhas, cabelo e maquiagem, perto de você.");
  assert.equal((await p.locator(".selo").textContent()).trim(), "Há 20 anos em Jundiaí");
  await p.close();
});

test("C17 [navegador] WhatsApp antes do Como chegar e com área maior, em toda página", async () => {
  await preparar();
  for (const url of paginas) {
    for (const largura of [360, 1280]) {
      const p = await abrir(url, largura, 800);
      const blocos = await p.locator("section.loja").all();
      assert.ok(blocos.length > 0, url);
      for (const b of blocos) {
        const w = await b.locator(".btn-whats").boundingBox();
        const m = await b.locator(".link-mapa").boundingBox();
        assert.ok(w.y < m.y, `${url} @${largura}: WhatsApp (y=${w.y}) depois do Como chegar (y=${m.y})`);
        assert.ok(w.width * w.height > m.width * m.height, `${url} @${largura}: WhatsApp não é maior que Como chegar`);
      }
      await p.close();
    }
  }
});

test("C34 [navegador] contraste: branco sobre magenta só em texto grande, normal ≥4,5:1", async () => {
  await preparar();
  for (const url of paginas) {
    for (const largura of [360, 1280]) {
      const p = await abrir(url, largura, 800);
      const violacoes = await p.evaluate(() => {
        const rgb = (s) => s.match(/[\d.]+/g).map(Number);
        const lum = ([r, g, b]) => {
          const c = [r, g, b].map((v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; });
          return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
        };
        const fundo = (el) => {
          for (let e = el; e; e = e.parentElement) {
            const c = rgb(getComputedStyle(e).backgroundColor);
            if (c.length < 4 || c[3] > 0) return c.slice(0, 3);
          }
          return [255, 255, 255];
        };
        const erros = [];
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        for (let n = walker.nextNode(); n; n = walker.nextNode()) {
          if (!n.textContent.trim()) continue;
          const el = n.parentElement;
          const st = getComputedStyle(el);
          if (st.visibility === "hidden" || st.display === "none") continue;
          const fg = rgb(st.color).slice(0, 3);
          const bg = fundo(el);
          const [a, b] = [lum(fg), lum(bg)].sort((x, y) => y - x);
          const razao = (a + 0.05) / (b + 0.05);
          const tamanho = parseFloat(st.fontSize);
          const negrito = Number(st.fontWeight) >= 700;
          const grande = tamanho >= 24 || (tamanho >= 18.66 && negrito);
          const brancoNoMagenta = fg.join() === "255,255,255" && bg.join() === "239,1,141";
          if (brancoNoMagenta && !grande) erros.push(`branco sobre magenta em ${tamanho}px "${n.textContent.trim().slice(0, 30)}"`);
          else if (!brancoNoMagenta && !grande && razao < 4.5) erros.push(`${razao.toFixed(2)}:1 em "${n.textContent.trim().slice(0, 30)}"`);
          else if (!brancoNoMagenta && grande && razao < 3) erros.push(`${razao.toFixed(2)}:1 (grande) em "${n.textContent.trim().slice(0, 30)}"`);
        }
        return erros;
      });
      assert.deepEqual(violacoes, [], `${url} @${largura}px`);
      await p.close();
    }
  }
});
