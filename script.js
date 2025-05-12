document.addEventListener("DOMContentLoaded", () => {
  const tableBody = document.querySelector("#vocabTable tbody");
  const levelSelect = document.getElementById("levelSelect"); // Ensure this ID exists in your HTML
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

  // Handle change
  levelSelect.addEventListener("change", () => {
    const selectedOptions = Array.from(levelSelect.selectedOptions).map(opt => opt.value);

    if (selectedOptions.includes("all")) {
      levelSelect.selectedIndex = 0; // Keep only "all" selected
      renderTable(allData);
      return;
    }

    const filtered = allData.filter(row =>
      selectedOptions.includes((row["Level"] || "").trim())
    );

    renderTable(filtered);
  });

  // Mouse click on dropdown
  levelSelect.addEventListener("click", function (e) {
    const option = e.target;
    if (option.tagName === "OPTION") {
      // Prevent "all" from being selected with others
      if (option.value === "all") {
        for (const opt of this.options) opt.selected = false;
        option.selected = true;
      } else {
        const allSelected = this.querySelector('option[value="all"]').selected;
        if (allSelected) this.querySelector('option[value="all"]').selected = false;
      }

      // Trigger change
      const event = new Event("change", { bubbles: true });
      this.dispatchEvent(event);
    }
  });

  // Display table after filter
  document.getElementById("displayTableBtn").addEventListener("click", () => {
    const selectedOptions = Array.from(levelSelect.selectedOptions).map(opt => opt.value);
    if (selectedOptions.length === 0 || selectedOptions.includes("all")) {
      renderTable(allData);
    } else {
      const filtered = allData.filter(row =>
        selectedOptions.includes((row["Level"] || "").trim())
      );
      renderTable(filtered);
    }
  });

  // Clear selection listener
  document.getElementById("clearSelection").addEventListener("click", () => {
    for (const option of levelSelect.options) {
      option.selected = false;
    }
    tableBody.innerHTML = ""; // Clear table
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
