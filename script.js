document.addEventListener("DOMContentLoaded", async function () {
	function charAlign(character) {
		var charAlignment = ''
		if (character.alignment.morals && !character.alignment.empathy) {
			charAlignment = character.alignment.morals
		} else if (character.alignment.empathy && !character.alignment.morals) {
			charAlignment = character.alignment.empathy
		} else if (character.alignment.morals && character.alignment.empathy) {
			charAlignment = `${character.alignment.morals} ${character.alignment.empathy}`
		}
		charAlignment = charAlignment.toUpperCase()
		return charAlignment
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
		} else if (format === 'official') {
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
		} else {
			return firstA.localeCompare(firstB);
		}
	});
	// Get the current page filename
	const page = window.location.pathname.split("/").pop();
	// Get the URL parameter (if any)
	const urlParams = new URLSearchParams(window.location.search);
	// Ensure URL has ?tags=
	if (
		!window.location.search.includes('=') ||
		window.location.search.endsWith("=") ||
		window.location.search.includes('=&') ||
		window.location.search.includes(',,')
	) {
		window.location.replace(`${window.location.pathname}?include=default&exclude=default`);
	}
	const includeTag = urlParams.get('include');
	const excludeTag = urlParams.get('exclude');
	const includeTags = includeTag ? includeTag.split(',') : [];
	const excludeTags = excludeTag ? excludeTag.split(',') : [];
	// Pre-process each character for filtering
	characters.forEach(character => {
		if (includeTags.includes('all')) {
			character.queue = true;
		} else if (includeTags.includes('default')) {
			if (character.tags) {
				character.tags.forEach(tag => {
					if (keyDefaults[tag] === true) {
						character.queue = true;
					}
				});
			}
		} else if (includeTags.includes('none')) {
			character.block = true
		} else if (includeTags.every(tag => character.tags.includes(tag))) {
			character.queue = true;
		}
		if (excludeTags.includes('all')) {
			character.block = true;
		} else if (excludeTags.includes('default')) {
			if (character.tags) {
				character.tags.forEach(tag => {
					if (keyDefaults[tag] === false) {
						character.block = true;
					}
				});
			}
		} else if (excludeTags.includes('none')) {
			character.queue = true
		} else if (excludeTags.every(tag => character.tags.includes(tag))) {
			character.block = true;
		}
	});
	// Compute which characters will be displayed on index.html
	const displayedCharacters = characters.filter(character => !character.block && character.queue);
	// Compute commonTags: tags that every displayed character has
	let commonTags = [];
	if (displayedCharacters.length > 0) {
		commonTags = displayedCharacters[0].tags ? [...displayedCharacters[0].tags] : [];
		displayedCharacters.forEach(character => {
			if (character.tags) {
				commonTags = commonTags.filter(tag => character.tags.includes(tag));
			} else {
				// If a character has no tags, then there are no common tags
				commonTags = [];
			}
		});
	}

	if (page === "index.html" || page === "") {
		let numCharacters = 0;
		var letterList = [];
		const list = document.getElementById("character-list");
		// Generate Alphabetical Shortcuts
		const alphabeticalShortcuts = document.getElementById("alphabetical-shortcuts");

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

		// Add character list sections grouped by letter
		Object.keys(groupedCharacters).forEach(letter => {
			const section = document.createElement("section");
			section.id = `letter-${letter}`;
			section.className = "letter-section mt-8";
			const h2 = document.createElement("h2");
			h2.className = "text-xl font-bold";
			h2.innerHTML = `${letter}`;
			const ul = document.createElement("ul");
			groupedCharacters[letter].forEach((character) => {
				const li = document.createElement("li");
				li.className = "p-3 bg-gray-200 rounded hover:bg-gray-300 transition";
				// Only display tags that are not common across all characters
				const tagsToShow = character.tags ? character.tags.filter(tag => !commonTags.includes(tag)) : [];
				// Preserve tags in the URL
				const tagsParam = `&include=${includeTags.length ? `${includeTags.join(',')}` : 'default'}&exclude=${excludeTags.length ? `${excludeTags.join(',')}` : 'default'}`;
				li.innerHTML = `<a style="font-weight: bold;" href="character.html?index=${characters.indexOf(character)}${tagsParam}" class="block text-lg text-gray-800" target="_blank">
				<p>
					<span style="color: blue;">
						${charAlign(character)}
					</span>
				</p>
				<p>
					${tagsToShow.map(tag => `<a href="${window.location.pathname}?include=default&exclude=default" style="color: red; font-style: italic;">#${tag.toUpperCase()}</a>`).join(', ')}
				</p>
                    <span style='color:${character.sex === 'Male' ? "blue" : "red"};'>
                        ${character.sex === 'Male' ? "♂" : "♀"}
					</span>
                    ${getFullName(character, 'official')}
                    ${character.name[0][2] ? `<br>${'&nbsp'.repeat(4)}${getFullName(character, 'official', 2)}` : ''}
                </a>`;
				function appendCharacter() {
					if (!letterList.includes(letter)) {
						letterList.push(letter);
					}
					if (letterList.includes(letter)) {
						section.appendChild(h2);
					}
					ul.appendChild(li);
					numCharacters++;
				}
				if (!character.block && character.queue) {
					appendCharacter();
				}
			});
			section.appendChild(ul);
			list.appendChild(section);
		});
		var i = 0;
		Object.keys(groupedCharacters).forEach(letter => {
			const button = document.createElement("button");
			button.innerHTML = `<span style="font-weight: bold; font-size: 2em;">${letter}&nbsp;</span>`;
			button.className = "p-2 bg-gray-300 hover:bg-gray-400 rounded";
			button.onclick = () => {
				const section = document.getElementById(`letter-${letter}`);
				section.scrollIntoView({ behavior: 'smooth' });
			};
			if (letterList.includes(letter)) {
				alphabeticalShortcuts.appendChild(button);
				if ((i % 5) === 4) {
					alphabeticalShortcuts.appendChild(document.createElement("br"))
				}
				i++
			};
		});
		if (numCharacters === 0) { window.location.replace(`${window.location.pathname}?include=default&exclude=default`); }
		document.getElementById('details').innerHTML = `${numCharacters} Character${numCharacters !== 1 ? 's' : ''}`;
	} else if (page === "character.html") {
		// If on character.html, get the character index from the URL
		const urlParams = new URLSearchParams(window.location.search);
		const characterIndex = parseInt(urlParams.get("index"), 10);
		// Get tags separately
		const includeTags = urlParams.get("include") ? urlParams.get("include").split(',') : [];
		const excludeTags = urlParams.get("exclude") ? urlParams.get("exclude").split(',') : [];
		// Validate index and fetch the character
		if (!isNaN(characterIndex) && characterIndex >= 0 && characterIndex < characters.length) {
			const character = characters[characterIndex];
			// Populate character details
			document.title = getFullName(character, 'casual');
			document.getElementById(`character-name`).innerHTML = `${getFullName(character, 'casual')}${character.name[0][2] ? affix([character.name[0]?.[2], character.name[1]?.[2], character.name[2]?.[2]].filter(Boolean).join(' '), '<br>&nbsp&nbsp<i><sup><sub>', '</sub></sup></i>') : ''}`;
			if (character.alignment) {
				document.getElementById('character-alignment').innerHTML = `<span style="color: blue; font-size: 1.5em; font-weight: bold;">${'&nbsp'.repeat(4)}${charAlign(character)}</span>`
			}
			if (character.tags) {
				document.getElementById('character-tags').innerHTML = `Tags: <span style="color: red; font-style: italic;">${character.tags.map(tag => `#${tag}`).join(', ').toUpperCase()}</span>`;
			}
			document.getElementById(`character-pronunciation`).innerHTML = `&nbsp;<sub><i>Pronunciation</i></sub><br>${[character.name[0]?.[1], character.name[1]?.[1], character.name[2]?.[1]].filter(Boolean).join('-')}`;
			if (character.profession) {
				document.getElementById('character-profession').innerHTML = affix(character.profession, '<b>Profession: </b>');
			}
			if (character.pob) {
				document.getElementById(`character-pob`).innerHTML =
					`<b>Place of Birth: </b>${character.pob.reverse().filter(Boolean).join(', ')}`;
			}
			if (character.languages) {
				let langList = `<b>Spoken Languages:</b> <i>`;
				character.languages.forEach((language, index) => {
					langList += language;
					if (index === 0) {
						langList += '</i>';
					}
					if (index !== character.languages.length - 1) {
						langList += ', ';
					}
				});
				document.getElementById(`character-languages`).innerHTML = langList;
			}
			if (character.sex) {
				document.getElementById('character-sex').innerHTML = affix(character.sex, '<b>Sex: </b>');
			}
			if (character.species) {
				document.getElementById(`character-species`).innerHTML = `<b>Species: </b>${character.species[0]}${character.species[1] ? `(${character.species[1]})` : ''}`;
			}
			if (character.description) {
				document.getElementById('character-description').innerHTML = affix(character.description, '<hr>');
			}
			// Update the "Back" button to retain tags
			document.getElementById('back-button').setAttribute('href', `index.html?include=${includeTags.join(',') || 'default'}&exclude=${excludeTags.join(',') || 'default'}`);
		} else {
			document.body.innerHTML = `<div class="text-center text-red-500 text-xl mt-10">Character not found.</div>`;
		}
	}
});
