import { useState } from "react";
import { artwork, displayName, type Pokemon } from "../api";

export default function PokemonImage({
  pokemon,
  eager = false,
}: {
  pokemon: Pokemon;
  eager?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const source = artwork(pokemon);
  return !failed && source ? (
    <img
      src={source}
      alt={displayName(pokemon.name)}
      loading={eager ? "eager" : "lazy"}
      onError={() => setFailed(true)}
    />
  ) : (
    <span
      className="image-fallback"
      role="img"
      aria-label={`${displayName(pokemon.name)} — artwork unavailable`}
    >
      ?
    </span>
  );
}
