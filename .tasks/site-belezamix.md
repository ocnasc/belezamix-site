# Site Belezamix: conteúdo, páginas e publicação

> Build this with **tlc-implement** (`.claude/skills/tlc-implement`).
> Every criterion below becomes a check with a proof, referenced by its number. Nothing under
> `Unresolved` gets settled while building.

## Intent

Quem procura em Jundiaí uma loja de cosméticos perto de casa não encontra um site da Belezamix. Encontra, no máximo, o Perfil do Google e o Instagram `@belezamixjundiai`. Não existem páginas por loja ou por categoria que respondam a buscas locais, nem um caminho direto e medível do Google até o WhatsApp de cada loja. O volume atual de conversas no WhatsApp por loja não é medido.

Com esta task entregue, a Belezamix passa a ter um site estático com 6 páginas gerado a partir de um único arquivo de conteúdo. A prévia fica publicada no Cloudflare Pages a cada push. Cada loja tem botão de WhatsApp com mensagem pré-preenchida própria e um "Como chegar" que abre o perfil dela no Google Maps. O build de lançamento recusa publicar enquanto faltar dado obrigatório. Design: [.design/site-belezamix.md](../.design/site-belezamix.md).

31 critérios em 6 slices · 6 one-way doors · 9 em aberto, dos quais 2 bloqueiam e 3 bloqueiam o go-live

## Criteria

### Conteúdo: um arquivo de fatos e a regra de obrigatórios

1. Sempre, todo dado factual exibido no site (nome, endereço, horário, telefone, WhatsApp, Place ID, ano de fundação, marcas, formas de pagamento, entrega, retirada, lista VIP, fotos) sai do arquivo de conteúdo. Uma busca nos templates pelos endereços e horários do `objetivo.md`, pelo Instagram e pelos Place IDs não encontra nenhum desses valores.
2. Quando o arquivo de conteúdo é criado nesta task, ele contém só o que as fontes já informam:
   - as duas lojas trazem `slug`, `nome`, `bairro`, endereço e `horarios` do `objetivo.md`;
   - os `placeId` são `ChIJ3wjOYpAmz5QRd_NY4r1x-mo` (Anhangabaú) e `ChIJoygNBBklz5QRUl-scTsYM3g` (Eloy Chaves);
   - o `Negócio` traz `nome` "Belezamix" e `instagram` "belezamixjundiai";
   - ficam ausentes: `telefone`, `whatsapp`, `latitude`, `longitude`, `fotoFachada`, `fotos`, `anoFundacao`, `categorias`, `formasPagamento`, `retirada`, `entrega` e `listaVip`.
3. Dado um campo obrigatório ausente, quando o build roda em modo prévia, ele termina com código 0. A página mostra `[PENDENTE: <campo> da loja <nome da loja>]` para campos de `Loja` e `[PENDENTE: <campo>]` para campos de `Negócio`. Exemplo: `[PENDENTE: whatsapp da loja Belezamix Eloy Chaves]`.
4. Se faltar qualquer um dos campos obrigatórios abaixo no modo lançamento, o build termina com código diferente de 0. A saída de erro lista cada pendência em uma linha, no formato `<nome da loja ou Negócio>: <campo>`, e nenhum HTML é escrito na pasta de saída.
   - Obrigatórios de `Negócio`: `nome`, `anoFundacao` e `instagram`.
   - Obrigatórios de cada `Loja`: `slug`, `nome`, `bairro`, `logradouro`, `numero`, `cep`, `cidade`, `uf`, `latitude`, `longitude`, `placeId`, `horarios`, `telefone`, `whatsapp`, `mensagemWhatsapp` e `fotoFachada`.
5. O build termina com código diferente de 0 nos dois modos, nomeando a loja e o campo, em qualquer um destes casos:
   - `whatsapp` ou `telefone` não casa com `^55\d{10,11}$`;
   - um `abre` ou `fecha` de `horarios` não casa com `^\d{2}:\d{2}$`;
   - o `arquivo` de `fotoFachada` ou de `fotos` não existe no repositório ou não termina em `.webp`.
6. Dado um campo opcional ausente, a seção correspondente não aparece no HTML e o texto `[PENDENTE` também não aparece no lugar dela.
7. O telefone é exibido formatado a partir dos dígitos guardados:

   | Telefone guardado | Na página | No JSON-LD |
   |---|---|---|
   | `5511999990000` | `(11) 99999-0000` | `+55 11 99999-0000` |
   | `551145210000` | `(11) 4521-0000` | `+55 11 4521-0000` |

### Início: a página `/`

