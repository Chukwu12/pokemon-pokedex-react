// Fetch evolution chain by ID
export async function fetchEvolutionChain(chainId) {
  try {
    const response = await fetch(`${POKE_API_BASE_URL}/evolution-chain/${chainId}/`);
    if (!response.ok) {
      throw new Error('Failed to fetch evolution chain');
    }
    return response.json();
  } catch (error) {
    return null;
  }
}

// Fetch evolution trigger by ID or name
export async function fetchEvolutionTrigger(idOrName) {
  try {
    const response = await fetch(`${POKE_API_BASE_URL}/evolution-trigger/${idOrName}/`);
    if (!response.ok) {
      throw new Error('Failed to fetch evolution trigger');
    }
    return response.json();
  } catch (error) {
    return null;
  }
}

const POKE_API_BASE_URL = 'https://pokeapi.co/api/v2';
const RAPID_API_BASE_URL = 'https://pokemon-go1.p.rapidapi.com';
const POGO_API_BASE_URL = 'https://pogoapi.net';
const RAPID_API_HOST = process.env.REACT_APP_RAPIDAPI_HOST || 'pokemon-go1.p.rapidapi.com';

function getRapidApiHeaders() {
  if (!process.env.REACT_APP_RAPIDAPI_KEY) {
    return null;
  }

  return {
    'x-rapidapi-key': process.env.REACT_APP_RAPIDAPI_KEY,
    'x-rapidapi-host': RAPID_API_HOST,
  };
}

async function fetchRapidApiJson(path) {
  const headers = getRapidApiHeaders();
  const fallbackUrl = `${POGO_API_BASE_URL}${path}`;

  if (!headers) {
    try {
      const fallbackResponse = await fetch(fallbackUrl);

      if (!fallbackResponse.ok) {
        return null;
      }

      return fallbackResponse.json();
    } catch (error) {
      return null;
    }
  }

  try {
    const response = await fetch(`${RAPID_API_BASE_URL}${path}`, { headers });

    if (response.ok) {
      return response.json();
    }
  } catch (error) {
    // Ignore and try the public fallback endpoint below.
  }

  try {
    const fallbackResponse = await fetch(fallbackUrl);

    if (!fallbackResponse.ok) {
      return null;
    }

    return fallbackResponse.json();
  } catch (error) {
    return null;
  }
}

function extractPokemonName(entry) {
  if (typeof entry === 'string') {
    return entry;
  }

  if (Array.isArray(entry)) {
    const firstString = entry.find((value) => typeof value === 'string');
    return firstString || '';
  }

  if (entry && typeof entry === 'object') {
    if (typeof entry.name === 'string') {
      return entry.name;
    }

    if (typeof entry.pokemon_name === 'string') {
      return entry.pokemon_name;
    }
  }

  return '';
}

export async function fetchPokemon(pokemon) {
  return fetch(`${POKE_API_BASE_URL}/pokemon/${pokemon}`);
}

export async function fetchPokemonNames() {
  const data = await fetchRapidApiJson('/api/v1/pokemon_names.json');

  if (!data) {
    return [];
  }

  return Object.values(data)
    .map((entry) => extractPokemonName(entry))
    .filter(Boolean);
}

export async function fetchReleasedPokemonNames() {
  const data = await fetchRapidApiJson('/api/v1/released_pokemon.json');

  if (!data) {
    return new Set();
  }

  return new Set(
    Object.values(data)
      .map((entry) => extractPokemonName(entry))
      .filter(Boolean)
      .map((name) => name.trim().toLowerCase())
  );
}

export async function fetchTypeEffectiveness() {
  const data = await fetchRapidApiJson('/api/v1/type_effectiveness.json');

  if (!data) {
    return null;
  }

  return data;
}