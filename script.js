document.addEventListener("DOMContentLoaded", () => {
  const tableBody = document.querySelector("#vocabTable tbody");
  const levelSelect = document.getElementById("levelSelect");
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

  // Only render when level is selected
  levelSelect.addEventListener("change", () => {
    const selectedOptions = Array.from(levelSelect.selectedOptions).map(opt => opt.value);
  
    // If "all" is selected, deselect everything else and show all data
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


  function renderTable(data) {
    tableBody.innerHTML = "";
    data.forEach(row => {
      const tr = document.createElement("tr");
      const columns = [
        "Level",
        "Article, Word and Plural",
        "Part of Speech",
        "Meaning",
        "example",
        "Past (Präteritum)",
        "Perfect (Partizip II)",
        "Plusquamperfekt",
        "Futur I",
        "Futur II",
        "Prepositions that go together with the verb/Noun/Adj.",
        "Example statement with the preposition."
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
