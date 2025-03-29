document.addEventListener("DOMContentLoaded", async function () {
    function getFullName(character,format) {
        let first = character.name[0][0];
        let last = character.name.slice(-1)[0][0]; // Last element in the name array
        let middle = character.name.length === 3 ? character.name[1][0] : null;
        if (format === 'personal') {
            return middle ? `${first} ${middle} ${last}` : `${first} ${last}`;
        }
        else if (format === 'official') {
            return middle ? `${last}, ${first} ${middle}` : `${last}, ${first}`;
        }
    }
    // Fetch character data
    const response = await fetch("characters.json");
    let characters = await response.json();
    characters = characters.filter(character => 
        (character.name[0] && character.name[0][0]) || 
        (character.name[1] && character.name[1][0]) || 
        (character.name[2] && character.name[2][0])
    );
    // Sort characters by last name
    characters.sort((a, b) => {
        const lastA = a.name[a.name.length - 1][0] || ""; // Get last name, fallback to empty string
        const lastB = b.name[b.name.length - 1][0] || "";
        return lastA.localeCompare(lastB);
    });
    // Get the current page filename
    const page = window.location.pathname.split("/").pop();
    if (page === "index.html" || page === "") {
        // If on index.html, populate the character list
        const list = document.getElementById("character-list");
        characters.forEach((character, index) => {
            console.log(getFullName(character,'official'));
            const li = document.createElement("li");
            li.className = "p-3 bg-gray-200 rounded hover:bg-gray-300 transition";
            li.innerHTML = `<a href="character.html?index=${index}" class="block text-lg text-gray-800">${getFullName(character,'official')}</a>`;
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
            document.title = getFullName(character,'personal');
            console.log(getFullName(character,'personal'))
            document.getElementById(`character-name`).innerHTML = `${getFullName(character,'personal')}<br><sub>${[character.name[0]?.[2],character.name[1]?.[2],character.name[2]?.[2]].filter(Boolean).join(' ')}</sub><hr>`;
            document.getElementById(`character-pronunciation`).innerHTML = `&nbsp;<sub><i>Pronunciation</i></sub><br>${[character.name[0]?.[1],character.name[1]?.[1],character.name[2]?.[1]].filter(Boolean).join('-')}`;
            console.log([character.name[0]?.[1],character.name[1]?.[1],character.name[2]?.[1]].filter(Boolean).join('-'))
            ifKeyExists('profession', character.profession,'<b>Profession: </b>');
            console.log(character.profession)
            if (character.pob) {
                document.getElementById(`character-pob`).innerHTML =
                    `<b>Place of Birth: </b>${character.pob.reverse().filter(Boolean).join(', ')}`
                console.log(character.pob.reverse().filter(Boolean).join(', '))
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
                console.log(langList.replace('<b>Spoken Languages:</b> <i>','').replace('</i>',''))
            }
            ifKeyExists('sex', character.sex, '<b>Sex: </b>');
            console.log(character.sex)
            if (character.species && character.species[0]) {
                document.getElementById(`character-species`).innerHTML =
                    `<b>Species: </b>${character.species[0]}${character.species[1] ? ` (${character.species[1]})` : ''}`;
                console.log(`${character.species[0]}${character.species[1] ? ` (${character.species[1]})` : ''}`)
            }
            ifKeyExists('description', character.description, '<hr>');
            console.log(character.description.replace(/<h2>/g,'\n').replace(/<\/h2>/g,'\n').replace(/<p>/g,'\n').replace(/<\/p>/g,'\n').replace(/<br>/g,'\n').replace(/\n\n/g,'\n'))
        } else {
            document.body.innerHTML = `<div class="text-center text-red-500 text-xl mt-10">Character not found.</div>`;
        }
    }
});
