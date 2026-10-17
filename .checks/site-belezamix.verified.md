# Site Belezamix Verification

**Verdict**: FAIL
**Profile**: light
**Diff range**: 3193b6c..e0fe57a (HEAD de `feat/site-eleventy`)
**Round**: 1 - full
**Verifier**: independent sub-agent (author != verifier)

Resumo: 33 de 35 checks provados. C8 tem metade da afirmação sem prova que discrimine (regra `.webp`), C31 está BLOQUEADO por configuração externa no Cloudflare. C32 só tem a prova estática.

## Steps que não rodaram (profile `light`)

- Step 1, checklist contra as fontes binding (`ui`): não rodou. `.design/visual/inicio.html` não foi aberto, e nenhuma contradição ou lacuna de arranjo foi avaliada.
- Join de `Coverage` (`standard`/`ui`): não rodou. O checklist também não tem seção `Coverage`.
- Veredictos de `Test policy` (`standard`/`ui`): não rodaram. O checklist também não tem seção `## Test policy`.
- Step 4, injeção de falhas (`standard`/`ui`): não rodou. Os mutantes que sobreviveriam e aparecem abaixo vêm da leitura das asserções contra o código, não de execução.

## Diff

`git diff --stat 3193b6c..HEAD`: 27 arquivos, +2957 linhas, todos novos (`lib/build.js`, `lib/conteudo.js`, `scripts/build.js`, `src/**`, `conteudo/conteudo.json`, `.github/workflows/regeracao-anual.yml`, `tests/**`). Todos os testes chamam `build()` de `lib/build.js` (via `tests/helpers.js:20`) ou leem arquivos introduzidos neste range. Nenhuma prova cai em código que o range não tocou.

## Checks

Proof run de todos: `npm test` (= `node --test "tests/**/*.test.js"`), uma invocação, exit 0, 37 testes. Cada id aparece individualmente como `✔`, e C6/C7/C8 aparecem duas vezes (previa e lancamento).

