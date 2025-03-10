document.addEventListener('DOMContentLoaded', () => {
  // Local Storage key for mood entries
  const STORAGE_KEY = 'amieMoodLogs';

  // Select all mood shapes (e.g., .mood-shape elements)
  const moodShapes = document.querySelectorAll('.mood-shape');

  // Modal Elements for mood logging overlay
  const moodEntryModal = document.getElementById('moodEntryModal');
  const modalDateEl = document.getElementById('modalDate');
  const modalQuoteEl = document.getElementById('modalQuote');
  const moodJournal = document.getElementById('moodJournal');
  const saveMoodEntryBtn = document.getElementById('saveMoodEntry');
  const cancelMoodEntryBtn = document.getElementById('cancelMoodEntry');

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

  // Function to open the mood logging modal with the selected mood
  function openMoodEntryModal(mood) {
    selectedMood = mood;
    // Set today's date in the modal
    const today = new Date();
    modalDateEl.textContent = today.toLocaleDateString();
    // Set the inspirational quote based on the selected mood
    modalQuoteEl.textContent = moodQuotes[mood] || "";
    // Clear previous journal input
    moodJournal.value = "";
    // Change the background color (lightly tinted) based on mood
    document.body.style.backgroundColor = moodColors[mood] || "#fafafa";
    // Show the modal by removing the 'hidden' class (ensure your CSS hides the modal by default)
    moodEntryModal.classList.remove('hidden');
  }

  // Function to close the mood logging modal and reset background
  function closeMoodEntryModal() {
    moodEntryModal.classList.add('hidden');
    // Reset background to default gradient
    document.body.style.background = "linear-gradient(135deg, #fafafa, #eaeaea)";
  }

  // Attach click listeners to each mood shape button
  moodShapes.forEach(shape => {
    shape.addEventListener('click', () => {
      const mood = shape.dataset.mood;
      if (mood) {
        openMoodEntryModal(mood);
      }
    });
  });

  // Save mood entry when Save button is clicked
  saveMoodEntryBtn.addEventListener('click', () => {
    if (!selectedMood) {
      alert('Please select a mood.');
      return;
    }
    const journalText = moodJournal.value.trim();
    const entry = {
      date: new Date().toISOString().split('T')[0],
      mood: selectedMood,
      quote: moodQuotes[selectedMood],
      journal: journalText,
      timestamp: new Date().toISOString()
    };
    // Retrieve existing entries from localStorage
    let moodLogs = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    moodLogs.push(entry);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(moodLogs));
    alert('Mood entry saved!');
    closeMoodEntryModal();
  });

  // Cancel button to close the modal without saving
  cancelMoodEntryBtn.addEventListener('click', () => {
    closeMoodEntryModal();
  });

  // Optional: Close modal when clicking outside of the modal content
  moodEntryModal.addEventListener('click', (e) => {
    if (e.target === moodEntryModal) {
      closeMoodEntryModal();
    }
  });
});