8. Quando `/` é aberta num viewport de 360×640 px, a primeira tela mostra, sem rolar:
   - o logo;
   - o selo "Há N anos em Jundiaí";
   - o `h1` "Tudo para unhas, cabelo e maquiagem, perto de você.";
   - as duas lojas, cada uma com nome curto, endereço, horários, botão "Chamar no WhatsApp" e "Como chegar".

   Esse é o layout de [.design/visual/inicio.html](../.design/visual/inicio.html).
9. Dado `anoFundacao` 2006 e build em 2026, o selo de `/` mostra "Há 20 anos em Jundiaí". Sem `anoFundacao`, em prévia, o selo mostra `[PENDENTE: anoFundacao]` no lugar do número. Nenhuma outra página nem o rodapé mostram "Há N anos".
10. Dado `whatsapp` 5511999990000 e a `mensagemWhatsapp` "Olá! Vim pelo site, loja Anhangabaú", o botão da loja aponta para `https://wa.me/5511999990000?text=Ol%C3%A1!%20Vim%20pelo%20site%2C%20loja%20Anhangaba%C3%BA`.
    - Cada loja tem a sua mensagem: o default é "Olá! Vim pelo site, loja Anhangabaú" e "Olá! Vim pelo site, loja Eloy Chaves".
    - O texto visível do botão é "Chamar no WhatsApp", e o nome acessível (`aria-label`) é "Chamar no WhatsApp da loja Anhangabaú" (e da loja Eloy Chaves).
11. O botão "Como chegar" de cada loja aponta para `https://www.google.com/maps/search/?api=1&query=<nome da loja codificado>&query_place_id=<placeId>`. Para a loja Anhangabaú: `https://www.google.com/maps/search/?api=1&query=Belezamix%20(Anhangaba%C3%BA)&query_place_id=ChIJ3wjOYpAmz5QRd_NY4r1x-mo`.
12. Sempre, cada página entregue tem no HTML, sem depender de JavaScript, `og:title`, `og:description`, `og:url` e `og:image`. O `og:image` é uma URL absoluta para a imagem da marca.
13. Sempre, em toda página, o "Chamar no WhatsApp" de cada loja aparece antes do "Como chegar" da mesma loja, e com destaque visual maior.

### Loja: `/lojas/anhangabau/` e `/lojas/eloy-chaves/`

14. Quando o build roda, são geradas `/lojas/anhangabau/` e `/lojas/eloy-chaves/`. Cada uma mostra a foto da fachada (com o `alt` do conteúdo), endereço, horários, "Chamar no WhatsApp" e "Como chegar" da própria loja. O `<title>` é "Cosméticos em <bairro>, Jundiaí | Belezamix"; para a loja Anhangabaú, "Cosméticos em Anhangabaú, Jundiaí | Belezamix".
15. Sempre, cada página de loja contém exatamente um bloco JSON-LD com `@type` `Store`, contendo:
    - `name`, `telephone` (no formato do critério 7) e `openingHoursSpecification`;
    - `address`, com `streetAddress`, `addressLocality`, `addressRegion`, `postalCode` e `addressCountry` "BR";
    - `geo`, com `latitude` e `longitude`;
    - `url`, a URL absoluta da própria página;
    - `image`, a URL absoluta da `fotoFachada`;
    - `sameAs`, com `["https://www.instagram.com/belezamixjundiai"]`.

    Os valores são iguais aos do arquivo de conteúdo.
16. Sempre, o nome, o endereço e o telefone exibido (critério 7) de uma loja aparecem com os mesmos caracteres no texto da página da loja e no rodapé de todas as páginas.
17. Dada uma loja sem `fotos`, a página dela não tem galeria. A foto da fachada continua aparecendo.

### Páginas de apoio: `/marcas/`, `/profissionais/`, `/como-comprar/`

18. Dado um conteúdo sem `categorias`, `listaVip`, `formasPagamento`, `retirada` e `entrega`, `/marcas/`, `/profissionais/` e `/como-comprar/` não são geradas e não aparecem no menu de nenhuma página.
19. Dada ao menos uma `Categoria` com marcas, `/marcas/` é gerada com as marcas agrupadas por categoria, na ordem do arquivo de conteúdo, e com `<title>` "Marcas de cosméticos em Jundiaí | Belezamix".
20. Dada uma `Categoria` com `profissional` sim ou uma `listaVip` informada, `/profissionais/` é gerada com as categorias profissionais e suas marcas. Quando `listaVip` existe, a página tem também um link para ela.
21. Dado ao menos um entre `formasPagamento`, `retirada` e `entrega`, `/como-comprar/` é gerada só com as seções informadas.
22. Sempre, cada página de apoio gerada tem um "Chamar no WhatsApp" por loja.

