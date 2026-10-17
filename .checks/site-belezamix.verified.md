# Site Belezamix Verification

**Verdict**: PASS (34 de 35 provados; C31 BLOCKED por dependência externa, não conta como provado)
**Profile**: light
**Diff range**: 3193b6c..644d1d1 (HEAD de `feat/site-eleventy`)
**Round**: 2 - scoped (round 1 em e0fe57a; fix = 644d1d1)
**Verifier**: independent sub-agent (author != verifier; também não é o verifier da rodada 1)

Resumo: os 10 achados da rodada 1 foram fechados. Todos os 34 checks com prova rodaram e passaram individualmente em 644d1d1. C31 continua BLOCKED (configuração do Cloudflare e a renegociação do critério 27, que ainda espera o OK do Otávio). C32 tem só a prova estática, porque a execução real está bloqueada por fator externo (Unresolved 2). Nenhum desses dois é falha do build, mas a feature só fica completa quando C31 tiver prova.

## Escopo da rodada 2

- O fix 644d1d1 mexe em `tests/conteudo.test.js`, `tests/estilo.test.js`, `tests/paginas.test.js`, `tests/publicacao.test.js`, `tests/visual.test.js` e no relatório da rodada 1. Nenhum código de produção (`lib/`, `src/`, `scripts/`, `conteudo/`, workflow) e nenhum helper (`tests/helpers.js`) mudou.
- Todas as provas rodaram de novo, em uma invocação, em 644d1d1.
- As citações foram atualizadas para os 5 arquivos de teste tocados. Como todo check com prova está num desses arquivos, todas as linhas da tabela foram relidas em 644d1d1.
- O julgamento dos checks cuja asserção não mudou no fix (C1, C3, C5, C7, C9, C10, C12-C16, C18, C20-C26, C29, C30, C32, C34, C35) vem da rodada 1, marcado como carried from e0fe57a. Só as linhas mudaram.

## Steps que não rodaram (profile `light`), carried from e0fe57a

- Step 1, checklist contra as fontes binding (`ui`): não rodou. `.design/visual/inicio.html` não foi aberto. O fix não tocou a interface.
- Join de `Coverage` (`standard`/`ui`): não rodou. O checklist não tem seção `Coverage`.
- Veredictos de `Test policy` (`standard`/`ui`): não rodaram. O checklist não tem `## Test policy`.
- Step 4, injeção de falhas (`standard`/`ui`): não rodou. O fechamento do achado 1 foi julgado pela leitura da asserção contra `lib/conteudo.js`, não por mutação executada.

## Achados da rodada 1 (verified at 644d1d1)

