document.addEventListener("DOMContentLoaded", () => {
  const loadButton = document.getElementById("loadPracticeBtn");
  const checkboxes = document.querySelectorAll("#sourceSelector input[type='checkbox']");
  const practiceArea = document.getElementById("practiceArea");

  loadButton.addEventListener("click", async () => {
    const selected = Array.from(checkboxes)
      .filter(cb => cb.checked)
      .map(cb => cb.value);

    if (selected.length === 0) {
      alert("Please select at least one source.");
      return;
    }

    // Load and parse selected files
    let allFlashcardData = [];

    for (const sheetName of selected) {
      try {
        const response = await fetch(`${sheetName}.xlsx`);
        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: "array", codepage: 65001 });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];

        const parsedData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
        allFlashcardData.push(...parsedData);
      } catch (err) {
        console.error(`Error loading ${sheetName}:`, err);
      }
    }

    // Show one flashcard for now
    if (allFlashcardData.length > 0) {
      renderPracticeFlashcard(allFlashcardData[0]); // Later: random or shuffle
    } else {
      practiceArea.innerHTML = "No data loaded.";
    }
  });

  function renderPracticeFlashcard(entry) {
    practiceArea.innerHTML = ""; // Clear existing

    const container = document.createElement("div");
    container.className = "practice-card";

    const questionText = (entry["Usage"] || "").replace(/\b(\w+)\b/g, (match, word) => {
      // Example: only replace known target words (simplified for now)
      if (Math.random() > 0.8) { // randomly create blanks
        const blankId = `blank_${Math.random().toString(36).substring(2, 8)}`;
        const options = generateOptions(word); // pick 5 words incl. correct
        return createBlankWithOptions(blankId, word, options);
      }
      return word;
    });

    container.innerHTML = `<p>${questionText}</p><button id="submitAnswers">Submit</button>`;
    practiceArea.appendChild(container);

    document.getElementById("submitAnswers").addEventListener("click", () => {
      const selected = document.querySelectorAll("input[type='radio']:checked");
      let correct = 0;

      selected.forEach(input => {
        if (input.dataset.correct === "true") correct++;
      });

      const total = document.querySelectorAll("input[type='radio']").length / 5;
      alert(`You got ${correct} of ${total} correct.`);
    });
  }

  function createBlankWithOptions(blankId, correctWord, options) {
    return `
      <span class="blank-group">
        ${options
          .map(opt => `<label><input type="radio" name="${blankId}" data-correct="${opt === correctWord}" /> ${opt}</label>`)
          .join(" ")}
      </span>
    `;
  }

  function generateOptions(correct) {
    const dummyWords = ["laufen", "machen", "essen", "lesen", "schreiben", "sehen", "haben"];
    const shuffled = [correct, ...dummyWords.filter(w => w !== correct).sort(() => 0.5 - Math.random()).slice(0, 4)];
    return shuffled.sort(() => 0.5 - Math.random()); // Shuffle
  }
});
