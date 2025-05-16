document.addEventListener("DOMContentLoaded", () => {
  const tableViewRadio = document.getElementById("viewTable");
  const flashcardViewRadio = document.getElementById("viewFlashcards");
  const table = document.getElementById("maschinenbauTable");
  table.style.display = "none";
  const flashcardContainer = document.getElementById("flashcardContainer");
  
  const tableBody = document.querySelector("#maschinenbauTable tbody");
  const displayTableBtn = document.getElementById("displayTableBtn");
  const SHEET_NAME = "Maschinenbau";
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
            entry.t = entry.t.replace(/ø/g, "ß");
          }
        });
      }
    
      // Manually fix: Replace all 'Ó' with 'Ü'
      if (workbook && workbook.Strings && Array.isArray(workbook.Strings)) {
        workbook.Strings.forEach(entry => {
          if (entry.t && typeof entry.t === "string") {
            entry.t = entry.t.replace(/Ó/g, "Ü");
          }
        });
      }

      const worksheet = workbook.Sheets[SHEET_NAME];
      if (!worksheet) throw new Error(`Sheet "${SHEET_NAME}" not found.`);

      // Clean each cell in the worksheet to force using .t (plain text)
      for (const cellAddress in worksheet) {
        if (!cellAddress.startsWith('!')) {
          const cell = worksheet[cellAddress];
          if (cell.t === 's' && typeof cell.v === 'string') {
            // Replace ø with ß
            cell.v = cell.v.replace(/ø/g, "ß");
      
            // Replace Ó with Ü
            cell.v = cell.v.replace(/Ó/g, "Ü");
      
            // Ensure .w and .h are not used (just use .v)
            delete cell.w;
            delete cell.h;
          }
        }
      }
      
      	allData = XLSX.utils.sheet_to_json(worksheet, {
            defval: "",
            raw: false,     // Ensure text is parsed
            rawNumbers: false,
            // Ensure rich-text HTML isn't used
            // This prevents it from using `h` field if present
            cellText: true,
            cellHTML: false
          });

          window.maschinenbauData = allData;
          renderTable(allData); // Only call this after data is loaded
    })
    .catch(error => {
      tableBody.innerHTML = `<tr><td colspan="12">Error loading data: ${error.message}</td></tr>`;
      console.error(error);
    });

  	// Display the table/Flashcards when the button is clicked
  	displayTableBtn.addEventListener("click", () => {
	  const iframe = document.getElementById("maschinenbauFrame");
		
  	  if (tableViewRadio.checked) {
			// iframe.src = "maschinenbau_table.html";		  // Enable this if you want maschinenbau_table.html
			iframe.style.display = "block";   			  // Enable this if you want maschinenbau_table.html (value = 'block' will show the html; value = 'none' will not show the html)
		    table.style.display = "none"; 			  // Enable this if you don't want the data in maschinenbau_table.html as a plain text (value = 'table' will show the table; value = 'none' will not show the html)
    	    flashcardContainer.style.display = "none";
  	  } else if (flashcardViewRadio.checked) {
    		table.style.display = "none";
		    iframe.style.display = "none"; 		
    		flashcardContainer.style.display = "block";
  		  	renderFlashcards(allData);
  	  }
  	});
  
  // Function to render the table
  function renderTable(data) {
    tableBody.innerHTML = "";
    data.forEach(row => {
      const tr = document.createElement("tr");
      const columns = ["German", "English", "Example", "Remarks"];
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

  const columns = ["German", "English", "Example", "Remarks"];

  columns.forEach(col => {
    const value = row[col]?.trim();
    if (value && value !== "-") {
      const tr = document.createElement("tr");

      const th = document.createElement("th");
      th.textContent = col;

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