| # | Achado da rodada 1 | Fechado | Evidência |
|---|---|---|---|
| 1 | C8: regra `.webp` sem prova que a isole | sim | `tests/conteudo.test.js:113` e `:116` agora usam `conteudo/logo-belezamix.png`, que existe (`ls conteudo` → `conteudo.json`, `logo-belezamix.png`). `raiz` = `process.cwd()` (`lib/build.js:33`, `lib/conteudo.js:24`), então o `existsSync` de `lib/conteudo.js:62` aceitaria o arquivo e a recusa vem do ramo `!arquivo.endsWith(".webp")` de `:60-61`. A asserção `:124` - `l.startsWith(\`Belezamix (Anhangabaú): ${campo} inválido\`) && l.includes(motivo)` com `motivo` = `"não é .webp"` ou `"não existe"` - lê o `detalhe` que `lib/build.js:37` coloca na linha. Sem o ramo `.webp`, os casos de `:113`/`:116` não teriam erro e `:122` (`notEqual(r.codigo, 0)`) falharia. Os casos "não existe" (`:114-115`) cobrem o outro ramo com o motivo dele. Rodou nos 2 modos |
| 2 | C28: domínio esperado vindo do código testado | sim | `tests/publicacao.test.js:39-40` - `assert.equal(canonical, "https://belezamixjundiai.com.br" + url)` e o mesmo para `og:url`. O import de `DOMINIO` saiu (`:5`) |
| 3 | C4: conjunto de obrigatórios vindo do código testado | sim | `conteudo.test.js:61` - `deepEqual(OBRIGATORIOS_NEGOCIO, ["nome", "anoFundacao", "instagram"])`; `:62-65` - `deepEqual([...OBRIGATORIOS_LOJA].sort(), [<17 literais>].sort())`. Conferi contra `.tasks/site-belezamix.md:27-28` (3 de Negócio, 16 de Loja) mais `nomeCurto`, que a Landing do checklist torna obrigatório no lançamento |
| 4 | C19: Eloy Chaves só com `@type` e `telephone` | sim | `tests/paginas.test.js:90-104` - objeto literal `esperadoEloy` com `name`, `url`, `telephone`, `address`, `geo`, `openingHoursSpecification` (sábado `09:00`-`12:00`), `image`, `sameAs`; `:108` - `assert.deepEqual(JSON.parse(blocos[0][1]), ldEsperado, url)` para as duas lojas |
| 5 | C27: link interno absoluto para a prévia não testado | sim | `tests/publicacao.test.js:28` - `for (const ref of referencias(html)) assert.ok(!ref.startsWith(URL_PREVIA), ...)` sem o filtro `ehInterno`. Os builds `previa` e `padrao` usam `urlBase: URL_PREVIA` (`tests/helpers.js:25`). Na prévia não há canonical (`src/_includes/base.njk:8`), então a asserção não tem falso positivo. Ressalva baixa: um link absoluto fixo para o domínio de produção numa prévia não seria pego. Os templates não emitem isso hoje |
| 6 | C2: "exatamente" não verificado nas lojas | sim | `conteudo.test.js:45-46` - `deepEqual(Object.keys(loja).sort(), [...chavesLoja].sort(), loja.slug)` com as 12 chaves literais; `:47-48` - valores literais de `nomeCurto` e `mensagemWhatsapp` |
| 7 | C6: borda superior de `^55\d{10,11}$` não testada | sim | `conteudo.test.js:91` - novo caso `["telefone", "55119999900001"]` (55 + 12 dígitos); `:95-96` - `notEqual(r.codigo, 0)`, `startsWith(\`Belezamix (Anhangabaú): ${campo} inválido\`)`. Nos 2 modos |
| 8 | C11: conteúdo das lojas provado só pela caixa | sim | `tests/visual.test.js:44-47` - `assert.equal(await textoDe(...h2), "Anhangabaú")`, `"Eloy Chaves"`, `.loja__info` = `"Av. Jundiaí, 376 Seg–Sex 8h–17h · Sáb 8h–12h"` e `"Av. Benedicto Castilho de Andrade, 558 Seg–Sex 8h–19h · Sáb 9h–12h"`; `:48-49` - textos do WhatsApp e do Como chegar da Anhangabaú. O texto dos botões da Eloy Chaves continua provado pelo HTML em C14 (`paginas.test.js:38`) |
| 9 | C17: provado só em 360 px | sim | `visual.test.js:58-59` - `for (const largura of [360, 1280])`, `abrir(url, largura, 800)`; `:65-66` - `w.y < m.y` e `w.width * w.height > m.width * m.height` nas duas larguras |
| 10 | C33: cores nomeadas fora do regex | sim | `tests/estilo.test.js:16-20` - extrai os valores de `color`, `background(-color)`, `border*`, `outline(-color)`, `fill`, `stroke`, remove `var(--*)`, hex, `currentColor` e palavras neutras, e `assert.doesNotMatch(semPermitidos, /[a-z]{3,}/i, ...)`. Ressalva baixa: `text-decoration` e `box-shadow` ficam fora da lista de propriedades. Hoje `src/assets/site.css` só tem `text-decoration: none`/`underline` (`:41`, `:42`, `:50`) e nenhum `box-shadow` (busca por `shadow\|decoration\|caret\|accent\|gradient` só achou essas 3 linhas) |

## Checks (proof run e citações verified at 644d1d1)

Proof run de todos: `npm test` (= `node --test "tests/**/*.test.js"`), uma invocação, exit 0, 37 testes. Cada id de C1 a C35, exceto C31, aparece individualmente como `✔`. C6, C7 e C8 aparecem duas vezes (previa e lancamento).

