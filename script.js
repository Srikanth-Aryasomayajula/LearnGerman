document.addEventListener("DOMContentLoaded", () => {
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
  checkboxes.forEach(checkbox => {
    checkbox.addEventListener("change", () => {
      // Gather selected levels from checked checkboxes
      const selectedLevels = [];
      checkboxes.forEach(cb => {
        if (cb.checked) {
          selectedLevels.push(cb.value);
        }
      });

      // Update the dropdown header text to show selected levels
      if (selectedLevels.length > 0) {
        dropdownHeader.textContent = selectedLevels.join(", ");
      } else {
        dropdownHeader.textContent = "Select Level(s)";
      }

      // If 'All' is selected, render all data
      if (selectedLevels.includes("all")) {
        //checkboxes.forEach(cb => cb.checked = true);  // Select all checkboxes
        checkboxes.forEach((cb, index) => {
          if (index === 0) {
            cb.checked = true;  // Check the "all" checkbox
          }
        });
        
        //checkboxes[0].checked = true;  // Ensure the "all" checkbox is also checked
        dropdownHeader.textContent = "All";  // Update the header text to show "All"
        renderTable(allData);
      } else {
        // Filter based on selected levels
        const filteredData = allData.filter(row => 
          selectedLevels.includes((row["Level"] || "").trim())
        );
        renderTable(filteredData);
      }

      // If any level is unchecked, uncheck the "all" checkbox
      if (!selectedLevels.includes("all")) {
        checkboxes[0].checked = false;  // Uncheck the "all" checkbox
        dropdownHeader.textContent = selectedLevels.length > 0 ? selectedLevels.join(", ") : "Select Level(s)";
      }

      // Ensure that clicking on any level other than "all" will uncheck "all" and the clicked level
      checkboxes.forEach((cb, index) => {
        if (index !== 0 && cb.checked) { // If it's not "all" and is checked
          checkboxes[0].checked = false;  // Uncheck "all"
        }
      });
    });
  });

  // Display the table when the button is clicked
  displayTableBtn.addEventListener("click", () => {
    const table = document.getElementById("vocabTable");
    table.style.display = "table"; // Show the table when display button is clicked
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
});
