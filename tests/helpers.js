import { mkdtempSync, readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { createServer } from "node:http";
import os from "node:os";
import path from "node:path";
import { build } from "../lib/build.js";

export const AGORA = new Date("2026-06-01T12:00:00-03:00");
export const URL_PREVIA = "https://previa.teste";
export const COMPLETO = JSON.parse(readFileSync("tests/fixtures/completo.json", "utf8"));
export const REAL = JSON.parse(readFileSync("conteudo/conteudo.json", "utf8"));

export const clonar = (o) => structuredClone(o);

// why: cada build vai para um diretório temporário próprio, para um teste não ler a saída de outro
export async function gerar(conteudo, { modo, urlBase } = {}) {
  const dir = mkdtempSync(path.join(os.tmpdir(), "belezamix-"));
  const arquivo = path.join(dir, "conteudo.json");
  writeFileSync(arquivo, JSON.stringify(conteudo));
  const saida = path.join(dir, "saida");
  const r = await build({
    conteudo: arquivo,
    saida,
    agora: AGORA,
    ...(modo ? { modo } : {}),
    ...(urlBase ? { urlBase } : modo === "lancamento" ? {} : { urlBase: URL_PREVIA }),
  });
  return { ...r, saida, ...leitor(saida) };
}

function leitor(saida) {
  const arquivoDe = (url) => {
    const limpo = decodeURI(url.split(/[?#]/)[0]);
    return path.join(saida, limpo.endsWith("/") ? `${limpo}index.html` : limpo);
  };
  return {
    existe: (url) => existsSync(arquivoDe(url)),
    html: (url) => readFileSync(arquivoDe(url), "utf8"),
    paginas: () => listarHtml(saida).map((f) => "/" + path.relative(saida, f).replaceAll("\\", "/").replace(/index\.html$/, "")),
  };
}

export function listarHtml(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { recursive: true, withFileTypes: true })
    .filter((e) => e.isFile() && e.name.endsWith(".html"))
    .map((e) => path.join(e.parentPath, e.name));
}

export const decodificar = (s) =>
  s.replaceAll("&quot;", '"').replaceAll("&#39;", "'").replaceAll("&lt;", "<").replaceAll("&gt;", ">").replaceAll("&amp;", "&");

export function tags(html, tag) {
  return [...html.matchAll(new RegExp(`<${tag}\\b([^>]*)>`, "gi"))].map((m) => {
    const attrs = {};
    for (const a of m[1].matchAll(/([\w:-]+)\s*=\s*"([^"]*)"/g)) attrs[a[1]] = decodificar(a[2]);
    return attrs;
  });
}

export const texto = (html) => decodificar(html.replace(/<script[\s\S]*?<\/script>/g, "").replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ");
export const trecho = (html, tag) => (html.match(new RegExp(`<${tag}\\b[\\s\\S]*?</${tag}>`)) ?? [""])[0];
export const meta = (html, prop) => tags(html, "meta").find((m) => m.property === prop || m.name === prop)?.content;

export const ehInterno = (url) => !/^(https?:|mailto:|tel:|#|data:)/.test(url);

export function referencias(html) {
  return [
    ...tags(html, "a").map((a) => a.href),
    ...tags(html, "link").map((l) => l.href),
    ...tags(html, "img").map((i) => i.src),
    ...tags(html, "script").map((s) => s.src),
  ].filter(Boolean);
}

export function servir(dir) {
  const tipos = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".svg": "image/svg+xml", ".png": "image/png", ".webp": "image/webp", ".woff2": "font/woff2" };
  const server = createServer((req, res) => {
    let p = decodeURI(new URL(req.url, "http://x").pathname);
    if (p.endsWith("/")) p += "index.html";
    const f = path.join(dir, p);
    if (!existsSync(f)) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { "content-type": tipos[path.extname(f)] ?? "application/octet-stream" });
    res.end(readFileSync(f));
  });
  return new Promise((resolve) => server.listen(0, "127.0.0.1", () => resolve({ url: `http://127.0.0.1:${server.address().port}`, fechar: () => server.close() })));
}
