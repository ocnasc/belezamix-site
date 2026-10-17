import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { OBRIGATORIOS_LOJA, OBRIGATORIOS_NEGOCIO, formatarTelefone } from "../lib/conteudo.js";
import { COMPLETO, REAL, clonar, gerar, listarHtml, texto, trecho } from "./helpers.js";

test("C1 nenhum template contém endereço, horário, Instagram ou Place ID", () => {
  const fatos = [
    "Av. Jundiaí", "Benedicto Castilho", "13208-051", "13212-070", "8h–17h", "8h–19h", "17:00", "19:00",
    "belezamixjundiai", "ChIJ3wjOYpAmz5QRd_NY4r1x-mo", "ChIJoygNBBklz5QRUl-scTsYM3g",
  ];
  const arquivos = readdirSync("src", { recursive: true, withFileTypes: true })
    .filter((e) => e.isFile()).map((e) => path.join(e.parentPath, e.name));
  assert.ok(arquivos.length > 0);
  for (const f of arquivos) {
    const conteudo = readFileSync(f, "utf8");
    for (const fato of fatos) assert.ok(!conteudo.includes(fato), `${f} contém "${fato}"`);
  }
});

test("C2 conteudo.json traz só o que as fontes informam", () => {
  assert.deepEqual(REAL.negocio, { nome: "Belezamix", instagram: "belezamixjundiai" });
  const [a, e] = REAL.lojas;
  assert.deepEqual(
    [a.slug, a.nome, a.bairro, a.logradouro, a.numero, a.cep, a.cidade, a.uf, a.placeId],
    ["anhangabau", "Belezamix (Anhangabaú)", "Anhangabaú", "Av. Jundiaí", "376", "13208-051", "Jundiaí", "SP", "ChIJ3wjOYpAmz5QRd_NY4r1x-mo"],
  );
  assert.deepEqual(
    [e.slug, e.nome, e.bairro, e.logradouro, e.numero, e.cep, e.cidade, e.uf, e.placeId],
    ["eloy-chaves", "Belezamix Eloy Chaves", "Parque Eloy Chaves", "Av. Benedicto Castilho de Andrade", "558", "13212-070", "Jundiaí", "SP", "ChIJoygNBBklz5QRUl-scTsYM3g"],
  );
  assert.deepEqual(a.horarios, [
    { dias: ["seg", "ter", "qua", "qui", "sex"], abre: "08:00", fecha: "17:00" },
    { dias: ["sab"], abre: "08:00", fecha: "12:00" },
  ]);
  assert.deepEqual(e.horarios, [
    { dias: ["seg", "ter", "qua", "qui", "sex"], abre: "08:00", fecha: "19:00" },
    { dias: ["sab"], abre: "09:00", fecha: "12:00" },
  ]);
  const ausentesLoja = ["telefone", "whatsapp", "latitude", "longitude", "fotoFachada", "fotos"];
  const ausentesNegocio = ["anoFundacao", "categorias", "formasPagamento", "retirada", "entrega", "listaVip"];
  for (const loja of REAL.lojas) for (const c of ausentesLoja) assert.ok(!(c in loja), `${loja.slug}.${c} deveria estar ausente`);
  for (const c of ausentesNegocio) assert.ok(!(c in REAL.negocio), `negocio.${c} deveria estar ausente`);
  const chavesLoja = ["slug", "nome", "nomeCurto", "bairro", "logradouro", "numero", "cep", "cidade", "uf", "placeId", "horarios", "mensagemWhatsapp"];
  for (const loja of REAL.lojas) assert.deepEqual(Object.keys(loja).sort(), [...chavesLoja].sort(), loja.slug);
  assert.deepEqual([a.nomeCurto, a.mensagemWhatsapp], ["Anhangabaú", "Olá! Vim pelo site, loja Anhangabaú"]);
  assert.deepEqual([e.nomeCurto, e.mensagemWhatsapp], ["Eloy Chaves", "Olá! Vim pelo site, loja Eloy Chaves"]);
});

test("C3 prévia com obrigatório ausente sai com 0 e mostra [PENDENTE]", async () => {
  const r = await gerar(REAL);
  assert.equal(r.codigo, 0);
  const inicio = r.html("/");
  assert.ok(inicio.includes("[PENDENTE: whatsapp da loja Belezamix Eloy Chaves]"));
  assert.ok(inicio.includes("[PENDENTE: anoFundacao]"));
  assert.ok(r.html("/lojas/anhangabau/").includes("[PENDENTE: telefone da loja Belezamix (Anhangabaú)]"));
});

