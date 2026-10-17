import { test, before } from "node:test";
import assert from "node:assert/strict";
import { COMPLETO, MINIMO, URL_PREVIA, clonar, gerar, meta, tags, texto, trecho } from "./helpers.js";

let completo;
before(async () => {
  completo = await gerar(COMPLETO);
  assert.equal(completo.codigo, 0, completo.linhas.join("\n"));
});

const WHATS_ANHANGABAU = "https://wa.me/5511999990000?text=Ol%C3%A1!%20Vim%20pelo%20site%2C%20loja%20Anhangaba%C3%BA";
const MAPA_ANHANGABAU = "https://www.google.com/maps/search/?api=1&query=Belezamix%20(Anhangaba%C3%BA)&query_place_id=ChIJ3wjOYpAmz5QRd_NY4r1x-mo";
const botoesWhats = (html) => tags(html, "a").filter((a) => a.class === "btn-whats");

test("C12 selo de anos só na Início, calculado ou [PENDENTE]", async () => {
  assert.ok(texto(trecho(completo.html("/"), "header")).includes("Há 20 anos em Jundiaí"));
  for (const url of completo.paginas().filter((u) => u !== "/")) {
    assert.ok(!/Há .{0,40} anos/.test(texto(completo.html(url))), url);
  }
  assert.ok(!/Há .{0,40} anos/.test(texto(trecho(completo.html("/"), "footer"))));
  const real = await gerar(MINIMO);
  assert.ok(texto(trecho(real.html("/"), "header")).includes("Há [PENDENTE: anoFundacao] anos em Jundiaí"));
});

test("C13 botão de WhatsApp da loja Anhangabaú aponta para a URL exata", () => {
  const hrefs = botoesWhats(completo.html("/")).map((a) => a.href);
  assert.ok(hrefs.includes(WHATS_ANHANGABAU), hrefs.join("\n"));
});

test("C14 mensagem por loja, texto visível e aria-label com o nome curto", () => {
  const html = completo.html("/");
  const botoes = botoesWhats(html);
  assert.equal(botoes.length, 2);
  const mensagens = botoes.map((b) => decodeURIComponent(new URL(b.href).searchParams.get("text")));
  assert.deepEqual(mensagens, ["Olá! Vim pelo site, loja Anhangabaú", "Olá! Vim pelo site, loja Eloy Chaves"]);
  assert.deepEqual(botoes.map((b) => b["aria-label"]), ["Chamar no WhatsApp da loja Anhangabaú", "Chamar no WhatsApp da loja Eloy Chaves"]);
  const visiveis = [...html.matchAll(/<a class="btn-whats"[^>]*>([\s\S]*?)<\/a>/g)].map((m) => texto(m[1]).trim());
  assert.deepEqual(visiveis, ["Chamar no WhatsApp", "Chamar no WhatsApp"]);
});

test("C15 Como chegar aponta para o Maps com nome e Place ID", () => {
  const hrefs = tags(completo.html("/"), "a").filter((a) => a.class === "link-mapa").map((a) => a.href);
  assert.ok(hrefs.includes(MAPA_ANHANGABAU), hrefs.join("\n"));
  assert.ok(hrefs.includes("https://www.google.com/maps/search/?api=1&query=Belezamix%20Eloy%20Chaves&query_place_id=ChIJoygNBBklz5QRUl-scTsYM3g"));
});

test("C16 toda página tem og:title, og:description, og:url e og:image absolutos", () => {
  for (const url of completo.paginas()) {
    const html = completo.html(url);
    for (const p of ["og:title", "og:description"]) assert.ok(meta(html, p)?.length > 0, `${url} ${p}`);
    assert.equal(meta(html, "og:url"), URL_PREVIA + url);
    assert.equal(meta(html, "og:image"), `${URL_PREVIA}/assets/logo-belezamix.png`);
  }
});

