import { parseArgs } from "node:util";
import { build } from "../lib/build.js";

const { values } = parseArgs({
  options: {
    lancamento: { type: "boolean", default: false },
    conteudo: { type: "string" },
  },
});

const modo = values.lancamento ? "lancamento" : "previa";
const { codigo, linhas } = await build({
  modo,
  ...(values.conteudo ? { conteudo: values.conteudo } : {}),
});

if (codigo !== 0) {
  console.error(`Build (${modo}) recusado:`);
  for (const l of linhas) console.error(l);
} else {
  console.log(`Build (${modo}) gerado.`);
}
process.exitCode = codigo;
