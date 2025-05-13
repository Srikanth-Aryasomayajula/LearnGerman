document.addEventListener("DOMContentLoaded", () => {
  const loadButton = document.getElementById("loadPracticeBtn");
  const checkboxes = document.querySelectorAll("#sourceSelector input[type='checkbox']");
  const practiceArea = document.getElementById("practiceArea");

  loadButton.addEventListener("click", () => {
    const selected = Array.from(checkboxes)
      .filter(cb => cb.checked)
      .map(cb => cb.value);

    if (selected.length === 0) {
      alert("Please select at least one topic.");
      return;
    }

    // Access data from script.js
    const vocabData = window.vocabData || [];
    console.log(vocabData);
    const filtered = vocabData.filter(row => selected.includes((row["Topic"] || row["SheetName"] || "Vokabular").trim()));

    if (filtered.length > 0) {
      renderPracticeFlashcard(filtered[0]); // Show one for now
    } else {
      practiceArea.innerHTML = "No data loaded.";
    }
  });
});

function renderPracticeFlashcard(entry, vocabData) {
  practiceArea.innerHTML = "";

  const card = document.createElement("div");
  card.className = "flashcard";

  const table = document.createElement("table");
  table.className = "flashcard-table";

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
    const value = entry[col]?.trim();
    if (value && value !== "-") {
      const tr = document.createElement("tr");
      const th = document.createElement("th");
      th.textContent = col;

      const td = document.createElement("td");

      if (col === "Meaning" || col === "Usage") {
        const processed = value.replace(/\b([\wäöüÄÖÜß]+)\b/g, (match) => {
          if (Math.random() > 0.8) {
            const blankId = `${col.toLowerCase()}_blank_${Math.random().toString(36).substr(2, 6)}`;
            const options = generateOptions(match, vocabData);
            return createBlankHTML(blankId, match, options);
          }
          return match;
        });
        td.innerHTML = processed;
      } else {
        td.innerHTML = value.replace(/\r?\n/g, "<br>");
      }

      tr.appendChild(th);
      tr.appendChild(td);
      table.appendChild(tr);
    }
  });

  card.appendChild(table);
  practiceArea.appendChild(card);

  const submitBtn = document.createElement("button");
  submitBtn.textContent = "Submit";
  submitBtn.id = "submitAnswers";
  submitBtn.style.marginTop = "1rem";
  practiceArea.appendChild(submitBtn);

  submitBtn.addEventListener("click", () => {
    const selected = document.querySelectorAll("input[type='radio']:checked");
    let correct = 0;

    selected.forEach(input => {
      if (input.dataset.correct === "true") correct++;
    });

    const total = document.querySelectorAll("input[type='radio']").length / 4;
    alert(`You got ${correct} of ${total} correct.`);
  });
}

function createBlankHTML(blankId, correctWord, options) {
  return `
    <span class="blank-line">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
    <div class="option-group">
      ${options.map(opt => `
        <label>
          <input type="radio" name="${blankId}" value="${opt}" data-correct="${opt === correctWord}">
          ${opt}
        </label>
      `).join("")}
    </div>
  `;
}

function generateOptions(correctWord, vocabData) {
  const allWords = vocabData.flatMap(entry => 
    [entry["Meaning"], entry["Usage"]].join(" ").match(/\b([\wäöüÄÖÜß]+)\b/g) || []
  );
  const filtered = allWords.filter(word => word !== correctWord);
  const unique = Array.from(new Set(filtered)).sort(() => 0.5 - Math.random()).slice(0, 3);
  return [...unique, correctWord].sort(() => 0.5 - Math.random());
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