test("C18 páginas de loja com fachada, endereço, horários, ações e título", () => {
  const casos = [
    ["/lojas/anhangabau/", "Cosméticos em Anhangabaú, Jundiaí | Belezamix", "Fachada de teste da loja Anhangabaú", "Av. Jundiaí, 376 – Anhangabaú, Jundiaí/SP, 13208-051", ["Seg–Sex 8h–17h", "Sáb 8h–12h"]],
    ["/lojas/eloy-chaves/", "Cosméticos em Parque Eloy Chaves, Jundiaí | Belezamix", "Fachada de teste da loja Eloy Chaves", "Av. Benedicto Castilho de Andrade, 558 – Parque Eloy Chaves, Jundiaí/SP, 13212-070", ["Seg–Sex 8h–19h", "Sáb 9h–12h"]],
  ];
  for (const [url, titulo, alt, endereco, horarios] of casos) {
    const html = completo.html(url);
    assert.equal(texto(trecho(html, "title")).trim(), titulo);
    const main = trecho(html, "main");
    assert.ok(tags(main, "img").some((i) => i.class?.includes("foto--fachada") && i.alt === alt && i.src === `/fotos${url.slice("/lojas".length)}fachada-teste.webp`), url);
    const t = texto(main);
    assert.ok(t.includes(endereco), url);
    for (const h of horarios) assert.ok(t.includes(h), `${url} ${h}`);
    assert.equal(botoesWhats(main).length, 1, url);
    assert.equal(tags(main, "a").filter((a) => a.class === "link-mapa").length, 1, url);
  }
});

