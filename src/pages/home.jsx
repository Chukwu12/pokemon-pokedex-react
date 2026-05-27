import React from "react";
import Search from "../components/search";
import {
  fetchPokemon,
  fetchPokemonNames,
  fetchReleasedPokemonNames,
  fetchTypeEffectiveness,
} from "../services/getPokemon";
import PokemonData from "../components/PokemonData";
import ComparePokemon from "../components/ComparePokemon";
import { Spinner, Alert } from "react-bootstrap";

export default function HomePage() {
  const [mode, setMode] = React.useState("single");
  const [pokemon, setPokemon] = React.useState();
  const [comparePokemon, setComparePokemon] = React.useState({ left: undefined, right: undefined });
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState("");
  const [suggestions, setSuggestions] = React.useState([]);
  const [releasedPokemonNames, setReleasedPokemonNames] = React.useState(() => new Set());
  const [typeEffectiveness, setTypeEffectiveness] = React.useState(null);
  const [theme, setTheme] = React.useState(() => {
    const savedTheme = localStorage.getItem("pokedex-theme");
    if (savedTheme === "dark" || savedTheme === "light") {
      return savedTheme;
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  React.useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("pokedex-theme", theme);
  }, [theme]);

  React.useEffect(() => {
    let mounted = true;

    const hydrateGoData = async () => {
      const [namesResult, releasedResult, typeResult] = await Promise.allSettled([
        fetchPokemonNames(),
        fetchReleasedPokemonNames(),
        fetchTypeEffectiveness(),
      ]);

      if (!mounted) {
        return;
      }

      if (namesResult.status === "fulfilled") {
        setSuggestions(namesResult.value);
      }

      if (releasedResult.status === "fulfilled") {
        setReleasedPokemonNames(releasedResult.value);
      }

      if (typeResult && typeResult.status === "fulfilled") {
        setTypeEffectiveness(typeResult.value);
      }
    };

    hydrateGoData();

    return () => {
      mounted = false;
    };
  }, []);

  const toggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === "dark" ? "light" : "dark"));
  };

  const getPokemon = async (query) => {
    if (!query) {
      setErrorMsg("You must enter a Pokemon");
      setError(true);
      return;
    }

    setError(false);
    setLoading(true);

    try {
      const response = await fetchPokemon(query);

      if (!response.ok) {
        throw new Error("Pokemon request failed");
      }

      const results = await response.json();
      setPokemon(results);
      setComparePokemon({ left: undefined, right: undefined });
      setLoading(false);
    } catch (err) {
      console.log(err);
      setLoading(false);
      setError(true);
      setPokemon(undefined);
      setErrorMsg("Pokemon not found.");
    }
  };

  const getPokemonPair = async (leftQuery, rightQuery) => {
    if (!leftQuery || !rightQuery) {
      setErrorMsg("You must enter two Pokemon to compare");
      setError(true);
      return;
    }

    setError(false);
    setLoading(true);

    try {
      const [leftResponse, rightResponse] = await Promise.all([
        fetchPokemon(leftQuery),
        fetchPokemon(rightQuery),
      ]);

      if (!leftResponse.ok || !rightResponse.ok) {
        throw new Error("One or both Pokemon requests failed");
      }

      const [leftPokemon, rightPokemon] = await Promise.all([
        leftResponse.json(),
        rightResponse.json(),
      ]);

      setComparePokemon({ left: leftPokemon, right: rightPokemon });
      setPokemon(undefined);
      setLoading(false);
    } catch (err) {
      console.log(err);
      setLoading(false);
      setError(true);
      setComparePokemon({ left: undefined, right: undefined });
      setErrorMsg("Could not compare those Pokemon.");
    }
  };

  return (
    <main className="home-page">
      <section className="hero-panel">
        <div className="hero-top-row">
          <p className="eyebrow">Pokedex Explorer</p>
          <button
            aria-label="Toggle dark mode"
            className="theme-toggle"
            onClick={toggleTheme}
            type="button"
          >
            {theme === "dark" ? "Light" : "Dark"}
          </button>
        </div>
        <h1 className="hero-title">Discover Pokemon Stats Instantly</h1>
        <p className="hero-subtitle">
          Search by name and get a quick profile with abilities, types, and base
          stats.
        </p>
      </section>

      {error ? (
        <Alert className="app-alert" variant="danger">
          {errorMsg}
        </Alert>
      ) : null}

      <Search
        mode={mode}
        onModeChange={setMode}
        getPokemon={getPokemon}
        getPokemonPair={getPokemonPair}
        loading={loading}
        suggestions={suggestions}
      />

      {loading ? (
        <div className="spinner-shell" aria-live="polite" aria-busy="true">
          <Spinner className="spinner-ring" animation="border" />
          <p className="spinner-text">Scanning the Pokedex...</p>
        </div>
      ) : null}

      {!loading && pokemon ? (
        <PokemonData
          name={pokemon.name}
          primaryType={pokemon.types?.[0]?.type?.name}
          sprite={pokemon.sprites.front_default}
          abilities={pokemon.abilities}
          stats={pokemon.stats}
          types={pokemon.types}
          isReleasedInGo={releasedPokemonNames.has(pokemon.name?.toLowerCase())}
          showReleaseStatus={releasedPokemonNames.size > 0}
        />
      ) : null}

      {!loading && mode === "compare" && comparePokemon.left && comparePokemon.right ? (
        <ComparePokemon
          left={comparePokemon.left}
          right={comparePokemon.right}
          releasedPokemonNames={releasedPokemonNames}
          showReleaseStatus={releasedPokemonNames.size > 0}
          typeEffectiveness={typeEffectiveness}
        />
      ) : null}

      {!loading && !pokemon && !comparePokemon.left && !comparePokemon.right && !error ? (
        <section className="empty-state">
          <h2>Start With Your Favorite Pokemon</h2>
          <p>Try Pikachu, Charmander, Bulbasaur, or Squirtle.</p>
        </section>
      ) : null}
    </main>
  );
}