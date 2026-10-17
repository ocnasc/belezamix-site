# Site Belezamix Verification

**Verdict**: PASS (33 de 34 checks em escopo provados; C31 BLOCKED por dependência externa, não conta como provado; C32 CANCELLED pelo Otávio junto com o critério 28, fora da contagem)
**Profile**: light
**Diff range**: 3193b6c..1cec887 (HEAD de `feat/site-eleventy`); fix desta rodada = 89093ba..1cec887
**Round**: 3 - scoped (round 1 em e0fe57a; round 2 em 644d1d1; fix = 91c5528, 234f15c, 93fe312, 3962a79, 1cec887)
**Verifier**: independent sub-agent (author != verifier; não é o verifier das rodadas 1 e 2)

Resumo: os achados F1 a F5 da revisão do PR foram fechados. Todos os 33 checks com prova rodaram numa única invocação de `npm test` em 1cec887 e passaram, cada id aparecendo individualmente. C31 continua BLOCKED. C32 foi cancelado pelo Otávio ("não precisa de lógica para atualizar a idade"), e o checklist, a task e o design registram isso de forma consistente. Nenhum teste foi enfraquecido nem apagado, exceto o de C32. Ficaram ressalvas, nenhuma bloqueante. A mais séria é que o teste de regressão do `--saida` apagaria o repositório se a opção voltasse.

## Escopo da rodada 3

- Arquivos do fix: `lib/build.js`, `lib/conteudo.js`, `scripts/build.js`, `src/_includes/cartao-loja.njk`, `src/loja.njk`, `src/loja.11tydata.js` (novo), `.github/workflows/regeracao-anual.yml` (apagado), `tests/conteudo.test.js`, `tests/paginas.test.js`, `tests/publicacao.test.js`, `tests/fixtures/completo.json`, `tests/fixtures/outra/fachada-teste.webp` (novo), mais `.checks/`, `.tasks/` e `.design/`.
- Até onde o diff chega: `caminhoFoto` (`lib/conteudo.js:102`) decide o `src` da fachada e da galeria e o destino da cópia (C8, C18, C19, C21, C29). O macro `acoesLoja` (`cartao-loja.njk:1`) é usado em Início, loja e apoio (C11, C13-C15, C17, C18, C26). `loja.11tydata.js` alimenta `title`, `og:title`, `description`, `h1` e JSON-LD da loja (C16, C18-C20). A troca da fachada da Eloy Chaves na fixture afeta C10, C18, C19, C20 e C21. Pelo CLI, `scripts/build.js` afeta C30.
- Todas as provas rodaram de novo em 1cec887, numa invocação.
- As citações foram atualizadas nos 3 arquivos de teste tocados. As linhas mudaram em `paginas.test.js` (+13 depois de `:72`), `publicacao.test.js` (+1) e `conteudo.test.js` (+20 depois de `:129`). `visual.test.js` e `estilo.test.js` não mudaram: citações carried from 644d1d1.
- Os demais checks foram carried from 644d1d1 com a citação conferida. O próprio julgamento deles vem das rodadas 1 e 2.

## Steps que não rodaram (profile `light`), carried from 644d1d1

- Step 1, checklist contra as fontes binding (`ui`): não rodou. `.design/visual/inicio.html` não foi aberto. O fix mexe no markup das ações da loja (macro), mas o HTML gerado mantém classes, texto e ordem, e C11/C17/C34 passaram no navegador.
- `Coverage` e `Test policy`: não rodaram. O checklist não tem essas seções.
- Step 4, injeção de falhas: não rodou. As asserções novas foram julgadas pela leitura contra o código (abaixo), não por mutação executada.

## Fix da revisão do PR (verified at 1cec887)

