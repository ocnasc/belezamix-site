import { readFileSync, rmSync } from "node:fs";
import path from "node:path";
import Eleventy from "@11ty/eleventy";
import { validar, montarSite } from "./conteudo.js";

export const DOMINIO = "https://belezamixjundiai.com.br";

const FONTES = [
  "@fontsource/nunito/files/nunito-latin-700-normal.woff2",
  "@fontsource/nunito/files/nunito-latin-800-normal.woff2",
  "@fontsource/nunito-sans/files/nunito-sans-latin-400-normal.woff2",
  "@fontsource/nunito-sans/files/nunito-sans-latin-600-normal.woff2",
  "@fontsource/nunito-sans/files/nunito-sans-latin-700-normal.woff2",
];
const ICONES = {
  "whatsapp.svg": "@phosphor-icons/core/assets/bold/whatsapp-logo-bold.svg",
  "map-pin.svg": "@phosphor-icons/core/assets/bold/map-pin-bold.svg",
};

function urlBasePara(modo) {
  if (modo === "lancamento") return DOMINIO;
  return (process.env.CF_PAGES_URL || "http://localhost:8080").replace(/\/$/, "");
}

// invariant: código 1 nunca escreve em `saida`; a validação roda antes da limpeza e do Eleventy
export async function build({
  conteudo = "conteudo/conteudo.json",
  saida = "_site",
  modo = "previa",
  agora = new Date(),
  urlBase = urlBasePara(modo),
} = {}) {
  const raiz = process.cwd();
  const dados = JSON.parse(readFileSync(path.resolve(raiz, conteudo), "utf8"));
  const { erros, pendencias } = validar(dados, { raiz });

  const linhas = erros.map((e) => `${e.alvo}: ${e.campo} inválido (${e.detalhe})`);
  if (modo === "lancamento") linhas.push(...pendencias.map((p) => `${p.alvo}: ${p.campo}`));
  if (linhas.length > 0) return { codigo: 1, linhas };

  const site = montarSite(dados, { modo, urlBase, agora });
  // why: o Eleventy não limpa a saída; arquivo de um build antigo seria publicado como se fosse atual
  rmSync(path.resolve(raiz, saida), { recursive: true, force: true });

  const fotos = (dados.lojas ?? []).flatMap((l) => [l.fotoFachada, ...(l.fotos ?? [])]).filter(Boolean);
  const elev = new Eleventy("src", saida, {
    quietMode: true,
    config(cfg) {
      cfg.addGlobalData("site", site);
      cfg.addPassthroughCopy({ "src/assets/site.css": "assets/site.css" });
      cfg.addPassthroughCopy({ "conteudo/logo-belezamix.png": "assets/logo-belezamix.png" });
      for (const f of FONTES) cfg.addPassthroughCopy({ [`node_modules/${f}`]: `assets/fontes/${path.basename(f)}` });
      for (const [nome, f] of Object.entries(ICONES)) cfg.addPassthroughCopy({ [`node_modules/${f}`]: `assets/icones/${nome}` });
      for (const f of fotos) cfg.addPassthroughCopy({ [f.arquivo]: `fotos/${path.basename(f.arquivo)}` });
      if (!site.paginas.marcas) cfg.ignores.add("src/marcas.njk");
      if (!site.paginas.profissionais) cfg.ignores.add("src/profissionais.njk");
      if (!site.paginas.comoComprar) cfg.ignores.add("src/como-comprar.njk");
      if (modo !== "lancamento") cfg.ignores.add("src/sitemap.njk");
    },
  });
  await elev.write();
  return { codigo: 0, linhas: [] };
}