### Publicação: prévia e lançamento no Cloudflare Pages

23. Enquanto o modo for prévia (o default quando nenhum modo é informado), toda página tem `<meta name="robots" content="noindex">`, nenhum `sitemap.xml` é gerado e os links internos são relativos à raiz (`/`, `/lojas/anhangabau/`).
24. Dado um conteúdo de teste com todos os obrigatórios preenchidos, quando o build roda em modo lançamento:
    - nenhuma página tem `noindex`;
    - cada página tem `<link rel="canonical">` e `og:url` apontando para `https://belezamixjundiai.com.br` com o caminho da própria página;
    - é gerado um `sitemap.xml` listando exatamente essas URLs canônicas, nem mais nem menos.
25. Sempre, nos dois modos, todo link interno de toda página aponta para um arquivo que existe na saída do build.
26. Quando `npm test` roda, ele executa com o test runner nativo do Node os checks dos critérios 1 a 25 e 31 e termina com código 0 só se todos passarem.
27. Quando há push na branch `main`, o Cloudflare Pages roda `npm test` antes do build da prévia e publica o resultado em `https://<projeto>.pages.dev`. Se `npm test` falhar, o deploy falha e a versão anterior continua no ar.
28. Um workflow do GitHub Actions agendado para `0 3 1 1 *` (00:00 de 1º de janeiro no horário de Brasília), e que também pode ser disparado manualmente, faz um POST no deploy hook do Cloudflare guardado no secret `CLOUDFLARE_DEPLOY_HOOK`. Quando ele roda, um novo build da `main` começa no Cloudflare. Se o POST não receber resposta 2xx, o workflow termina com falha.

### Visual: a identidade aprovada em todas as páginas

29. Sempre, as cores da interface são os tokens do design aprovado. A tabela está no slice Visual de [.design/site-belezamix.md](../.design/site-belezamix.md):
    - `#EF018D` (marca);
    - `#FFFFFF` (sobre a marca e superfície);
    - `#B5006A` (marca para texto);
    - `#FFF0F7` (fundo);
    - `#1A1A1A` (texto);
    - `#5C5560` (texto secundário).

    Nenhuma outra cor aparece no CSS, exceto os estados de hover e pressionado do botão. Os títulos e botões usam Nunito 700/800, e o texto usa Nunito Sans 400/600/700.
30. Sempre, texto branco sobre `#EF018D` só aparece com tamanho ≥24px, ou ≥18,66px em negrito, e todo texto de tamanho normal tem contraste ≥4,5:1 com o fundo dele.
31. Sempre, nenhuma página carrega recurso de outro domínio. Fontes, ícones (Phosphor, peso bold), imagens e CSS saem do próprio site. Os links de saída (WhatsApp, Google Maps, Instagram) não contam.

## Out of scope

- Mapa embutido na página da loja - depende de uma chave da Maps Embed API que ainda não existe. Sem chave, o design manda omitir a seção (Unresolved 6).
- Página por marca - o design só a admite se o Search Console mostrar busca por "<marca> Jundiaí" depois do lançamento.
- Indicador de "aberto agora" - descartado no design: exigiria JavaScript e o horário fixo já responde à pergunta.
- Analytics, cookies e banner - Key decision 6 do design.
- GitHub Pages - os termos dele proíbem o uso como hospedagem gratuita de negócio.
- Registro do domínio, DNS e Search Console - são ações do Otávio fora do repositório (Unresolved 4).
- Conversão de imagens para WebP no build - as fotos entram já em WebP (design, slice Conteúdo, default 2).

## Observable

