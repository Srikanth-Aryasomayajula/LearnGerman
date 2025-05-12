document.addEventListener("DOMContentLoaded", () => {
  const tableBody = document.querySelector("#vocabTable tbody");
  const dropdownHeader = document.getElementById("dropdownHeader");
  const dropdownOptions = document.getElementById("dropdownOptions");
  const checkboxes = dropdownOptions.querySelectorAll("input[type='checkbox']");
  const clearBtn = document.getElementById("clearSelection");
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

  // Handle checkbox selection
  checkboxes.forEach(checkbox => {
    checkbox.addEventListener("change", () => {
      const selectedValues = Array.from(checkboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.value);
  
      if (selectedValues.includes("all")) {
        checkboxes.forEach(cb => {
          if (cb.value !== "all") cb.checked = false;
        });
      } else {
        checkboxes.forEach(cb => {
          if (cb.value === "all") cb.checked = false;
        });
      }
  
      dropdownHeader.textContent = selectedValues.length > 0
        ? selectedValues.join(", ")
        : "Select Level(s)";
    });
  });

  // Display the table
  document.getElementById("displayTableBtn").addEventListener("click", () => {
    const selectedValues = Array.from(checkboxes)
      .filter(cb => cb.checked)
      .map(cb => cb.value);
  
    if (selectedValues.includes("all") || selectedValues.length === 0) {
      renderTable(allData);
    } else {
      const filtered = allData.filter(row =>
        selectedValues.includes((row["Level"] || "").trim())
      );
      renderTable(filtered);
    }
  });

  // Clear selection
  clearBtn.addEventListener("click", () => {
    checkboxes.forEach(cb => cb.checked = false);
    tableBody.innerHTML = "";
    dropdownHeader.textContent = "Select Level(s)";
  });

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
