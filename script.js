document.addEventListener("DOMContentLoaded", function () {
  const calendarBody = document.getElementById("calendarBody");
  const currentMonthLabel = document.getElementById("currentMonth");
  let today = new Date();
  let currentYear = today.getFullYear();
  let currentMonth = today.getMonth(); // 0-indexed

  function generateCalendar(year, month) {
    calendarBody.innerHTML = "";
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    currentMonthLabel.textContent = monthNames[month] + " " + year;

    // Get first day and number of days in month
    let firstDay = new Date(year, month, 1).getDay();
    let daysInMonth = new Date(year, month + 1, 0).getDate();

    // Create blank cells for days before the first day
    for (let i = 0; i < firstDay; i++) {
      let blankDiv = document.createElement("div");
      blankDiv.classList.add("day-bubble", "empty");
      calendarBody.appendChild(blankDiv);
    }

    // Create day bubbles
    for (let d = 1; d <= daysInMonth; d++) {
      let dayDiv = document.createElement("div");
      dayDiv.classList.add("day-bubble");
      dayDiv.textContent = d;
      // Store ISO date string for potential saving
      dayDiv.dataset.date = new Date(year, month, d).toISOString();
      dayDiv.addEventListener("click", function (e) {
        e.stopPropagation();
        // Toggle inline mood entry panel
        if (dayDiv.querySelector(".mood-entry-panel")) {
          dayDiv.querySelector(".mood-entry-panel").remove();
        } else {
          closeAllPanels();
          createMoodEntryPanel(dayDiv, year, month, d);
        }
      });
      calendarBody.appendChild(dayDiv);
    }
  }

  function closeAllPanels() {
    document.querySelectorAll(".mood-entry-panel").forEach(panel => panel.remove());
  }

  // Close panels when clicking outside
  document.addEventListener("click", function () {
    closeAllPanels();
  });

  // Create the inline panel for mood entry
  function createMoodEntryPanel(dayDiv, year, month, day) {
    let panel = document.createElement("div");
    panel.classList.add("mood-entry-panel");
    panel.addEventListener("click", function (e) {
      e.stopPropagation();
    });

    // Header with date info
    let header = document.createElement("div");
    header.classList.add("panel-header");
    header.textContent = "Date: " + (month + 1) + "/" + day + "/" + year;
    panel.appendChild(header);

    // Time-of-day selection
    let timeLabel = document.createElement("div");
    timeLabel.textContent = "Select Time:";
    panel.appendChild(timeLabel);

    let timeContainer = document.createElement("div");
    timeContainer.classList.add("time-options");
    const times = ["Morning", "Afternoon", "Evening", "Night"];
    times.forEach(time => {
      let btn = document.createElement("button");
      btn.textContent = time;
      btn.classList.add("time-btn");
      btn.addEventListener("click", function () {
        // Mark the selected button
        timeContainer.querySelectorAll(".time-btn").forEach(b => b.classList.remove("selected"));
        btn.classList.add("selected");
        // Show mood color options if not already added
        if (!panel.querySelector(".mood-colors")) {
          createMoodColorOptions(panel);
        }
      });
      timeContainer.appendChild(btn);
    });
    panel.appendChild(timeContainer);

    dayDiv.appendChild(panel);
  }

  function createMoodColorOptions(panel) {
    let colorsContainer = document.createElement("div");
    colorsContainer.classList.add("mood-colors");
    // Define mood options with colors
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
        // Mark selected color
        colorsContainer.querySelectorAll(".color-option").forEach(c => c.classList.remove("selected"));
        colorDiv.classList.add("selected");
        // Show reason input if not already present
        if (!panel.querySelector(".reason-input")) {
          createReasonInput(panel);
        }
      });
      colorsContainer.appendChild(colorDiv);
    });
    panel.appendChild(colorsContainer);
  }

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
      // Get selected time and mood
      const selectedTime = panel.querySelector(".time-btn.selected")?.textContent;
      const selectedMood = panel.querySelector(".color-option.selected")?.dataset.mood;
      const reason = textarea.value;
      const date = panel.closest(".day-bubble").dataset.date;

      // Create mood entry object
      const moodEntry = {
        date: date,
        time: selectedTime,
        mood: selectedMood,
        reason: reason
      };

      // Save to localStorage
      saveMoodEntry(moodEntry);
      
      // Update visual feedback
      const dayBubble = panel.closest(".day-bubble");
      const selectedColor = panel.querySelector(".color-option.selected").style.backgroundColor;
      dayBubble.style.backgroundColor = selectedColor;
      
      closeAllPanels();
    });
    reasonDiv.appendChild(saveBtn);

    panel.appendChild(reasonDiv);
  }

  function saveMoodEntry(moodEntry) {
    // Get existing entries or initialize empty array
    let moodEntries = JSON.parse(localStorage.getItem("moodEntries") || "[]");
    
    // Add new entry
    moodEntries.push(moodEntry);
    
    // Save back to localStorage
    localStorage.setItem("moodEntries", JSON.stringify(moodEntries));
  }

  function loadMoodEntries() {
    const moodEntries = JSON.parse(localStorage.getItem("moodEntries") || "[]");
    moodEntries.forEach(entry => {
      const date = new Date(entry.date);
      const dayBubble = document.querySelector(`.day-bubble[data-date="${entry.date}"]`);
      if (dayBubble) {
        const mood = entry.mood;
        const moods = {
          "stressed": "#9F58B0",
          "sad": "#8C9EFF",
          "angry": "#FF5A5F",
          "anxiety": "#FFA500",
          "depressed": "#4C4CFF",
          "lonely": "#999999"
        };
        dayBubble.style.backgroundColor = moods[mood];
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

  // Reset calendar button
  document.getElementById("resetCalendar").addEventListener("click", function (e) {
    e.stopPropagation();
    currentYear = today.getFullYear();
    currentMonth = today.getMonth();
    generateCalendar(currentYear, currentMonth);
    loadMoodEntries();
  });

  // Initial calendar render
  generateCalendar(currentYear, currentMonth);
  loadMoodEntries();
});
