document.addEventListener("DOMContentLoaded", () => {
  const tableBody = document.querySelector("#vocabTable tbody");
  const SHEET_NAME = "Führerschein";
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
      renderTable(allData); // Only call this after data is loaded
    })
    .catch(error => {
      tableBody.innerHTML = `<tr><td colspan="12">Error loading data: ${error.message}</td></tr>`;
      console.error(error);
    });

  // Function to render the table
  function renderTable(data) {
    tableBody.innerHTML = "";
    data.forEach(row => {
      const tr = document.createElement("tr");
      const columns = ["German", "English", "Action to be done during Exam"];
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