| Check | Claim | Proof run | Evidence | Result |
|---|---|---|---|---|
| C1 | nenhum template tem endereço, horário, Instagram ou Place ID | `✔ C1 ...` | `tests/conteudo.test.js:18` - `assert.ok(!conteudo.includes(fato))`, fatos literais em `:10-11` | PASS (carried from e0fe57a) |
| C2 | conteudo.json só com campos das fontes; 12 ausentes | `✔ C2 ...` | `conteudo.test.js:23` - `deepEqual(REAL.negocio, {...})`; `:43-44` - os 12 ausentes; `:46` - `deepEqual(Object.keys(loja).sort(), [...chavesLoja].sort())` | PASS (verified at 644d1d1) |
| C3 | prévia: código 0 e `[PENDENTE: ...]` | `✔ C3 ...` | `conteudo.test.js:53` - `equal(r.codigo, 0)`; `:55` - `includes("[PENDENTE: whatsapp da loja Belezamix Eloy Chaves]")`; `:56` - `"[PENDENTE: anoFundacao]"` | PASS (carried from e0fe57a) |
| C4 | lançamento: 3 + 17 obrigatórios, código ≠ 0, linha `<nome>: <campo>` | `✔ C4 ...` | `conteudo.test.js:61-65` - listas literais; `:70`/`:78` - `notEqual(r.codigo, 0)`; `:71` - ``includes(`Negócio: ${campo}`)``; `:79` - ``includes(`${alvo}: ${campo}`)`` | PASS (verified at 644d1d1) |
| C5 | lançamento recusado não escreve `.html` | `✔ C5 ...` | `conteudo.test.js:85-86` - `notEqual(r.codigo, 0)`; `deepEqual(listarHtml(r.saida), [])` | PASS (carried from e0fe57a) |
| C6 | whatsapp/telefone fora de `^55\d{10,11}$` recusa nos 2 modos | `✔ C6 ... (previa)`, `✔ C6 ... (lancamento)` | `conteudo.test.js:91` - 4 casos, incluindo `55119999900001`; `:95-96` - `notEqual(r.codigo, 0)`, ``startsWith(`Belezamix (Anhangabaú): ${campo} inválido`)`` | PASS (verified at 644d1d1) |
| C7 | abre/fecha fora de `^\d{2}:\d{2}$` recusa nos 2 modos | `✔ C7 ...` ×2 | `conteudo.test.js:105-106` - `notEqual(r.codigo, 0)`; ``startsWith(`Belezamix Eloy Chaves: horarios[0].${campo} inválido`)`` | PASS (carried from e0fe57a) |
| C8 | foto inexistente **ou** sem `.webp` recusa nos 2 modos | `✔ C8 ...` ×2 | `conteudo.test.js:113-116` - casos com motivo; `:122` - `notEqual(r.codigo, 0)`; `:124` - `startsWith(...) && l.includes(motivo)` | PASS (verified at 644d1d1; antes FAIL de prova) |
| C9 | opcional ausente: sem seção, sem `[PENDENTE` | `✔ C9 ...` | `conteudo.test.js:139-140` - `!html.includes("[PENDENTE")`, `!html.includes('class="galeria"')`; `:142` - `!r.existe(url)` | PASS (carried from e0fe57a) |
| C10 | telefone exibido e no JSON-LD | `✔ C10 ...` | `conteudo.test.js:146-147` - `deepEqual(formatarTelefone(...), { exibido, schema })`; `:151-154` - texto e `"telephone":"+55 11 ..."` | PASS (carried from e0fe57a) |
| C11 | primeira tela em 360×640 com logo, selo, h1 e as 2 lojas completas | `✔ C11 [navegador] ...` | `tests/visual.test.js:40-41` - caixa visível e `caixa.y + caixa.height <= 640`; `:44-49` - textos literais de h2, `.loja__info` e ações; `:50-51` - h1 e selo | PASS (verified at 644d1d1) |
| C12 | selo "Há 20 anos" com 2006 em 2026; `[PENDENTE]` sem ano; ausente nas outras páginas e no rodapé | `✔ C12 ...` | `tests/paginas.test.js:16` - `includes("Há 20 anos em Jundiaí")`; `:18`, `:20` - `!/Há .{0,40} anos/.test(...)`; `:22` - `"Há [PENDENTE: anoFundacao] anos em Jundiaí"` | PASS (carried from e0fe57a) |
| C13 | URL exata do WhatsApp Anhangabaú | `✔ C13 ...` | `paginas.test.js:27` - `hrefs.includes(WHATS_ANHANGABAU)`, literal `:11` | PASS (carried from e0fe57a) |
| C14 | mensagens por loja, texto visível, aria-label | `✔ C14 ...` | `paginas.test.js:35` - mensagens literais; `:36` - aria-labels; `:38` - `["Chamar no WhatsApp", "Chamar no WhatsApp"]` | PASS (carried from e0fe57a) |
| C15 | URL do "Como chegar" | `✔ C15 ...` | `paginas.test.js:43` - `hrefs.includes(MAPA_ANHANGABAU)` (literal `:12`); `:44` - URL da Eloy Chaves | PASS (carried from e0fe57a) |
| C16 | og:title/description/url/image absoluto em toda página | `✔ C16 ...` | `paginas.test.js:50` - `meta(html, p)?.length > 0`; `:51` - `equal(meta(html, "og:url"), URL_PREVIA + url)`; `:52` - `og:image` absoluto | PASS (carried from e0fe57a) |
| C17 | WhatsApp antes do "Como chegar" e com área maior, em toda página | `✔ C17 [navegador] ...` | `visual.test.js:58` - larguras `[360, 1280]`; `:61` - `blocos.length > 0`; `:65` - `w.y < m.y`; `:66` - `w.width * w.height > m.width * m.height` | PASS (verified at 644d1d1) |
| C18 | páginas de loja: fachada+alt, endereço, horários, ações, `<title>` | `✔ C18 ...` | `paginas.test.js:63` - `equal(..., titulo)`; `:65` - `img.foto--fachada` com `alt` e `src`; `:67-70` - endereço, horários, 1 `.btn-whats`, 1 `.link-mapa` | PASS (carried from e0fe57a) |
| C19 | exatamente um JSON-LD `Store` por loja, igual ao conteúdo | `✔ C19 ...` | `paginas.test.js:107` - `equal(blocos.length, 1, url)`; `:108` - `deepEqual(JSON.parse(blocos[0][1]), ldEsperado, url)` com literais `:75-89` e `:90-104` | PASS (verified at 644d1d1) |
| C20 | NAP igual na página da loja e no rodapé de todas | `✔ C20 ...` | `paginas.test.js:120`, `:123` - `includes(v)` para os literais de `:115-116` | PASS (carried from e0fe57a) |
| C21 | sem `fotos` não há galeria, a fachada continua | `✔ C21 ...` | `paginas.test.js:130-132` | PASS (carried from e0fe57a) |
| C22 | sem dados de apoio, páginas não geradas nem no menu | `✔ C22 ...` | `paginas.test.js:140-141` - `!r.existe(url)`, nenhum `<a href=url>`; `:144` controle positivo | PASS (carried from e0fe57a) |
| C23 | /marcas/ agrupada na ordem, `<title>` | `✔ C23 ...` | `paginas.test.js:150` - título literal; `:152` - `deepEqual(secoes, [...])` | PASS (carried from e0fe57a) |
| C24 | /profissionais/ por categoria profissional ou listaVip; link da lista | `✔ C24 ...` | `paginas.test.js:157-159`, `:164`, `:169-170`, `:175` | PASS (carried from e0fe57a) |
| C25 | /como-comprar/ só com as seções informadas | `✔ C25 ...` | `paginas.test.js:180-182` | PASS (carried from e0fe57a) |
| C26 | um "Chamar no WhatsApp" por loja nas páginas de apoio | `✔ C26 ...` | `paginas.test.js:188` - `deepEqual(labels, [...])` | PASS (carried from e0fe57a) |
| C27 | prévia default: noindex, sem sitemap, links internos com `/` | `✔ C27 ...` | `tests/publicacao.test.js:23` - `!r.existe("/sitemap.xml")`; `:26` - `noindex(html)`; `:27` - `ref.startsWith("/")`; `:28` - `!ref.startsWith(URL_PREVIA)` | PASS (verified at 644d1d1) |
| C28 | lançamento: sem noindex, canonical/og:url no domínio, sitemap exato | `✔ C28 ...` | `publicacao.test.js:37` - `!noindex(html)`; `:39-40` - literal `"https://belezamixjundiai.com.br" + url`; `:45-46` - `deepEqual(locs, canonicas)`, `equal(locs.length, 6)` | PASS (verified at 644d1d1) |
| C29 | todo link interno existe na saída, nos 2 modos | `✔ C29 ...` | `publicacao.test.js:52` - `r.existe(ref)`; `:55` - idem para `url(...)` do CSS | PASS (carried from e0fe57a) |
| C30 | `npm test` roda o runner nativo sobre `tests/` | `npm test` exit 0 + `✔ C30 ...` | `publicacao.test.js:61` - `equal(pkg.scripts.test, 'node --test "tests/**/*.test.js"')` | PASS (carried from e0fe57a) |
| C31 | Cloudflare roda os testes antes do build e não publica se falharem | nenhuma (por desenho) | sem `file:line`; `rg -n "C31" tests/` sem resultado. Depende da configuração do Cloudflare (Unresolved 1) e da renegociação do critério 27, que ainda espera o OK do Otávio | **BLOCKED** (carried from e0fe57a) |
| C32 | workflow anual: cron, dispatch, secret, falha sem 2xx | `✔ C32 ...` (estático) | `publicacao.test.js:68` - cron; `:69` - `workflow_dispatch:`; `:70` - secret; `:71` - `-X POST "$DEPLOY_HOOK"`; `:72` - `case "$codigo" in 2??) ;; *) exit 1 ;; esac` | PASS só estático; execução real bloqueada externamente (Unresolved 2) (carried from e0fe57a) |
| C33 | só os 6 tokens (+ hover/pressionado), Nunito 700/800, Nunito Sans 400/600/700 | `✔ C33 ...` | `tests/estilo.test.js:14` - hex ∈ tokens; `:15` - nenhuma função de cor; `:20` - nenhuma cor nomeada nas propriedades de cor; `:27` - `deepEqual(faces.sort(), [...])` | PASS (verified at 644d1d1) |
| C34 | branco sobre `#EF018D` só em texto grande; normal ≥4,5:1 | `✔ C34 [navegador] ...` | `visual.test.js:104-107` - `grande`, `brancoNoMagenta && !grande`, `razao < 4.5`; `:112` - `deepEqual(violacoes, [])`, 360 e 1280 px | PASS (carried from e0fe57a) |
| C35 | nenhum recurso de outro domínio | `✔ C35 ...` | `estilo.test.js:42-43` - sem `@import` nem `url()` externo; `:55-56` - `recursos.length > 0`, `!externo(u)` | PASS (carried from e0fe57a) |

