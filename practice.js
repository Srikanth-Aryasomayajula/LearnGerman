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

function renderPracticeFlashcard(entry) {
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
        const processed = value.replace(/\b(\w+)\b/g, (match, word) => {
          if (Math.random() > 0.8) {
            const blankId = `blank_${Math.random().toString(36).substring(2, 8)}`;
            const options = generateOptions(word);
            return createBlankHTML(blankId, word, options);
          }
          return word;
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

    const total = document.querySelectorAll("input[type='radio']").length / 4; // assuming 4 options
    alert(`You got ${correct} of ${total} correct.`);
  });
}

function createBlankHTML(blankId, correctWord, options) {
  const html = `
    <span style="display:inline-block; border-bottom: 1px solid #000; min-width: 60px;">&nbsp;</span>
    <div style="margin-top: 5px;">
      ${options.map((opt, i) => `
        <label style="margin-right: 10px;">
          <input type="radio" name="${blankId}" value="${opt}" data-correct="${opt === correctWord}">
          ${opt}
        </label>
      `).join("")}
    </div>
  `;
  return html;
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

function generateOptions(correctWord) {
  const allWords = vocabData.flatMap(entry => 
    [entry["Meaning"], entry["Usage"]].join(" ").match(/\b\w+\b/g) || []
  );
  const filtered = allWords.filter(word => word !== correctWord);
  const shuffled = filtered.sort(() => 0.5 - Math.random());
  const unique = Array.from(new Set(shuffled)).slice(0, 3);
  return [...unique, correctWord].sort(() => 0.5 - Math.random());
}
