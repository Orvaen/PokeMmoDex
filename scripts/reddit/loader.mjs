// Hooks Node : .json → export default, Access.jsx → version sans JSX (seulement centerInfo).
import { readFile } from "node:fs/promises";

const STUB = new URL("./access-stub.mjs", import.meta.url).href;

export async function resolve(specifier, context, next) {
  if (specifier.endsWith("/Access.jsx")) return { url: STUB, shortCircuit: true };
  return next(specifier, context);
}

export async function load(url, context, next) {
  if (url.endsWith(".json")) {
    const text = await readFile(new URL(url), "utf8");
    return { format: "module", source: `export default ${text};`, shortCircuit: true };
  }
  return next(url, context);
}
