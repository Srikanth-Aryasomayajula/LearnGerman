document.addEventListener("DOMContentLoaded", () => {
  const loadButton = document.getElementById("loadPracticeBtn");
  const checkboxes = document.querySelectorAll("#sourceSelector input[type='checkbox']");
  const practiceArea = document.getElementById("practiceArea");

  let filteredData = [];
  let currentIndex = 0;
  let selectedLevels = [];

  const levelDropdownContainer = createLevelDropdown();
  practiceArea.parentNode.insertBefore(levelDropdownContainer, practiceArea);

  const levelCheckboxes = levelDropdownContainer.querySelectorAll("input[type='checkbox']");
  const dropdownHeader = levelDropdownContainer.querySelector(".dropdown-header-1");
  const dropdownOptions = levelDropdownContainer.querySelector(".dropdown-options");
  const secondStartBtn = levelDropdownContainer.querySelector("#startAfterLevelSelect");

  setupDropdownToggle(dropdownHeader, dropdownOptions);
  setupLevelCheckboxes(levelCheckboxes, dropdownHeader);

  loadButton.addEventListener("click", () => {
    const selectedSources = getSelectedValues(checkboxes);
    if (selectedSources.length === 0) return alert("Please select at least one topic.");

    if (selectedSources.includes("Vokabular")) {
      levelDropdownContainer.style.display = "flex";
      secondStartBtn.style.display = "inline-block";
    } else {
      levelDropdownContainer.style.display = "none";
      secondStartBtn.style.display = "none";
      startPractice(selectedSources, []);
    }
  });

  secondStartBtn.addEventListener("click", () => {
    selectedLevels = getSelectedLevels(levelCheckboxes);
    if (selectedLevels.length === 0) return alert("Please select at least one level.");
    const selectedSources = getSelectedValues(checkboxes);
    startPractice(selectedSources, selectedLevels);
  });

  function createLevelDropdown() {
    const container = document.createElement("div");
    container.className = "dropdown-buttons";
    container.id = "levelDropdownContainer";
    container.style.display = "none";

    const dropdown = document.createElement("div");
    dropdown.className = "custom-dropdown";
    dropdown.id = "levelSelectContainer";

    const header = document.createElement("div");
    header.className = "dropdown-header-1";
    header.id = "dropdownHeader";
    header.textContent = "Select Level(s)";
    dropdown.appendChild(header);

    const options = document.createElement("div");
    options.className = "dropdown-options hidden";
    options.id = "dropdownOptions";

    const levels = ["All", "A1", "A2", "B1", "B2", "C1", "C2"];
    levels.forEach(level => {
      const label = document.createElement("label");
      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.value = level.toLowerCase();
      cb.name = "levelCheckbox";
      label.appendChild(cb);
      label.append(` ${level}`);
      options.appendChild(label);
    });

    dropdown.appendChild(options);
    container.appendChild(dropdown);

    const startBtn = document.createElement("button");
    startBtn.id = "startAfterLevelSelect";
    startBtn.textContent = "Start";
    startBtn.style.display = "none";
    container.appendChild(startBtn);

    return container;
  }

  function setupDropdownToggle(header, options) {
    header.addEventListener("click", () => {
      options.classList.toggle("hidden");
    });

    document.addEventListener("click", (e) => {
      if (!header.contains(e.target) && !options.contains(e.target)) {
        options.classList.add("hidden");
      }
    });
  }

  function setupLevelCheckboxes(checkboxes, header) {
    checkboxes.forEach(cb => {
      cb.addEventListener("change", () => {
        const allBox = Array.from(checkboxes).find(c => c.value === "all");
        const others = Array.from(checkboxes).filter(c => c.value !== "all");

        if (cb.value === "all") {
          const allChecked = others.every(c => c.checked);
          others.forEach(c => c.checked = !allChecked);
        } else {
          if (!cb.checked) allBox.checked = false;
          else if (others.every(c => c.checked)) allBox.checked = true;
        }

        const selected = Array.from(checkboxes)
          .filter(c => c.checked && c.value !== "all")
          .map(c => c.value.toUpperCase());

        header.textContent = selected.length === 0
          ? "Select Level(s)"
          : selected.length === others.length
            ? "All"
            : selected.join(", ");
      });
    });
  }

  function getSelectedValues(checkboxes) {
    return Array.from(checkboxes)
      .filter(cb => cb.checked)
      .map(cb => cb.value);
  }

  function getSelectedLevels(checkboxes) {
    return Array.from(checkboxes)
      .filter(cb => cb.checked && cb.value !== "all")
      .map(cb => cb.value.toUpperCase());
  }

  function startPractice(selectedSources, selectedLevels) {
    const vocabData = window.vocabData || [];

    const data = vocabData.filter(row =>
      selectedSources.includes((row["Topic"] || row["SheetName"] || "Vokabular").trim()) &&
      (selectedSources.includes("Vokabular") ? selectedLevels.includes((row["Level"] || "").trim().toUpperCase()) : true)
    );

    if (data.length > 0) {
      filteredData = data.sort(() => 0.5 - Math.random());
      currentIndex = 0;
      renderPracticeFlashcard(filteredData[currentIndex]);
    } else {
      practiceArea.innerHTML = "No data loaded.";
    }

    levelDropdownContainer.style.display = "none";
    secondStartBtn.style.display = "none";
  }
});