| # | Achado | Fechado | Evidência |
|---|---|---|---|
| F1 | regeração anual (critério 28) | sim, cancelado pelo usuário | `.tasks/site-belezamix.md:91` - "28. Cancelado pelo Otávio em 2026-10-17 (\"não precisa de lógica para atualizar a idade\")". `.checks/site-belezamix.md:18` (Out of scope, com a mesma citação) e `:144-145` - "C32 - Cancelado com o critério 28", "Proof: nenhuma - check removido". O design tirou a linha de 1º de janeiro e a fonte do deploy hook. Unresolved foram renumerados de 9 para 8 de forma consistente (task e checklist citam 1, 5, 6 e 8 nas posições novas). `.github/` não existe mais (`ls .github` → não encontrado; `git ls-files` sem workflow) |
| F2 | escape duplo em título/h1/descrição da loja | sim | `src/loja.11tydata.js:3-7` - `eleventyComputed` com funções que devolvem texto cru; `base.njk:6`, `:7`, `:11`, `:26` escapam uma vez só. Prova: `tests/paginas.test.js:74-85`, com bairro/nome `D'Ávila & Cia`. `:80` `title`, `:81` `og:title`, `:82` `description`, `:83` `h1` iguais ao texto cru (o helper `decodificar`, `tests/helpers.js:49-50`, decodifica uma vez só, então um escape duplo não viraria o texto cru). `:84` - `doesNotMatch(html, /&amp;(amp|#39);/)` |
| F5 | ações da loja duplicadas | sim | `src/_includes/cartao-loja.njk:1-9` - macro `acoesLoja`; usado em `:15` (cartão) e `src/loja.njk:21`. O markup inline saiu da página da loja |
| F3 | foto publicada por nome sem loja; colisão | sim | `lib/conteudo.js:102` - `caminhoFoto = (slug, arquivo) => \`fotos/${slug}/${path.basename(arquivo)}\``. `lib/build.js:45-46`, `:56` copiam para o mesmo destino. `lib/conteudo.js:66-67` recusa dois arquivos diferentes com o mesmo destino na mesma loja. Provas: `tests/conteudo.test.js:131-142` (2 modos) e `:144-149`; `paginas.test.js:65`, `:100`, `:115` |
| F4 | `--saida` no CLI apagava qualquer caminho | sim | `scripts/build.js:4-9` - `parseArgs` só com `lancamento` e `conteudo`; o `strict` padrão recusa opção desconhecida. Prova: `tests/publicacao.test.js:60-64` - `status ≠ 0`, `stderr` casa `/saida/`. Ver ressalva 2 |

## Testes enfraquecidos ou apagados (verified at 1cec887)

`git diff 89093ba..1cec887 -- tests/`:
- Apagado: só `C32 workflow anual ...` (`publicacao.test.js`), junto com o import `existsSync`, que ficou sem uso. Está coberto pelo cancelamento do critério 28.
- Alterado: `paginas.test.js:65` (era `i.src === "/fotos/fachada-teste.webp"`, agora o caminho por slug, ainda literal e por página), `:100` e `:115` (`image` do JSON-LD por slug; antes as duas lojas esperavam o mesmo caminho). Ficaram mais estritos, não mais fracos.
- Fixture: `completo.json:59` - a fachada da Eloy Chaves passou para `tests/fixtures/outra/fachada-teste.webp`, mesmo nome e conteúdo diferente (`cmp` difere no byte 5). É de propósito, para exercitar o mesmo nome em lojas diferentes.
- Adicionados: C8 nome repetido ×2, C8 lojas diferentes, C18 escape duplo, C30 CLI recusa `--saida`.
- Nenhuma asserção removida ou afrouxada fora do C32.

## Checks

Proof run: `npm test` (= `node --test "tests/**/*.test.js"`), uma invocação na raiz, em 1cec887, exit 0, 41 testes, 41 passaram. Cada id de C1 a C30, C33, C34 e C35 aparece individualmente como `✔`. C6, C7 e C8 aparecem por modo, e C8 tem 5 testes. C18 e C30 têm 2 testes cada. Nenhum teste tem o id C31 ou C32.

