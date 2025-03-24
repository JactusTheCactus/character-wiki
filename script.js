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
        characters.forEach(character => {
            const li = document.createElement("li");
            li.className = "p-3 bg-gray-200 rounded hover:bg-gray-300 transition";
            li.innerHTML = `<a href="template.html?id=${character.id}" class="block text-lg text-gray-800">${character.first_name} ${character.last_name}</a>`;
            list.appendChild(li);
        });
    } else if (page === "template.html") {
        // If on template.html, get the character ID from the URL
        const urlParams = new URLSearchParams(window.location.search);
        const characterId = urlParams.get("id");
        const character = characters.find(c => c.id === characterId);

        // If character exists, insert their data into the page
        if (character) {
            document.getElementById("character-name").textContent = `${character.first_name} ${character.last_name}`;
            document.getElementById("character-pronunciation").textContent = character.pronunciation;
            document.getElementById("character-country").textContent = character.country;
            document.getElementById("character-region").textContent = character.region;
            document.getElementById("character-city").textContent = character.city;
            document.getElementById("character-sex").textContent = character.sex;
            document.getElementById("character-species").textContent = character.species;
        } else {
            document.body.innerHTML = `<div class="text-center text-red-500 text-xl mt-10">Character not found.</div>`;
        }
    }
});
