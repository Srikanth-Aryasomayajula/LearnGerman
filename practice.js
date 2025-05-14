document.addEventListener("DOMContentLoaded", () => {
  const loadButton = document.getElementById("loadPracticeBtn");
  const checkboxes = document.querySelectorAll("#sourceSelector input[type='checkbox']");
  const practiceArea = document.getElementById("practiceArea");

  let filteredData = [];
  let currentIndex = 0;
  let selectedLevels = [];

  // Create level dropdown
  const levelDropdownContainer = document.createElement("div");
  levelDropdownContainer.id = "levelDropdownContainer";
  levelDropdownContainer.style.display = "none";

  const dropdownHeader = document.createElement("div");
  dropdownHeader.id = "dropdownHeader";
  dropdownHeader.className = "dropdown-header";
  dropdownHeader.textContent = "Select Level(s)";
  levelDropdownContainer.appendChild(dropdownHeader);

  const dropdownOptions = document.createElement("div");
  dropdownOptions.id = "dropdownOptions";
  dropdownOptions.className = "dropdown-options hidden";
  levelDropdownContainer.appendChild(dropdownOptions);

  const levels = ["all", "A1", "A2", "B1", "B2", "C1", "C2"];
  levels.forEach(level => {
    const label = document.createElement("label");
    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.value = level;
    label.appendChild(cb);
    label.append(` ${level}`);
    dropdownOptions.appendChild(label);
  });

  // Add second "Start Practice" button after dropdown
  const secondStartBtn = document.createElement("button");
  secondStartBtn.id = "startAfterLevelSelect";
  secondStartBtn.textContent = "Start Practice";
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
      const isAll = cb.value === "all";
      const rest = Array.from(levelCheckboxes).filter(c => c.value !== "all");

      if (isAll) {
        const allChecked = rest.every(c => c.checked);
        levelCheckboxes.forEach(c => c.checked = !allChecked);
      } else {
        if (!cb.checked) levelCheckboxes[0].checked = false;
        else if (rest.every(c => c.checked)) levelCheckboxes[0].checked = true;
      }

      selectedLevels = Array.from(levelCheckboxes)
        .filter(c => c.checked)
        .map(c => c.value)
        .filter(l => l !== "all");

      dropdownHeader.textContent = selectedLevels.length === 0
        ? "Select Level(s)"
        : selectedLevels.length === rest.length
          ? "All"
          : selectedLevels.join(", ");
    });
  });

  // First Start Practice button (main flow trigger)
  loadButton.addEventListener("click", () => {
    const selectedSources = Array.from(checkboxes)
      .filter(cb => cb.checked)
      .map(cb => cb.value);

    if (selectedSources.length === 0) {
      alert("Please select at least one topic.");
      return;
    }

    if (selectedSources.includes("Vokabular")) {
      levelDropdownContainer.style.display = "block";
      secondStartBtn.style.display = "inline-block";
      return; // Wait for user to click second start button
    } else {
      levelDropdownContainer.style.display = "none";
      secondStartBtn.style.display = "none";
    }

    startPractice(selectedSources, []); // No levels needed if not Vokabular
  });

  // Second Start Practice button (after level selection)
  secondStartBtn.addEventListener("click", () => {
    selectedLevels = Array.from(levelCheckboxes)
      .filter(c => c.checked)
      .map(c => c.value)
      .filter(l => l !== "all");

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

    filteredData = vocabData.filter(row =>
      selectedSources.includes((row["Topic"] || row["SheetName"] || "Vokabular").trim()) &&
      (selectedSources.includes("Vokabular") ? selectedLevels.includes((row["Level"] || "").trim()) : true)
    );

    if (filteredData.length > 0) {
      currentIndex = 0;
      renderPracticeFlashcard(filteredData[currentIndex]);
    } else {
      practiceArea.innerHTML = "No data loaded.";
    }

    // Hide level selector and second button after practice starts
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

        if (col === "Meaning" || col === "Usage") {
          const words = value.split(/\s+/);
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

    practiceArea.innerHTML = "";
    practiceArea.appendChild(container);

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