test("C18 título e descrição da loja não escapam duas vezes", async () => {
  const c = clonar(COMPLETO);
  c.lojas[0].bairro = "Vila D'Ávila & Cia";
  c.lojas[0].nome = "Belezamix D'Ávila & Cia";
  const r = await gerar(c);
  const html = r.html("/lojas/anhangabau/");
  assert.equal(texto(trecho(html, "title")).trim(), "Cosméticos em Vila D'Ávila & Cia, Jundiaí | Belezamix");
  assert.equal(meta(html, "og:title"), "Cosméticos em Vila D'Ávila & Cia, Jundiaí | Belezamix");
  assert.ok(meta(html, "description").startsWith("Belezamix D'Ávila & Cia: "));
  assert.equal(texto(trecho(html, "h1")).trim(), "Belezamix D'Ávila & Cia");
  assert.doesNotMatch(html, /&amp;(amp|#39);/);
});

test("C19 um JSON-LD Store por página de loja, igual ao conteúdo", () => {
  const esperado = {
    "@context": "https://schema.org",
    "@type": "Store",
    name: "Belezamix (Anhangabaú)",
    url: `${URL_PREVIA}/lojas/anhangabau/`,
    telephone: "+55 11 99999-0000",
    address: { "@type": "PostalAddress", streetAddress: "Av. Jundiaí, 376", addressLocality: "Jundiaí", addressRegion: "SP", postalCode: "13208-051", addressCountry: "BR" },
    geo: { "@type": "GeoCoordinates", latitude: -23.1, longitude: -46.8 },
    openingHoursSpecification: [
      { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "08:00", closes: "17:00" },
      { "@type": "OpeningHoursSpecification", dayOfWeek: ["Saturday"], opens: "08:00", closes: "12:00" },
    ],
    image: `${URL_PREVIA}/fotos/anhangabau/fachada-teste.webp`,
    sameAs: ["https://www.instagram.com/belezamixjundiai"],
  };
  const esperadoEloy = {
    "@context": "https://schema.org",
    "@type": "Store",
    name: "Belezamix Eloy Chaves",
    url: `${URL_PREVIA}/lojas/eloy-chaves/`,
    telephone: "+55 11 4521-0000",
    address: { "@type": "PostalAddress", streetAddress: "Av. Benedicto Castilho de Andrade, 558", addressLocality: "Jundiaí", addressRegion: "SP", postalCode: "13212-070", addressCountry: "BR" },
    geo: { "@type": "GeoCoordinates", latitude: -23.2, longitude: -46.9 },
    openingHoursSpecification: [
      { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "08:00", closes: "19:00" },
      { "@type": "OpeningHoursSpecification", dayOfWeek: ["Saturday"], opens: "09:00", closes: "12:00" },
    ],
    image: `${URL_PREVIA}/fotos/eloy-chaves/fachada-teste.webp`,
    sameAs: ["https://www.instagram.com/belezamixjundiai"],
  };
  for (const [url, ldEsperado] of [["/lojas/anhangabau/", esperado], ["/lojas/eloy-chaves/", esperadoEloy]]) {
    const blocos = [...completo.html(url).matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
    assert.equal(blocos.length, 1, url);
    assert.deepEqual(JSON.parse(blocos[0][1]), ldEsperado, url);
  }
  for (const url of ["/", "/marcas/"]) assert.ok(!completo.html(url).includes("application/ld+json"), url);
});

test("C20 nome, endereço e telefone iguais na página da loja e no rodapé de todas", () => {
  const nap = [
    ["/lojas/anhangabau/", ["Belezamix (Anhangabaú)", "Av. Jundiaí, 376 – Anhangabaú, Jundiaí/SP, 13208-051", "(11) 99999-0000"]],
    ["/lojas/eloy-chaves/", ["Belezamix Eloy Chaves", "Av. Benedicto Castilho de Andrade, 558 – Parque Eloy Chaves, Jundiaí/SP, 13212-070", "(11) 4521-0000"]],
  ];
  for (const [url, valores] of nap) {
    const pagina = texto(trecho(completo.html(url), "header") + trecho(completo.html(url), "main"));
    for (const v of valores) assert.ok(pagina.includes(v), `${url}: ${v}`);
    for (const outra of completo.paginas()) {
      const rodape = texto(trecho(completo.html(outra), "footer"));
      for (const v of valores) assert.ok(rodape.includes(v), `rodapé de ${outra}: ${v}`);
    }
  }
});

test("C21 loja sem fotos não tem galeria e mantém a fachada", () => {
  const eloy = completo.html("/lojas/eloy-chaves/");
  assert.ok(!eloy.includes('class="galeria"'));
  assert.ok(tags(eloy, "img").some((i) => i.class?.includes("foto--fachada")));
  assert.ok(completo.html("/lojas/anhangabau/").includes('class="galeria"'));
});

test("C22 sem dados de apoio as páginas não existem nem estão no menu", async () => {
  const c = clonar(COMPLETO);
  for (const campo of ["categorias", "listaVip", "formasPagamento", "retirada", "entrega"]) delete c.negocio[campo];
  const r = await gerar(c);
  for (const url of ["/marcas/", "/profissionais/", "/como-comprar/"]) {
    assert.ok(!r.existe(url), url);
    for (const p of r.paginas()) assert.ok(!tags(r.html(p), "a").some((a) => a.href === url), `${p} → ${url}`);
  }
  for (const url of ["/marcas/", "/profissionais/", "/como-comprar/"]) {
    assert.ok(tags(trecho(completo.html("/"), "footer"), "a").some((a) => a.href === url), `menu completo sem ${url}`);
  }
});

test("C23 marcas agrupadas por categoria na ordem do conteúdo", () => {
  const html = completo.html("/marcas/");
  assert.equal(texto(trecho(html, "title")).trim(), "Marcas de cosméticos em Jundiaí | Belezamix");
  const secoes = [...trecho(html, "main").matchAll(/<section class="bloco">([\s\S]*?)<\/section>/g)].map((m) => texto(m[1]).trim());
  assert.deepEqual(secoes, ["Unhas Marca Teste A Marca Teste B", "Cabelo Marca Teste C", "Linha profissional Marca Teste D"]);
});

test("C24 profissionais gerada por categoria profissional ou lista VIP", async () => {
  const main = texto(trecho(completo.html("/profissionais/"), "main"));
  assert.ok(main.includes("Linha profissional") && main.includes("Marca Teste D"));
  assert.ok(!main.includes("Marca Teste A"));
  assert.ok(tags(completo.html("/profissionais/"), "a").some((a) => a.href === "https://chat.whatsapp.com/TESTE"));

  const soVip = clonar(COMPLETO);
  soVip.negocio.categorias = soVip.negocio.categorias.filter((x) => !x.profissional);
  const r1 = await gerar(soVip);
  assert.ok(r1.existe("/profissionais/"));

  const soCategoria = clonar(COMPLETO);
  delete soCategoria.negocio.listaVip;
  const r2 = await gerar(soCategoria);
  assert.ok(r2.existe("/profissionais/"));
  assert.ok(!tags(r2.html("/profissionais/"), "a").some((a) => a.href?.startsWith("https://chat.whatsapp.com")));

  const nenhum = clonar(soCategoria);
  nenhum.negocio.categorias = nenhum.negocio.categorias.filter((x) => !x.profissional);
  const r3 = await gerar(nenhum);
  assert.ok(!r3.existe("/profissionais/"));
});

test("C25 como comprar mostra só as seções informadas", () => {
  const main = trecho(completo.html("/como-comprar/"), "main");
  assert.ok(main.includes('id="retirada"') && main.includes("Texto de retirada de teste."));
  assert.ok(main.includes('id="pagamento"') && main.includes("Pagamento Teste 1"));
  assert.ok(!main.includes('id="entrega"'));
});

test("C26 cada página de apoio tem um WhatsApp por loja", () => {
  for (const url of ["/marcas/", "/profissionais/", "/como-comprar/"]) {
    const labels = botoesWhats(completo.html(url)).map((a) => a["aria-label"]);
    assert.deepEqual(labels, ["Chamar no WhatsApp da loja Anhangabaú", "Chamar no WhatsApp da loja Eloy Chaves"], url);
  }
});
