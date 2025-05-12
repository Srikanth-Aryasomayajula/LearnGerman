document.addEventListener("DOMContentLoaded", () => {
  fetch("Vocabulary.xlsx")
    .then(res => {
      if (!res.ok) throw new Error("File not found");
      console.log("File loaded ✅");
      return res.arrayBuffer();
    })
    .then(buffer => {
      const wb = XLSX.read(buffer, { type: "array" });
      console.log("Workbook loaded. Sheets:", wb.SheetNames);

      const ws = wb.Sheets["Vocabulary"];
      if (!ws) throw new Error("Sheet 'Vocabulary' not found");

      const data = XLSX.utils.sheet_to_json(ws, { defval: "" });
      console.log("Data:", data.slice(0, 5)); // first 5 rows
    })
    .catch(err => {
      console.error("Error loading Excel:", err.message);
    });
});
