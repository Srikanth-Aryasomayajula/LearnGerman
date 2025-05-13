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
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      const worksheet = workbook.Sheets[SHEET_NAME];
      if (!worksheet) throw new Error(`Sheet "${SHEET_NAME}" not found.`);
      allData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
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
  
  function renderFlashcards(data) {
  flashcardContainer.innerHTML = "";
  if (data.length === 0) {
    flashcardContainer.textContent = "No entries found for this level.";
    return;
  }

  const shuffled = data.sort(() => 0.5 - Math.random());
  shuffled.forEach(row => {
    const card = document.createElement("div");
    card.className = "flashcard";
    card.innerHTML = `
      <strong>${row["Article, Word and Plural"] || ""}</strong><br/>
      <em>${row["Meaning"] || ""}</em><br/>
      ${row["Example statement with the preposition"] || ""}
    `;
    flashcardContainer.appendChild(card);
  });
}

});
