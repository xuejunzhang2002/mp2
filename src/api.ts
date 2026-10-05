import axios from "axios";

export interface Pokemon {
  id: number;
  name: string;
  height: number;
  weight: number;
  types: { type: { name: string } }[];
  abilities: { ability: { name: string }; is_hidden: boolean }[];
  stats: { base_stat: number; stat: { name: string } }[];
  sprites: {
    front_default: string | null;
    other: { "official-artwork": { front_default: string | null } };
  };
}

const api = axios.create({
  baseURL: "https://pokeapi.co/api/v2/",
  timeout: 15000,
});
const CACHE_KEY = "kanto-pokemon-v1";
const memory = new Map<number, Pokemon>();

function validPokemon(value: unknown): value is Pokemon {
  if (!value || typeof value !== "object") return false;
  const p = value as Pokemon;
  return (
    Number.isInteger(p.id) &&
    p.id >= 1 &&
    p.id <= 151 &&
    typeof p.name === "string" &&
    typeof p.height === "number" &&
    typeof p.weight === "number" &&
    Array.isArray(p.types) &&
    p.types.every((t) => typeof t?.type?.name === "string") &&
    Array.isArray(p.abilities) &&
    p.abilities.every((a) => typeof a?.ability?.name === "string") &&
    Array.isArray(p.stats) &&
    p.stats.every(
      (s) =>
        typeof s?.base_stat === "number" && typeof s?.stat?.name === "string",
    ) &&
    !!p.sprites?.other?.["official-artwork"]
  );
}

try {
  const cached: unknown = JSON.parse(localStorage.getItem(CACHE_KEY) || "[]");
  if (Array.isArray(cached))
    cached.filter(validPokemon).forEach((p) => memory.set(p.id, p));
} catch {
  /* A corrupt or unavailable browser cache must not prevent loading. */
}

function saveCache() {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify([...memory.values()]));
  } catch {
    /* Storage may be full or disabled. */
  }
}

let pending: Promise<Pokemon[]> | undefined;
export function loadPokemon(): Promise<Pokemon[]> {
  if (pending) return pending;
  pending = (async () => {
    // Bounded concurrency and persistent caching keep API traffic modest.
    const missing = Array.from({ length: 151 }, (_, i) => i + 1).filter(
      (id) => !memory.has(id),
    );
    let cursor = 0;
    let failed = false;
    await Promise.all(
      Array.from({ length: Math.min(6, missing.length) }, async () => {
        while (cursor < missing.length) {
          const id = missing[cursor++];
          try {
            const { data } = await api.get<Pokemon>(`pokemon/${id}`);
            if (!validPokemon(data))
              throw new Error("Invalid Pokémon response");
            // Keep only fields used in the UI; full responses contain hundreds of moves.
            const { name, height, weight, types, abilities, stats, sprites } =
              data;
            memory.set(id, {
              id,
              name,
              height,
              weight,
              types,
              abilities,
              stats,
              sprites: {
                front_default: sprites.front_default,
                other: {
                  "official-artwork": sprites.other["official-artwork"],
                },
              },
            });
          } catch {
            failed = true;
          }
        }
      }),
    );
    saveCache();
    if (failed)
      throw new Error(
        "We couldn’t load the complete field guide. Check your connection and try again. Your downloaded entries are saved.",
      );
    return [...memory.values()].sort((a, b) => a.id - b.id);
  })().finally(() => {
    pending = undefined;
  });
  return pending;
}

export const displayName = (name: string) =>
  name.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
export const number = (id: number) => `#${String(id).padStart(3, "0")}`;
export const totalStats = (p: Pokemon) =>
  p.stats.reduce((total, stat) => total + stat.base_stat, 0);
export const artwork = (p: Pokemon) =>
  p.sprites.other["official-artwork"].front_default || p.sprites.front_default;
