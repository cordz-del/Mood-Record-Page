document.addEventListener('DOMContentLoaded', () => {
  // Local Storage key
  const STORAGE_KEY = 'amieMoodLogs';

  // --- Calendar Elements ---
  const calendarGrid = document.getElementById('calendarGrid');
  const currentMonthEl = document.getElementById('currentMonth');
  const prevMonthBtn = document.getElementById('prevMonth');
  const nextMonthBtn = document.getElementById('nextMonth');

  // --- Modal Elements for Calendar Mood Logging ---
  const moodEntryModal = document.getElementById('moodEntryModal');
  const modalDateEl = document.getElementById('modalDate');
  const modalMoodBtns = moodEntryModal.querySelectorAll('.mood-btn');
  const moodReasonField = document.getElementById('moodReason');
  const saveCalendarMoodBtn = document.getElementById('saveCalendarMood');
  const cancelCalendarMoodBtn = document.getElementById('cancelCalendarMood');

  // --- Chart Element ---
  const moodChartCtx = document.getElementById('moodChart').getContext('2d');
  let moodChart;

  // --- Other Elements ---
  const moodLogContainer = document.getElementById('mood-log');

  // Define mood colors (updated from Amie-Skills)
  const moodColors = {
    stressed: '#9F58B0',
    sad: '#003d82',
    angry: '#FF4500',       // Updated to Warm Orange-Red
    anxiety: '#FFA500',
    depressed: '#002147',   // Representative color; calendar cells for depressed use gradient
    lonely: '#999999'
  };

  // Global variables for calendar view and modal selection
  let currentYear = new Date().getFullYear();
  let currentMonth = new Date().getMonth(); // 0-indexed
  let selectedDate = null; // Format: YYYY-MM-DD
  let modalSelectedMood = null;

  // -------------------------
  // Calendar Generation
  // -------------------------
  function generateCalendar(year, month) {
    calendarGrid.innerHTML = '';
    const monthNames = ["January", "February", "March", "April", "May", "June",
                        "July", "August", "September", "October", "November", "December"];
    currentMonthEl.textContent = `${monthNames[month]} ${year}`;
    
    // Determine the first day index and days in the month
    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Add blank cells for days before the first day of the month
    for (let i = 0; i < firstDayIndex; i++) {
      const blankCell = document.createElement('div');
      blankCell.className = 'day-cell empty';
      calendarGrid.appendChild(blankCell);
    }
    
    // Create cells for each day
    for (let day = 1; day <= daysInMonth; day++) {
      const dayCell = document.createElement('div');
      dayCell.className = 'day-cell';
      dayCell.textContent = day;
      const dateStr = new Date(year, month, day).toISOString().split('T')[0];
      dayCell.dataset.date = dateStr;
      dayCell.addEventListener('click', () => openMoodModal(dateStr));
      calendarGrid.appendChild(dayCell);
    }
    // Update visual highlights on the calendar based on logged moods
    updateCalendarHighlights();
  }

  // -------------------------
  // Modal Functions
  // -------------------------
  function openMoodModal(dateStr) {
    selectedDate = dateStr;
    modalDateEl.textContent = dateStr;
    moodEntryModal.classList.remove('hidden');
    // Reset modal selections
    modalMoodBtns.forEach(btn => btn.classList.remove('selected'));
    modalSelectedMood = null;
    moodReasonField.value = '';
  }

  function closeMoodModal() {
    moodEntryModal.classList.add('hidden');
  }

  // Attach event listeners for modal mood buttons
  modalMoodBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      modalMoodBtns.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      modalSelectedMood = btn.dataset.mood;
    });
  });

  // Save mood entry from modal
  saveCalendarMoodBtn.addEventListener('click', () => {
    if (!modalSelectedMood) {
      alert('Please select a mood.');
      return;
    }
    // Check if already two logs exist for the selected day
    let moodLogs = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const logsForDay = moodLogs.filter(entry => entry.date === selectedDate);
    if (logsForDay.length >= 2) {
      alert('You can only log your mood twice a day.');
      return;
    }
    const newEntry = {
      date: selectedDate,
      mood: modalSelectedMood,
      reason: moodReasonField.value.trim(),
      timestamp: new Date().toISOString()
    };
    moodLogs.push(newEntry);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(moodLogs));
    closeMoodModal();
    renderMoodHistory();
    renderChart();
    updateCalendarHighlights();
  });

  // Cancel button for modal
  cancelCalendarMoodBtn.addEventListener('click', () => {
    closeMoodModal();
  });

  // -------------------------
  // Calendar Highlights
  // -------------------------
  function updateCalendarHighlights() {
    let moodLogs = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    document.querySelectorAll('.day-cell').forEach(cell => {
      if (cell.classList.contains('empty')) return;
      const cellDate = cell.dataset.date;
      const logsForDay = moodLogs.filter(entry => entry.date === cellDate);
      if (logsForDay.length > 0) {
        // Use the mood color of the latest entry
        const latestEntry = logsForDay[logsForDay.length - 1];
        if (latestEntry.mood === 'depressed') {
          cell.style.background = 'linear-gradient(45deg, #002147, #3B4252)';
        } else {
          cell.style.backgroundColor = moodColors[latestEntry.mood] || '';
        }
      } else {
        cell.style.backgroundColor = '';
        cell.style.background = '';
      }
    });
  }

  // -------------------------
  // Mood History Rendering
  // -------------------------
  function renderMoodHistory() {
    moodLogContainer.innerHTML = '';
    let moodLogs = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    // Sort so newest entries appear first
    moodLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    moodLogs.forEach(log => {
      const card = document.createElement('div');
      card.className = 'mood-card';
      const dateObj = new Date(log.timestamp);
      const dateString = dateObj.toLocaleString([], {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      card.innerHTML = `
        <div class="card-time">${dateString}</div>
        <div class="card-mood">${log.date} - ${log.mood}</div>
        <div class="card-notes">${log.reason || ''}</div>
      `;
      moodLogContainer.appendChild(card);
    });
  }

  // -------------------------
  // Chart.js Rendering
  // -------------------------
  function renderChart() {
    let moodLogs = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    // Map moods to numeric values (example: stressed:5, sad:4, angry:3, anxiety:2, depressed:1, lonely:0)
    const moodValueMap = {
      stressed: 5,
      sad: 4,
      angry: 3,
      anxiety: 2,
      depressed: 1,
      lonely: 0
    };
    // Sort logs chronologically
    moodLogs.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    const labels = moodLogs.map(log => {
      const d = new Date(log.timestamp);
      return d.toLocaleDateString([], { month: 'short', day: 'numeric' }) +
             ` (${log.date})`;
    });
    const dataValues = moodLogs.map(log => moodValueMap[log.mood]);
    if (moodChart) moodChart.destroy();
    moodChart = new Chart(moodChartCtx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Mood Intensity',
          data: dataValues,
          fill: false,
          borderColor: '#0056b3',
          backgroundColor: '#0056b3',
          tension: 0.3,
          pointBackgroundColor: moodLogs.map(log => moodColors[log.mood] || '#0056b3'),
          pointRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            max: 5,
            ticks: {
              stepSize: 1,
              callback: (value) => {
                switch(value) {
                  case 5: return 'Stressed';
                  case 4: return 'Sad';
                  case 3: return 'Angry';
                  case 2: return 'Anxiety';
                  case 1: return 'Depressed';
                  case 0: return 'Lonely';
                  default: return '';
                }
              }
            }
          }
        },
        plugins: {
          legend: { display: false }
        }
      }
    });
  }

  // -------------------------
  // Calendar Navigation
  // -------------------------
  prevMonthBtn.addEventListener('click', () => {
    currentMonth--;
    if (currentMonth < 0) {
      
