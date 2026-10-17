# Site Belezamix

> Plan from this document. Each slice below carries its own shape - copy it, do not re-derive it.
> Status: confirmed by Otávio (ocnasc), 2026-10-17. Amended 2026-10-17 after a review of the plan (hosting, phone, Place ID, façade photo, JSON-LD, founding year).

## Situation

- Project: not shipped yet. O repositório só tem o briefing (`objetivo.md`) e o README. A loja não tem site: a busca por "Belezamix Jundiaí" não encontra nada dela.
- Decision: committed by Otávio, 2026-10-17, no `objetivo.md` e na entrevista de discovery.
- In flight: nada a copiar como precedente. O domínio `belezamix.com.br` está registrado desde 2019, mas não é da loja e fica fora. Os donos da loja são os pais do Otávio. A "Fase 1" (Perfil do Google, avaliações e WhatsApp Business, até 28/11/2026) corre fora deste documento e tem prioridade sobre ele.
- At stake: barato antes do lançamento. A partir dele, URLs indexadas e nome/endereço/telefone espelhados no Perfil do Google e no Instagram ficam caros de mudar (Key decisions 4 e 5).

## Problem

Ausência. A Belezamix tem duas lojas físicas em Jundiaí há cerca de 20 anos, e quem procura "loja de cosméticos perto de mim" não acha um site dela. O que as pessoas fazem no lugar disso: encontram o Perfil do Google, o Instagram `@belezamixjundiai` ou passam na frente da loja. O que fica impossível sem o site: ter páginas por loja e por categoria/marca que respondam a buscas locais ("[categoria] em [bairro], Jundiaí"), e um caminho direto e medível do Google até o WhatsApp de cada loja. O volume atual de conversas no WhatsApp por loja **não é medido**. Ninguém tem o número hoje.

## Success

- Worked if: conversas no WhatsApp que começam com a mensagem pré-preenchida do site aparecem toda semana nas duas lojas, nos primeiros 3 meses após o lançamento.
- Going wrong: quatro semanas após o lançamento sem nenhuma mensagem "Vim pelo site" em uma das lojas; ou páginas de loja fora do índice do Google no Search Console.
- Review: 3 meses após o lançamento - Otávio, com a contagem de mensagens repassada pelas lojas.

## Boundary

In: as seis páginas do briefing, o arquivo de conteúdo, o schema `LocalBusiness` por loja, o sitemap, e a prévia e o lançamento no Cloudflare Pages.

Out:
- E-commerce, preços e carrinho - o briefing exclui.
- Analytics e banner de cookies - a medição é só pela mensagem pré-preenchida (Key decision 6).
- Busca de imagens em bancos - o briefing proíbe; a skill `taste-skill` foi descartada por isso.
- Edição do conteúdo pelos donos - quem edita é o Otávio, no JSON.
- GitHub Pages - os termos dele não permitem uso como hospedagem gratuita de negócio.

Unchanged: Perfil do Google e Instagram não são alterados por este trabalho; só são conferidos contra o conteúdo antes do lançamento.

## Shape

Um arquivo de conteúdo é o único registro de fatos da loja. O Eleventy transforma esse arquivo em páginas HTML finais, em dois modos: prévia e lançamento. As duas são publicadas pelo Cloudflare Pages. A porta de mão única é o lançamento: a partir dele, URLs e nome/endereço/telefone ficam indexados e espelhados fora do site, e mudá-los custa SEO e conferência manual.

A alternativa mais leve, um script de build em Node puro sem dependências, ganharia se esta base nunca fosse reaproveitada. Otávio escolheu o Eleventy apostando no reaproveitamento como template.

## Key decisions