test("C4 lançamento recusa cada obrigatório ausente com a linha <nome>: <campo>", async () => {
  assert.deepEqual(OBRIGATORIOS_NEGOCIO, ["nome", "anoFundacao", "instagram"]);
  assert.deepEqual([...OBRIGATORIOS_LOJA].sort(), [
    "slug", "nome", "nomeCurto", "bairro", "logradouro", "numero", "cep", "cidade", "uf", "latitude", "longitude",
    "placeId", "horarios", "telefone", "whatsapp", "mensagemWhatsapp", "fotoFachada",
  ].sort());
  for (const campo of OBRIGATORIOS_NEGOCIO) {
    const c = clonar(COMPLETO);
    delete c.negocio[campo];
    const r = await gerar(c, { modo: "lancamento" });
    assert.notEqual(r.codigo, 0, campo);
    assert.ok(r.linhas.includes(`Negócio: ${campo}`), `${campo}: ${r.linhas}`);
  }
  for (const campo of OBRIGATORIOS_LOJA) {
    const c = clonar(COMPLETO);
    delete c.lojas[0][campo];
    const r = await gerar(c, { modo: "lancamento" });
    const alvo = campo === "nome" ? "anhangabau" : "Belezamix (Anhangabaú)";
    assert.notEqual(r.codigo, 0, campo);
    assert.ok(r.linhas.includes(`${alvo}: ${campo}`), `${campo}: ${r.linhas}`);
  }
});

test("C5 lançamento recusado não escreve nenhum .html", async () => {
  const r = await gerar(REAL, { modo: "lancamento" });
  assert.notEqual(r.codigo, 0);
  assert.deepEqual(listarHtml(r.saida), []);
});

for (const modo of ["previa", "lancamento"]) {
  test(`C6 telefone ou whatsapp fora do formato recusa o build (${modo})`, async () => {
    for (const [campo, valor] of [["whatsapp", "11999990000"], ["telefone", "55 11 99999-0000"], ["whatsapp", "551199"], ["telefone", "55119999900001"]]) {
      const c = clonar(COMPLETO);
      c.lojas[0][campo] = valor;
      const r = await gerar(c, { modo });
      assert.notEqual(r.codigo, 0, `${campo}=${valor}`);
      assert.ok(r.linhas.some((l) => l.startsWith(`Belezamix (Anhangabaú): ${campo} inválido`)), r.linhas.join("\n"));
    }
  });

  test(`C7 horário fora de HH:MM recusa o build (${modo})`, async () => {
    for (const campo of ["abre", "fecha"]) {
      const c = clonar(COMPLETO);
      c.lojas[1].horarios[0][campo] = "8h";
      const r = await gerar(c, { modo });
      assert.notEqual(r.codigo, 0);
      assert.ok(r.linhas.some((l) => l.startsWith(`Belezamix Eloy Chaves: horarios[0].${campo} inválido`)), r.linhas.join("\n"));
    }
  });

  test(`C8 foto inexistente ou sem .webp recusa o build (${modo})`, async () => {
    // why: os casos "sem .webp" usam um arquivo que existe, para a recusa vir da extensão e não da ausência
    const casos = [
      ["fotoFachada", "não é .webp", (l) => { l.fotoFachada.arquivo = "conteudo/logo-belezamix.png"; }],
      ["fotoFachada", "não existe", (l) => { l.fotoFachada.arquivo = "tests/fixtures/nao-existe.webp"; }],
      ["fotos[0]", "não existe", (l) => { l.fotos[0].arquivo = "tests/fixtures/nao-existe.webp"; }],
      ["fotos[0]", "não é .webp", (l) => { l.fotos[0].arquivo = "conteudo/logo-belezamix.png"; }],
    ];
    for (const [campo, motivo, mudar] of casos) {
      const c = clonar(COMPLETO);
      mudar(c.lojas[0]);
      const r = await gerar(c, { modo });
      assert.notEqual(r.codigo, 0, campo);
      assert.ok(
        r.linhas.some((l) => l.startsWith(`Belezamix (Anhangabaú): ${campo} inválido`) && l.includes(motivo)),
        `${campo} (${motivo}): ${r.linhas.join("\n")}`,
      );
    }
  });
}

test("C9 opcional ausente não gera seção nem [PENDENTE", async () => {
  const c = clonar(COMPLETO);
  for (const campo of ["listaVip", "formasPagamento", "retirada", "entrega", "categorias"]) delete c.negocio[campo];
  delete c.lojas[0].fotos;
  const r = await gerar(c);
  assert.equal(r.codigo, 0);
  for (const url of r.paginas()) {
    const html = r.html(url);
    assert.ok(!html.includes("[PENDENTE"), url);
    assert.ok(!html.includes('class="galeria"'), url);
  }
  for (const url of ["/marcas/", "/profissionais/", "/como-comprar/"]) assert.ok(!r.existe(url), url);
});

test("C10 telefone exibido e no JSON-LD a partir dos dígitos", async () => {
  assert.deepEqual(formatarTelefone("5511999990000"), { exibido: "(11) 99999-0000", schema: "+55 11 99999-0000" });
  assert.deepEqual(formatarTelefone("551145210000"), { exibido: "(11) 4521-0000", schema: "+55 11 4521-0000" });
  const r = await gerar(COMPLETO);
  const anhangabau = r.html("/lojas/anhangabau/");
  const eloy = r.html("/lojas/eloy-chaves/");
  assert.ok(texto(trecho(anhangabau, "main")).includes("(11) 99999-0000"));
  assert.ok(texto(trecho(eloy, "main")).includes("(11) 4521-0000"));
  assert.ok(anhangabau.includes('"telephone":"+55 11 99999-0000"'));
  assert.ok(eloy.includes('"telephone":"+55 11 4521-0000"'));
});
