document.addEventListener("DOMContentLoaded", () => {
  const table = document.getElementById("vocabTable");
  const tableBody = table.querySelector("tbody");
  const tableHead = table.querySelector("thead");
  const SHEET_NAME = "Grammatik";
  let allData = [];

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

      if (allData.length > 0) {
        // Generate table headers dynamically
        const firstRow = allData[0];
        const headers = Object.keys(firstRow);

        tableHead.innerHTML = "";
        const tr = document.createElement("tr");
        headers.forEach(header => {
          const th = document.createElement("th");
          th.textContent = header;
          tr.appendChild(th);
        });
        tableHead.appendChild(tr);
      }

      renderTable(allData);
      table.style.display = "table";
    })
    .catch(error => {
      tableBody.innerHTML = `<tr><td colspan="12">Error loading data: ${error.message}</td></tr>`;
      console.error(error);
    });

  function renderTable(data) {
    tableBody.innerHTML = "";
    data.forEach(row => {
      const tr = document.createElement("tr");
      Object.values(row).forEach(value => {
        const td = document.createElement("td");
        td.textContent = value;
        tr.appendChild(td);
      });
      tableBody.appendChild(tr);
    });

    if (data.length === 0) {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td colspan="12">No entries found.</td>`;
      tableBody.appendChild(tr);
    }
  }
});