## Swept rows que resolvem para "existing", carried from e0fe57a

| Row | Constraint citada | No código |
|---|---|---|
| authorization: permissão de push no GitHub; secret do repositório | o hook vem de um secret e não fica no repositório | sim. `.github/workflows/regeracao-anual.yml:16` - `DEPLOY_HOOK: ${{ secrets.CLOUDFLARE_DEPLOY_HOOK }}`, `permissions: {}`. O workflow não mudou no fix |

## Achados restantes (do mais grave para o menos grave)

1. **C31 BLOCKED** (externo): não tem prova executável enquanto o Cloudflare não estiver configurado e o Otávio não aprovar a renegociação do critério 27.
2. **C32 só estático** (externo): a execução real do workflow depende do deploy hook (Unresolved 2).
3. Ressalva baixa, C33: `text-decoration`, `box-shadow` e outras propriedades com cor ficam fora da varredura de cores nomeadas. Hoje o CSS não tem cor nessas propriedades.
4. Ressalva baixa, C27: só links absolutos para `URL_PREVIA` são recusados. Um link fixo para o domínio de produção numa prévia passaria. Hoje os templates não emitem isso.

## Gate

`npm test` - 37 passed, 0 failed, 0 cancelled, 0 skipped (34 checks com teste, C6/C7/C8 duas vezes; C31 sem teste por desenho), exit 0, duration 6,6 s, em 644d1d1. `git status --porcelain` limpo antes desta escrita.
