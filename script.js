document.addEventListener("DOMContentLoaded", async function () {
    // Fetch character data
    const response = await fetch("characters.json");
    const characters = await response.json();

    // Sort characters by last name
    characters.sort((a, b) => a.last_name.localeCompare(b.last_name));

    // Get the current page filename
    const page = window.location.pathname.split("/").pop();

    if (page === "index.html" || page === "") {
        // If on index.html, populate the character list
        const list = document.getElementById("character-list");
        characters.forEach((character, index) => {
            const li = document.createElement("li");
            li.className = "p-3 bg-gray-200 rounded hover:bg-gray-300 transition";
            li.innerHTML = `<a href="character.html?index=${index}" class="block text-lg text-gray-800">${character.first_name} ${character.last_name}</a>`;
            list.appendChild(li);
        });
        
    } else if (page === "character.html") {
        // If on character.html, get the character ID from the URL
        const urlParams = new URLSearchParams(window.location.search);
        const characterId = urlParams.get("index");
        const character = characters.find(c => c.id === characterId);

        // If character exists, insert their data into the page
        function ifKeyExists(id,key) {
            if (key) {
                return document.getElementById(`character-${id}`).textContent = key;
            }
        }
        if (character) {
            ifKeyExists('first',character.first_name)
            ifKeyExists('middle',character.middle_name)
            ifKeyExists('last',character.last_name)
            ifKeyExists('pronunciation',character.pronunciation)
            ifKeyExists('country',character.country)
            ifKeyExists('region',character.region)
            ifKeyExists('city',character.city)
            ifKeyExists('sex',character.sex)
            ifKeyExists('species',character.species[0])
            ifKeyExists('race',character.species[1])
        } else {
            document.body.innerHTML = `<div class="text-center text-red-500 text-xl mt-10">Character not found.</div>`;
        }
    }
});
