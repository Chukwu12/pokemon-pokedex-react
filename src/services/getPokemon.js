
const baseUrl = 'http://pokeapi.co/api/v2';
const query = {
  pokemon: 'pokemon'
  // type: "type",
  // ability: "ability",
  // stat: 'stat',
}

export async function fetchPokemon(pokemon) {
  console.log(`${baseUrl}/${query.pokemon}/${pokemon}`);
  return fetch(`${baseUrl}/${query.pokemon}/${pokemon}`)
}