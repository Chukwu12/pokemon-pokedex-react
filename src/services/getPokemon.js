const baseUrl = "https://pokeapi.co/api/v2/{endpoint}/";
const query = {
  pokemon: "pokemon",
};

export async function fetchPokemon(pokemon) {
  console.log(`${baseUrl}/${query.pokemon}/${pokemon}`);
  return fetch(`${baseUrl}/${query.pokemon}/${pokemon}`);
}
