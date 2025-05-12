document.addEventListener("DOMContentLoaded", () => {
  const tableBody = document.querySelector("#vocabTable tbody");
  const SHEET_NAME = "Vokabular"; // Exact sheet name in Excel

  fetch("Vocabulary.xlsx")
    .then(response => {
      if (!response.ok) throw new Error("Failed to load Excel file.");
      return response.arrayBuffer();
    })
    .then(arrayBuffer => {
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      const worksheet = workbook.Sheets[SHEET_NAME];

      if (!worksheet) {
        throw new Error(`Sheet "${SHEET_NAME}" not found in Excel file.`);
      }

      const data = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

      if (data.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="12">No data found in sheet "${SHEET_NAME}".</td></tr>`;
        return;
      }

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
          "Example statement with the preposition."
        ];

        columns.forEach(col => {
          const td = document.createElement("td");
          td.textContent = row[col] || "";
          tr.appendChild(td);
        });

        tableBody.appendChild(tr);
      });
    })
    .catch(error => {
      tableBody.innerHTML = `<tr><td colspan="12">Error loading data: ${error.message}</td></tr>`;
      console.error("Excel load error:", error);
    });
});
