# Site Belezamix: conteúdo, páginas e publicação

Profile: `light` (o repositório não declara `AGENTS.md`). Handoff: `on`, mas um único lote cabe no orçamento (ver `## Handoff`).

Sources:

- [.tasks/site-belezamix.md](../.tasks/site-belezamix.md) - os 31 critérios; cada check abaixo cita o critério de onde veio.
- [.design/site-belezamix.md](../.design/site-belezamix.md) - Key decisions 1 a 7, formato do conteúdo, tokens do slice Visual.
- [.design/visual/inicio.html](../.design/visual/inicio.html) - **binding for the interface**: tela Início, 360×640 e desktop.
- [objetivo.md](../objetivo.md) - endereços e horários que entram no conteúdo.
- [Eleventy programmatic API](https://www.11ty.dev/docs/programmatic/) - `new Eleventy(input, output, { config })`, `write()`.
- [Cloudflare Pages build configuration](https://developers.cloudflare.com/pages/configuration/build-configuration/) - `CF_PAGES_URL` é a URL do deploy durante o build.

## Out of scope

- Mapa embutido, página por marca, "aberto agora", analytics, 404 própria, conversão para WebP - excluídos na task (Out of scope e Unresolved 5 e 6).
- Configurar o Cloudflare Pages, `git push` - ações do Otávio ou que exigem o OK dele (task, Unresolved 1; rule 6).
- Regeração anual do "Há N anos" - critério 28 cancelado pelo Otávio em 2026-10-17 ("não precisa de lógica para atualizar a idade").

## Landing

Repositório sem código: tudo é novo. Fontes e ícones vêm de pacotes npm copiados para a saída, não de CDN (critério 31). O build valida o conteúdo antes de chamar o Eleventy, para a recusa do lançamento acontecer antes de qualquer escrita.

| One-way door | Literal shape | Alternative rejected |
| --- | --- | --- |
| Interface do build, consumida pela configuração do Cloudflare | `npm run build` = prévia; `npm run build -- --lancamento` = lançamento; saída em `_site/`; código ≠ 0 e uma pendência por linha no stderr quando recusa | variável de ambiente `MODO` - invisível no comando que o Otávio vai colar no painel, e um typo vira prévia em silêncio |
| `Loja` ganha `nomeCurto` (obrigatório no lançamento) | texto: `"Anhangabaú"`, `"Eloy Chaves"`; usado no cartão, no `aria-label` e na mensagem default | derivar de `bairro` - o bairro da segunda loja é "Parque Eloy Chaves", não o nome com que ela é chamada |
| `horarios[].dias` é lista de códigos | `["seg","ter","qua","qui","sex"]`; códigos `seg ter qua qui sex sab dom`; exibido como "Seg–Sex" quando consecutivo, mapeado para `dayOfWeek` do schema.org | texto livre "Seg–Sex" - não dá para gerar o `openingHoursSpecification` sem interpretar texto |
| URL base por modo | lançamento: `https://belezamixjundiai.com.br`; prévia: `CF_PAGES_URL`, ou `http://localhost:8080` fora do Cloudflare | URL da prévia fixa - o nome do projeto no Cloudflare ainda não existe (task, Unresolved 1) |
| Dependências de runtime do build | `@11ty/eleventy` 3.1.7, `@fontsource/nunito` 5.3.0, `@fontsource/nunito-sans` 5.3.0, `@phosphor-icons/core` 2.1.1, versões exatas | baixar arquivos de fonte e ícone à mão - sem versão, sem licença rastreável |
| Dependência de teste visual | `playwright-core` 1.64.1 (dev), usando o Edge/Chrome já instalado (`channel: "msedge"`), sem baixar navegador | `playwright` completo - baixa ~150 MB de navegadores por instalação |

- Nada mais nesta mudança é difícil de reverter.

**Renegociação aprovada pelo Otávio em 2026-10-17** ("OK no critério 27"; critérios 26 e 27): os checks visuais (C11, C17, C34) precisam de navegador. `npm test` roda todos eles localmente, o que mantém o critério 26 literal. O build do Cloudflare não tem Edge, então ele roda `npm run test:ci`: os mesmos testes, menos os visuais. O critério 27 da task foi atualizado; C31 continua bloqueado pela configuração do Cloudflare.

## Checks

Todo proof roda com `node --test --test-name-pattern="^Cn " "tests/**/*.test.js"`, abreviado abaixo como `teste Cn`. Cada teste começa pelo id do check.

### S1 - Conteúdo · 6 arquivos · ~8k

**C1** - Nenhum template contém os endereços, horários, Instagram ou Place IDs (critério 1)
Proof: teste C1

**C2** - `conteudo/conteudo.json` traz exatamente os campos informados pelas fontes e deixa ausentes os 12 listados (critério 2)
Proof: teste C2

**C3** - Em prévia, um obrigatório ausente sai com código 0 e a página mostra `[PENDENTE: <campo> da loja <nome>]` (Loja) e `[PENDENTE: <campo>]` (Negócio) (critério 3)
Proof: teste C3

**C4** - Em lançamento, cada um dos 3 obrigatórios de `Negócio` e dos 17 de `Loja` ausente gera código ≠ 0 e a linha `<nome>: <campo>` no stderr (critério 4)
Proof: teste C4

**C5** - Um lançamento recusado não deixa nenhum `.html` na pasta de saída (critério 4)
Proof: teste C5

**C6** - `whatsapp` ou `telefone` fora de `^55\d{10,11}$` recusa o build nos dois modos, nomeando loja e campo (critério 5)
Proof: teste C6

**C7** - `abre`/`fecha` fora de `^\d{2}:\d{2}$` recusa o build nos dois modos, nomeando loja e campo (critério 5)
Proof: teste C7

**C8** - `fotoFachada` ou `fotos` com arquivo inexistente ou sem `.webp` recusa o build nos dois modos (critério 5)
Proof: teste C8

**C9** - Campo opcional ausente não gera seção nem texto `[PENDENTE` (critério 6)
Proof: teste C9

**C10** - Telefone exibido `(11) 99999-0000` / `(11) 4521-0000` e no JSON-LD `+55 11 99999-0000` / `+55 11 4521-0000` (critério 7)
Proof: teste C10

### S2 - Início · 4 arquivos · ~6k

**C11** - Em 360×640, logo, selo, `h1` e as duas lojas com nome curto, endereço, horários, WhatsApp e "Como chegar" estão dentro da primeira tela (critério 8)
Proof: teste C11 (visual)

**C12** - Selo "Há 20 anos em Jundiaí" com `anoFundacao` 2006 em 2026; `[PENDENTE: anoFundacao]` sem ele; nenhuma outra página nem o rodapé mostram "Há N anos" (critério 9)
Proof: teste C12

**C13** - O botão da loja Anhangabaú aponta para `https://wa.me/5511999990000?text=Ol%C3%A1!%20Vim%20pelo%20site%2C%20loja%20Anhangaba%C3%BA` (critério 10)
Proof: teste C13

**C14** - Mensagens default por loja, texto visível "Chamar no WhatsApp" e `aria-label` "Chamar no WhatsApp da loja <nomeCurto>" (critério 10)
Proof: teste C14

**C15** - "Como chegar" aponta para `https://www.google.com/maps/search/?api=1&query=Belezamix%20(Anhangaba%C3%BA)&query_place_id=ChIJ3wjOYpAmz5QRd_NY4r1x-mo` (critério 11)
Proof: teste C15

**C16** - Toda página tem `og:title`, `og:description`, `og:url` e `og:image` absoluto no HTML (critério 12)
Proof: teste C16

**C17** - Em toda página, o WhatsApp de cada loja vem antes do "Como chegar" dela e tem área maior (critério 13)
Proof: teste C17 (visual)

### S3 - Loja · 3 arquivos · ~5k

**C18** - `/lojas/anhangabau/` e `/lojas/eloy-chaves/` existem com foto da fachada e `alt`, endereço, horários, WhatsApp, "Como chegar" e `<title>` "Cosméticos em <bairro>, Jundiaí | Belezamix" (critério 14)
Proof: teste C18

**C19** - Cada página de loja tem exatamente um JSON-LD `Store` com os campos do critério 15 iguais ao conteúdo
Proof: teste C19

**C20** - Nome, endereço e telefone exibido aparecem com os mesmos caracteres na página da loja e no rodapé de todas as páginas (critério 16)
Proof: teste C20

**C21** - Sem `fotos`, não há galeria e a foto da fachada continua (critério 17)
Proof: teste C21

### S4 - Páginas de apoio · 4 arquivos · ~5k

**C22** - Sem dados de apoio, `/marcas/`, `/profissionais/` e `/como-comprar/` não são geradas nem aparecem no menu (critério 18)
Proof: teste C22

**C23** - `/marcas/` agrupa por categoria na ordem do conteúdo, com `<title>` "Marcas de cosméticos em Jundiaí | Belezamix" (critério 19)
Proof: teste C23

**C24** - `/profissionais/` aparece com categoria profissional ou `listaVip`, e tem o link da lista quando ela existe (critério 20)
Proof: teste C24

**C25** - `/como-comprar/` mostra só as seções informadas (critério 21)
Proof: teste C25

**C26** - Cada página de apoio tem um "Chamar no WhatsApp" por loja (critério 22)
Proof: teste C26

### S5 - Publicação · 4 arquivos · ~5k

**C27** - Em prévia (default), toda página tem `noindex`, não há `sitemap.xml` e os links internos começam com `/` (critério 23)
Proof: teste C27

**C28** - Em lançamento, nenhuma página tem `noindex`; `canonical` e `og:url` usam `https://belezamixjundiai.com.br` + caminho; `sitemap.xml` lista exatamente essas URLs (critério 24)
Proof: teste C28

**C29** - Nos dois modos, todo link interno aponta para arquivo existente na saída (critério 25)
Proof: teste C29

**C30** - `npm test` roda o test runner nativo do Node sobre `tests/` e sai com código ≠ 0 se algum teste falhar (critério 26)
Proof: `npm test` (exit 0) e teste C30, que confere o script `test` do `package.json`

**C31** - O Cloudflare roda os testes antes do build e não publica se falharem (critério 27)
Proof: bloqueado - task Unresolved 1; e a renegociação acima

**C32** - Cancelado com o critério 28 (ver Out of scope)
Proof: nenhuma - check removido

### S6 - Visual · 2 arquivos · ~4k

**C33** - O CSS usa só os 6 tokens de cor (mais hover e pressionado do botão), Nunito 700/800 e Nunito Sans 400/600/700 (critério 29)
Proof: teste C33

**C34** - Texto branco sobre `#EF018D` só com ≥24px ou ≥18,66px em negrito; todo texto normal tem contraste ≥4,5:1 com o próprio fundo (critério 30)
Proof: teste C34 (visual)

**C35** - Nenhuma página carrega recurso de outro domínio; links de saída não contam (critério 31)
Proof: teste C35

## Swept

- validation: C4, C6, C7, C8
- failure modes: C4, C5, C31
- idempotency: não se aplica - o build é função do conteúdo e do ano
- authorization: existing - permissão de push no GitHub; secret do repositório
- concurrency: fora do escopo - task Unresolved 8
- data lifecycle: C22
- dependency failure: C31; fontes e ícones locais (C35)
- state transitions: C3, C4, C27, C28
- observability: fora do escopo - Key decision 6 (sem analytics)

## Handoff

O lote é único. Os 6 slices somam ~33k tokens de leitura, num repositório sem código, abaixo dos 150k. Não há troca de agente: o Verifier roda ao final, sobre `3193b6c..HEAD`.
