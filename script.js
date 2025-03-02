document.addEventListener("DOMContentLoaded", function () {
  const calendarBody = document.getElementById("calendarBody");
  const currentMonthLabel = document.getElementById("currentMonth");
  let today = new Date();
  let currentYear = today.getFullYear();
  let currentMonth = today.getMonth(); // 0-indexed

  // Generates the calendar for a given month/year
  function generateCalendar(year, month) {
    calendarBody.innerHTML = "";
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    currentMonthLabel.textContent = `${monthNames[month]} ${year}`;

    // Determine the starting day and total days in month
    let firstDay = new Date(year, month, 1).getDay();
    let daysInMonth = new Date(year, month + 1, 0).getDate();

    // Create blank cells for days before the first day
    for (let i = 0; i < firstDay; i++) {
      let blankDiv = document.createElement("div");
      blankDiv.classList.add("day-bubble", "empty");
      calendarBody.appendChild(blankDiv);
    }

    // Create day bubbles with click events to open the mood entry panel
    for (let d = 1; d <= daysInMonth; d++) {
      let dayDiv = document.createElement("div");
      dayDiv.classList.add("day-bubble");
      dayDiv.textContent = d;
      dayDiv.dataset.date = new Date(year, month, d).toISOString();
      dayDiv.addEventListener("click", function (e) {
        e.stopPropagation();
        // If a panel already exists, close it; otherwise, create a new one
        if (dayDiv.querySelector(".mood-entry-panel")) {
          closePanel(dayDiv.querySelector(".mood-entry-panel"));
        } else {
          closeAllPanels();
          createMoodEntryPanel(dayDiv, year, month, d);
        }
      });
      calendarBody.appendChild(dayDiv);
    }
  }

  // Smoothly close a single panel with fade-out animation
  function closePanel(panel) {
    if (panel) {
      panel.classList.remove("active");
      setTimeout(() => panel.remove(), 300); // Remove after animation duration
    }
  }

  // Close all open mood panels
  function closeAllPanels() {
    document.querySelectorAll(".mood-entry-panel").forEach(panel => {
      panel.classList.remove("active");
      setTimeout(() => panel.remove(), 300);
    });
  }

  // Clicking anywhere outside closes any open panel
  document.addEventListener("click", function () {
    closeAllPanels();
  });

  // Creates and appends the mood entry panel to the clicked day bubble
  function createMoodEntryPanel(dayDiv, year, month, day) {
    let panel = document.createElement("div");
    panel.classList.add("mood-entry-panel");
    // Start hidden for smooth fade-in
    panel.style.opacity = "0";
    panel.addEventListener("click", function (e) {
      e.stopPropagation();
    });

    // Header displaying the selected date
    let header = document.createElement("div");
    header.classList.add("panel-header");
    header.textContent = `Date: ${month + 1}/${day}/${year}`;
    panel.appendChild(header);

    // Time selection label and options
    let timeLabel = document.createElement("div");
    timeLabel.textContent = "Select Time:";
    panel.appendChild(timeLabel);

    let timeContainer = document.createElement("div");
    timeContainer.classList.add("time-options");
    ["Morning", "Afternoon", "Evening", "Night"].forEach(time => {
      let btn = document.createElement("button");
      btn.textContent = time;
      btn.classList.add("time-btn");
      btn.addEventListener("click", function () {
        // Mark only the clicked time as selected
        timeContainer.querySelectorAll(".time-btn").forEach(b => b.classList.remove("selected"));
        btn.classList.add("selected");
        // Create mood color options if not already created
        if (!panel.querySelector(".mood-colors")) {
          createMoodColorOptions(panel);
        }
      });
      timeContainer.appendChild(btn);
    });
    panel.appendChild(timeContainer);

    dayDiv.appendChild(panel);
    // Trigger smooth fade-in by adding the "active" class after appending
    setTimeout(() => {
      panel.classList.add("active");
      panel.style.opacity = "1";
    }, 10);
  }

  // Creates the mood color options (six moods) for the panel
  function createMoodColorOptions(panel) {
    let colorsContainer = document.createElement("div");
    colorsContainer.classList.add("mood-colors");

    const moods = [
      { name: "stressed", color: "#9F58B0" },
      { name: "sad", color: "#8C9EFF" },
      { name: "angry", color: "#FF5A5F" },
      { name: "anxiety", color: "#FFA500" },
      { name: "depressed", color: "#4C4CFF" },
      { name: "lonely", color: "#999999" }
    ];

    moods.forEach(mood => {
      let colorDiv = document.createElement("div");
      colorDiv.classList.add("color-option");
      colorDiv.style.backgroundColor = mood.color;
      colorDiv.dataset.mood = mood.name;
      colorDiv.title = mood.name;
      colorDiv.addEventListener("click", function (e) {
        e.stopPropagation();
        // Highlight the selected mood color
        colorsContainer.querySelectorAll(".color-option").forEach(c => c.classList.remove("selected"));
        colorDiv.classList.add("selected");
        // Once a mood is selected, add the reason input if not already present
        if (!panel.querySelector(".reason-input")) {
          createReasonInput(panel);
        }
      });
      colorsContainer.appendChild(colorDiv);
    });
    panel.appendChild(colorsContainer);
  }

  // Creates the reason input area and Save button for the mood entry
  function createReasonInput(panel) {
    let reasonDiv = document.createElement("div");
    reasonDiv.classList.add("reason-input");

    let textarea = document.createElement("textarea");
    textarea.placeholder = "Why do you feel this way?";
    reasonDiv.appendChild(textarea);

    let saveBtn = document.createElement("button");
    saveBtn.textContent = "Save";
    saveBtn.classList.add("save-btn");
    saveBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      const selectedTime = panel.querySelector(".time-btn.selected")?.textContent;
      const selectedMood = panel.querySelector(".color-option.selected")?.dataset.mood;
      const reason = textarea.value;
      const date = panel.closest(".day-bubble").dataset.date;

      const moodEntry = {
        date: date,
        time: selectedTime,
        mood: selectedMood,
        reason: reason
      };

      saveMoodEntry(moodEntry);
      
      const dayBubble = panel.closest(".day-bubble");
      const selectedColor = panel.querySelector(".color-option.selected").style.backgroundColor;
      dayBubble.style.backgroundColor = selectedColor;
      
      // Optionally, add a brief "saved" animation on the day bubble
      dayBubble.classList.add("saved");
      setTimeout(() => dayBubble.classList.remove("saved"), 300);

      closeAllPanels();
    });
    reasonDiv.appendChild(saveBtn);

    panel.appendChild(reasonDiv);
  }

  // Save the mood entry in localStorage
  function saveMoodEntry(moodEntry) {
    let moodEntries = JSON.parse(localStorage.getItem("moodEntries") || "[]");
    moodEntries.push(moodEntry);
    localStorage.setItem("moodEntries", JSON.stringify(moodEntries));
  }

  // Load saved mood entries and update day bubbles accordingly
  function loadMoodEntries() {
    const moodEntries = JSON.parse(localStorage.getItem("moodEntries") || "[]");
    const moods = {
      "stressed": "#9F58B0",
      "sad": "#8C9EFF",
      "angry": "#FF5A5F",
      "anxiety": "#FFA500",
      "depressed": "#4C4CFF",
      "lonely": "#999999"
    };

    moodEntries.forEach(entry => {
      const dayBubble = document.querySelector(`.day-bubble[data-date="${entry.date}"]`);
      if (dayBubble) {
        dayBubble.style.backgroundColor = moods[entry.mood];
      }
    });
  }

  // Month navigation
  document.getElementById("prevMonth").addEventListener("click", function (e) {
    e.stopPropagation();
    currentMonth--;
    if (currentMonth < 0) {
      currentMonth = 11;
      currentYear--;
    }
    generateCalendar(currentYear, currentMonth);
    loadMoodEntries();
  });

  document.getElementById("nextMonth").addEventListener("click", function (e) {
    e.stopPropagation();
    currentMonth++;
    if (currentMonth > 11) {
      currentMonth = 0;
      currentYear++;
    }
    generateCalendar(currentYear, currentMonth);
    loadMoodEntries();
  });

  // Reset calendar button: returns to the current month and clears saved entries from view
  document.getElementById("resetCalendar").addEventListener("click", function (e) {
    e.stopPropagation();
    currentYear = today.getFullYear();
    currentMonth = today.getMonth();
    generateCalendar(currentYear, currentMonth);
    loadMoodEntries();
  });

  // Initial render
  generateCalendar(currentYear, currentMonth);
  loadMoodEntries();
});
