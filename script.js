document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements for mood logging
  const timeBtns = document.querySelectorAll('.time-btn');
  const moodBtns = document.querySelectorAll('.mood-btn');
  const notesField = document.getElementById('moodNotes');
  const saveMoodBtn = document.getElementById('saveMoodBtn');
  const moodLogContainer = document.getElementById('moodLog');
  const moodChartCanvas = document.getElementById('moodChart').getContext('2d');

  // Local Storage key to persist mood logs
  const STORAGE_KEY = 'amieMoodLogs';

  // Variables to track current selections
  let selectedTime = null;
  let selectedMood = null;

  // Define mood colors used for chart point coloring
  const moodColors = {
    stressed: '#9F58B0',
    sad: '#003d82',
    angry: '#FF5A5F',
    anxiety: '#FFA500',
    depressed: '#4C4CFF',
    lonely: '#999999'
  };

  // Event listeners for Time-of-Day buttons
  timeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      timeBtns.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedTime = btn.dataset.time;
    });
  });

  // Event listeners for Mood buttons
  moodBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      moodBtns.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedMood = btn.dataset.mood;
    });
  });

  // Save mood entry when user clicks the save button
  saveMoodBtn.addEventListener('click', () => {
    const notes = notesField.value.trim();

    // Validate that a time and a mood have been selected
    if (!selectedTime || !selectedMood) {
      alert('Please select both a time of day and a mood.');
      return;
    }

    // Build the mood entry object
    const newEntry = {
      timestamp: new Date().toISOString(),
      timeOfDay: selectedTime,
      mood: selectedMood,
      notes: notes
    };

    // Retrieve existing mood logs, append the new entry, and save back to localStorage
    let moodLogs = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    moodLogs.push(newEntry);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(moodLogs));

    // Reset selections and clear the notes field
    timeBtns.forEach(b => b.classList.remove('selected'));
    moodBtns.forEach(b => b.classList.remove('selected'));
    notesField.value = '';
    selectedTime = null;
    selectedMood = null;

    // Re-render the mood history list and update the chart
    renderMoodHistory();
    renderChart();
  });

  // Function to render the mood history as cards
  function renderMoodHistory() {
    moodLogContainer.innerHTML = '';
    let moodLogs = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');

    // Sort entries so that newest appear first
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
        <div class="card-mood">${log.timeOfDay.toUpperCase()} - ${log.mood}</div>
        <div class="card-notes">${log.notes || ''}</div>
      `;

      moodLogContainer.appendChild(card);
    });
  }

  // Chart.js instance (to be updated on each save)
  let moodChart;
  function renderChart() {
    let moodLogs = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');

    // Map each mood to a numeric value for the chart:
    // stressed:5, sad:4, angry:3, anxiety:2, depressed:1, lonely:0
    const moodValueMap = {
      stressed: 5,
      sad: 4,
      angry: 3,
      anxiety: 2,
      depressed: 1,
      lonely: 0
    };

    // Sort logs in chronological order
    moodLogs.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    const labels = moodLogs.map(log => {
      const d = new Date(log.timestamp);
      return d.toLocaleDateString([], { month: 'short', day: 'numeric' }) + 
             ` (${log.timeOfDay.substring(0, 3)})`;
    });
    const dataValues = moodLogs.map(log => moodValueMap[log.mood]);

    // Destroy the existing chart instance if it exists
    if (moodChart) {
      moodChart.destroy();
    }

    moodChart = new Chart(moodChartCanvas, {
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
          pointBackgroundColor: dataValues.map((val, i) => {
            const mood = moodLogs[i].mood;
            return moodColors[mood] || '#0056b3';
          }),
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

  // Initial rendering of the mood history and chart on page load
  renderMoodHistory();
  renderChart();
});
