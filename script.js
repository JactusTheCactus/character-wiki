document.addEventListener("DOMContentLoaded", async function () {
	function consoleFormat(input) {
		return input
			.replace(/<\/?[^>]+>/g, match => {
				if (/<h[1-6]>/.test(match)) return '<<NEWLINE>>';
				if (match === "<p>" || match === "<li>") return '\n'.repeat(1);
				return ''; // Remove all other tags
			})
			.replace('&nbsp;', '&nbsp')
			.replace('&nbsp', '  ')
			.replace(/\n\n\n/g, '\n'.repeat(2))
			.replace(/<<NEWLINE>>/g, '\n'.repeat(3))
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
	const keys = await fetch("keyDefaults.json");
	let keyDefaults = await keys.json();
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
	// Group characters by the first letter of their last name
	const groupedCharacters = characters.reduce((acc, character) => {
		const lastName = character.name[character.name.length - 1][0] || "";
		const firstLetter = lastName.charAt(0).toUpperCase();
		if (!acc[firstLetter]) {
			acc[firstLetter] = [];
		}
		acc[firstLetter].push(character);
		return acc;
	}, {});
	// Get the current page filename
	const page = window.location.pathname.split("/").pop();
	// Get the URL parameter (if any)
	const urlParams = new URLSearchParams(window.location.search);
	// Ensure URL has ?tags=
	if (
		!window.location.search.includes('=') ||
		window.location.search.endsWith("=") ||
		window.location.search.includes('=&')
	) {
		window.location.replace(`${window.location.pathname}?tags=default`);
	}
	const filterTag = urlParams.get('tags');
	// Define filterTags here for both cases
	const filterTags = filterTag ? filterTag.split(',') : [];
	if (page === "index.html" || page === "") {
		let numCharacters = 0
		var letterList = []
		const list = document.getElementById("character-list");
		// Generate Alphabetical Shortcuts
		const alphabeticalShortcuts = document.getElementById("alphabetical-shortcuts");
		// Add character list sections grouped by letter
		Object.keys(groupedCharacters).forEach(letter => {
			const section = document.createElement("section");
			section.id = `letter-${letter}`;
			section.className = "letter-section mt-8";
			const h2 = document.createElement("h2");
			h2.className = "text-xl font-bold";
			h2.innerHTML = `${letter}`;
			const ul = document.createElement("ul");
			groupedCharacters[letter].forEach((character, index) => {
				const li = document.createElement("li");
				li.className = "p-3 bg-gray-200 rounded hover:bg-gray-300 transition";
				// Preserve tags in the URL
				const tagsParam = filterTags.length ? `&tags=${filterTags.join(',')}` : '';
				li.innerHTML = `<a style="font-weight: bold;" href="character.html?index=${characters.indexOf(character)}${tagsParam}" class="block text-lg text-gray-800">
                    ${character.tags ? `<p style="color: red; font-style: italic;">${character.tags.filter( x => !filterTags.has(x)).map(tags => `#${tags}`).join(', ').toUpperCase()}</p>` : ''}
                    <span style='color:${character.sex === 'Male' ? "blue" : character.sex === 'Female' ? "red" : ''};'>
                        ${character.sex === 'Male' ? "♂" : character.sex === 'Female' ? "♀" : ''}</span>
                    ${getFullName(character, 'official')}
                    ${character.name[0][2] ? affix(getFullName(character, 'official', 2), `<br>${'&nbsp'.repeat(4)}`) : ''}
                </a>`;
				const excludeDefaults = {
					nsfw: true,
					human: false,
					inhuman: false
				}
				function appendCharacter() {
					if (!letterList.includes(letter)) {
						letterList.push(letter)
					}
					if (letterList.includes(letter)) {
						section.appendChild(h2);
					}
					ul.appendChild(li);
					numCharacters++
				};
				if (filterTags.includes('all')) {
					character.queued = true
				} else if (filterTags.includes('default')) {
					character.queued = true
					character.tags.forEach(tag => {
						if (excludeDefaults[tag]) {
							character.block = true
						}
					})
				} else if (filterTags.every(tag => character.tags.includes(tag))) {
					character.queued = true
				}
				if (!character.block && character.queued) {
					appendCharacter()
				}
			});
			section.appendChild(ul);
			list.appendChild(section);
		});
		Object.keys(groupedCharacters).forEach(letter => {
			const button = document.createElement("button");
			button.textContent = letter;
			button.className = "p-2 bg-gray-300 hover:bg-gray-400 rounded";
			button.onclick = () => {
				const section = document.getElementById(`letter-${letter}`);
				section.scrollIntoView({ behavior: 'smooth' });
			};
			if (letterList.includes(letter)) {
				alphabeticalShortcuts.appendChild(button);
			}
		});
		document.getElementById('details').innerHTML = `${numCharacters} ${!filterTags.some(tag => ['all','default'].includes(tag)) ? `${filterTags.join('/').toUpperCase()} ` : ''}Character${numCharacters > 1 ? 's' : ''}`
	} else if (page === "character.html") {
		// If on character.html, get the character index from the URL
		const urlParams = new URLSearchParams(window.location.search);
		const characterIndex = parseInt(urlParams.get("index"), 10);
		// Get tags separately
		const filterTags = urlParams.get("tags") ? urlParams.get("tags").split(',') : [];
		// Validate index and fetch the character
		if (!isNaN(characterIndex) && characterIndex >= 0 && characterIndex < characters.length) {
			const character = characters[characterIndex];
			// Populate character details
			document.title = getFullName(character, 'casual');
			document.getElementById(`character-name`).innerHTML = `${getFullName(character, 'casual')}${character.name[0][2] ? affix([character.name[0]?.[2], character.name[1]?.[2], character.name[2]?.[2]].filter(Boolean).join(' '), '<br>&nbsp&nbsp<i><sup><sub>', '</sub></sup></i><hr>') : ''}`;
			if (character.tags) {
				document.getElementById('character-tags').innerHTML = `Tags: <span style="color: red; font-style: italic;">${character.tags.map(tag => `#${tag}`).join(', ').toUpperCase()}</span>`
			}
			document.getElementById(`character-pronunciation`).innerHTML = `&nbsp;<sub><i>Pronunciation</i></sub><br>${[character.name[0]?.[1], character.name[1]?.[1], character.name[2]?.[1]].filter(Boolean).join('-')}`;
			if (character.profession) {
				document.getElementById('character-profession').innerHTML = affix(character.profession, '<b>Profession: </b>');
			}
			if (character.pob) {
				document.getElementById(`character-pob`).innerHTML =
					`<b>Place of Birth: </b>${character.pob.reverse().filter(Boolean).join(', ')}`
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
			}
			if (character.sex) {
				document.getElementById('character-sex').innerHTML = affix(character.sex, '<b>Sex: </b>');
			} if (character.species) { document.getElementById(`character-species`).innerHTML = `<b>Species: </b>${character.species[0]}${character.species[1] ? `(${character.species[1]})` : ''}` } if (character.description) { document.getElementById('character-description').innerHTML = affix(character.description, '<hr>') }
			// Update the "Back" button to retain tags
			document.getElementById('back-button').setAttribute('href', `index.html?tags=${filterTags.join(',') || 'default'}`);
		} else { document.body.innerHTML = `<div class="text-center text-red-500 text-xl mt-10">Character not found.</div>`; }
	}
});