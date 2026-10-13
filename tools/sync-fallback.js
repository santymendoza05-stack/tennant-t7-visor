/* Regenera el bloque FALLBACK de js/app.js a partir de data/machine.json
   y de los JSON de cada zona disponible.

   Uso (desde la carpeta del proyecto):  node tools/sync-fallback.js */
"use strict";
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const read = (rel) => JSON.parse(fs.readFileSync(path.join(root, rel), "utf8"));

const MACHINE = "data/machine.json";
const machine = read(MACHINE);
const files = { [MACHINE]: machine };
for (const z of machine.zones) {
  // Zonas con una figura ("data") o con varias ("figures": [{ label, data }])
  const urls = z.figures ? z.figures.map((f) => f.data) : [z.data];
  for (const url of urls) if (url) files[url] = read(url);
}

// Formato compacto: un objeto por línea dentro de las listas "zones" y "parts"
const lit = (v) => {
  if (Array.isArray(v)) return `[${v.map(lit).join(", ")}]`;
  if (v && typeof v === "object") {
    const props = Object.entries(v).map(([k, x]) => `${/^[A-Za-z_$][\w$]*$/.test(k) ? k : JSON.stringify(k)}: ${lit(x)}`);
    return props.length ? `{ ${props.join(", ")} }` : "{}";
  }
  return JSON.stringify(v);
};
function block(obj, indent) {
  const pad = " ".repeat(indent);
  const lines = Object.entries(obj).map(([k, v]) => {
    if (Array.isArray(v) && v.length && typeof v[0] === "object") {
      return `${pad}  ${k}: [\n${v.map((x) => `${pad}    ${lit(x)}`).join(",\n")}\n${pad}  ]`;
    }
    return `${pad}  ${k}: ${lit(v)}`;
  });
  return `{\n${lines.join(",\n")}\n${pad}}`;
}

const body = Object.entries(files)
  .map(([url, data]) => `    ${JSON.stringify(url)}: ${block(data, 4)}`)
  .join(",\n");
const fallback = `const FALLBACK = {\n${body}\n  };`;

const appPath = path.join(root, "js/app.js");
const src = fs.readFileSync(appPath, "utf8");
const re = /const FALLBACK = \{[\s\S]*?\n  \};/;
if (!re.test(src)) throw new Error("No se encontró el bloque FALLBACK en js/app.js");
fs.writeFileSync(appPath, src.replace(re, () => fallback));
console.log(`FALLBACK actualizado con ${Object.keys(files).length} archivos: ${Object.keys(files).join(", ")}`);
