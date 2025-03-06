document.addEventListener("DOMContentLoaded", function () {
  const calendarBody = document.getElementById("calendarBody");
  const currentMonthLabel = document.getElementById("currentMonth");
  let today = new Date();
  let currentYear = today.getFullYear();
  let currentMonth = today.getMonth();

  // Generate the calendar for a given month and year
  function generateCalendar(year, month) {
    calendarBody.innerHTML = "";
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    currentMonthLabel.textContent = `${monthNames[month]} ${year}`;

    // Determine the first day and number of days in the month
    let firstDay = new Date(year, month, 1).getDay();
    let daysInMonth = new Date(year, month + 1, 0).getDate();

    // Create blank cells for days before the first day of the month
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
      dayDiv.dataset.date = new Date(year, month, d).toISOString().split('T')[0];
      dayDiv.addEventListener("click", function (e) {
        e.stopPropagation();
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

  // Smoothly close a single mood entry panel
  function closePanel(panel) {
    if (panel) {
      panel.classList.remove("active");
      setTimeout(() => panel.remove(), 300);
    }
  }

  // Close all open mood entry panels
  function closeAllPanels() {
    document.querySelectorAll(".mood-entry-panel").forEach(panel => {
      closePanel(panel);
    });
  }

  // Create and append the mood entry panel to the clicked day bubble
  function createMoodEntryPanel(dayDiv, year, month, day) {
    let panel = document.createElement("div");
    panel.classList.add("mood-entry-panel");
    panel.innerHTML = `
      <div class="panel-header">Date: ${month + 1}/${day}/${year}</div>
      <div>Select Time:</div>
      <div class="time-options">
        ${["Morning", "Afternoon", "Evening", "Night"].map(time => `<button class="time-btn">${time}</button>`).join('')}
      </div>
      <div class="mood-colors">
        ${[
          { name: "stressed", color: "#9F58B0" },
          { name: "sad", color: "#003d82" },
          { name: "angry", color: "#FF5A5F" },
          { name: "anxiety", color: "#FFA500" },
          { name: "depressed", color: "#4C4CFF" },
          { name: "lonely", color: "#999999" }
        ].map(mood => `<div class="color-option" data-mood="${mood.name}" style="background-color:${mood.color}"></div>`).join('')}
      </div>
      <div class="reason-input">
        <textarea placeholder="Why do you feel this way?"></textarea>
        <button class="save-btn">Save</button>
      </div>`;

    // Add event listeners for time selection buttons
    panel.querySelectorAll('.time-btn').forEach(btn => {
      btn.onclick = () => {
        panel.querySelectorAll('.time-btn').forEach(b => b.classList.remove("selected"));
        btn.classList.add("selected");
      };
    });

    // Add event listeners for mood color options
    panel.querySelectorAll('.color-option').forEach(option => {
      option.onclick = () => {
        panel.querySelectorAll('.color-option').forEach(o => o.classList.remove("selected"));
        option.classList.add("selected");
      };
    });

    // Add event listener for the Save button
    panel.querySelector('.save-btn').onclick = () => {
      const selectedTime = panel.querySelector(".time-btn.selected")?.textContent;
      const selectedMood = panel.querySelector(".color-option.selected")?.dataset.mood;
      const reason = panel.querySelector("textarea").value.trim();
      const date = dayDiv.dataset.date;

      if (!selectedTime || !selectedMood || !reason) {
        alert("Please fill in all fields before saving.");
        return;
      }

      saveMoodEntry({ date, time: selectedTime, mood: selectedMood, reason });
      // Update the day bubble's background color to the selected mood color
      dayDiv.style.backgroundColor = panel.querySelector(".color-option.selected").style.backgroundColor;
      closeAllPanels();
    };

    dayDiv.appendChild(panel);
    // Activate the panel after a slight delay for a smooth transition
    setTimeout(() => panel.classList.add("active"), 10);
  }

  // Save mood entry data in localStorage
  function saveMoodEntry(entry) {
    let moodEntries = JSON.parse(localStorage.getItem("moodEntries") || "[]");
    // Remove any existing entry for the same date and time
    moodEntries = moodEntries.filter(e => !(e.date === entry.date && e.time === entry.time));
    moodEntries.push(entry);
    localStorage.setItem("moodEntries", JSON.stringify(moodEntries));
  }

  // Load saved mood entries and update day bubbles accordingly
  function loadMoodEntries() {
    const moodEntries = JSON.parse(localStorage.getItem("moodEntries") || "[]");
    const moods = {
      stressed: "#9F58B0",
      sad: "#003d82",
      angry: "#FF5A5F",
      anxiety: "#FFA500",
      depressed: "#4C4CFF",
      lonely: "#999999"
    };
    document.querySelectorAll(".day-bubble").forEach(bubble => {
      if (!bubble.classList.contains("empty")) {
        const entry = moodEntries.filter(e => e.date === bubble.dataset.date).pop();
        if (entry) bubble.style.backgroundColor = moods[entry.mood];
      }
    });
  }

  // Month navigation: previous month
  document.getElementById("prevMonth").onclick = () => {
    currentMonth = (currentMonth - 1 + 12) % 12;
    currentYear -= currentMonth === 11 ? 1 : 0;
    generateCalendar(currentYear, currentMonth);
    loadMoodEntries();
  };

  // Month navigation: next month
  document.getElementById("nextMonth").onclick = () => {
    currentMonth = (currentMonth + 1) % 12;
    currentYear += currentMonth === 0 ? 1 : 0;
    generateCalendar(currentYear, currentMonth);
    loadMoodEntries();
  };

  // Close any open panels when clicking outside
  document.addEventListener("click", closeAllPanels);

  // Initial render of calendar and mood entries
  generateCalendar(currentYear, currentMonth);
  loadMoodEntries();
});
