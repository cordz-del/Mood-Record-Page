document.addEventListener('DOMContentLoaded', () => {
  // Local Storage key for mood entries (fallback or additional logging if needed)
  const STORAGE_KEY = 'amieMoodLogs';

  // Select all mood buttons
  const moodButtons = document.querySelectorAll('.mood-button');

  // Pop-out journaling elements
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
    // Reset background to default gradient
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
  saveJournalBtn.addEventListener('click', async () => {
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

    try {
      // Send the mood entry to your backend (Replit & MongoDB)
      const response = await fetch(`${API_BASE_URL}/mood-entries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(entry)
      });
      const data = await response.json();
      if (response.ok) {
        alert('Mood entry saved!');
        closeJournalBubbleFunc();

        // Optionally, also save to localStorage as a fallback/log (if needed)
        let moodLogs = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        moodLogs.push(entry);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(moodLogs));
      } else {
        throw new Error(data.error || 'Failed to save mood entry.');
      }
    } catch (error) {
      console.error('Error saving mood entry:', error);
      alert('Error saving mood entry.');
    }
  });

  // Attach click listener to the close button for the journal bubble
  closeJournalBubble.addEventListener('click', closeJournalBubbleFunc);

  // Optional: Close the journal bubble when clicking outside its content
  journalBubble.addEventListener('click', (e) => {
    if (e.target === journalBubble) {
      closeJournalBubbleFunc();
    }
  });

  // Logout functionality: Clear stored data and redirect to Log-in-Amie page
  const logoutButton = document.getElementById('logoutButton');
  if (logoutButton) {
    logoutButton.addEventListener('click', async function() {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No authentication token found');
        const response = await fetch(`${API_BASE_URL}/api/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Logout failed');
        }
        localStorage.clear();
        window.location.href = 'https://cordz-del.github.io/Log-in-Amie/';
      } catch (error) {
        console.error('Logout error:', error);
        alert('Error logging out. Please try again.');
      }
    });
  }
});
