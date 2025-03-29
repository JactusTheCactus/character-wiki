document.addEventListener("DOMContentLoaded", async function () {
    function consoleFormat(input) {
        return input
            .replace(/<\//g, '<')
            .replace(/<h2>/g, '<<NEWLINE>>')
            .replace(/<p>/g, '\n')
            .replace(/\n\n/g, '\n')
            .replace(/<<NEWLINE>>/g, '\n');
    }
    function affix(input, prefix = '', suffix = '') {
        return input ? `${prefix}${input}${suffix}` : '';
    }
    function getFullName(character, format, type = 0) {
        let first = character.name[0][type];
        let last = character.name.slice(-1)[0][type]; // Last element in the name array
        let middle = character.name.length === 3 ? character.name[1][type] : null;
        if (format === 'casual') {
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
        const lastA = a.name[a.name.length - 1][0] || ""; // Get last name, fallback to first name, then empty string
        const lastB = b.name[b.name.length - 1][0] || "";
        const firstA = a.name[0][0] || "";
        const firstB = b.name[0][0] || "";
        if (lastA !== lastB) {
            return lastA.localeCompare(lastB);
        }
        else {
            return firstA.localeCompare(firstB);
        }
    });

    // Get the current page filename
    const page = window.location.pathname.split("/").pop();

    // Get the URL parameter (if any)
    const urlParams = new URLSearchParams(window.location.search);
    const filterKeyword = urlParams.get('keywords');

    // Define filterKeywords here for both cases
    const filterKeywords = filterKeyword ? filterKeyword.split(',') : [];

    if (page === "index.html" || page === "") {
        const list = document.getElementById("character-list");

        characters.forEach((character, index) => {
            console.log(getFullName(character, 'official'));

            const li = document.createElement("li");
            li.className = "p-3 bg-gray-200 rounded hover:bg-gray-300 transition";

            // Preserve keywords in the URL
            const keywordParam = filterKeywords.length ? `&keywords=${filterKeywords.join(',')}` : '';

            li.innerHTML = `<a href="character.html?index=${index}${keywordParam}" class="block text-lg text-gray-800">
                <span style='color:${character.sex === 'Male' ? "blue" : character.sex === 'Female' ? "red" : ''};'>
                    <sup>${character.sex === 'Male' ? "♂" : character.sex === 'Female' ? "♀" : ''}</sup>
                </span>
                ${getFullName(character, 'official')}
                ${character.name[0][2] ? affix(getFullName(character, 'official', 2), `<br>${'&nbsp'.repeat(4)}`) : ''}
            </a>`;

            if (filterKeywords.includes('all')) {
                list.appendChild(li);
            } else if (!character.keywords || filterKeywords.some(keyword => character.keywords.includes(keyword))) {
                list.appendChild(li);
            }
        });
    } else if (page === "character.html") {
        // If on character.html, get the character index from the URL
        const urlParams = new URLSearchParams(window.location.search);
        const characterIndex = parseInt(urlParams.get("index"), 10);
        // Get keywords separately
        const filterKeywords = urlParams.get("keywords") ? urlParams.get("keywords").split(',') : [];
        // Validate index and fetch the character
        if (!isNaN(characterIndex) && characterIndex >= 0 && characterIndex < characters.length) {
            const character = characters[characterIndex];
            // Function to insert data only if it exists
            // Populate character details
            document.title = getFullName(character, 'casual');
            console.log(getFullName(character, 'casual'))
            document.getElementById(`character-name`).innerHTML = `${getFullName(character, 'casual')}${character.name[0][2] ? affix([character.name[0]?.[2], character.name[1]?.[2], character.name[2]?.[2]].filter(Boolean).join(' '), '<br>&nbsp&nbsp<i><sup><sub>', '</sub></sup></i><hr>') : ''}`;
            if (character.keywords) {
                document.getElementById('character-keywords').innerHTML = `<span style="color: red; font-style: italic;">${character.keywords.map(keyword => `#${keyword}`).join(', ')}</span>`
            }
            document.getElementById(`character-pronunciation`).innerHTML = `&nbsp;<sub><i>Pronunciation</i></sub><br>${[character.name[0]?.[1], character.name[1]?.[1], character.name[2]?.[1]].filter(Boolean).join('-')}`;
            console.log([character.name[0]?.[1], character.name[1]?.[1], character.name[2]?.[1]].filter(Boolean).join('-'))
            if (character.profession) {
                document.getElementById('character-profession').innerHTML = affix(character.profession, '<b>Profession: </b>');
                console.log(character.profession)
            }
            if (character.pob) {
                document.getElementById(`character-pob`).innerHTML =
                    `<b>Place of Birth: </b>${character.pob.reverse().filter(Boolean).join(', ')}`
                console.log(character.pob.reverse().filter(Boolean).join(', '))
            }
            if (character.languages) {
                let langList = `<b>Spoken Languages:</b> <i>`;
                character.languages.forEach((language, index) => {
                    langList += language;
                    if (index === 0) {
                        langList += '</i>'
                    }
                    if (index !== character.languages.length - 1) {
                        langList += ', ';
                    }
                }
                );
                document.getElementById(`character-languages`).innerHTML = langList
                console.log(langList.replace('<b>Spoken Languages:</b> <i>', '').replace('</i>', ''))
            }
            if (character.sex) {
                document.getElementById('character-sex').innerHTML = affix(character.sex, '<b>Sex: </b>');
                console.log(character.sex)
            }
            if (character.species) {
                document.getElementById(`character-species`).innerHTML =
                    `<b>Species: </b>${character.species[0]}${character.species[1] ? ` (${character.species[1]})` : ''}`;
                console.log(`${character.species[0]}${character.species[1] ? ` (${character.species[1]})` : ''}`)
            }
            if (character.description) {
                document.getElementById('character-description').innerHTML = affix(character.description, '<hr>')
                console.log(consoleFormat(character.description))
            }
            // Update the "Back" button to retain keywords
            document.getElementById('back-button').setAttribute('href', `index.html?keywords=${filterKeywords.join(',') || ''}`);
        } else {
            document.body.innerHTML = `<div class="text-center text-red-500 text-xl mt-10">Character not found.</div>`;
        }
    }
});
