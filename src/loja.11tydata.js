// why: string em `eleventyComputed` no front matter é renderizada como template (autoescape) e o layout escapa de novo; função devolve o texto cru
export default {
  eleventyComputed: {
    titulo: (data) => `Cosméticos em ${data.loja.bairro}, Jundiaí | Belezamix`,
    h1: (data) => data.loja.nome,
    descricao: (data) => `${data.loja.nome}: ${data.loja.enderecoCompleto}. Chame no WhatsApp ou veja como chegar.`,
    jsonld: (data) => data.loja.jsonld,
  },
};
