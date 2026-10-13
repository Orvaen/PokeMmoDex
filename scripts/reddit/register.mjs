// Permet à Node de lire les modules du site (imports .json sans attribut, composant Access.jsx).
import { register } from "node:module";
register("./loader.mjs", import.meta.url);
