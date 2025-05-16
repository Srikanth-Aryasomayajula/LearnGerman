document.addEventListener("DOMContentLoaded", () => {
	const tableViewRadio = document.getElementById("viewTable");
	const flashcardViewRadio = document.getElementById("viewFlashcards");
	const table = document.getElementById("vocabTable");
	const flashcardContainer = document.getElementById("flashcardContainer");

	const tableBody = document.querySelector("#vocabTable tbody");
	const dropdownHeader = document.getElementById("dropdownHeader");
	const dropdownOptions = document.getElementById("dropdownOptions");

	const checkboxes = dropdownOptions.querySelectorAll("input[type='checkbox']");

	const clearBtn = document.getElementById("clearSelection");
	const displayTableBtn = document.getElementById("displayTableBtn");
	const SHEET_NAME = "vokabular";
	let allData = [];
	let shuffledFlashcards = [];
	let currentFlashcardIndex = 0;

	// Call this function to load the excel data
	fetchExcelData();

	// Toggle dropdown visibility
	dropdownHeader.addEventListener("click", () => {
		dropdownOptions.classList.toggle("hidden");
	});

	// Close dropdown if clicked outside
	document.addEventListener("click", (e) => {
		if (!dropdownHeader.contains(e.target) && !dropdownOptions.contains(e.target)) {
		  dropdownOptions.classList.add("hidden");
		}
	});

	// Handle checkbox change for level selection
	let selectedLevels = [];
	
	checkboxes.forEach(checkbox => {
	  checkbox.addEventListener("change", () => {
		const isAllBoxClicked = checkbox.value === "all";
		const allCheckboxesExceptAll = Array.from(checkboxes).slice(1);

		if (isAllBoxClicked) {
			const allChecked = allCheckboxesExceptAll.every(cb => cb.checked);
			if (allChecked) {
				// If all are already checked and 'all' is clicked again → uncheck all
				checkboxes.forEach(cb => cb.checked = false);
			} else {
				// Otherwise → check all
				checkboxes.forEach(cb => cb.checked = true);
			}
		} else {
			// Any individual checkbox is clicked
			if (!checkbox.checked && checkboxes[0].checked) {
				// If a level is unchecked and 'all' is checked → uncheck 'all'
				checkboxes[0].checked = false;
			} else {
				// If all others are now checked → check 'all' automatically
				const allSelected = allCheckboxesExceptAll.every(cb => cb.checked);
				checkboxes[0].checked = allSelected;
			}
		}

		// Now collect selected levels and render table
		selectedLevels = Array.from(checkboxes)
			.filter(cb => cb.checked)
			.map(cb => cb.value);

		if (selectedLevels.length === 0) {
			dropdownHeader.textContent = "Select Level(s)";
			renderTable([]);
		} else if (selectedLevels.length === checkboxes.length) {
			dropdownHeader.textContent = "All";
			renderTable(allData);
		} else {
			dropdownHeader.textContent = selectedLevels.join(", ");
			const filteredData = allData.filter(row =>
				selectedLevels.includes((row["Level"] || "").trim())
			);
			renderTable(filteredData);
		}
	  });
	});

	// Display the table/flashcards when the button is clicked
	displayTableBtn.addEventListener("click", () => {
		if (selectedLevels.length === 0) {
			alert("Please select the level");
			return;
		}

		const filteredData = allData.filter(row =>
			selectedLevels.includes((row["Level"] || "").trim())
		);
		
		if (tableViewRadio.checked) {
			iframe.style.display = "block";   // 'block' --> selected levels from vokabular.json,'none' --> nothing
			table.style.display = "none";
			flashcardContainer.style.display = "none";
		} else if (flashcardViewRadio.checked) {
			table.style.display = "none";
			flashcardContainer.style.display = "block";
			renderFlashcards(
				allData.filter(row => selectedLevels.includes((row["Level"] || "").trim()))
			);
		}
	});

	// Clear selection
	clearBtn.addEventListener("click", () => {
		checkboxes.forEach(cb => cb.checked = false);
		tableBody.innerHTML = "";  // Clear the table body
		const table = document.getElementById("vocabTable");
		table.style.display = "none";  // Hide the table
		dropdownHeader.textContent = "Select Level(s)";  // Reset dropdown header text
	});

  	// Fetch and parse JSON from pre-converted file
	function fetchExcelData() {
		fetch(`${SHEET_NAME}.json`)
			.then(response => {
				if (!response.ok) throw new Error("Failed to load JSON data.");
				return response.json();
			})
			.then(data => {
				allData = data;
				window.vocabData = allData;
				renderTable(allData);
			})
			.catch(error => {
				tableBody.innerHTML = `<tr><td colspan="12">Error loading data: ${error.message}</td></tr>`;
				console.error(error);
			});
	}
  
	//Function to render the table
	function renderTable(data) {
		tableBody.innerHTML = "";
		data.forEach(row => {
			const tr = document.createElement("tr");
			const columns = [
				"Level",
				"Word (with Article and Plural)",
				"Part of Speech",
				"Meaning",
				"Usage",
				"Past (Präteritum)",
				"Perfect (Partizip II)",
				"Plusquamperfekt",
				"Futur I",
				"Futur II",
				"Linked Preposition(s)",
				"Example statement with the preposition"
			];
			columns.forEach(col => {
				const td = document.createElement("td");
				td.innerHTML = (row[col] || "").replace(/\r?\n/g, "<br>");
				tr.appendChild(td);
			});
			tableBody.appendChild(tr);
		});

		if (data.length === 0) {
		  const tr = document.createElement("tr");
		  tr.innerHTML = `<td colspan="12">No entries found for this level.</td>`;
		  tableBody.appendChild(tr);
		}
	}

	// Function to render flashcard	
	function renderFlashcards(data) {
		flashcardContainer.innerHTML = "";

		if (data.length === 0) {
			flashcardContainer.textContent = "No entries found for this level.";
			return;
		}

		// Shuffle and reset index
		shuffledFlashcards = data.sort(() => 0.5 - Math.random());
		currentFlashcardIndex = 0;

		showFlashcard(shuffledFlashcards[currentFlashcardIndex]);
	}

	// Show one flashcard
	function showFlashcard(row) {
		flashcardContainer.innerHTML = ""; // Clear container

		const card = document.createElement("div");
		card.className = "flashcard";

		// Create a table to hold content
		const table = document.createElement("table");
		table.className = "flashcard-table";

		const columns = [
			"Level",
			["Word (with Article and Plural)", "Word<br>(with Article and Plural)"],
			"Part of Speech",
			"Meaning",
			"Usage",
			"Past (Präteritum)",
			"Perfect (Partizip II)",
			"Plusquamperfekt",
			"Futur I",
			"Futur II",
			"Linked Preposition(s)",
			"Example statement with the preposition"
		];

		columns.forEach(col => {
			const key = Array.isArray(col) ? col[0] : col;
			const displayName = Array.isArray(col) ? col[1] : col;
			const value = row[key]?.trim();
			  
			if (value && value !== "-") {
				const tr = document.createElement("tr");

				const th = document.createElement("th");
				th.innerHTML = displayName;

				const td = document.createElement("td");
				td.innerHTML = value.replace(/\r?\n/g, "<br>");

				tr.appendChild(th);
				tr.appendChild(td);
				table.appendChild(tr);
			}
		});

		card.appendChild(table);
		flashcardContainer.appendChild(card);

		// Progress indicator
		const progress = document.createElement("p");
		progress.className = "flashcard-progress";
		progress.textContent = `Card ${currentFlashcardIndex + 1} of ${shuffledFlashcards.length}`;
		flashcardContainer.appendChild(progress);

		// Button wrapper
		const buttonWrapper = document.createElement("div");
		buttonWrapper.className = "button-wrapper";

		const prevBtn = document.createElement("button");
		prevBtn.textContent = "Previous";
		prevBtn.style.display = currentFlashcardIndex === 0 ? "none" : "inline-block";
		prevBtn.addEventListener("click", () => {
			if (currentFlashcardIndex > 0) {
				currentFlashcardIndex--;
				showFlashcard(shuffledFlashcards[currentFlashcardIndex]);
			} else {
				prevBtn.style.display = "none";
			}
		});

		const nextBtn = document.createElement("button");
		nextBtn.textContent = "Next";
		nextBtn.style.display = currentFlashcardIndex === shuffledFlashcards.length - 1 ? "none" : "inline-block";
		nextBtn.addEventListener("click", () => {
			if (currentFlashcardIndex < shuffledFlashcards.length - 1) {
				currentFlashcardIndex++;
				showFlashcard(shuffledFlashcards[currentFlashcardIndex]);
			} else {
				nextBtn.style.display = "none";
			}
		});

		buttonWrapper.appendChild(prevBtn);
		buttonWrapper.appendChild(nextBtn);
		flashcardContainer.appendChild(buttonWrapper);
	}

	// Function to generate the html from the selected data
	function generateSelectedLevelsHTML(filteredData) {
		const columns = [
			"Level",
			"Word (with Article and Plural)",
			"Part of Speech",
			"Meaning",
			"Usage",
			"Past (Präteritum)",
			"Perfect (Partizip II)",
			"Plusquamperfekt",
			"Futur I",
			"Futur II",
			"Linked Preposition(s)",
			"Example statement with the preposition"
		];
	
		let html = `
			<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<title>Selected Vocabulary Table</title>
				<style>
					body { font-family: sans-serif; padding: 10px; }
					table { border-collapse: collapse; width: 100%; }
					th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
					th { background-color: #f2f2f2; }
				</style>
			</head>
			<body>
				<h2>Selected Vocabulary Table</h2>
				<table>
					<thead><tr>${columns.map(col => `<th>${col}</th>`).join("")}</tr></thead>
					<tbody>
		`;
	
		filteredData.forEach(row => {
			html += `<tr>${columns.map(col => `<td>${(row[col] || "").replace(/\r?\n/g, "<br>")}</td>`).join("")}</tr>`;
		});
	
		html += `
					</tbody>
				</table>
			</body>
			</html>
		`;
	
		return html;
	}
		
});

// Close menu when clicking outside
document.addEventListener('click', (event) => {
    const menu = document.getElementById('menuContainer');
    const toggleBtn = document.getElementById('menuToggleBtn');

    // If the menu is open (has "show-menu" class), and the click is outside the menu and toggle button
    if (menu.classList.contains('show-menu') &&
        !menu.contains(event.target) &&
        !toggleBtn.contains(event.target)) {
        menu.classList.remove('show-menu');
    }
});
