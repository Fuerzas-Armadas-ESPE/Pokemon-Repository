document.getElementById('search-button').addEventListener('click', async() => {
    const search = document.getElementById('search').value.trim().toLowerCase();
    const endPoint = document.getElementById('search-type').value;
    performSearch(search, endPoint, 0);  // Comienza con la primera página (offset 0)
});

document.getElementById('clear-button').addEventListener('click', () => {
    const pokemonContainer = document.getElementById('pokemon');
    pokemonContainer.innerHTML = '';
    document.getElementById('search').value = '';
    document.getElementById('prev-page').disabled = true;
    document.getElementById('next-page').disabled = true;
});

async function performSearch(search, endPoint, offset) {
    const limit = 5;  // Número de Pokémon por página
    const pokemonContainer = document.getElementById('pokemon');
    const spinner = document.createElement('div');
    spinner.classList.add('spinner');
    pokemonContainer.innerHTML = '';
    pokemonContainer.appendChild(spinner);

    try {
       // console.log(`https://pokeapi.co/api/v2/${endPoint}/${search ? search + '/' : ''}?limit=${limit}&offset=${offset}`);
        const response = await fetch(`https://pokeapi.co/api/v2/${endPoint}/${search ? search + '/' : ''}${search ? '' : `?limit=${limit}&offset=${offset}`}`);
        //console.log(response)
        if (!response.ok) throw new Error('Pokemon no encontrado');

        const data = await response.json();
        spinner.remove();
        
        if (search){
            if (data.pokemon && data.pokemon.length > 0) {
                const promises = data.pokemon.map(async(p) => await fetch(p.pokemon.url).then(res => res.json()));
                const result = await Promise.all(promises);
    
                pokemonContainer.innerHTML = result.map(poke => `
                    <div>
                        <h2>${poke.name}</h2>
                        <img src="${poke.sprites.front_default}" alt="${poke.name}">
                        <p>Altura: ${poke.height / 10} m</p>
                        <p>Peso: ${poke.weight / 10} kg</p>
                    </div>
                `).join('');
            } else {
                pokemonContainer.innerHTML = '<p class="error">No se encontraron Pokémon.</p>';
            }
        }else{
            if (data.results && data.results.length > 0) {
                const promises = data.results.map(async(p) => await fetch(p.url).then(res => res.json()));
                const result = await Promise.all(promises);
    
                pokemonContainer.innerHTML = result.map(poke => `
                    <div>
                        <h2>${poke.name}</h2>
                        <img src="${poke.sprites.front_default}" alt="${poke.name}">
                        <p>Altura: ${poke.height / 10} m</p>
                        <p>Peso: ${poke.weight / 10} kg</p>
                    </div>
                `).join('');
            } else {
                pokemonContainer.innerHTML = '<p class="error">No se encontraron Pokémon.</p>';
            }
        }

        // Actualiza los controles de paginación
        updatePaginationControls(search, endPoint, offset, limit, data.count);

    } catch (error) {
        spinner.remove();
        pokemonContainer.innerHTML = `<p class="error">${error.message}</p>`;
    }
}

function updatePaginationControls(search, endPoint, offset, limit, total) {
    const prevButton = document.getElementById('prev-page');
    const nextButton = document.getElementById('next-page');

    prevButton.disabled = offset <= 0;
    nextButton.disabled = offset + limit >= total;

    prevButton.onclick = () => performSearch(search, endPoint, offset - limit);
    nextButton.onclick = () => performSearch(search, endPoint, offset + limit);
}