| Surface | Decision | Landing |
| --- | --- | --- |
| tela `/` | estado vazio (dado ausente) | 3, 6, 9 |
| tela `/` | carregando | n/a - HTML estático, não há carregamento assíncrono de conteúdo |
| tela `/` | erro | n/a - não há operação que falhe no navegador; links de saída abrem apps externos |
| tela `/` | não autorizado | n/a - site público, sem login |
| tela `/` | densidade e ordem | 8, 13; ordem das lojas = ordem do arquivo de conteúdo (Unresolved 8) |
| tela `/` | ação destrutiva confirma | n/a - não há ação destrutiva |
| tela `/` | layout, cores e tipografia | 8, 29, 30, 31 |
| telas `/lojas/<slug>/` | estado vazio | 3, 6, 17 |
| telas `/lojas/<slug>/` | carregando, erro, não autorizado, ação destrutiva | n/a - mesmos motivos de `/` |
| telas `/lojas/<slug>/` | densidade e ordem | 13, 14 |
| telas de apoio | estado vazio | 18 |
| telas de apoio | densidade e ordem | 19, 20, 21 |
| URL inexistente | página de erro 404 | Unresolved 7 |
| comando de build | modo default | 23 |
| comando de build | códigos de saída | 3, 4, 5 |
| comando de build | o que imprime ao falhar | 4, 5 |
| comando de build | falha no meio | 4 |
| comando `npm test` | saída e código | 26 |
| deploy no Cloudflare | falha | 27 |
| workflow agendado | falha | 28 |
| texto das páginas | tom e afirmações | existing - `objetivo.md`, "O site NÃO deve ter" (sem superlativos, depoimentos ou números sem fonte); revisado no diff |
| texto das páginas | o que o leitor faz a seguir | 8, 10, 11, 22 |
| coleção `Loja` | ordem | Unresolved 8 |
| coleção `Categoria`/marcas | agrupamento e ordem | 19 |
| coleção `Categoria`/marcas | duplicatas | Unresolved 8 |
| link compartilhado (card de prévia) | título, descrição, imagem | 12 |

## Swept

- validation: 4, 5
- failure modes: 4, 27, 28
- idempotency and retry: n/a - o build é uma função do conteúdo e do ano corrente; rodar de novo com as mesmas entradas gera a mesma saída, e um deploy repetido republica o mesmo site
- authorization: existing - só quem tem permissão de push no repositório `ocnasc/belezamix-site` dispara a publicação; o deploy hook fica num secret do repositório; o site é público e sem login
- concurrency and ordering: Unresolved 9 - a documentação do Cloudflare Pages não diz em que ordem builds na fila são processados
- data lifecycle: 18. Quando um dado sai do conteúdo, a página ou seção dele some no próximo deploy. Remover uma URL depois do lançamento é tratado pela Key decision 5 do design
- external-dependency failure: 27, 28 - falha do Cloudflare mantém a versão anterior no ar; falha do deploy hook aparece como workflow falho. WhatsApp e Google Maps são só links de saída; n/a. Fontes e ícones saem do próprio site (31)
- state transitions: 3, 4, 23, 24 - prévia e lançamento são modos de build, não estados persistidos
- observability: n/a em tempo de execução - por decisão do design (Key decision 6), não há analytics. A medição é a mensagem pré-preenchida (10); logs de build ficam no Cloudflare, e os do workflow anual no GitHub Actions

## Impact

| Front | What changes |
|---|---|
| domain | novo termo: `Negócio` - os fatos da empresa (nome, ano de fundação, Instagram, pagamento, entrega, retirada, lista VIP, categorias), no arquivo de conteúdo |
| domain | novo termo: `Loja` - uma loja física com slug, NAP, coordenadas, Place ID, horários, WhatsApp, mensagem e foto da fachada, no arquivo de conteúdo |
| domain | novo termo: `Categoria` - grupo de marcas (Unhas, Cabelo, Maquiagem, Linha profissional), com marcação `profissional`, no arquivo de conteúdo |
| domain | novo termo: modo `prévia` / `lançamento` - o modo do build; prévia é o default |
| stored data | nada a migrar - não existe site nem conteúdo anterior |
| repositório | primeiro código do projeto: entram `package.json` (dependência `@11ty/eleventy`) e o workflow agendado; `objetivo.md`, `README.md` e `.design/` não mudam |

## Decided

| Decision | Shape | Alternative rejected |
|---|---|---|
| Gerador do site | dependência `@11ty/eleventy` 3.x; HTML final gerado no build | script Node sem dependência - mais leve, mas o Otávio escolheu apostar no reaproveitamento como template; render no navegador - robôs de prévia de link não executam JS |
| Hospedagem | Cloudflare Pages para prévia (`*.pages.dev`) e lançamento (domínio próprio), conectado ao repositório | GitHub Pages - os termos proíbem o uso como hospedagem gratuita de negócio, e não faz 301 |
| URLs públicas | `/`, `/lojas/anhangabau/`, `/lojas/eloy-chaves/`, `/marcas/`, `/profissionais/`, `/como-comprar/` | URLs por bairro sem `/lojas/` - não há motivo; renomear depois do lançamento exige 301 e perde posição temporariamente |
| Formato do conteúdo | um arquivo JSON com `Negócio` (`nome`, `anoFundacao`, `instagram`, `formasPagamento`, `retirada`, `entrega`, `listaVip`, `categorias`[{`nome`, `marcas`[], `profissional`}]) e `lojas`[{`slug`, `nome`, `bairro`, `logradouro`, `numero`, `cep`, `cidade`, `uf`, `latitude`, `longitude`, `placeId`, `horarios`[{`dias`, `abre`, `fecha`}], `telefone` (só dígitos), `whatsapp` (só dígitos), `mensagemWhatsapp`, `fotoFachada`{`arquivo`, `alt`}, `fotos`[{`arquivo`, `alt`}]}] | planilha ou painel - quem edita é o Otávio, que lê JSON; telefone já formatado - exigiria duas fontes para a página e o JSON-LD |
| Modo do build | prévia é o default; lançamento só quando pedido explicitamente | lançamento como default - um build esquecido publicaria uma versão indexável com dados incompletos |
| Mensagem do WhatsApp | `https://wa.me/<whatsapp>?text=<mensagemWhatsapp>`, uma mensagem por loja que nomeia a loja e a origem "site" | parâmetro `utm_source` - não chega ao WhatsApp; a mensagem é o que o atendente vê |