| Check | Claim | Proof run | Evidence | Result |
|---|---|---|---|---|
| C1 | nenhum template tem endereço, horário, Instagram ou Place ID | `✔ C1 ...` | `tests/conteudo.test.js:18` - `assert.ok(!conteudo.includes(fato))` sobre todo arquivo de `src/`, fatos em `:10-11` ("Av. Jundiaí", "13208-051", "17:00", "belezamixjundiai", os 2 Place IDs ...) | PASS |
| C2 | conteudo.json só com campos das fontes; 12 ausentes | `✔ C2 ...` | `conteudo.test.js:23` - `deepEqual(REAL.negocio, { nome: "Belezamix", instagram: "belezamixjundiai" })`; `:25-40` valores e horários literais; `:43-44` - `!(c in loja)` para os 12 ausentes | PASS (ver achado 6) |
| C3 | prévia: código 0 e `[PENDENTE: ...]` | `✔ C3 ...` | `conteudo.test.js:49` - `equal(r.codigo, 0)`; `:51` - `includes("[PENDENTE: whatsapp da loja Belezamix Eloy Chaves]")`; `:52` - `"[PENDENTE: anoFundacao]"` | PASS |
| C4 | lançamento: 3 + 17 obrigatórios, código ≠ 0, linha `<nome>: <campo>` | `✔ C4 ...` | `conteudo.test.js:57-58` - `equal(OBRIGATORIOS_NEGOCIO.length, 3)`, `equal(OBRIGATORIOS_LOJA.length, 17)`; `:63`/`:71` - `notEqual(r.codigo, 0)`; `:64` - ``r.linhas.includes(`Negócio: ${campo}`)``; `:72` - ``includes(`${alvo}: ${campo}`)`` | PASS (ver achado 3) |
| C5 | lançamento recusado não escreve `.html` | `✔ C5 ...` | `conteudo.test.js:78-79` - `notEqual(r.codigo, 0)`; `deepEqual(listarHtml(r.saida), [])` | PASS |
| C6 | whatsapp/telefone fora de `^55\d{10,11}$` recusa nos 2 modos | `✔ C6 ... (previa)`, `✔ C6 ... (lancamento)` | `conteudo.test.js:88-89` - `notEqual(r.codigo, 0)`; ``l.startsWith(`Belezamix (Anhangabaú): ${campo} inválido`)`` para `11999990000`, `55 11 99999-0000`, `551199` | PASS (ver achado 7) |
| C7 | abre/fecha fora de `^\d{2}:\d{2}$` recusa nos 2 modos | `✔ C7 ...` ×2 | `conteudo.test.js:98-99` - `notEqual(r.codigo, 0)`; ``startsWith(`Belezamix Eloy Chaves: horarios[0].${campo} inválido`)`` com `"8h"` | PASS |
| C8 | foto inexistente **ou** sem `.webp` recusa nos 2 modos | `✔ C8 ...` ×2 | `conteudo.test.js:114-115` - `notEqual(r.codigo, 0)`; ``startsWith(`Belezamix (Anhangabaú): ${campo} inválido`)``; casos `:105-108` | **FAIL de prova**: os dois casos "sem .webp" (`fachada-teste.jpg`, `interior.png`) também são arquivos inexistentes (`tests/fixtures/` só tem os dois `.webp`). Sem a checagem `.endsWith(".webp")` em `lib/conteudo.js:60`, o `existsSync` de `:62` recusa do mesmo jeito com o mesmo prefixo, e a asserção não lê o `detalhe`. A regra `.webp` não tem prova que a isole (achado 1) |
| C9 | opcional ausente: sem seção, sem `[PENDENTE` | `✔ C9 ...` | `conteudo.test.js:128-129` - `!html.includes("[PENDENTE")`, `!html.includes('class="galeria"')`; `:131` - `!r.existe(url)` para as 3 páginas de apoio | PASS |
| C10 | telefone exibido e no JSON-LD | `✔ C10 ...` | `conteudo.test.js:135-136` - `deepEqual(formatarTelefone("5511999990000"), { exibido: "(11) 99999-0000", schema: "+55 11 99999-0000" })` e o fixo; `:140-143` - `includes("(11) 99999-0000")`, `includes('"telephone":"+55 11 99999-0000"')`, idem `4521-0000` | PASS |
| C11 | primeira tela em 360×640 com logo, selo, h1 e as 2 lojas completas | `✔ C11 [navegador] ...` (Edge) | `tests/visual.test.js:40-41` - `assert.ok(caixa)`; `caixa.y >= 0 && caixa.y + caixa.height <= 640` para `.topo__logo`, `.selo`, `.topo h1` e, por loja, `h2`, `.loja__info`, `.btn-whats`, `.link-mapa`; `:43-44` - texto do h1 e `"Há 20 anos em Jundiaí"` | PASS (ver achado 8) |
| C12 | selo "Há 20 anos" com 2006 em 2026; `[PENDENTE]` sem ano; ausente nas outras páginas e no rodapé | `✔ C12 ...` | `tests/paginas.test.js:16` - `includes("Há 20 anos em Jundiaí")`; `:18` e `:20` - `!/Há .{0,40} anos/.test(...)`; `:22` - `includes("Há [PENDENTE: anoFundacao] anos em Jundiaí")` | PASS |
| C13 | URL exata do WhatsApp Anhangabaú | `✔ C13 ...` | `paginas.test.js:27` - `hrefs.includes(WHATS_ANHANGABAU)`, literal em `:11` igual ao checklist | PASS |
| C14 | mensagens por loja, texto visível, aria-label | `✔ C14 ...` | `paginas.test.js:35` - `deepEqual(mensagens, ["Olá! Vim pelo site, loja Anhangabaú", "Olá! Vim pelo site, loja Eloy Chaves"])`; `:36` - aria-labels literais; `:38` - `["Chamar no WhatsApp", "Chamar no WhatsApp"]` | PASS |
| C15 | URL do "Como chegar" | `✔ C15 ...` | `paginas.test.js:43` - `hrefs.includes(MAPA_ANHANGABAU)` (literal `:12` = checklist); `:44` - URL da Eloy Chaves com o Place ID dela | PASS |
| C16 | og:title/description/url/image absoluto em toda página | `✔ C16 ...` | `paginas.test.js:50` - `meta(html, p)?.length > 0`; `:51` - `equal(meta(html, "og:url"), URL_PREVIA + url)`; `:52` - ``equal(meta(html, "og:image"), `${URL_PREVIA}/assets/logo-belezamix.png`)`` | PASS |
| C17 | WhatsApp antes do "Como chegar" e com área maior, em toda página | `✔ C17 [navegador] ...` | `visual.test.js:53` - `blocos.length > 0`; `:57` - `w.y < m.y`; `:58` - `w.width * w.height > m.width * m.height` | PASS (ver achado 9) |
| C18 | páginas de loja: fachada+alt, endereço, horários, ações, `<title>` | `✔ C18 ...` | `paginas.test.js:63` - `equal(..., "Cosméticos em Anhangabaú, Jundiaí \| Belezamix")`; `:65` - `img.foto--fachada` com `alt` e `src === "/fotos/fachada-teste.webp"`; `:67-70` - endereço e horários literais, 1 `.btn-whats`, 1 `.link-mapa` | PASS |
| C19 | exatamente um JSON-LD `Store` por loja, igual ao conteúdo | `✔ C19 ...` | `paginas.test.js:92` - `equal(blocos.length, 1)`; `:95` - `deepEqual(ld, esperado)` (objeto literal `:75-89`) só para Anhangabaú; `:96` - Eloy Chaves só `equal(ld.telephone, "+55 11 4521-0000")` | PASS (ver achado 4) |
| C20 | NAP igual na página da loja e no rodapé de todas | `✔ C20 ...` | `paginas.test.js:108` e `:111` - `includes(v)` para nome, endereço e telefone literais de `:103-104` | PASS |
| C21 | sem `fotos` não há galeria, a fachada continua | `✔ C21 ...` | `paginas.test.js:118-120` - `!eloy.includes('class="galeria"')`; `img.foto--fachada` presente; controle positivo na Anhangabaú | PASS |
| C22 | sem dados de apoio, páginas não geradas nem no menu | `✔ C22 ...` | `paginas.test.js:128-129` - `!r.existe(url)`; nenhum `<a href=url>`; `:132` controle positivo no completo | PASS |
| C23 | /marcas/ agrupada na ordem, `<title>` | `✔ C23 ...` | `paginas.test.js:138` - `"Marcas de cosméticos em Jundiaí \| Belezamix"`; `:140` - `deepEqual(secoes, ["Unhas Marca Teste A Marca Teste B", "Cabelo Marca Teste C", "Linha profissional Marca Teste D"])` | PASS |
| C24 | /profissionais/ por categoria profissional ou listaVip; link da lista | `✔ C24 ...` | `paginas.test.js:145-147` - categoria e marca profissionais, `href === "https://chat.whatsapp.com/TESTE"`; `:152`, `:157`, `:163` - existe só com VIP, só com categoria, não existe sem nenhum; `:158` sem link sem VIP | PASS |
| C25 | /como-comprar/ só com as seções informadas | `✔ C25 ...` | `paginas.test.js:168-170` - `id="retirada"` e `id="pagamento"` presentes com o texto; `!main.includes('id="entrega"')` | PASS |
| C26 | um "Chamar no WhatsApp" por loja nas páginas de apoio | `✔ C26 ...` | `paginas.test.js:176` - `deepEqual(labels, ["Chamar no WhatsApp da loja Anhangabaú", "Chamar no WhatsApp da loja Eloy Chaves"])` | PASS |
| C27 | prévia default: noindex, sem sitemap, links internos com `/` | `✔ C27 ...` | `tests/publicacao.test.js:24` - `!r.existe("/sitemap.xml")`; `:27` - `noindex(html)` (`name === "robots" && content === "noindex"`); `:28` - `ref.startsWith("/")` sobre `referencias(html).filter(ehInterno)` | PASS (ver achado 5) |
| C28 | lançamento: sem noindex, canonical/og:url no domínio, sitemap exato | `✔ C28 ...` | `publicacao.test.js:37` - `!noindex(html)`; `:39-40` - `equal(canonical, DOMINIO + url)`, `equal(meta(html, "og:url"), DOMINIO + url)`; `:45-46` - `deepEqual(locs.sort(), canonicas.sort())`, `equal(locs.length, 6)` | PASS (ver achado 2) |
| C29 | todo link interno existe na saída, nos 2 modos | `✔ C29 ...` | `publicacao.test.js:52` - `r.existe(ref)` para todo ref interno; `:55` - idem para `url(...)` do CSS | PASS |
| C30 | `npm test` roda o runner nativo sobre `tests/` | `npm test` exit 0 + `✔ C30 ...` | `publicacao.test.js:61` - `equal(pkg.scripts.test, 'node --test "tests/**/*.test.js"')` | PASS |
| C31 | Cloudflare roda os testes antes do build e não publica se falharem | nenhuma (por desenho) | nenhum `file:line`. `rg -n "C31" tests/` não encontra nada. Bloqueado pela task (Unresolved 1) e pela renegociação do critério 27 que ainda espera o OK | **BLOCKED** |
| C32 | workflow anual: cron, dispatch, secret, falha sem 2xx | `✔ C32 ...` (estático) | `publicacao.test.js:68` - `match(y, /- cron: "0 3 1 1 \*"/)`; `:69` - `workflow_dispatch:`; `:70` - `secrets.CLOUDFLARE_DEPLOY_HOOK`; `:72` - `case "$codigo" in 2??) ;; *) exit 1 ;; esac`. Conferido em `.github/workflows/regeracao-anual.yml:5-21` (`curl -s -o /dev/null -w '%{http_code}' -X POST`) | PASS (só estático; a execução real está bloqueada, Unresolved 2) |
| C33 | só os 6 tokens (+ hover/pressionado), Nunito 700/800, Nunito Sans 400/600/700 | `✔ C33 ...` | `tests/estilo.test.js:14` - toda cor hex ∈ TOKENS + `#D9007F` (literais `:8-9`); `:15` - nenhuma `rgb/hsl/...()`; `:21` - `deepEqual(faces, ["Nunito 700", "Nunito 800", "Nunito Sans 400", "Nunito Sans 600", "Nunito Sans 700"])` | PASS (ver achado 10) |
| C34 | branco sobre `#EF018D` só em texto grande; normal ≥4,5:1 | `✔ C34 [navegador] ...` | `visual.test.js:95-98` - `grande = tamanho >= 24 \|\| (tamanho >= 18.66 && negrito)`; `brancoNoMagenta && !grande` → erro; `razao < 4.5` → erro; `:103` - `deepEqual(violacoes, [])` em toda página, 360 e 1280 px | PASS |
| C35 | nenhum recurso de outro domínio | `✔ C35 ...` | `estilo.test.js:36-37` - sem `@import`, nenhum `url()` externo no CSS; `:49-50` - `recursos.length > 0`, `!externo(u)` para link/script/img/source/iframe/video nos 3 builds | PASS |

