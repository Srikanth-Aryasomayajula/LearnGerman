document.addEventListener("DOMContentLoaded", () => {
	const loadButton = document.getElementById("loadPracticeBtn");
	const checkboxes = document.querySelectorAll("#sourceSelector input[type='checkbox']");
	const practiceArea = document.getElementById("practiceArea");

	let filteredData = [];
	let currentIndex = 0;
	let selectedLevels = [];
	let SHEET_NAME;

	// Define arrays to store loaded data
	let maschinenbauData = [];
	let fuehrerscheinData = [];

	const levelDropdownContainer = createLevelDropdown();
	practiceArea.parentNode.insertBefore(levelDropdownContainer, practiceArea);

	const levelCheckboxes = levelDropdownContainer.querySelectorAll("input[type='checkbox']");
	const dropdownHeader = levelDropdownContainer.querySelector(".dropdown-header-1");
	const dropdownOptions = levelDropdownContainer.querySelector(".dropdown-options");
	const secondStartBtn = levelDropdownContainer.querySelector("#startAfterLevelSelect");

	const germanPrepositions = [
		"an", "am", "auf", "aus", "bei", "beim", "durch", "für", "fürs", "gegen", "hinter", "in", "im", "mit",
		"nach", "neben", "ohne", "über", "um", "unter", "von", "vor", "zu", "zum","zur", "zwischen",
		"trotz", "während", "wegen", "entlang", "ab", "seit", "außer", "gegenüber", "anstatt"
	];
	const compoundPrepositions = [
		"worauf", "woran", "woraus", "worüber", "womit", "wodurch", "wofür", "wogegen", "wohin", "wozu",
		"darauf", "daran", "daraus", "darüber", "damit", "dadurch", "dafür", "dagegen", "dahin", "dazu",
		"wovor", "woher", "worin", "wobei", "darunter", "darin", "daraufhin", "darüberhinaus", "davor"
	];
	const allValidPrepositions = [...germanPrepositions, ...compoundPrepositions];

	setupLevelCheckboxes(levelCheckboxes, dropdownHeader);
	setupDropdownToggle(dropdownHeader, dropdownOptions);

	loadFlashcards();

	// Second start button
	secondStartBtn.addEventListener("click", () => {
		selectedLevels = getSelectedLevels(levelCheckboxes);
		if (selectedLevels.length === 0) return alert("Please select at least one level.");
		const selectedSources = getSelectedValues(checkboxes);
		startPractice(selectedSources, selectedLevels);
	});

	// Select the topic of practice
	function loadFlashcards() {
		loadButton.addEventListener("click", () => {
			const selectedSources = getSelectedValues(checkboxes);
			if (selectedSources.length === 0) {
				return alert("Please select at least one topic.");
			}
			if (selectedSources.includes("Vokabular")) {
				levelDropdownContainer.style.display = "flex";
				secondStartBtn.style.display = "inline-block";
			} else if (selectedSources.includes("Grammatik")) {
				// code for grammatik test
			} else if (selectedSources.includes("Maschinenbau")) {
				(async () => {
					await loadJsonData("Maschinenbau");
					startPracticeMechLicense("Maschinenbau");
				})();
			} else if (selectedSources.includes("Führerschein")) {
				(async () => {
					await loadJsonData("Führerschein");
					startPracticeMechLicense("Führerschein");
				})();
			} else {
				levelDropdownContainer.style.display = "none";
				secondStartBtn.style.display = "none";
				startPractice(selectedSources, []);
			}
		});
	}

	// Create dropdown to select the level in vocabulary
	function createLevelDropdown() {
		const container = document.createElement("div");
		container.className = "dropdown-buttons";
		container.id = "levelDropdownContainer";
		container.style.display = "none";

		const dropdown = document.createElement("div");
		dropdown.className = "custom-dropdown";
		dropdown.id = "levelSelectContainer";

		const header = document.createElement("div");
		header.className = "dropdown-header-1";
		header.id = "dropdownHeader";
		header.textContent = "Select Level(s)";
		dropdown.appendChild(header);

		const options = document.createElement("div");
		options.className = "dropdown-options hidden";
		options.id = "dropdownOptions";

		const levels = ["All", "A1", "A2", "B1", "B2", "C1", "C2"];
		levels.forEach(level => {
			const label = document.createElement("label");
			const cb = document.createElement("input");
			cb.type = "checkbox";
			cb.value = level.toLowerCase();
			cb.name = "levelCheckbox";
			label.appendChild(cb);
			label.append(` ${level}`);
			options.appendChild(label);
		});

		dropdown.appendChild(options);
		container.appendChild(dropdown);

		const startBtn = document.createElement("button");
		startBtn.id = "startAfterLevelSelect";
		startBtn.textContent = "Start";
		startBtn.style.display = "none";
		container.appendChild(startBtn);

		return container;
	}

	// Function to setup dropdown toggle
	function setupDropdownToggle(header, options) {
		header.addEventListener("click", () => {
			options.classList.toggle("hidden");
		});

		document.addEventListener("click", (e) => {
			if (!header.contains(e.target) && !options.contains(e.target)) {
			options.classList.add("hidden");
			}
		});
	}

	// Function to setup level checkboxes in the dropdown
	function setupLevelCheckboxes(checkboxes, header) {
		checkboxes.forEach(cb => {
			cb.addEventListener("change", () => {
				const allBox = Array.from(checkboxes).find(c => c.value === "all");
				const others = Array.from(checkboxes).filter(c => c.value !== "all");

				if (cb.value === "all") {
					const allChecked = others.every(c => c.checked);
					others.forEach(c => c.checked = !allChecked);
				} else {
					if (!cb.checked) allBox.checked = false;
					else if (others.every(c => c.checked)) allBox.checked = true;
				}

				const selected = Array.from(checkboxes)
				  .filter(c => c.checked && c.value !== "all")
				  .map(c => c.value.toUpperCase());

				header.textContent = selected.length === 0
				  ? "Select Level(s)"
				  : selected.length === others.length
					? "All"
					: selected.join(", ");
			});
		});
	}

	function getSelectedValues(checkboxes) {
		return Array.from(checkboxes)
			.filter(cb => cb.checked)
			.map(cb => cb.value);
	}

	function getSelectedLevels(checkboxes) {
		return Array.from(checkboxes)
			.filter(cb => cb.checked && cb.value !== "all")
			.map(cb => cb.value.toUpperCase());
	}

	function startPractice(selectedSources, selectedLevels) {
		const vocabData = window.vocabData || [];

		const data = vocabData.filter(row =>
		  selectedSources.includes((row["Topic"] || row["SheetName"] || "Vokabular").trim()) &&
		  (selectedSources.includes("Vokabular") ? selectedLevels.includes((row["Level"] || "").trim().toUpperCase()) : true)
		);

		if (data.length > 0) {
			filteredData = data.sort(() => 0.5 - Math.random());
			currentIndex = 0;
			renderPracticeFlashcard(filteredData[currentIndex]);
		} else {
			practiceArea.innerHTML = "No data loaded.";
		}

		levelDropdownContainer.style.display = "none";
		secondStartBtn.style.display = "none";
	}
  
	function renderPracticeFlashcard(entry) {
		practiceArea.innerHTML = "";

		const container = document.createElement("div");
		container.className = "flashcard-container";

		const card = document.createElement("div");
		card.className = "flashcard";

		const table = document.createElement("table");
		table.className = "flashcard-table";

		const columns = [
			"Level", "Word (with Article and Plural)", "Part of Speech", "Meaning", "Usage",
			"Past (Präteritum)", "Perfect (Partizip II)", "Plusquamperfekt",
			"Futur I", "Futur II",
			"Linked Preposition(s)",
			"Example statement with the preposition"
		];

		columns.forEach(col => {
			const value = entry[col]?.trim();
			if (value && value !== "-") {
				const tr = document.createElement("tr");
				const th = document.createElement("th");
				th.textContent = col;
				const td = document.createElement("td");

				// Handle "Meaning" and "Usage" specifically for blanks
				if (col === "Meaning") {
					const correctPhrase = value.trim(); // For "Meaning", blank the whole phrase.
					const blankId = `${col.toLowerCase()}_blank_${Math.random().toString(36).substr(2, 6)}`;
					const options = generateOptions(correctPhrase, window.vocabData || [], col);
				  
					td.innerHTML = `
					  <span class="blank-line" style="display: inline-block; min-width: 150px;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
					  <br>${createOptionsHTML(blankId, correctPhrase, options)}
					`;
				} else if (col === "Usage") {
					const words = value.split(/\s+/);  // For "Usage", only one word is blanked.
					const randomIndex = Math.floor(Math.random() * words.length);
					const correctWord = words[randomIndex];
					const blankId = `${col.toLowerCase()}_blank_${Math.random().toString(36).substr(2, 6)}`;
					const options = generateOptions(correctWord, window.vocabData || [], col);
				  
					words[randomIndex] = `<span class="blank-line">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>`;
					td.innerHTML = `${words.join(" ")}<br>${createOptionsHTML(blankId, correctWord, options)}`;
				} else if (["Past (Präteritum)", "Perfect (Partizip II)", "Plusquamperfekt", "Futur I", "Futur II"].includes(col)) {
					const blankId = `${col.toLowerCase().replace(/\s+/g, "_")}_text_${Math.random().toString(36).substr(2, 6)}`;
					td.innerHTML = `<input type="text" id="${blankId}" data-answer="${value}" data-col="${col}" style="min-width: 120px;" />`;
				} else if (col === "Linked Preposition(s)") {
					const preps = value.split(/\s*,\s*/);  // Split by comma
					const cellContent = preps.map((prep, idx) => {
						const blankId = `${col.toLowerCase().replace(/\s+/g, "_")}_blank_${idx}_${Math.random().toString(36).substr(2, 6)}`;
						const options = generateOptions(prep, window.vocabData || [], col);
						return `
							<span class="blank-line" style="display: inline-block; min-width: 60px;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
							<br>${createOptionsHTML(blankId, prep, options)}
							`;
					}).join('<br>');

					td.innerHTML = cellContent;
				} else if (col === "Example statement with the preposition") {
					const lines = value.split(/\r?\n/); // split on real linebreaks
					const lineHTML = [];

					lines.forEach((line, lineIdx) => {
						let processedLine = line;
						const radioBlocks = [];

						const regex = new RegExp(`\\b(${allValidPrepositions.join("|")})\\b`, "gi");
						const matches = [...processedLine.matchAll(regex)];
							
						matches.forEach((match, idx) => {
							const fullMatch = match[0];
							const placeholder = `__BLANK${lineIdx}_${idx}__`;
							processedLine = processedLine.replace(fullMatch, placeholder);

							const incorrectOpts = allValidPrepositions.filter(opt => opt.toLowerCase() !== fullMatch.toLowerCase());
							const incorrectOptions = incorrectOpts.sort(() => 0.5 - Math.random()).slice(0, 3);
							const options = [...incorrectOptions, fullMatch].sort(() => 0.5 - Math.random());

							const blankId = `${col.toLowerCase().replace(/\s+/g, "_")}_blank_${lineIdx}_${idx}_${Math.random().toString(36).substr(2, 6)}`;
							radioBlocks.push({
								id: blankId,
								Answer: fullMatch,
								html: createOptionsHTML(blankId, fullMatch, options)
							});
						});
							
						radioBlocks.forEach((block, idx) => {
							const placeholderHTML = `
								<span class="blank-line" style="display: inline-block; min-width: 80px;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
								`;
							processedLine = processedLine.replace(`__BLANK${lineIdx}_${idx}__`, placeholderHTML);
						});

						// Assemble the full HTML for this line: sentence, then options, then result
						const sentenceHTML = `<div class="example-sentence" style="margin-bottom: 0.3em;">${processedLine}</div>`;
						const optionsHTML = radioBlocks.map(rb => `<div style="margin: 0.3em 0;">${rb.html}</div>`).join("");
						const resultHTML = `<div class="example-result" id="result_${lineIdx}" style="margin-bottom: 1em;"></div>`;

						lineHTML.push(`${sentenceHTML}${optionsHTML}${resultHTML}`);
					});
						
					td.innerHTML = lineHTML.join("");
					} else {
						td.innerHTML = value.replace(/\r?\n/g, "<br>");
					}

					tr.appendChild(th);
					tr.appendChild(td);
					table.appendChild(tr);
			}
		});

		card.appendChild(table);
		container.appendChild(card);

		const resultDisplay = document.createElement("div");
		resultDisplay.id = "practiceResult";
		resultDisplay.className = "flashcard-progress";
		container.appendChild(resultDisplay);

		const buttonRow = document.createElement("div");
		buttonRow.className = "button-wrapper";

		const prevBtn = document.createElement("button");
		prevBtn.textContent = "Previous";
		prevBtn.className = "loadPracticeBtn";
		prevBtn.style.display = currentIndex === 0 ? "none" : "inline-block";
		prevBtn.addEventListener("click", () => {
			if (currentIndex > 0) {
				currentIndex--;
				renderPracticeFlashcard(filteredData[currentIndex]);
			}
		});

		const submitBtn = document.createElement("button");
		submitBtn.textContent = "Submit";
		submitBtn.className = "loadPracticeBtn";
		submitBtn.id = "submitAnswers";

		const nextBtn = document.createElement("button");
		nextBtn.textContent = "Next";
		nextBtn.className = "loadPracticeBtn";
		nextBtn.style.display = "none";
		nextBtn.addEventListener("click", () => {
			if (currentIndex < filteredData.length - 1) {
				currentIndex++;
				renderPracticeFlashcard(filteredData[currentIndex]);
			}
		});

		buttonRow.appendChild(prevBtn);
		buttonRow.appendChild(submitBtn);
		buttonRow.appendChild(nextBtn);
		container.appendChild(buttonRow);

		practiceArea.appendChild(container);

		submitBtn.addEventListener("click", () => {
			let correct = 0;
			const radioGroups = new Set();
			document.querySelectorAll("input[type='radio']").forEach(r => radioGroups.add(r.name));

			radioGroups.forEach(groupName => {
				const checked = document.querySelector(`input[name='${groupName}']:checked`);
				const inputs = document.querySelectorAll(`input[name='${groupName}']`);
				if (checked) {
					const isCorrect = checked.dataset.correct === "true";
					const answerCell = checked.closest("td");

					const resultIcon = document.createElement("span");
					resultIcon.textContent = isCorrect ? "✅" : "❌";
					resultIcon.style.color = isCorrect ? "green" : "red";
					checked.parentNode.appendChild(resultIcon);

					if (!isCorrect) {
						const correctInput = Array.from(inputs).find(i => i.dataset.correct === "true");
						const parentDiv = (checked || correctInput).closest("div"); // works for both blank and incorrect
						const existing = parentDiv.querySelector(".correct-combo");

						if (!existing) {
							parentDiv.style.display = "block"; // Ensure parent allows line breaks
							const correctAnswerSpan = document.createElement("div");
							correctAnswerSpan.className = "correct-combo";
							correctAnswerSpan.textContent = `Answer: ${correctInput.dataset.correctAnswer}`;
							correctAnswerSpan.style.cssText = "color: blue; margin-top: 4px; display: block;";
							parentDiv.appendChild(correctAnswerSpan);
						}
					}
					if (isCorrect) correct++;
				} else {
					// No radio selected — treat as wrong
					const answerCell = inputs[0]?.closest("td");
					const resultIcon = document.createElement("span");
					resultIcon.textContent = "❌";
					resultIcon.style.color = "red";
					inputs[0].parentNode.appendChild(resultIcon);

					const correctInput = Array.from(inputs).find(i => i.dataset.correct === "true");
					const correctAnswerSpan = document.createElement("div");
					correctAnswerSpan.textContent = `Answer: ${correctInput.dataset.correctAnswer}`;
					correctAnswerSpan.style.color = "blue";
					answerCell.appendChild(correctAnswerSpan);
				}
			});

			// Evaluate text inputs for all tense columns
			const tenseColumns = ["Past (Präteritum)", "Perfect (Partizip II)", "Plusquamperfekt", "Futur I", "Futur II"];
			evaluateTextInputs(tenseColumns);

			const total = document.querySelectorAll("input[type='radio']").length / 4;
			resultDisplay.textContent = `You got ${correct} of ${total} correct.`;

			submitBtn.style.display = "none";
			if (currentIndex > 0) prevBtn.style.display = "inline-block";
			if (currentIndex < filteredData.length - 1) nextBtn.style.display = "inline-block";
		});
	}

	function generateOptions(correctWord, vocabData, column) {
		if (column === "Linked Preposition(s)") {
			const incorrectOptions = germanPrepositions
				.filter(prep => prep !== correctWord)
				.sort(() => 0.5 - Math.random())
				.slice(0, 3);
		
			return [...incorrectOptions, correctWord].sort(() => 0.5 - Math.random());
		}
		const wordsFromSameColumn = vocabData
			.map(entry => entry[column])
			.filter(value => value && value !== "-")
			.map(value => value.trim())
			.filter(phrase => phrase !== correctWord);  // Exclude the correct word
	  
		// Get individual words from the phrases
		const allWords = wordsFromSameColumn.flatMap(phrase => phrase.split(/\s+/));
	  
		// Select 3 random words from the available options (excluding the correct word)
		const incorrectWords = Array.from(new Set(allWords))
			.sort(() => 0.5 - Math.random())  // Shuffle
			.slice(0, 3);  // Select 3 words randomly
	  
		// Return a mix of incorrect options and the correct word
		return [...incorrectWords, correctWord].sort(() => 0.5 - Math.random());
	}
  
	function createOptionsHTML(blankId, correctWord, options) {
		return `
		  <div class="option-group">
			${options.map(opt => `
				<label>
					<input type="radio" name="${blankId}" value="${opt}" data-correct="${opt === correctWord}" data-correct-answer="${correctWord}">
					${opt}
				</label>
			`).join("")}
		  </div>
		`;
	}
  
	function evaluateTextInputs(columns) {
		columns.forEach(col => {
			const inputs = document.querySelectorAll(`input[data-col="${col}"]`);
			inputs.forEach(input => {
				const userAnswer = (input.value || "").trim().toLowerCase();
				const correctAnswer = input.dataset.answer.toLowerCase();
		  
				const resultIcon = document.createElement("span");
				resultIcon.textContent = userAnswer === correctAnswer ? "✅" : "❌";
				resultIcon.style.marginLeft = "5px";
				resultIcon.style.color = userAnswer === correctAnswer ? "green" : "red";
				input.parentNode.insertBefore(resultIcon, input.nextSibling);
		  
				const correctDisplay = document.createElement("div");
				correctDisplay.textContent = `Answer: ${correctAnswer}`;
				correctDisplay.style.color = "blue";
				input.parentNode.appendChild(correctDisplay);
			});
		});
	}

	// Load maschinenbau.json and fuehrerschein.json
	async function loadJsonData(sheet_name) {
		try {
			let response;
			if (sheet_name === "Maschinenbau") {
				response = await fetch("maschinenbau.json");
			} else if (sheet_name === "Führerschein") {
				response = await fetch("fuehrerschein.json");
			} else {
				throw new Error("Invalid sheet name");
			}
	
			if (!response.ok) {
				throw new Error(`Failed to load ${sheet_name}.json`);
			}
	
			const data = await response.json();
	
			if (sheet_name === "Maschinenbau") {
				maschinenbauData = data;
			} else if (sheet_name === "Führerschein") {
				fuehrerscheinData = data;
			}
	
			console.log(`${sheet_name} data loaded:`, data.length, "items");
	
			return data;  // <--- Return the loaded data here!
		} catch (error) {
			console.error("Error loading data:", error);
			alert(`Could not load data for ${sheet_name}.json`);
			return null;  // Return null on error
		}
	}

	// Function to start practice Maschinenbau and Führerschein
	function startPracticeMechLicense(sheet_name) {
		let data = [];

		// Select the appropriate dataset
		if (sheet_name === "Maschinenbau") {
			data = window.maschinenbauData || [];
			console.log("Maschinenbau data loaded");
			console.log(data);
		} else if (sheet_name === "Führerschein") {
			data = window.fuehrerscheinData || [];
			console.log("Führerschein data loaded");
		} else {
			console.error("Invalid sheet name:", sheet_name);
			practiceArea.innerHTML = "Invalid sheet name.";
			return;
		}

		// Check if data exists and render it
		if (data.length > 0) {
			filteredData = data.sort(() => 0.5 - Math.random());
			currentIndex = 0;
			renderPracticeFlashcardMechLic(filteredData[currentIndex],sheet_name);
		} else {
			practiceArea.innerHTML = "No data loaded.";
		}

		// Hide dropdowns
		levelDropdownContainer.style.display = "none";
		secondStartBtn.style.display = "none";
	}

	// Render practice flashcard for Maschinenbau and License
	function renderPracticeFlashcardMechLic(entry,sheet_name) {
		practiceArea.innerHTML = "";

		const container = document.createElement("div");
		container.className = "flashcard-container";

		const card = document.createElement("div");
		card.className = "flashcard";

		const table = document.createElement("table");
		table.className = "flashcard-table";

		if (sheet_name === "Maschinenbau") {
			const columns = ["German", "English", "Example", "Remarks"];
		} else if (sheet_name === "Führerschein") {
			const columns = ["German", "English", "Action to be done during Exam"];
		}

		columns.forEach(col => {
			const value = entry[col]?.trim();
			if (value && value !== "-") {
				const tr = document.createElement("tr");
				const th = document.createElement("th");
				th.textContent = col;
				const td = document.createElement("td");

				// Handle "Meaning" and "Usage" specifically for blanks
				if (col === "English" || col === "Example" || col === "Remarks" || col === "Action to be done during Exam") {
					const correctPhrase = value.trim(); // For "English/Example/Remarks/Action to be done during Exam", blank the whole phrase.
					const blankId = `${col.toLowerCase()}_blank_${Math.random().toString(36).substr(2, 6)}`;
					if (col === "English") {
						const options = generateOptionsMechLic(correctPhrase, window.maschinenbauData || [], col);
						td.innerHTML = `<span class="blank-line" style="display: inline-block; min-width: 150px;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
							  <br>${createOptionsHTML(blankId, correctPhrase, options)}`;
					}
					else {
						td.innerHTML = "we will print something";
					}
				} else {
						td.innerHTML = value.replace(/\r?\n/g, "<br>");
					}

					tr.appendChild(th);
					tr.appendChild(td);
					table.appendChild(tr);
			}
		});

		card.appendChild(table);
		container.appendChild(card);

		const resultDisplay = document.createElement("div");
		resultDisplay.id = "practiceResult";
		resultDisplay.className = "flashcard-progress";
		container.appendChild(resultDisplay);

		const buttonRow = document.createElement("div");
		buttonRow.className = "button-wrapper";

		const prevBtn = document.createElement("button");
		prevBtn.textContent = "Previous";
		prevBtn.className = "loadPracticeBtn";
		prevBtn.style.display = currentIndex === 0 ? "none" : "inline-block";
		prevBtn.addEventListener("click", () => {
			if (currentIndex > 0) {
				currentIndex--;
				renderPracticeFlashcardMechLic(filteredData[currentIndex],sheet_name);
			}
		});

		const submitBtn = document.createElement("button");
		submitBtn.textContent = "Submit";
		submitBtn.className = "loadPracticeBtn";
		submitBtn.id = "submitAnswers";

		const nextBtn = document.createElement("button");
		nextBtn.textContent = "Next";
		nextBtn.className = "loadPracticeBtn";
		nextBtn.style.display = "none";
		nextBtn.addEventListener("click", () => {
			if (currentIndex < filteredData.length - 1) {
				currentIndex++;
				renderPracticeFlashcardMechLic(filteredData[currentIndex],sheet_name);
			}
		});

		buttonRow.appendChild(prevBtn);
		buttonRow.appendChild(submitBtn);
		buttonRow.appendChild(nextBtn);
		container.appendChild(buttonRow);

		practiceArea.appendChild(container);

		submitBtn.addEventListener("click", () => {
			let correct = 0;
			const radioGroups = new Set();
			document.querySelectorAll("input[type='radio']").forEach(r => radioGroups.add(r.name));

			radioGroups.forEach(groupName => {
				const checked = document.querySelector(`input[name='${groupName}']:checked`);
				const inputs = document.querySelectorAll(`input[name='${groupName}']`);
				if (checked) {
					const isCorrect = checked.dataset.correct === "true";
					const answerCell = checked.closest("td");

					const resultIcon = document.createElement("span");
					resultIcon.textContent = isCorrect ? "✅" : "❌";
					resultIcon.style.color = isCorrect ? "green" : "red";
					checked.parentNode.appendChild(resultIcon);

					if (!isCorrect) {
						const correctInput = Array.from(inputs).find(i => i.dataset.correct === "true");
						const parentDiv = (checked || correctInput).closest("div"); // works for both blank and incorrect
						const existing = parentDiv.querySelector(".correct-combo");

						if (!existing) {
							parentDiv.style.display = "block"; // Ensure parent allows line breaks
							const correctAnswerSpan = document.createElement("div");
							correctAnswerSpan.className = "correct-combo";
							correctAnswerSpan.textContent = `Answer: ${correctInput.dataset.correctAnswer}`;
							correctAnswerSpan.style.cssText = "color: blue; margin-top: 4px; display: block;";
							parentDiv.appendChild(correctAnswerSpan);
						}
					}
					if (isCorrect) correct++;
				} else {
					// No radio selected — treat as wrong
					const answerCell = inputs[0]?.closest("td");
					const resultIcon = document.createElement("span");
					resultIcon.textContent = "❌";
					resultIcon.style.color = "red";
					inputs[0].parentNode.appendChild(resultIcon);

					const correctInput = Array.from(inputs).find(i => i.dataset.correct === "true");
					const correctAnswerSpan = document.createElement("div");
					correctAnswerSpan.textContent = `Answer: ${correctInput.dataset.correctAnswer}`;
					correctAnswerSpan.style.color = "blue";
					answerCell.appendChild(correctAnswerSpan);
				}
			});

			const total = document.querySelectorAll("input[type='radio']").length / 4;
			resultDisplay.textContent = `You got ${correct} of ${total} correct.`;

			submitBtn.style.display = "none";
			if (currentIndex > 0) prevBtn.style.display = "inline-block";
			if (currentIndex < filteredData.length - 1) nextBtn.style.display = "inline-block";
		});
	}

});
