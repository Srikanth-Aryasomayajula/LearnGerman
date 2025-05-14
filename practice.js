document.addEventListener("DOMContentLoaded", () => {
  const loadButton = document.getElementById("loadPracticeBtn");
  const checkboxes = document.querySelectorAll("#sourceSelector input[type='checkbox']");
  const practiceArea = document.getElementById("practiceArea");

  let filteredData = [];
  let currentIndex = 0;
  let selectedLevels = [];

  // Compact dropdown container for level selection
  const levelDropdownContainer = document.createElement("div");
  levelDropdownContainer.className = "dropdown-buttons";
  levelDropdownContainer.id = "levelDropdownContainer";
  levelDropdownContainer.style.display = "none";

  const levelSelect = document.createElement("div");
  levelSelect.className = "custom-dropdown";
  levelSelect.id = "levelSelectContainer";

  const dropdownHeader = document.createElement("div");
  dropdownHeader.className = "dropdown-header-1";
  dropdownHeader.id = "dropdownHeader";
  dropdownHeader.textContent = "Select Level(s)";
  levelSelect.appendChild(dropdownHeader);

  const dropdownOptions = document.createElement("div");
  dropdownOptions.className = "dropdown-options hidden";
  dropdownOptions.id = "dropdownOptions";

  const levels = ["All", "A1", "A2", "B1", "B2", "C1", "C2"];
  levels.forEach(level => {
    const label = document.createElement("label");
    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.value = level.toLowerCase();
    cb.name = "levelCheckbox";
    label.appendChild(cb);
    label.append(` ${level}`);
    dropdownOptions.appendChild(label);
  });

  levelSelect.appendChild(dropdownOptions);
  levelDropdownContainer.appendChild(levelSelect);

  const secondStartBtn = document.createElement("button");
  secondStartBtn.id = "startAfterLevelSelect";
  secondStartBtn.textContent = "Start";
  secondStartBtn.style.display = "none";
  levelDropdownContainer.appendChild(secondStartBtn);

  practiceArea.parentNode.insertBefore(levelDropdownContainer, practiceArea);

  const levelCheckboxes = dropdownOptions.querySelectorAll("input[type='checkbox']");

  dropdownHeader.addEventListener("click", () => {
    dropdownOptions.classList.toggle("hidden");
  });

  document.addEventListener("click", (e) => {
    if (!dropdownHeader.contains(e.target) && !dropdownOptions.contains(e.target)) {
      dropdownOptions.classList.add("hidden");
    }
  });

  levelCheckboxes.forEach(cb => {
    cb.addEventListener("change", () => {
      const allBox = Array.from(levelCheckboxes).find(c => c.value === "all");
      const others = Array.from(levelCheckboxes).filter(c => c.value !== "all");

      if (cb.value === "all") {
        const allChecked = others.every(c => c.checked);
        others.forEach(c => c.checked = !allChecked);
      } else {
        if (!cb.checked) allBox.checked = false;
        else if (others.every(c => c.checked)) allBox.checked = true;
      }

      selectedLevels = Array.from(levelCheckboxes)
        .filter(c => c.checked && c.value !== "all")
        .map(c => c.value.toUpperCase());

      dropdownHeader.textContent = selectedLevels.length === 0
        ? "Select Level(s)"
        : selectedLevels.length === others.length
          ? "All"
          : selectedLevels.join(", ");
    });
  });

  loadButton.addEventListener("click", () => {
    const selectedSources = Array.from(checkboxes)
      .filter(cb => cb.checked)
      .map(cb => cb.value);

    if (selectedSources.length === 0) {
      alert("Please select at least one topic.");
      return;
    }

    if (selectedSources.includes("Vokabular")) {
      levelDropdownContainer.style.display = "flex";
      secondStartBtn.style.display = "inline-block";
      return;
    } else {
      levelDropdownContainer.style.display = "none";
      secondStartBtn.style.display = "none";
    }

    startPractice(selectedSources, []);
  });

  secondStartBtn.addEventListener("click", () => {
    selectedLevels = Array.from(levelCheckboxes)
      .filter(c => c.checked && c.value !== "all")
      .map(c => c.value.toUpperCase());

    if (selectedLevels.length === 0) {
      alert("Please select at least one level from the dropdown.");
      return;
    }

    const selectedSources = Array.from(checkboxes)
      .filter(cb => cb.checked)
      .map(cb => cb.value);

    startPractice(selectedSources, selectedLevels);
  });

function startPractice(selectedSources, selectedLevels) {
  const vocabData = window.vocabData || [];

  const data = vocabData.filter(row =>
    selectedSources.includes((row["Topic"] || row["SheetName"] || "Vokabular").trim()) &&
    (selectedSources.includes("Vokabular") ? selectedLevels.includes((row["Level"] || "").trim().toUpperCase()) : true)
  );

  if (data.length > 0) {
    filteredData = data.sort(() => 0.5 - Math.random());  // Shuffle like in script.js
    currentIndex = 0;
    renderPracticeFlashcard(filteredData[currentIndex]);
  } else {
    practiceArea.innerHTML = "No data loaded.";
  }

  levelDropdownContainer.style.display = "none";
  secondStartBtn.style.display = "none";
}


function renderPracticeFlashcard(entry) {
  practiceArea.innerHTML = "";

  const container = document.createElement("div");
  container.className = "flashcard-container";

  const card = document.createElement("div");
  card.className = "flashcard";

  const table = document.createElement("table");
  table.className = "flashcard-table";

  const columns = [
    "Level", "Article, Word and Plural", "Part of Speech", "Meaning", "Usage",
    "Past (Präteritum)", "Perfect (Partizip II)", "Plusquamperfekt",
    "Futur I", "Futur II",
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

      // Handle "Meaning" and "Usage" specifically for blanks
      if (col === "Meaning") {
                const correctPhrase = value.trim(); // For "Meaning", blank the whole phrase.
                const blankId = `${col.toLowerCase()}_blank_${Math.random().toString(36).substr(2, 6)}`;
                const options = generateOptions(correctPhrase, window.vocabData || [], col);
              
                td.innerHTML = `
                  <span class="blank-line" style="display: inline-block; min-width: 150px;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
                  <br>${createOptionsHTML(blankId, correctPhrase, options)}
                `;
              } else if (col === "Usage") {
                const words = value.split(/\s+/);  // For "Usage", only one word is blanked.
                const randomIndex = Math.floor(Math.random() * words.length);
                const correctWord = words[randomIndex];
                const blankId = `${col.toLowerCase()}_blank_${Math.random().toString(36).substr(2, 6)}`;
                const options = generateOptions(correctWord, window.vocabData || [], col);
              
                words[randomIndex] = `<span class="blank-line">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>`;
                td.innerHTML = `${words.join(" ")}<br>${createOptionsHTML(blankId, correctWord, options)}`;
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
  prevBtn.style.display = currentIndex === 0 ? "none" : "inline-block";
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

  practiceArea.appendChild(container);

  submitBtn.addEventListener("click", () => {
    const selected = document.querySelectorAll("input[type='radio']:checked");
    let correct = 0;

    selected.forEach(input => {
      const answerCell = input.closest('td');  // The cell containing the answer
      const correctWord = input.dataset.correct === "true";
      
      // Show the result (green tick or red cross)
      const resultIcon = document.createElement('span');
      resultIcon.textContent = correctWord ? '✅' : '❌';
      resultIcon.style.color = correctWord ? 'green' : 'red';
      
      // Append the result icon next to the radio input
      input.parentNode.appendChild(resultIcon);

      // Display the correct answer if the user is wrong
      if (!correctWord) {
        const correctAnswerSpan = document.createElement('span');
        correctAnswerSpan.textContent = ` Correct: ${input.dataset.correctAnswer}`;
        correctAnswerSpan.style.color = 'blue';
        answerCell.appendChild(correctAnswerSpan);
      }

      if (correctWord) correct++;
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
      .map(value => value.trim())
      .filter(phrase => phrase !== correctWord);  // Exclude the correct word
  
    // Get individual words from the phrases
    const allWords = wordsFromSameColumn.flatMap(phrase => phrase.split(/\s+/));
  
    // Select 3 random words from the available options (excluding the correct word)
    const incorrectWords = Array.from(new Set(allWords))
      .sort(() => 0.5 - Math.random())  // Shuffle
      .slice(0, 3);  // Select 3 words randomly
  
    // Return a mix of incorrect options and the correct word
    return [...incorrectWords, correctWord].sort(() => 0.5 - Math.random());
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
