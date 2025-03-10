document.addEventListener('DOMContentLoaded', () => {
  // Local Storage key for mood entries
  const STORAGE_KEY = 'amieMoodLogs';

  // Select all mood buttons (instead of .mood-shape)
  const moodButtons = document.querySelectorAll('.mood-button');

  // Pop-out journaling elements (thought bubble)
  const journalBubble = document.getElementById('journalBubble');
  const journalMoodTitle = document.getElementById('journalMoodTitle');
  const journalInspiration = document.getElementById('journalInspiration');
  const journalText = document.getElementById('journalText');
  const saveJournalBtn = document.getElementById('saveJournal');
  const closeJournalBubble = document.getElementById('closeJournalBubble');

  // Define mood colors and corresponding inspirational quotes
  const moodColors = {
    stressed: '#9F58B0',
    sad: '#003d82',
    angry: '#FF5A5F',
    anxiety: '#FFA500',
    depressed: '#002147',
    lonely: '#999999'
  };

  const moodQuotes = {
    stressed: "Take a deep breath, you got this.",
    sad: "Even the darkest night will end and the sun will rise.",
    angry: "Let your passion fuel your strength, not your anger.",
    anxiety: "Inhale courage, exhale fear.",
    depressed: "Every day is a new beginning.",
    lonely: "You are never truly alone; your strength is within you."
  };

  let selectedMood = null;

  // Function to open the journaling pop-out with the selected mood
  function openJournalBubble(mood) {
    selectedMood = mood;
    // Update pop-out header with mood name
    journalMoodTitle.textContent = `Mood: ${mood}`;
    // Update inspirational quote based on selected mood
    journalInspiration.textContent = moodQuotes[mood] || "";
    // Clear previous journal text
    journalText.value = "";
    // Change page background to a tinted version of the mood color
    document.body.style.backgroundColor = moodColors[mood] || "#fafafa";
    // Show the journal bubble (remove 'hidden' class)
    journalBubble.classList.remove('hidden');
  }

  // Function to close the journal bubble and reset background
  function closeJournalBubbleFunc() {
    journalBubble.classList.add('hidden');
    // Return to original page background (adjust if you prefer a different default)
    document.body.style.background = "linear-gradient(135deg, #fafafa, #eaeaea)";
  }

  // Attach click listeners to each mood button
  moodButtons.forEach(button => {
    button.addEventListener('click', () => {
      const mood = button.dataset.mood;
      if (mood) {
        openJournalBubble(mood);
      }
    });
  });

  // Save journal entry when Save button is clicked
  saveJournalBtn.addEventListener('click', () => {
    if (!selectedMood) {
      alert('Please select a mood.');
      return;
    }
    const journalTextValue = journalText.value.trim();
    const entry = {
      date: new Date().toISOString().split('T')[0],
      mood: selectedMood,
      quote: moodQuotes[selectedMood],
      journal: journalTextValue,
      timestamp: new Date().toISOString()
    };
    // Retrieve existing entries from localStorage and add the new one
    let moodLogs = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    moodLogs.push(entry);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(moodLogs));
    alert('Mood entry saved!');
    closeJournalBubbleFunc();
  });

  // Attach click listener to the close button
  closeJournalBubble.addEventListener('click', () => {
    closeJournalBubbleFunc();
  });

  // Optional: Close the journal bubble when clicking outside its content
  journalBubble.addEventListener('click', (e) => {
    if (e.target === journalBubble) {
      closeJournalBubbleFunc();
    }
  });
});