## Swept rows que resolvem para "existing"

| Row | Constraint citada | No código |
|---|---|---|
| authorization: permissão de push no GitHub; secret do repositório | o hook vem de um secret e não fica no repositório | sim. `.github/workflows/regeracao-anual.yml:16` - `DEPLOY_HOOK: ${{ secrets.CLOUDFLARE_DEPLOY_HOOK }}`, `permissions: {}`. A permissão de push é configuração do GitHub, fora do código |

## Achados (do mais grave para o menos grave)

1. **C8, regra `.webp` sem prova que a isole (mutante sobrevivente por leitura).** Os dois casos de "sem .webp" (`tests/fixtures/fachada-teste.jpg`, `tests/fixtures/interior.png`) também não existem. Se o ramo `!arquivo.endsWith(".webp")` em `lib/conteudo.js:60` for apagado, o `existsSync` de `:62` recusa o build com a mesma linha `Belezamix (Anhangabaú): fotoFachada inválido (...)`, e a asserção `conteudo.test.js:115` só confere o prefixo. A correção é um arquivo existente que não seja `.webp` em `tests/fixtures/`, ou asserir o `detalhe` ("não é .webp" / "não existe").
2. **C28, valor esperado vindo do código testado.** `canonical` e `og:url` são comparados com `DOMINIO`, que vem de `lib/build.js:6`, e não com o literal `https://belezamixjundiai.com.br` do checklist. Hoje o valor em `lib/build.js:6` está certo, mas a asserção continuaria verde com um domínio errado.
3. **C4, conjunto de obrigatórios vindo do código testado.** `conteudo.test.js:57-58` só confere o tamanho (3 e 17), e o laço percorre `OBRIGATORIOS_*` de `lib/conteudo.js:4-8`. Trocar um campo por outro mantém 17 e o teste continua verde. Hoje a lista em `lib/conteudo.js:5-8` é igual às 16 do critério 4 mais `nomeCurto`, mas a autoridade do conjunto é a task, então a lista deveria ser literal no teste.
4. **C19, afirmação sobre 2 lojas provada inteira em 1.** Na Eloy Chaves só `@type` e `telephone` são conferidos (`paginas.test.js:96`). Endereço, `geo`, `url`, `image` e os horários dela (sábado 09:00) ficam sem prova. É lacuna de cobertura.
5. **C27, filtro torna a regra "relativo à raiz" parcialmente vácua.** `ehInterno` (`tests/helpers.js:64`) descarta tudo que começa com `https?:`, então um link interno absoluto para a URL da prévia (`https://previa.teste/lojas/...`) não seria testado. Só links `../` seriam pegos. Os templates de hoje não emitem isso (`urlBase` só aparece em `og:*`, canonical e sitemap: `src/_includes/base.njk:8,13,14`, `src/sitemap.njk:8`).
6. **C2, "exatamente" não é verificado nas lojas.** O teste confere uma lista fixa de campos e a ausência dos 12, mas não confere o conjunto de chaves. Um campo extra numa loja passaria. O arquivo tem hoje `nomeCurto` e `mensagemWhatsapp`, que vêm da Landing e do critério 10. A comparação é exata só no `negocio` (`:23`).
7. **C6, borda superior de `^55\d{10,11}$` não testada.** Nenhum caso com 12 ou mais dígitos depois do `55`. Só há prefixo ausente, espaços e número curto.
8. **C11, conteúdo das lojas provado pela caixa, não pelo texto.** O `h2` (nome curto) e `.loja__info` (endereço e horários) são conferidos só por posição e visibilidade. O texto deles na primeira tela não é asserido aqui. O nome curto é asserido via aria-label em C14 e o endereço via HTML em C18/C20.
9. **C17, provado só em 360 px.** O design binding também desenha desktop. No desktop, "antes" (`w.y < m.y`) não é testado.
10. **C33, cores nomeadas fora do regex.** A varredura cobre hex e funções de cor, mas não palavras-chave (`white`, `black`, ...). Hoje `rg` não acha nenhuma em `src/assets/site.css`. O único `currentColor` (`:56`) herda um token.

Fora dos achados de asserção: C31 está **BLOCKED** (Unresolved 1 e a renegociação do critério 27 ainda esperam o OK do Otávio) e C32 só tem a prova estática (Unresolved 2).

## Gate

`npm test` - 37 passed, 0 failed, 0 skipped (34 checks com teste, C6/C7/C8 duas vezes; C31 sem teste por desenho), exit 0, duration 5,6 s.
