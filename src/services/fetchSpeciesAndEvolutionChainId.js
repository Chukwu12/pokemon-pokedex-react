// Utility to fetch Pokémon species and extract evolution chain ID
export async function fetchSpeciesAndEvolutionChainId(pokemonName) {
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemonName}/`);
  if (!response.ok) return { species: null, evolutionChainId: null };
  const species = await response.json();
  // evolution_chain.url is like: https://pokeapi.co/api/v2/evolution-chain/15/
  const evoUrl = species.evolution_chain?.url;
  let evolutionChainId = null;
  if (evoUrl) {
    const match = evoUrl.match(/evolution-chain\/(\d+)\/?$/);
    if (match) evolutionChainId = match[1];
  }
  return { species, evolutionChainId };
}
