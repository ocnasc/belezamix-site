# Site Belezamix

## O que é

Site institucional da **Belezamix**, rede de duas lojas de cosméticos em Jundiaí/SP, **há 20 anos na cidade**. Não é e-commerce: é uma **vitrine local** que leva o visitante até a loja física ou até o WhatsApp.

Não vamos vender online porque os marketplaces (Mercado Livre, Amazon, Shopee, Beleza na Web) praticam preços próximos aos de fornecedor. A vantagem da Belezamix está no que eles não oferecem: loja perto, atendimento, retirada no mesmo dia e relação com profissionais da beleza.

## Objetivo principal

Fazer quem está em Jundiaí sair do site **indo até a loja** ou **mandando mensagem no WhatsApp**. Qualquer elemento que não leve a uma dessas duas ações é secundário.

- **Ação principal:** "Chamar no WhatsApp" (um botão por loja)
- **Ação secundária:** "Como chegar" (abre o Google Maps)

## O que o site deve transmitir

> "A loja de beleza de confiança do bairro, que tem o que você precisa e fica perto."

1. **Tradição e confiança.** "Há 20 anos em Jundiaí" aparece logo no topo, não apenas na página "Sobre".
2. **Variedade com orientação.** Do básico ao profissional (unhas, cabelo, maquiagem, linhas profissionais), com atendimento que ajuda a escolher.
3. **Proximidade.** Duas lojas, retirada no mesmo dia e atendimento pelo WhatsApp. É conveniência de bairro, não frete de 5 dias.

**Tom:** acolhedor, direto e local. Não é perfumaria de luxo nem atacadão. Fotos reais da loja e da equipe têm prioridade sobre imagens de banco.

**Opções de frase principal:**
- "Há 20 anos cuidando da beleza de Jundiaí."
- "Tudo para unhas, cabelo e maquiagem, perto de você, há 20 anos."

## Público (em ordem de prioridade)

1. **Moradora do bairro** procurando onde comprar um produto perto de casa.
2. **Profissional da beleza** (manicure, cabeleireira) que precisa de reposição de linha profissional.
3. **Quem procura presente**, principalmente em datas fortes (Natal, Dia das Mães, Dia dos Namorados).

## Lojas

Dados tirados do Perfil do Google. Conferir com os donos antes de publicar.

| Loja | Endereço | Horário |
| --- | --- | --- |
| Belezamix (Anhangabaú) | Av. Jundiaí, 376 – Anhangabaú, Jundiaí/SP, 13208-051 | Seg–Sex 8h–17h · Sáb 8h–12h |
| Belezamix Eloy Chaves | Av. Benedicto Castilho de Andrade, 558 – Parque Eloy Chaves, Jundiaí/SP, 13212-070 | Seg–Sex 8h–19h · Sáb 9h–12h |

## Estrutura de páginas

| Página | Conteúdo | Para quê |
| --- | --- | --- |
| Início | Proposta, "20 anos em Jundiaí", as duas lojas, botões de WhatsApp | Primeira impressão e conversão |
| Loja Anhangabaú | Endereço, mapa, horário, fotos, WhatsApp da loja | SEO local |
| Loja Eloy Chaves | Endereço, mapa, horário, fotos, WhatsApp da loja | SEO local |
| Marcas e categorias | Unhas, cabelo, maquiagem, linha profissional, com as marcas de cada uma | Busca por marca + Jundiaí |
| Para profissionais | Linhas profissionais, reposição, lista VIP no WhatsApp | Cliente recorrente |
| Como comprar | Retirada, entrega no bairro, formas de pagamento | Tirar dúvidas antes do contato |

## O site NÃO deve ter

- Preços ou carrinho de compras
- Depoimentos inventados
- Marcas que a loja não vende
- Afirmações sem comprovação ("a melhor de Jundiaí", "milhares de clientes")
- Imagens genéricas de banco no lugar de fotos reais

## Regra de conteúdo (obrigatória para os agentes)

**Todo dado factual vem do arquivo de conteúdo fornecido pelo responsável:** lojas, endereços, horários, telefones, marcas, fotos, ano de fundação, serviços oferecidos.

- O que não estiver no arquivo vira `[PENDENTE: descrição do que falta]` no lugar do conteúdo.
- **Nunca** inventar depoimentos, avaliações, números, marcas, nomes de pessoas ou fotos.
- Em caso de dúvida, marcar como pendente em vez de preencher.

## Requisitos técnicos

- Site estático HTML
- Conteúdo separado em JSON (lojas, horários, marcas), para virar template reutilizável
- Mobile-first: a maioria dos acessos vem do celular
- Imagens reais em WebP, comprimidas
- Schema `LocalBusiness` (Store) separado para cada loja: nome, endereço, telefone, horário, coordenadas
- Nome, endereço e telefone idênticos no site, no Perfil do Google e no Instagram
- Títulos no padrão "[categoria] em [bairro], Jundiaí"
- Google Search Console e sitemap configurados no lançamento

## Como medir o sucesso

- Cliques em "Chamar no WhatsApp" e "Como chegar" por semana, por loja
- Links com `?utm_source=site` ou mensagens pré-preenchidas diferentes por loja (ex.: "Olá! Vim pelo site, loja Eloy Chaves"), para identificar quem chegou pelo site