import { existsSync } from "node:fs";
import path from "node:path";

export const OBRIGATORIOS_NEGOCIO = ["nome", "anoFundacao", "instagram"];
export const OBRIGATORIOS_LOJA = [
  "slug", "nome", "nomeCurto", "bairro", "logradouro", "numero", "cep", "cidade", "uf",
  "latitude", "longitude", "placeId", "horarios", "telefone", "whatsapp", "mensagemWhatsapp",
  "fotoFachada",
];

const TELEFONE = /^55\d{10,11}$/;
const HORA = /^\d{2}:\d{2}$/;
const DIAS = ["seg", "ter", "qua", "qui", "sex", "sab", "dom"];
const DIA_ROTULO = { seg: "Seg", ter: "Ter", qua: "Qua", qui: "Qui", sex: "Sex", sab: "Sáb", dom: "Dom" };
const DIA_SCHEMA = {
  seg: "Monday", ter: "Tuesday", qua: "Wednesday", qui: "Thursday",
  sex: "Friday", sab: "Saturday", dom: "Sunday",
};

const ausente = (v) => v === undefined || v === null || v === "" || (Array.isArray(v) && v.length === 0);
const rotuloLoja = (loja, i) => loja.nome || loja.slug || `loja ${i + 1}`;

// invariant: erros de formato recusam o build nos dois modos; pendências só recusam o lançamento
export function validar(conteudo, { raiz = process.cwd() } = {}) {
  const erros = [];
  const pendencias = [];
  const negocio = conteudo.negocio ?? {};

  for (const campo of OBRIGATORIOS_NEGOCIO) {
    if (ausente(negocio[campo])) pendencias.push({ alvo: "Negócio", campo });
  }

  (conteudo.lojas ?? []).forEach((loja, i) => {
    const alvo = rotuloLoja(loja, i);
    for (const campo of OBRIGATORIOS_LOJA) {
      if (ausente(loja[campo])) pendencias.push({ alvo, campo });
    }
    for (const campo of ["telefone", "whatsapp"]) {
      if (!ausente(loja[campo]) && !TELEFONE.test(String(loja[campo]))) {
        erros.push({ alvo, campo, detalhe: `"${loja[campo]}" não casa com ${TELEFONE}` });
      }
    }
    (loja.horarios ?? []).forEach((h, j) => {
      for (const campo of ["abre", "fecha"]) {
        if (!HORA.test(String(h[campo] ?? ""))) {
          erros.push({ alvo, campo: `horarios[${j}].${campo}`, detalhe: `"${h[campo] ?? ""}" não casa com ${HORA}` });
        }
      }
      const dias = h.dias ?? [];
      if (dias.length === 0 || dias.some((d) => !DIAS.includes(d))) {
        erros.push({ alvo, campo: `horarios[${j}].dias`, detalhe: `use códigos ${DIAS.join(" ")}` });
      }
    });
    const fotos = [
      ...(ausente(loja.fotoFachada) ? [] : [["fotoFachada", loja.fotoFachada]]),
      ...(loja.fotos ?? []).map((f, j) => [`fotos[${j}]`, f]),
    ];
    for (const [campo, foto] of fotos) {
      const arquivo = String(foto?.arquivo ?? "");
      if (!arquivo.endsWith(".webp")) {
        erros.push({ alvo, campo, detalhe: `"${arquivo}" não é .webp` });
      } else if (!existsSync(path.resolve(raiz, arquivo))) {
        erros.push({ alvo, campo, detalhe: `"${arquivo}" não existe` });
      }
    }
  });

  return { erros, pendencias };
}

export function formatarTelefone(digitos) {
  const s = String(digitos);
  const ddd = s.slice(2, 4);
  const numero = s.slice(4);
  const meio = numero.length - 4;
  const local = `${numero.slice(0, meio)}-${numero.slice(meio)}`;
  return { exibido: `(${ddd}) ${local}`, schema: `+55 ${ddd} ${local}` };
}

function formatarHora(hhmm) {
  const [h, m] = hhmm.split(":");
  return `${Number(h)}h${m === "00" ? "" : m}`;
}

function formatarDias(dias) {
  const idx = dias.map((d) => DIAS.indexOf(d));
  const consecutivos = idx.every((v, i) => i === 0 || v === idx[i - 1] + 1);
  if (dias.length > 1 && consecutivos) return `${DIA_ROTULO[dias[0]]}–${DIA_ROTULO[dias.at(-1)]}`;
  return dias.map((d) => DIA_ROTULO[d]).join(", ");
}

function anoEmSaoPaulo(agora) {
  return Number(new Intl.DateTimeFormat("en", { timeZone: "America/Sao_Paulo", year: "numeric" }).format(agora));
}

const urlFoto = (arquivo) => `/fotos/${path.basename(arquivo)}`;

