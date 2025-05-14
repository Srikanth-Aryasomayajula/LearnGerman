document.addEventListener("DOMContentLoaded", () => {
  const loadButton = document.getElementById("loadPracticeBtn");
  const checkboxes = document.querySelectorAll("#sourceSelector input[type='checkbox']");
  const practiceArea = document.getElementById("practiceArea");

  let filteredData = [];
  let currentIndex = 0;

  loadButton.addEventListener("click", () => {
    const selected = Array.from(checkboxes)
      .filter(cb => cb.checked)
      .map(cb => cb.value);

    if (selected.length === 0) {
      alert("Please select at least one topic.");
      return;
    }

    const vocabData = window.vocabData || [];
    filteredData = vocabData.filter(row =>
      selected.includes((row["Topic"] || row["SheetName"] || "Vokabular").trim())
    );

    if (filteredData.length > 0) {
      currentIndex = 0;
      renderPracticeFlashcard(filteredData[currentIndex]);
    } else {
      practiceArea.innerHTML = "No data loaded.";
    }
  });

  function renderPracticeFlashcard(entry) {
    practiceArea.innerHTML = "";

    const container = document.createElement("div");
    container.className = "flashcard-container";
    
    const wrapper = document.createElement("div");
    wrapper.className = "button-wrapper";

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
          const words = value.split(/\s+/);
          const randomIndex = Math.floor(Math.random() * words.length);
          const correctWord = words[randomIndex];
          const blankId = `${col.toLowerCase()}_blank_${Math.random().toString(36).substr(2, 6)}`;
          const options = generateOptions(correctWord, window.vocabData || [], col);

          words[randomIndex] = `<span class="blank-line">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>`;
          const sentenceWithBlank = words.join(" ");
          td.innerHTML = `${sentenceWithBlank}<br>${createOptionsHTML(blankId, correctWord, options)}`;
        } else {
          td.innerHTML = value.replace(/\r?\n/g, "<br>");
        }

        tr.appendChild(th);
        tr.appendChild(td);
        table.appendChild(tr);
      }
    });

    card.appendChild(table);
    container.appendChild(card);

    const resultDisplay = document.createElement("div");
    resultDisplay.id = "practiceResult";
    resultDisplay.className = "flashcard-progress";
    container.appendChild(resultDisplay);

    const buttonRow = document.createElement("div");
    buttonRow.className = "dropdown-buttons";

    const prevBtn = document.createElement("button");
    prevBtn.textContent = "Previous";
    prevBtn.className = "nav-button";
    prevBtn.style.display = "none";
    prevBtn.addEventListener("click", () => {
      if (currentIndex > 0) {
        currentIndex--;
        renderPracticeFlashcard(filteredData[currentIndex]);
      }
    });

    const submitBtn = document.createElement("button");
    submitBtn.textContent = "Submit";
    submitBtn.id = "submitAnswers";

    const nextBtn = document.createElement("button");
    nextBtn.textContent = "Next";
    nextBtn.className = "nav-button";
    nextBtn.style.display = "none";
    nextBtn.addEventListener("click", () => {
      if (currentIndex < filteredData.length - 1) {
        currentIndex++;
        renderPracticeFlashcard(filteredData[currentIndex]);
      }
    });

    buttonRow.appendChild(prevBtn);
    buttonRow.appendChild(submitBtn);
    buttonRow.appendChild(nextBtn);
    container.appendChild(buttonRow);
    
    practiceArea.innerHTML = "";
    practiceArea.appendChild(container);

    // Submission logic
    submitBtn.addEventListener("click", () => {
      const selected = document.querySelectorAll("input[type='radio']:checked");
      let correct = 0;

      selected.forEach(input => {
        if (input.dataset.correct === "true") correct++;
      });

      const total = document.querySelectorAll("input[type='radio']").length / 4;
      resultDisplay.textContent = `You got ${correct} of ${total} correct.`;

      submitBtn.style.display = "none";
      if (currentIndex > 0) prevBtn.style.display = "inline-block";
      if (currentIndex < filteredData.length - 1) nextBtn.style.display = "inline-block";
    });
  }

  function generateOptions(correctWord, vocabData, column) {
    const wordsFromSameColumn = vocabData
      .map(entry => entry[column])
      .filter(value => value && value !== "-")
      .flatMap(value => value.match(/\b([\wäöüÄÖÜß]+)\b/g) || [])
      .filter(word => word !== correctWord);

    const unique = Array.from(new Set(wordsFromSameColumn)).sort(() => 0.5 - Math.random()).slice(0, 3);
    return [...unique, correctWord].sort(() => 0.5 - Math.random());
  }

  function createOptionsHTML(blankId, correctWord, options) {
    return `
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
});
