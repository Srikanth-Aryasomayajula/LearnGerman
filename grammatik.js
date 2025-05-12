document.addEventListener("DOMContentLoaded", () => {
  const tableContainer = document.querySelector("main");

  fetch("Vocabulary.xlsx")
    .then(response => {
      if (!response.ok) throw new Error("Failed to load Excel file.");
      return response.arrayBuffer();
    })
    .then(arrayBuffer => {
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      const sheet = workbook.Sheets["Grammatik"];
      if (!sheet) throw new Error(`Sheet "Grammatik" not found.`);

      // Convert the sheet to an HTML string with borders
      const html = XLSX.utils.sheet_to_html(sheet, {
        id: "vocabTable",
        editable: false
      });

      // Insert the HTML table directly into the page
      tableContainer.insertAdjacentHTML("beforeend", html);

      // Optionally style the table
      const table = document.getElementById("vocabTable");
      table.classList.add("vocab-table"); // you can style this in CSS
    })
    .catch(error => {
      tableContainer.innerHTML += `<p>Error loading data: ${error.message}</p>`;
      console.error(error);
    });
});
