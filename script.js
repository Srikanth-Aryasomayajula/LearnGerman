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
  const SHEET_NAME = "Vokabular";
  let allData = [];


  // Fetch and parse Excel
fetch("Vocabulary.xlsx")
  .then(response => {
    if (!response.ok) throw new Error("Failed to load Excel file.");
    return response.arrayBuffer();
  })
.then(arrayBuffer => {
  const workbook = XLSX.read(arrayBuffer, {
    type: "array",
    codepage: 65001,
    WTF: true // Add this here
  });

  // Manually fix: Replace all 'φ' with 'ß'
  if (workbook && workbook.Strings && Array.isArray(workbook.Strings)) {
    workbook.Strings.forEach(entry => {
      if (entry.t && typeof entry.t === "string") {
        entry.t = entry.t.replace(/φ/g, "ß");
      }
    });
  }
	
  console.log("Workbook:", workbook); // Now it can access the variable correctly

  const worksheet = workbook.Sheets[SHEET_NAME];
  if (!worksheet) throw new Error(`Sheet "${SHEET_NAME}" not found.`);
  
  allData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
  renderTable(allData);
})

  .catch(error => {
    tableBody.innerHTML = `<tr><td colspan="12">Error loading data: ${error.message}</td></tr>`;
    console.error(error);
  });
	
	
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



	// Display the table/Flashcards when the button is clicked
	displayTableBtn.addEventListener("click", () => {
	  if (selectedLevels.length === 0) {
		alert("Please select the level");
		return;
	  }

	  if (tableViewRadio.checked) {
		table.style.display = "table";
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
  
  //Function to render the table
  function renderTable(data) {
    tableBody.innerHTML = "";
    data.forEach(row => {
      const tr = document.createElement("tr");
      const columns = [
        "Level",
        "Article, Word and Plural",
        "Part of Speech",
        "Meaning",
        "Usage",
        "Past (Präteritum)",
        "Perfect (Partizip II)",
        "Plusquamperfekt",
        "Futur I",
        "Futur II",
        "Prepositions that go together with the verb/Noun/Adj.",
        "Example statement with the preposition"
      ];
      columns.forEach(col => {
        const td = document.createElement("td");
        td.textContent = row[col] || "";
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

let shuffledFlashcards = [];
let currentFlashcardIndex = 0;
	
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
    "Article, Word and Plural",
    "Part of Speech",
    "Meaning",
    "Usage",
    "Past (Präteritum)",
    "Perfect (Partizip II)",
    "Plusquamperfekt",
    "Futur I",
    "Futur II",
    "Prepositions that go together with the verb/Noun/Adj.",
    "Example statement with the preposition"
  ];

  columns.forEach(col => {
    const value = row[col]?.trim();
    if (value && value !== "-") {
      const tr = document.createElement("tr");

      const th = document.createElement("th");
      th.textContent = col;

      const td = document.createElement("td");
      td.textContent = value;

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

	
});