## Sources

- [.design/site-belezamix.md](../.design/site-belezamix.md) - Key decisions 1 a 7, slices e defaults já aceitos, incluindo a revisão de 2026-10-17.
- [objetivo.md](../objetivo.md) - endereços e horários das lojas, frase principal, o que o site não deve ter.
- Revisão do plano colada pelo Otávio no chat em 2026-10-17, aprovada por ele ("A sim, B sim, aplica tudo") - Place IDs: "Anhangabaú: `ChIJ3wjOYpAmz5QRd_NY4r1x-mo`", "Eloy Chaves: `ChIJoygNBBklz5QRUl-scTsYM3g`".
- [conteudo/logo-belezamix.png](../conteudo/logo-belezamix.png) - imagem da marca para `og:image` e cabeçalho até existir a versão vetorial.
- [Google Maps URLs](https://developers.google.com/maps/documentation/urls/get-started) - formato do critério 11.
- [Cloudflare Pages deploy hooks](https://developers.cloudflare.com/pages/configuration/deploy-hooks/) - critério 28.
- [.design/visual/inicio.html](../.design/visual/inicio.html) - **binding para a interface**: tela Início (360×640 e desktop), aprovada pelo Otávio em 2026-10-17. Valores transcritos nos critérios 8, 10, 29 e 30; as demais páginas seguem os mesmos tokens e componentes.

This task is the record of decision. If a linked document diverges, ask before building.

## Unresolved

| # | Kind | Question | Until answered |
|---|---|---|---|
| 1 | blocks | Conta no Cloudflare e projeto Pages conectado ao repositório, com o comando de build rodando `npm test` antes do build. Nome do projeto: default `belezamix-site`, ou seja `belezamix-site.pages.dev` se o nome estiver livre. Também falta o OK do Otávio para o push. | O critério 27 não pode ser provado. |
| 2 | blocks | Deploy hook criado no Cloudflare e salvo como secret `CLOUDFLARE_DEPLOY_HOOK` no repositório, pelo Otávio. | O critério 28 só pode ser provado até o ponto do POST. |
| 3 | blocks go-live | Dados das lojas vindos dos donos: `telefone`, `whatsapp`, `latitude`/`longitude` e `fotoFachada` de cada loja, e `anoFundacao` da marca. | Todos os critérios passam com dados de teste, mas o build de lançamento recusa o conteúdo real (critério 4). |
| 4 | blocks go-live | Registro de `belezamixjundiai.com.br` (livre em 2026-10-17), domínio ligado ao projeto no Cloudflare Pages, e cadastro no Search Console com envio do sitemap. | O lançamento não pode ir ao ar no domínio. |
| 5 | blocks go-live | Conferência manual de nome, endereço e telefone contra o Perfil do Google e o Instagram (Key decision 4 do design), e teste de clique confirmando que os dois Place IDs abrem o perfil da loja certa. | Lançar sem conferir arrisca divergência entre site, Perfil e Instagram, ou um "Como chegar" apontando para outro lugar. |
| 6 | open | Chave da Maps Embed API para o mapa nas páginas de loja. | Mapa fora desta task; as páginas de loja não têm a seção de mapa. |
| 7 | open | Página 404 própria. | Fica a 404 padrão do Cloudflare Pages. |
| 8 | open | Ordem das lojas e tratamento de marca duplicada numa categoria. | Default: a ordem do arquivo de conteúdo, sem deduplicar; o Otávio corrige duplicatas no JSON. |
| 9 | open | Ordem de processamento de builds na fila do Cloudflare Pages com dois pushes próximos. | Não está documentada. Default: se a produção não corresponder ao último commit, refazer o deploy pelo painel. |