| Check | Claim | Proof run | Evidence | Result |
|---|---|---|---|---|
| C1 | nenhum template tem endereço, horário, Instagram ou Place ID | `✔ C1 ...` | `tests/conteudo.test.js:18` | PASS (carried from 644d1d1; arquivo de teste tocado, linha conferida) |
| C2 | conteudo.json só com campos das fontes; 12 ausentes | `✔ C2 ...` | `conteudo.test.js:23`, `:43-48` | PASS (carried from 644d1d1) |
| C3 | prévia: código 0 e `[PENDENTE: ...]` | `✔ C3 ...` | `conteudo.test.js:53-56` | PASS (carried from 644d1d1) |
| C4 | lançamento: 3 + 17 obrigatórios, código ≠ 0, linha `<nome>: <campo>` | `✔ C4 ...` | `conteudo.test.js:61-65`, `:70-71`, `:78-79` | PASS (carried from 644d1d1) |
| C5 | lançamento recusado não escreve `.html` | `✔ C5 ...` | `conteudo.test.js:85-86` | PASS (carried from 644d1d1) |
| C6 | whatsapp/telefone fora de `^55\d{10,11}$` recusa nos 2 modos | `✔ C6 ...` ×2 | `conteudo.test.js:91`, `:95-96` | PASS (carried from 644d1d1) |
| C7 | abre/fecha fora de `^\d{2}:\d{2}$` recusa nos 2 modos | `✔ C7 ...` ×2 | `conteudo.test.js:105-106` | PASS (carried from 644d1d1) |
| C8 | foto inexistente ou sem `.webp` recusa nos 2 modos | `✔ C8 foto inexistente ...` ×2, `✔ C8 ... nome repetido ...` ×2, `✔ C8 lojas diferentes ...` | `conteudo.test.js:113-116` - 4 casos com motivo; `:122` - `notEqual(r.codigo, 0)`; `:124` - `startsWith(...) && includes(motivo)`. Regressão F3: `:134` - `fotos[0]` = `outra/fachada-teste.webp` (mesmo nome da fachada `completo.json:36`); `:136` - `notEqual(r.codigo, 0)`; `:138` - linha `Belezamix (Anhangabaú): fotos[0] inválido` com `nome repetido`; `:146-148` - código 0 e `/fotos/anhangabau/` e `/fotos/eloy-chaves/fachada-teste.webp` existem | PASS (verified at 1cec887) |
| C9 | opcional ausente: sem seção, sem `[PENDENTE` | `✔ C9 ...` | `conteudo.test.js:159-160`, `:162` | PASS (carried from 644d1d1; linhas atualizadas) |
| C10 | telefone exibido e no JSON-LD | `✔ C10 ...` | `conteudo.test.js:166-167`, `:171-174` | PASS (carried from 644d1d1; linhas atualizadas; fixture tocada, rodou verde) |
| C11 | primeira tela em 360×640 com logo, selo, h1 e as 2 lojas completas | `✔ C11 [navegador] ...` | `tests/visual.test.js:40-41`, `:44-51` (arquivo não tocado) | PASS (verified at 1cec887: o macro mudou o cartão, a asserção literal de textos e caixas passou) |
| C12 | selo "Há 20 anos" só na Início; `[PENDENTE]` sem ano | `✔ C12 ...` | `paginas.test.js:16`, `:18`, `:20`, `:22` | PASS (carried from 644d1d1) |
| C13 | URL exata do WhatsApp Anhangabaú | `✔ C13 ...` | `paginas.test.js:27` - `hrefs.includes(WHATS_ANHANGABAU)`, literal `:11` | PASS (verified at 1cec887; botão agora sai de `acoesLoja`) |
| C14 | mensagens por loja, texto visível, aria-label | `✔ C14 ...` | `paginas.test.js:33` - 2 botões; `:35` mensagens literais; `:36` aria-labels; `:38` texto visível | PASS (verified at 1cec887) |
| C15 | URL do "Como chegar" | `✔ C15 ...` | `paginas.test.js:43` (literal `:12`), `:44` | PASS (verified at 1cec887) |
| C16 | og:title/description/url/image absoluto em toda página | `✔ C16 ...` | `paginas.test.js:50-52` | PASS (verified at 1cec887; título e descrição da loja vêm de `loja.11tydata.js`) |
| C17 | WhatsApp antes do "Como chegar" e com área maior, em toda página | `✔ C17 [navegador] ...` | `visual.test.js:58`, `:61`, `:65-66` (arquivo não tocado) | PASS (verified at 1cec887: rodou sobre o markup do macro) |
| C18 | páginas de loja: fachada+alt, endereço, horários, ações, `<title>` | `✔ C18 páginas de loja ...`, `✔ C18 ... não escapam duas vezes` | `paginas.test.js:63` - `title` literal; `:65` - `img.foto--fachada`, `alt` e `src === /fotos/<slug>/fachada-teste.webp`; `:67-68` endereço e horários; `:69-70` - 1 `.btn-whats` e 1 `.link-mapa` em `main`; `:80-84` - sem escape duplo | PASS (verified at 1cec887) |
| C19 | exatamente um JSON-LD `Store` por loja, igual ao conteúdo | `✔ C19 ...` | `paginas.test.js:88-117` - objetos literais, `image` por slug em `:100` e `:115`; `:120` - `equal(blocos.length, 1)`; `:121` - `deepEqual(JSON.parse(...), ldEsperado)`; `:123` sem JSON-LD em `/` e `/marcas/` | PASS (verified at 1cec887; `jsonld` agora vem de `loja.11tydata.js:7` e sai por `base.njk:17` `| safe`) |
| C20 | NAP igual na página da loja e no rodapé de todas | `✔ C20 ...` | `paginas.test.js:128-129` - literais; `:133`, `:136` - `includes(v)` | PASS (verified at 1cec887; `h1` da loja mudou de origem) |
| C21 | sem `fotos` não há galeria, a fachada continua | `✔ C21 ...` | `paginas.test.js:143-145` | PASS (verified at 1cec887; `src` da galeria/fachada por `caminhoFoto`) |
| C22 | sem dados de apoio, páginas não geradas nem no menu | `✔ C22 ...` | `paginas.test.js:153-154`, `:157` | PASS (carried from 644d1d1; linhas atualizadas) |
| C23 | /marcas/ agrupada na ordem, `<title>` | `✔ C23 ...` | `paginas.test.js:163`, `:165` | PASS (carried from 644d1d1; linhas atualizadas) |
| C24 | /profissionais/ por categoria profissional ou listaVip; link da lista | `✔ C24 ...` | `paginas.test.js:170-172`, `:177`, `:182-183`, `:188` | PASS (carried from 644d1d1; linhas atualizadas) |
| C25 | /como-comprar/ só com as seções informadas | `✔ C25 ...` | `paginas.test.js:193-195` | PASS (carried from 644d1d1; linhas atualizadas) |
| C26 | um "Chamar no WhatsApp" por loja nas páginas de apoio | `✔ C26 ...` | `paginas.test.js:201` - `deepEqual(labels, ["Chamar no WhatsApp da loja Anhangabaú", "... Eloy Chaves"])` nas 3 páginas | PASS (verified at 1cec887; cartão de apoio usa `acoesLoja`) |
| C27 | prévia default: noindex, sem sitemap, links internos com `/` | `✔ C27 ...` | `tests/publicacao.test.js:24`, `:27`, `:28`, `:29` | PASS (carried from 644d1d1; linhas +1) |
| C28 | lançamento: sem noindex, canonical/og:url no domínio, sitemap exato | `✔ C28 ...` | `publicacao.test.js:38`, `:40-41`, `:46-47` | PASS (carried from 644d1d1; linhas +1) |
| C29 | todo link interno existe na saída, nos 2 modos | `✔ C29 ...` | `publicacao.test.js:53` - `r.existe(ref)`, que agora inclui `/fotos/<slug>/...`; `:56` - `url(...)` do CSS | PASS (verified at 1cec887) |
| C30 | `npm test` roda o runner nativo sobre `tests/` | `npm test` exit 0, `✔ C30 npm test ...`, `✔ C30 o CLI de build não aceita --saida` | `publicacao.test.js:68` - `equal(pkg.scripts.test, 'node --test "tests/**/*.test.js"')`; `:61-63` - CLI com `--saida` sai ≠ 0 | PASS (verified at 1cec887; ressalvas 2 e 3) |
| C31 | Cloudflare roda os testes antes do build e não publica se falharem | nenhuma (por desenho) | sem `file:line`; nenhum teste com o id. Depende do projeto no Cloudflare (task Unresolved 1, `npm run test:ci && npm run build`) | **BLOCKED** (carried from 644d1d1) |
| C32 | cancelado com o critério 28 | nenhuma (check removido) | `.tasks/site-belezamix.md:91`; `.checks/site-belezamix.md:18`, `:144-145`; teste e workflow removidos | **CANCELLED** pelo usuário (verified at 1cec887); fora da contagem |
| C33 | só os 6 tokens (+ hover/pressionado), Nunito 700/800, Nunito Sans 400/600/700 | `✔ C33 ...` | `tests/estilo.test.js:14`, `:15`, `:20`, `:27` (arquivo e CSS não tocados) | PASS (carried from 644d1d1) |
| C34 | branco sobre `#EF018D` só em texto grande; normal ≥4,5:1 | `✔ C34 [navegador] ...` | `visual.test.js:104-107`, `:112` | PASS (carried from 644d1d1; rodou verde sobre o markup novo) |
| C35 | nenhum recurso de outro domínio | `✔ C35 ...` | `estilo.test.js:42-43`, `:55-56` | PASS (carried from 644d1d1) |