// invariant: campo ausente vira [PENDENTE: ...]; em lançamento a validação já recusou qualquer ausência
export function montarSite(conteudo, { modo, urlBase, agora = new Date() }) {
  const negocio = conteudo.negocio ?? {};
  const pendente = (texto) => `[PENDENTE: ${texto}]`;
  const ouPendente = (valor, texto) => (ausente(valor) ? pendente(texto) : valor);

  const anos = ausente(negocio.anoFundacao)
    ? pendente("anoFundacao")
    : String(anoEmSaoPaulo(agora) - negocio.anoFundacao);

  const lojas = (conteudo.lojas ?? []).map((loja, i) => {
    const nomeLoja = rotuloLoja(loja, i);
    const p = (campo) => pendente(`${campo} da loja ${nomeLoja}`);
    const v = (campo) => (ausente(loja[campo]) ? p(campo) : loja[campo]);
    const telefone = ausente(loja.telefone) ? null : formatarTelefone(loja.telefone);
    const url = `/lojas/${loja.slug}/`;
    const horarios = (loja.horarios ?? []).map((h) => ({
      texto: `${formatarDias(h.dias)} ${formatarHora(h.abre)}–${formatarHora(h.fecha)}`,
      schema: {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: h.dias.map((d) => DIA_SCHEMA[d]),
        opens: h.abre,
        closes: h.fecha,
      },
    }));
    const enderecoCurto = `${v("logradouro")}, ${v("numero")}`;
    const fachada = ausente(loja.fotoFachada)
      ? null
      : { src: urlFoto(loja.fotoFachada.arquivo), alt: loja.fotoFachada.alt };
    const instagramUrl = ausente(negocio.instagram) ? null : `https://www.instagram.com/${negocio.instagram}`;

    const jsonld = {
      "@context": "https://schema.org",
      "@type": "Store",
      name: v("nome"),
      url: urlBase + url,
      telephone: telefone ? telefone.schema : p("telefone"),
      address: {
        "@type": "PostalAddress",
        streetAddress: enderecoCurto,
        addressLocality: v("cidade"),
        addressRegion: v("uf"),
        postalCode: v("cep"),
        addressCountry: "BR",
      },
      geo: { "@type": "GeoCoordinates", latitude: v("latitude"), longitude: v("longitude") },
      openingHoursSpecification: horarios.map((h) => h.schema),
      ...(fachada ? { image: urlBase + fachada.src } : {}),
      ...(instagramUrl ? { sameAs: [instagramUrl] } : {}),
    };

    return {
      slug: loja.slug,
      url,
      nome: v("nome"),
      nomeCurto: v("nomeCurto"),
      bairro: v("bairro"),
      enderecoCurto,
      enderecoCompleto: `${enderecoCurto} – ${v("bairro")}, ${v("cidade")}/${v("uf")}, ${v("cep")}`,
      horarios: horarios.length ? horarios.map((h) => h.texto) : [p("horarios")],
      telefoneExibido: telefone ? telefone.exibido : p("telefone"),
      whatsappHref: ausente(loja.whatsapp) || ausente(loja.mensagemWhatsapp)
        ? null
        : `https://wa.me/${loja.whatsapp}?text=${encodeURIComponent(loja.mensagemWhatsapp)}`,
      whatsappPendente: ausente(loja.whatsapp) ? p("whatsapp") : ausente(loja.mensagemWhatsapp) ? p("mensagemWhatsapp") : null,
      mapaHref: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(v("nome"))}&query_place_id=${encodeURIComponent(v("placeId"))}`,
      fachada,
      fachadaPendente: fachada ? null : p("fotoFachada"),
      fotos: (loja.fotos ?? []).map((f) => ({ src: urlFoto(f.arquivo), alt: f.alt })),
      // hazard: "</script>" dentro de um valor fecharia a tag; "<" escapado mantém o JSON válido
      jsonld: JSON.stringify(jsonld).replace(/</g, "\\u003c"),
    };
  });

  const categorias = (negocio.categorias ?? []).filter((c) => !ausente(c.marcas));
  const categoriasProfissionais = categorias.filter((c) => c.profissional === true);
  const paginas = {
    marcas: categorias.length > 0,
    profissionais: categoriasProfissionais.length > 0 || !ausente(negocio.listaVip),
    comoComprar: !ausente(negocio.formasPagamento) || !ausente(negocio.retirada) || !ausente(negocio.entrega),
  };

  const menu = [
    { titulo: "Início", url: "/" },
    ...lojas.map((l) => ({ titulo: l.nomeCurto, url: l.url })),
    ...(paginas.marcas ? [{ titulo: "Marcas", url: "/marcas/" }] : []),
    ...(paginas.profissionais ? [{ titulo: "Para profissionais", url: "/profissionais/" }] : []),
    ...(paginas.comoComprar ? [{ titulo: "Como comprar", url: "/como-comprar/" }] : []),
  ];

  return {
    modo,
    urlBase,
    negocio: {
      nome: ouPendente(negocio.nome, "nome"),
      instagram: ausente(negocio.instagram) ? null : negocio.instagram,
      instagramPendente: ausente(negocio.instagram) ? pendente("instagram") : null,
      selo: `Há ${anos} anos em Jundiaí`,
      listaVip: ausente(negocio.listaVip) ? null : negocio.listaVip,
      formasPagamento: negocio.formasPagamento ?? [],
      retirada: ausente(negocio.retirada) ? null : negocio.retirada,
      entrega: ausente(negocio.entrega) ? null : negocio.entrega,
    },
    descricao: `Lojas de cosméticos ${negocio.nome ?? ""} em Jundiaí: ${lojas.map((l) => l.nomeCurto).join(" e ")}. Chame no WhatsApp ou veja como chegar.`,
    lojas,
    categorias,
    categoriasProfissionais,
    paginas,
    menu,
  };
}
