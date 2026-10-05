import { useEffect, useMemo, useState } from "react";
import {
  Link,
  NavLink,
  Route,
  Routes,
  useLocation,
  useParams,
  useSearchParams,
} from "react-router-dom";
import {
  ArrowDownUp,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Compass,
  Grid2X2,
  List,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";
import {
  displayName,
  loadPokemon,
  number,
  totalStats,
  type Pokemon,
} from "./api";
import PokemonImage from "./components/PokemonImage";

function Types({ pokemon }: { pokemon: Pokemon }) {
  return (
    <span className="types">
      {pokemon.types.map(({ type }) => (
        <span key={type.name} className={`type type-${type.name}`}>
          {type.name}
        </span>
      ))}
    </span>
  );
}

function App() {
  const [pokemon, setPokemon] = useState<Pokemon[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);
  const { pathname } = useLocation();

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    loadPokemon()
      .then((data) => {
        if (active) setPokemon(data);
      })
      .catch((err: Error) => {
        if (active) setError(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [attempt]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link to="/" className="brand" aria-label="Kanto home">
          <span className="brand-mark">
            <Compass size={26} />
          </span>
          <span>
            KANTO<span className="brand-sub">A POKÉMON FIELD GUIDE</span>
          </span>
        </Link>
        <div className="sidebar-label">YOUR EXPEDITION</div>
        <nav aria-label="Main navigation">
          <NavLink to="/" end>
            <BookOpen size={19} /> Field guide <span>151</span>
          </NavLink>
          <NavLink to="/gallery">
            <Grid2X2 size={19} /> Gallery <span>↗</span>
          </NavLink>
        </nav>
        <div className="region-note">
          <span className="region-icon">
            <Compass size={33} strokeWidth={1.2} />
          </span>
          <p>A world of discovery.</p>
          <span>
            From Bulbasaur to Mew.
            <br />
            Meet the original 151.
          </span>
          <div className="region-divider" />
          <small>KANTO REGION · GENERATION I</small>
        </div>
        <div className="sidebar-bottom">
          <span className="status-dot" /> Powered by{" "}
          <a href="https://pokeapi.co/" target="_blank" rel="noreferrer">
            PokéAPI
          </a>
          <small>An unofficial Pokémon field guide.</small>
        </div>
      </aside>
      <main id="main-content">
        <header className="topbar">
          <span>
            THE FIELD NOTES <span className="topbar-slash">/</span> KANTO REGION
          </span>
          <span className="edition">
            VOL. 001 <span>✳</span>
          </span>
        </header>
        {loading ? (
          <div className="state-panel" role="status">
            <Compass className="loading-icon" size={40} />
            <h1>Opening the field guide…</h1>
            <p>
              Gathering the original 151 Pokémon. The first visit can take a
              moment.
            </p>
          </div>
        ) : error ? (
          <div className="state-panel" role="alert">
            <h1>A little detour.</h1>
            <p>{error}</p>
            <button
              className="primary-button"
              onClick={() => setAttempt((a) => a + 1)}
            >
              Try again
            </button>
          </div>
        ) : (
          <Routes>
            <Route
              path="/"
              element={<Collection pokemon={pokemon} gallery={false} />}
            />
            <Route
              path="/gallery"
              element={<Collection pokemon={pokemon} gallery />}
            />
            <Route path="/pokemon/:id" element={<Detail pokemon={pokemon} />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        )}
        <footer>
          <span>Made for the curious.</span>
          <span>Pokémon © Nintendo / Creatures / GAME FREAK</span>
        </footer>
      </main>
    </div>
  );
}

function Collection({
  pokemon,
  gallery,
}: {
  pokemon: Pokemon[];
  gallery: boolean;
}) {
  const [params, setParams] = useSearchParams();
  const query = params.get("q") || "";
  const sort = params.get("sort") || "id";
  const descending = params.get("order") === "desc";
  const selectedTypes = params.getAll("type");
  const allTypes = useMemo(
    () =>
      [
        ...new Set(pokemon.flatMap((p) => p.types.map((t) => t.type.name))),
      ].sort(),
    [pokemon],
  );
  const location = useLocation();
  function update(key: string, value: string) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  }
  function toggleType(type: string) {
    const next = new URLSearchParams(params);
    next.delete("type");
    const values = selectedTypes.includes(type)
      ? selectedTypes.filter((t) => t !== type)
      : [...selectedTypes, type];
    values.forEach((t) => next.append("type", t));
    setParams(next, { replace: true });
  }
  const normalized = query.trim().toLowerCase().replace(/^#/, "");
  const results = pokemon
    .filter(
      (p) =>
        (p.name.includes(normalized) ||
          displayName(p.name).toLowerCase().includes(normalized) ||
          String(p.id) === normalized ||
          String(p.id).padStart(3, "0") === normalized) &&
        (!selectedTypes.length ||
          p.types.some((t) => selectedTypes.includes(t.type.name))),
    )
    .sort((a, b) => {
      const difference =
        sort === "name"
          ? a.name.localeCompare(b.name)
          : sort === "weight"
            ? a.weight - b.weight
            : sort === "height"
              ? a.height - b.height
              : sort === "stats"
                ? totalStats(a) - totalStats(b)
                : a.id - b.id;
      return (difference || a.id - b.id) * (descending ? -1 : 1);
    });
  const state = {
    ids: results.map((p) => p.id),
    returnTo: location.pathname + location.search,
  };
  const featured = pokemon.find((p) => p.id === 1)!;

  return (
    <div className="page-content">
      <section className="intro">
        <div>
          <div className="eyebrow">
            <span /> EXPLORE. OBSERVE. DISCOVER.
          </div>
          <h1>
            {gallery ? "A closer look." : "Small creatures."}
            <br />
            {gallery ? <em>A bigger world.</em> : <em>Endless discoveries.</em>}
          </h1>
          <p>
            Your pocket companion to the Kanto region.
            <br className="desktop-break" /> Get to know all 151 Pokémon, one
            discovery at a time.
          </p>
        </div>
        <div className="intro-stamp">
          <Compass size={54} strokeWidth={1} />
          <span>
            EST. 1996
            <br />
            KANTO REGION
          </span>
        </div>
      </section>
      <section className="feature-banner" aria-label="Featured Pokémon">
        <div>
          <span className="eyebrow">THE JOURNEY STARTS HERE</span>
          <h2>A very good place to begin.</h2>
          <p>Meet Bulbasaur. A little seed with a lot of potential.</p>
          <Link
            to="/pokemon/1"
            state={{
              ids: pokemon.map((p) => p.id),
              returnTo: location.pathname + location.search,
            }}
          >
            Meet your first Pokémon <ArrowRight size={17} />
          </Link>
        </div>
        <span className="feature-number">001</span>
        <div className="feature-art">
          <PokemonImage pokemon={featured} eager />
        </div>
        <span className="feature-caption">BULBASAUR · SEED POKÉMON</span>
      </section>
      <section className="collection" aria-label="Pokémon collection">
        <div className="collection-heading">
          <div>
            <h2>{gallery ? "The gallery" : "The field guide"}</h2>
            <span>Familiar faces. New favorites.</span>
          </div>
          <div className="view-switch" aria-label="View mode">
            <Link
              className={!gallery ? "selected" : ""}
              to={`/${location.search}`}
              aria-current={!gallery ? "page" : undefined}
            >
              <List size={16} /> List
            </Link>
            <Link
              className={gallery ? "selected" : ""}
              to={`/gallery${location.search}`}
              aria-current={gallery ? "page" : undefined}
            >
              <Grid2X2 size={16} /> Gallery
            </Link>
          </div>
        </div>
        <div className="toolbar">
          <label className="search-field">
            <Search size={19} />
            <input
              aria-label="Search Pokémon"
              placeholder="Search by name or Pokédex number…"
              value={query}
              onChange={(e) => update("q", e.target.value)}
            />
            {query && (
              <button onClick={() => update("q", "")} aria-label="Clear search">
                <X size={17} />
              </button>
            )}
          </label>
          <label className="sort-field">
            <SlidersHorizontal size={16} />
            <span className="sr-only">Sort by</span>
            <select
              aria-label="Sort by"
              value={sort}
              onChange={(e) => update("sort", e.target.value)}
            >
              <option value="id">Pokédex number</option>
              <option value="name">Name</option>
              <option value="weight">Weight</option>
              <option value="height">Height</option>
              <option value="stats">Base stat total</option>
            </select>
          </label>
          <button
            className="order-button"
            aria-label={descending ? "Sort ascending" : "Sort descending"}
            onClick={() => update("order", descending ? "asc" : "desc")}
          >
            <ArrowDownUp size={16} />
            <span>{descending ? "Descending" : "Ascending"}</span>
          </button>
        </div>
        <div className="filter-area">
          <span className="filter-label">TYPE</span>
          <button
            className={`filter-chip ${selectedTypes.length === 0 ? "active" : ""}`}
            onClick={() => {
              const next = new URLSearchParams(params);
              next.delete("type");
              setParams(next, { replace: true });
            }}
            aria-pressed={!selectedTypes.length}
          >
            All types
          </button>
          {allTypes.map((type) => (
            <button
              key={type}
              className={`filter-chip ${selectedTypes.includes(type) ? "active" : ""}`}
              aria-pressed={selectedTypes.includes(type)}
              onClick={() => toggleType(type)}
            >
              {displayName(type)}
            </button>
          ))}
        </div>
        <div className="results-summary" role="status">
          <span>
            Showing <strong>{results.length}</strong> of 151 Pokémon
          </span>
          <span>
            {selectedTypes.length
              ? "Matches any selected type"
              : "GENERATION I"}{" "}
            <span className="tiny-star">✳</span>
          </span>
        </div>
        {!results.length ? (
          <div className="empty-state">
            <Search size={30} />
            <h3>No Pokémon found</h3>
            <p>Try a different name, number, or type.</p>
            <button className="primary-button" onClick={() => setParams({})}>
              Reset filters
            </button>
          </div>
        ) : gallery ? (
          <div className="pokemon-grid">
            {results.map((p) => (
              <Link
                to={`/pokemon/${p.id}`}
                state={state}
                key={p.id}
                className={`pokemon-card card-${p.types[0].type.name}`}
              >
                <div className="card-top">
                  <span>{number(p.id)}</span>
                  <ArrowRight size={17} />
                </div>
                <div className="card-art">
                  <PokemonImage pokemon={p} />
                </div>
                <h3>{displayName(p.name)}</h3>
                <Types pokemon={p} />
              </Link>
            ))}
          </div>
        ) : (
          <div className="pokemon-list">
            <div className="list-heading">
              <span>POKÉMON</span>
              <span>TYPE</span>
              <span>HEIGHT</span>
              <span>WEIGHT</span>
              <span>BASE STATS</span>
              <span />
            </div>
            {results.map((p) => (
              <Link
                to={`/pokemon/${p.id}`}
                state={state}
                key={p.id}
                className="pokemon-row"
              >
                <div className="pokemon-identity">
                  <span className="dex-number">{number(p.id)}</span>
                  <div className={`list-art card-${p.types[0].type.name}`}>
                    <PokemonImage pokemon={p} />
                  </div>
                  <h3>{displayName(p.name)}</h3>
                </div>
                <Types pokemon={p} />
                <span className="measurement">
                  {(p.height / 10).toFixed(1)} <small>m</small>
                </span>
                <span className="measurement">
                  {(p.weight / 10).toFixed(1)} <small>kg</small>
                </span>
                <span className="stat-total">
                  {totalStats(p)} <Sparkles size={13} />
                </span>
                <ArrowRight className="row-arrow" size={18} />
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Detail({ pokemon }: { pokemon: Pokemon[] }) {
  const { id } = useParams();
  const location = useLocation();
  const p = pokemon.find((item) => String(item.id) === id);
  const routeState = location.state as {
    ids?: number[];
    returnTo?: string;
  } | null;
  const ids =
    routeState?.ids?.filter((value) =>
      pokemon.some((item) => item.id === value),
    ) || pokemon.map((item) => item.id);
  const sequence =
    p && ids.includes(p.id) ? ids : pokemon.map((item) => item.id);
  const index = p ? sequence.indexOf(p.id) : -1;
  const back =
    routeState?.returnTo?.startsWith("/") &&
    !routeState.returnTo.startsWith("//")
      ? routeState.returnTo
      : "/";
  if (!p) return <NotFound />;
  const previous = pokemon.find(
    (item) =>
      item.id === sequence[(index - 1 + sequence.length) % sequence.length],
  )!;
  const next = pokemon.find(
    (item) => item.id === sequence[(index + 1) % sequence.length],
  )!;
  const state = { ids: sequence, returnTo: back };
  return (
    <div className="page-content detail-page">
      <Link className="back-link" to={back}>
        <ArrowLeft size={17} /> Back to discoveries
      </Link>
      <div className="detail-title">
        <div>
          <span className="eyebrow">KANTO FIELD NOTES · {number(p.id)}</span>
          <h1>{displayName(p.name)}</h1>
          <Types pokemon={p} />
        </div>
        <span className="detail-number">{number(p.id)}</span>
      </div>
      <div className="detail-grid">
        <div className={`detail-art card-${p.types[0].type.name}`}>
          <span className="art-label">SPECIMEN {number(p.id)}</span>
          <PokemonImage key={p.id} pokemon={p} eager />
          <span className="art-caption">KANTO REGION / GENERATION I</span>
        </div>
        <div className="detail-facts">
          <h2>Meet {displayName(p.name)}.</h2>
          <p>
            A {p.types.map((t) => t.type.name).join(" / ")}-type Pokémon from
            the original Kanto collection. Explore its measurements, abilities,
            and base stats below.
          </p>
          <dl className="measurements">
            <div>
              <dt>HEIGHT</dt>
              <dd>
                {(p.height / 10).toFixed(1)} <span>m</span>
              </dd>
            </div>
            <div>
              <dt>WEIGHT</dt>
              <dd>
                {(p.weight / 10).toFixed(1)} <span>kg</span>
              </dd>
            </div>
          </dl>
          <h3 className="eyebrow">ABILITIES</h3>
          <div className="abilities">
            {p.abilities.map((a) => (
              <span key={a.ability.name}>
                {displayName(a.ability.name)}
                {a.is_hidden && <small>Hidden</small>}
              </span>
            ))}
          </div>
          <div className="stats-title">
            <h3>Base stats</h3>
            <span>
              Total <strong>{totalStats(p)}</strong>
            </span>
          </div>
          <div className="stats">
            {p.stats.map((s) => (
              <div className="stat" key={s.stat.name}>
                <label htmlFor={`stat-${s.stat.name}`}>
                  {displayName(s.stat.name).replace("Special", "Sp.")}
                </label>
                <span>{s.base_stat}</span>
                <meter
                  id={`stat-${s.stat.name}`}
                  min={0}
                  max={255}
                  value={s.base_stat}
                >
                  {s.base_stat} / 255
                </meter>
              </div>
            ))}
          </div>
        </div>
      </div>
      <nav className="detail-navigation" aria-label="Pokémon navigation">
        <Link
          to={`/pokemon/${previous.id}`}
          state={state}
          aria-label={`Previous Pokémon: ${displayName(previous.name)}`}
        >
          <ArrowLeft size={21} />
          <span>
            <small>PREVIOUS</small>
            {number(previous.id)} · {displayName(previous.name)}
          </span>
        </Link>
        <span className="sequence-position">
          {index + 1} / {sequence.length}
        </span>
        <Link
          to={`/pokemon/${next.id}`}
          state={state}
          aria-label={`Next Pokémon: ${displayName(next.name)}`}
        >
          <span>
            <small>NEXT</small>
            {number(next.id)} · {displayName(next.name)}
          </span>
          <ArrowRight size={21} />
        </Link>
      </nav>
    </div>
  );
}

function NotFound() {
  return (
    <div className="state-panel">
      <h1>Off the map.</h1>
      <p>This page isn’t in the Kanto field guide.</p>
      <Link className="primary-button" to="/">
        Back to the field guide
      </Link>
    </div>
  );
}

export default App;