## Swept rows que resolvem para "existing" (verified at 1cec887)

| Row | Constraint citada | No código |
|---|---|---|
| authorization: permissão de push no GitHub; secret do repositório | só quem pode fazer push dispara a publicação | Parcial. O push depende de permissão externa ao repositório, ok. A metade "secret do repositório" ficou desatualizada: o workflow e o secret saíram (`.github/` não existe). A task (`.tasks/site-belezamix.md`, Swept authorization) já tirou o secret; o checklist (`.checks/site-belezamix.md:163`) não. Ressalva 4 |

## Achados restantes (do mais grave para o menos grave)

1. **C31 BLOCKED** (externo): sem prova executável até o projeto existir no Cloudflare com `npm run test:ci && npm run build` (task Unresolved 1).
2. **Médio, teste de C30 que apaga o repo**: `tests/publicacao.test.js:61` roda `scripts/build.js --saida .` na raiz do repositório. Se a opção voltar, o próprio `npm test` chama `rmSync(path.resolve(raiz, "."), { recursive: true, force: true })` (`lib/build.js:43`) com a prévia válida (C27 mostra `REAL` com código 0) e apaga a cópia de trabalho, inclusive `.git`. Hoje a prova vale. Mas a falha que ele vigia é destrutiva. O mais seguro seria apontar `--saida` para uma pasta temporária com um arquivo sentinela e verificar que o sentinela continua lá.
3. **Baixo, regra nova fora do texto do check**: a recusa por "nome repetido" e o caminho `fotos/<slug>/` não estão no critério 5 (`.tasks/site-belezamix.md:29-32`) nem no texto do C8. O teste do CLI ficou sob o id C30, mas a afirmação do C30 é sobre o script `npm test`. O comportamento está provado, mas não registrado como critério.
4. **Baixo, checklist desatualizado**: `.checks/site-belezamix.md:163` ainda cita "secret do repositório".
5. **Baixo, C8 lojas diferentes**: `conteudo.test.js:147-148` confere só que os dois arquivos existem, não que cada loja recebeu a própria foto. As fixtures diferem no conteúdo, então seria possível comparar os bytes.
6. Ressalvas baixas, carried from 644d1d1: em C33, `text-decoration`/`box-shadow` ficam fora da varredura de cores nomeadas; em C27, um link fixo para o domínio de produção numa prévia não seria pego.
7. Muito baixo, inferido e não executado: 93fe312 muda os caminhos das fotos e só 1cec887 atualiza C18/C19. Pela leitura, os testes ficam vermelhos em 93fe312, o que atrapalha um `git bisect`.

## Gate

`npm test` - 41 passed, 0 failed, 0 cancelled, 0 skipped, exit 0, duration 7,6 s, em 1cec887 (33 checks com teste; C6/C7 ×2, C8 ×5, C18 ×2, C30 ×2; C31 sem teste por desenho; C32 cancelado). `git status --porcelain` limpo antes desta escrita.
