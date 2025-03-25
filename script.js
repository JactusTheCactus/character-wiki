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
            li.innerHTML = `<a href="character.html?index=${index}" class="block text-lg text-gray-800">${character.first_name} ${character.middle_name ? `${character.middle_name} ` : ''}${character.last_name}</a>`;
            list.appendChild(li);
        });

    } else if (page === "character.html") {
        // If on character.html, get the character index from the URL
        const urlParams = new URLSearchParams(window.location.search);
        const characterIndex = parseInt(urlParams.get("index"), 10);

        // Validate index and fetch the character
        if (!isNaN(characterIndex) && characterIndex >= 0 && characterIndex < characters.length) {
            const character = characters[characterIndex];

            function affix(input, prefix = '', suffix = '') {
                return input ? `${prefix}${input}${suffix}` : '';
            }

            // Function to insert data only if it exists
            function ifKeyExists(id, key, prefix='', suffix='') {
                if (key) {
                    document.getElementById(`character-${id}`).innerHTML = affix(key, prefix, suffix);
                }
            }

            // Populate character details
            document.getElementById(`character-name`).innerHTML = `${character.first_name} ${character.middle_name ? `${character.middle_name} ` : ''}${character.last_name}`;
            ifKeyExists('pronunciation', character.pronunciation,'&nbsp;<sub><i>Pronunciation</i></sub><br>');
            ifKeyExists('profession', character.profession,'<b>Profession: </b>');
            if (character.country) {
                document.getElementById(`character-pob`).innerHTML =
                    `<b>Place of Birth: </b>${affix(character.city, '', ', ')}${affix(character.region, '', ', ')}${character.country}`;
            }
            if (character.country) {
                let langList = `<b>Spoken Languages:</b> <i>`;
                character.languages.forEach((language,index) => {
                    langList += language;
                    if (index === 0) {
                        langList += '</i>'
                    }
                    if (index !== character.languages.length-1) {
                        langList +=', ';
                    }
                }
                );
                document.getElementById(`character-pob`).innerHTML = langList
            }
            ifKeyExists('sex', character.sex, '<b>Sex: </b>');
            if (character.species && character.species[0]) {
                document.getElementById(`character-species`).innerHTML =
                    `<b>Species: </b>${character.species[0]}${character.species[1] ? ` (${character.species[1]})` : ''}`;
            }

        } else {
            document.body.innerHTML = `<div class="text-center text-red-500 text-xl mt-10">Character not found.</div>`;
        }
    }
});