1. **O HTML sai pronto do build; nenhum conteúdo é montado no navegador.** Texto, schema `LocalBusiness` e tags de prévia de link precisam estar no HTML entregue. Os robôs que montam o card de um link compartilhado no WhatsApp não executam JavaScript, e o WhatsApp é a ação principal.
2. **O arquivo de conteúdo é a única origem de dado factual.** Endereço, horário, telefone, Place ID, marca, foto e ano de fundação vivem só nele. Nenhum template escreve um fato, nem o "há 20 anos", que é calculado a partir do ano de fundação. Um campo ausente nunca é preenchido por suposição.
3. **O mesmo conteúdo gera dois modos de build: prévia e lançamento.**
   - **Prévia:** é publicada no endereço `*.pages.dev` do projeto no Cloudflare, é marcada para não ser indexada e mostra `[PENDENTE: <o que falta>]` no lugar de cada campo ausente.
   - **Lançamento:** fica no domínio próprio e é indexável. Cada página aponta como canônica para o domínio, porque o endereço `*.pages.dev` continua respondendo com o mesmo conteúdo. O lançamento gera o sitemap. O build **é recusado**, nomeando o campo e a loja, enquanto faltar um campo obrigatório (lista no slice Conteúdo).
   - **Campo opcional ausente:** a seção some. Se uma página de apoio ficar sem nada, ela não é gerada, nem entra no menu ou no sitemap.
4. **Nome, endereço e telefone de cada loja são escritos uma vez e aparecem idênticos em todas as páginas do site.**
   - O telefone é guardado só em dígitos. A página exibe `(11) 99999-0000`, e o JSON-LD usa `+55 11 99999-0000`.
   - A exigência de caracteres idênticos vale para a forma exibida: texto da página e rodapé.
   - Antes do lançamento, Otávio confere esses dados contra o Perfil do Google e o Instagram. A conferência é manual, porque nenhum dos dois é lido pelo build.
5. **As URLs ficam fixas a partir do lançamento:** `/`, `/lojas/anhangabau/`, `/lojas/eloy-chaves/`, `/marcas/`, `/profissionais/`, `/como-comprar/`. O Cloudflare Pages faz redirecionamento 301 por arquivo, então renomear é possível. Mas cada renomeação exige um 301 no mesmo deploy, e a URL nova ainda leva tempo para herdar a posição da antiga.
6. **A medição é feita pela mensagem pré-preenchida, sem script de analytics.** Cada loja tem um link de WhatsApp próprio, com uma mensagem que identifica a loja e a origem ("Olá! Vim pelo site, loja Eloy Chaves"). Sem analytics, não há cookies nem banner. O clique em "Como chegar" não é medido.
7. **"Teste" neste projeto é um conjunto de checks do repositório, rodados por `npm test` com o test runner nativo do Node.** São eles:
   - o conteúdo é validado contra o formato do slice Conteúdo;
   - o HTML gerado é verificado contra os state tables de cada slice;
   - o build de lançamento falha quando há campo obrigatório pendente.

   O deploy só acontece se `npm test` passar, e é esse mesmo comando que o grind e o ship gate do harness executam.

## Work

