document.addEventListener("DOMContentLoaded", async function () {
    // Fetch character data
    const response = await fetch("characters.json");
    let characters = await response.json();
    characters = characters.filter(character => character.name[0] || character.name[1] || character.name[2]);
    // Sort characters by last name
    characters.sort((a, b) => {
        const lastA = a.name[a.name.length - 1] || ""; // Get last name, fallback to empty string
        const lastB = b.name[b.name.length - 1] || "";
        return lastA.localeCompare(lastB);
    });
    // Get the current page filename
    const page = window.location.pathname.split("/").pop();
    if (page === "index.html" || page === "") {
        // If on index.html, populate the character list
        const list = document.getElementById("character-list");
        characters.forEach((character, index) => {
            const fullName = character.name.filter(Boolean).join(' ');
            console.log(`Index: ${index}; Name: ${fullName}`);
            const li = document.createElement("li");
            li.className = "p-3 bg-gray-200 rounded hover:bg-gray-300 transition";
            li.innerHTML = `<a href="character.html?index=${index}" class="block text-lg text-gray-800">${fullName}</a>`;
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
            const fullName = character.name.filter(Boolean).join(' ');
            document.title = `${fullName}`;
            document.getElementById(`character-name`).innerHTML = `${fullName}<hr>`;
            ifKeyExists('pronunciation', character.pronunciation,'&nbsp;<sub><i>Pronunciation</i></sub><br>');
            ifKeyExists('profession', character.profession,'<b>Profession: </b>');
            if (character.country) {
                document.getElementById(`character-pob`).innerHTML =
                    `<b>Place of Birth: </b>${character.city ? `${character.city}, ` : ''}${character.region ? `${character.region}, ` : ''}${character.country}`;
            }
            if (character.languages) {
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
                document.getElementById(`character-languages`).innerHTML = langList
            }
            ifKeyExists('sex', character.sex, '<b>Sex: </b>');
            if (character.species && character.species[0]) {
                document.getElementById(`character-species`).innerHTML =
                    `<b>Species: </b>${character.species[0]}${character.species[1] ? ` (${character.species[1]})` : ''}`;
            }
            ifKeyExists('description', character.description, '<hr>');
        } else {
            document.body.innerHTML = `<div class="text-center text-red-500 text-xl mt-10">Character not found.</div>`;
        }
    }
});