| Slice | Delivers | Status |
|---|---|---|
| [Conteúdo](#conteúdo) | o arquivo de conteúdo com as duas lojas e a validação de obrigatórios | open — 3 defaults taken |
| [Visual](#visual) | identidade aplicada: paleta, tipografia e prévia da Início aprovada pelo Otávio | clear |
| [Início](#início) | a página `/` | clear |
| [Loja](#loja) | `/lojas/anhangabau/` e `/lojas/eloy-chaves/`, com schema por loja | open — 1 default taken |
| [Páginas de apoio](#páginas-de-apoio) | `/marcas/`, `/profissionais/`, `/como-comprar/`, geradas só com dado | open — 2 defaults taken |
| [Publicação](#publicação) | a prévia no Cloudflare Pages; depois, o lançamento no domínio, com sitemap e Search Console | open — 1 default taken |

Order: Conteúdo → Visual → Início → Loja → Publicação (prévia) → Páginas de apoio → Publicação (lançamento, quando os obrigatórios e o domínio existirem).

Derivable, left to the plan: estrutura de templates, nomes de arquivos e formato do comando de build, todos no padrão do Eleventy. Escape de texto e formatação de horário em pt-BR ("Seg–Sex 8h–17h"), como já aparece no `objetivo.md`.

### Conteúdo

**Delivers** o registro único de fatos (Key decision 2) e a regra de obrigatórios do lançamento (Key decision 3). **Status: open.**

| State | What should happen |
|---|---|
| campo obrigatório ausente, prévia | a página mostra `[PENDENTE: <campo> da loja <nome>]` |
| campo obrigatório ausente, lançamento | o build é recusado e lista cada campo e loja faltantes |
| campo opcional ausente | a seção some; uma página de apoio sem nenhum dado não é gerada |
| campo com formato inválido (WhatsApp sem DDI, horário fora de HH:MM) | o build é recusado nos dois modos, nomeando o campo |

Registro `Negócio` (um só).

| Field | Type | Obrigatório no lançamento | Note |
|---|---|---|---|
| `nome` | texto | sim | "Belezamix" |
| `anoFundacao` | inteiro | sim | ano da **marca**; gera "Há N anos em Jundiaí" só na Início, nunca nas páginas de loja nem no rodapé (que aparece nelas) |
| `instagram` | texto | sim | `belezamixjundiai`, informado pelo Otávio |
| `formasPagamento` | lista de texto | não | alimenta Como comprar |
| `retirada` | texto | não | alimenta Como comprar |
| `entrega` | texto | não | bairros e condições; alimenta Como comprar |
| `listaVip` | URL | não | link do grupo/lista no WhatsApp; alimenta Para profissionais |
| `categorias` | lista de `Categoria` | não | alimenta Marcas e categorias |

Registro `Loja` (uma por loja; duas hoje).

| Field | Type | Obrigatório no lançamento | Note |
|---|---|---|---|
| `slug` | texto | sim | `anhangabau` \| `eloy-chaves`; define a URL (Key decision 5) |
| `nome` | texto | sim | idêntico ao Perfil do Google (Key decision 4) |
| `bairro` | texto | sim | usado no título "[categoria] em [bairro], Jundiaí" |
| `logradouro`, `numero`, `cep`, `cidade`, `uf` | texto | sim | os valores do `objetivo.md` entram como estão |
| `latitude`, `longitude` | decimal | sim | tirados do Perfil do Google pelo Otávio |
| `placeId` | texto | sim | Place ID do Google; informado pelo Otávio: Anhangabaú `ChIJ3wjOYpAmz5QRd_NY4r1x-mo`, Eloy Chaves `ChIJoygNBBklz5QRUl-scTsYM3g` |
| `horarios` | lista de {`dias`, `abre`, `fecha`} | sim | os valores do `objetivo.md` entram como estão |
| `telefone` | dígitos com DDI e DDD | sim | pendente; formatado na exibição (Key decision 4) |
| `whatsapp` | dígitos com DDI e DDD | sim | pendente; pode ser igual ao telefone |
| `mensagemWhatsapp` | texto | sim | default "Olá! Vim pelo site, loja <nome curto>" (Key decision 6) |
| `fotoFachada` | {`arquivo` WebP, `alt`} | sim | foto real da fachada; ajuda a reconhecer a loja na rua e alimenta o `image` do schema |
| `fotos` | lista de {`arquivo` WebP, `alt`} | não | galeria; só fotos reais da loja ou da equipe |

Registro `Categoria`: `nome` (Unhas, Cabelo, Maquiagem, Linha profissional), `marcas` (lista de texto, só marcas que a loja vende), `profissional` (sim/não; as categorias marcadas alimentam Para profissionais).

Open, default taken:
1. Formato do arquivo - um único `conteudo.json`. Se ficar grande, divide em um arquivo por loja.
2. Fotos - entram no repositório já em WebP e comprimidas. O build não converte imagens; um pipeline de conversão só vale se o volume de fotos crescer.
3. Logo - hoje existe só um PNG de 447×447 px, com fundo magenta, guardado em `conteudo/`. Falta pedir aos donos uma versão em vetor ou com fundo transparente. Até lá, o cabeçalho usa o PNG.

### Visual

**Delivers** a identidade da marca aplicada ao site. **Status: clear** - prévia da Início aprovada pelo Otávio em 2026-10-17: [.design/visual/inicio.html](visual/inicio.html).

Fatos medidos no logo: magenta `#EF018D`, preto e branco. Branco sobre o magenta tem contraste **4,15:1**, abaixo dos 4,5:1 que o WCAG AA exige para texto normal. Por isso, texto branco sobre magenta só vale em texto ≥24px ou ≥18,66px em negrito.

| Token | Valor | Uso | Contraste medido |
|---|---|---|---|
| marca | `#EF018D` | faixa do topo, botão de WhatsApp | igual ao fundo do logo |
| sobre a marca | `#FFFFFF` | texto grande sobre a marca | 4,15:1 |
| marca para texto | `#B5006A` | links, "Como chegar", selo | 6,62:1 no branco; 6,01:1 no fundo |
| fundo | `#FFF0F7` | fundo da página | - |
| texto | `#1A1A1A` | texto principal; fundo do rodapé | 17,4:1 no branco |
| texto secundário | `#5C5560` | endereço, horário | 7,18:1 no branco; 6,52:1 no fundo |
| superfície | `#FFFFFF` | cartões das lojas | - |

Tipografia: Nunito 700/800 nos títulos e botões, Nunito Sans 400/600/700 no texto; hospedadas no próprio site. Ícones: Phosphor, peso bold, hospedados no próprio site. A `ui-ux-pro-max` recomendou depoimentos em carrossel, Playfair Display e um roxo de destaque; os três foram descartados (depoimento inventado é proibido, o tom não é de luxo, o roxo não é da marca).

Decisões da prévia aprovada:
- O botão mostra "Chamar no WhatsApp", e o nome da loja fica no título do cartão logo acima. "Chamar no WhatsApp · <loja>" não cabe em 360px. O nome acessível do botão inclui a loja: "Chamar no WhatsApp da loja <nome curto>".
- A frase principal é a opção 2 do briefing, sem o final, porque o "há 20 anos" já está no selo acima dela.

### Início

**Delivers** a página `/`. **Status: clear.**

| State | What should happen |
|---|---|
| primeira tela no celular | mostra a frase principal, "Há N anos em Jundiaí" e as duas lojas com bairro e botão de WhatsApp, sem rolar |
| toque em "Chamar no WhatsApp" de uma loja | abre a conversa com o WhatsApp daquela loja, com a mensagem dela (Key decision 6) |
| toque em "Como chegar" | abre o perfil da loja no Google Maps, com fotos e avaliações, pelo Place ID |
| link do site compartilhado no WhatsApp | o card mostra título, descrição e imagem da marca, lidos do HTML (Key decision 1) |

Links de saída, um por loja:
- WhatsApp: `https://wa.me/<whatsapp>?text=<mensagemWhatsapp codificada>`
- Como chegar: `https://www.google.com/maps/search/?api=1&query=<nome da loja codificado>&query_place_id=<placeId>`. O `query` é obrigatório no formato do Google e só é usado se o Place ID não for encontrado.

Frase principal: "Tudo para unhas, cabelo e maquiagem, perto de você.", acompanhada do selo "Há N anos em Jundiaí", com o número vindo de `anoFundacao` (slice Visual).

### Loja

**Delivers** uma página por `Loja`, em `/lojas/<slug>/`. **Status: open.**

| State | What should happen |
|---|---|
| página de loja carregada | mostra a foto da fachada, endereço, horário, botão de WhatsApp e "Como chegar" da loja; título "Cosméticos em <bairro>, Jundiaí \| Belezamix" |
| página de loja carregada | não mostra "Há N anos"; o ano de fundação é da marca, não de cada loja |
| robô de busca lê a página | encontra exatamente um schema `Store` (subtipo de `LocalBusiness`) com nome, endereço, telefone, horário e coordenadas iguais ao conteúdo, mais `url` da página, `image` da foto da fachada e `sameAs` com o Instagram (Key decision 4) |
| loja sem fotos de galeria | a galeria some |
| loja fora do horário | a página mostra só o horário; não existe indicador de "aberto agora" |

Open, default taken:
1. Mapa embutido - o briefing pede mapa na página da loja. Default: Maps Embed API do Google, que é gratuita mas exige uma chave criada pelo Otávio no Google Cloud. O mapa carrega só quando o visitante toca nele, para não colocar cookies do Google antes de uma ação dele. Sem chave, a seção do mapa some (é opcional).

Alternatives considered: indicador de "aberto agora" - só ganha se as lojas mudarem o horário com frequência. Ele exigiria JavaScript no navegador, e o horário fixo já responde à pergunta.

### Páginas de apoio

**Delivers** `/marcas/`, `/profissionais/` e `/como-comprar/`, cada uma gerada só quando o conteúdo tem dado para ela (Key decision 3). **Status: open.**

| State | What should happen |
|---|---|
| ao menos uma `Categoria` com marcas | gera `/marcas/`, agrupando as marcas por categoria |
| nenhuma marca informada | `/marcas/` não é gerada, não aparece no menu nem no sitemap |
| categoria profissional ou `listaVip` informada | gera `/profissionais/`, com as linhas profissionais e o convite para a lista VIP |
| ao menos um entre `formasPagamento`, `retirada` e `entrega` | gera `/como-comprar/` só com as seções informadas |
| qualquer página de apoio | tem um botão de WhatsApp por loja |

Open, default taken:
1. Títulos - `/marcas/` usa "Marcas de cosméticos em Jundiaí \| Belezamix". O padrão "[categoria] em [bairro]" do briefing só se aplica a páginas de loja, porque as páginas de apoio não têm bairro.
2. Uma página por marca - fora. Só vale se o Search Console mostrar busca por "<marca> Jundiaí" depois do lançamento.

### Publicação

**Delivers** a prévia publicada a cada push e, depois, o lançamento no domínio. **Status: open.**

| State | What should happen |
|---|---|
| push na branch principal, antes do lançamento | o Cloudflare Pages roda `npm test`, gera a prévia e a publica em `<projeto>.pages.dev` |
| `npm test` falha | nada é publicado; o site anterior continua no ar |
| robô de busca na prévia | recebe a instrução de não indexar |
| build de lançamento com obrigatório pendente | é recusado (Key decision 3) |
| lançamento | site no `belezamixjundiai.com.br` com HTTPS, indexável, com página canônica no domínio e `sitemap.xml` listando exatamente as páginas geradas |
| depois do lançamento | Otávio cadastra o domínio no Search Console e envia o sitemap |

Open, default taken:
1. Domínio - `belezamixjundiai.com.br` estava livre em 2026-10-17. O registro no Registro.br fica com o Otávio e bloqueia só o lançamento; a prévia não depende dele.

Alternatives considered: GitHub Pages - grátis e já ligado ao repositório, mas os termos dele proíbem o uso como hospedagem gratuita de negócio, e ele não faz 301.

## Sources

- `objetivo.md` - briefing: páginas, lojas, regra de conteúdo, métricas.
- Revisão do plano colada pelo Otávio no chat em 2026-10-17 - hospedagem no Cloudflare, telefone formatado, Place ID das lojas, foto da fachada obrigatória, `url`/`image`/`sameAs` no schema, ano de fundação da marca. Trechos decisivos: "Adicione `placeId` como campo da Loja"; "tornaria obrigatória, no modo lançamento, pelo menos uma foto da fachada de cada loja".
- Eleventy 3.1.7 (versão estável no npm em 2026-10-17).
- [GitHub Pages limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits) - não pode ser usado como hospedagem gratuita para negócio.
- [Cloudflare Pages redirects](https://developers.cloudflare.com/pages/configuration/redirects/) - 301 por arquivo `_redirects`.
- [Google Maps URLs](https://developers.google.com/maps/documentation/urls/get-started) - `query` obrigatório, `query_place_id` opcional e prioritário.
- [RDAP Registro.br](https://rdap.registro.br/) - `belezamix.com.br` registrado desde 2019-01-16; `belezamixjundiai.com.br` livre em 2026-10-17.
- `conteudo/logo-belezamix.png` - logo fornecido pelo Otávio; cores e contraste medidos a partir dele.
