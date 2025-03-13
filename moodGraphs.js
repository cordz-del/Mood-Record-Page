document.addEventListener("DOMContentLoaded", async () => {
  // Define the moods (must match the mood button data-mood values)
  const moods = ["stressed", "sad", "angry", "anxiety", "depressed", "lonely"];

  // Create container for the monthly gauge (bullet graph) chart
  const container = document.createElement("div");
  container.className = "monthly-gauge";
  
  // Create a canvas element for the chart
  const canvas = document.createElement("canvas");
  canvas.id = "monthlyGaugeChart";
  container.appendChild(canvas);
  
  // Append the container into the designated section (#monthlyStatsSection)
  let statsSection = document.getElementById("monthlyStatsSection");
  if (!statsSection) {
    statsSection = document.createElement("div");
    statsSection.id = "monthlyStatsSection";
    document.querySelector("main.container").appendChild(statsSection);
  }
  // Place the monthly gauge at the top of the stats section
  statsSection.insertBefore(container, statsSection.firstChild);
  
  // Define mood-to-color mapping (consistent with your app)
  const moodColors = {
    stressed: "#9F58B0",
    sad: "#003d82",
    angry: "#FF5A5F",
    anxiety: "#FFA500",
    depressed: "#002147",
    lonely: "#999999"
  };

  // Function to fetch monthly count for a given mood.
  // Assumes your backend endpoint supports a parameter "range=month".
  const fetchMonthlyCount = async (mood) => {
    const url = `${API_BASE_URL}/mood-history?mood=${encodeURIComponent(mood)}&range=month`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      // Expected response format: { dates: ["3/01", "3/02", ...], counts: [2, 3, ...] }
      if (data && Array.isArray(data.counts)) {
        // Sum up all counts to get the monthly total.
        return data.counts.reduce((sum, count) => sum + count, 0);
      } else {
        return 0;
      }
    } catch (error) {
      console.error(`Error fetching monthly count for ${mood}:`, error);
      return 0;
    }
  };

  // Fetch monthly counts for all moods concurrently.
  const monthlyCounts = await Promise.all(moods.map(fetchMonthlyCount));

  // Create a horizontal bar chart (bullet graph style) with Chart.js.
  new Chart(canvas, {
    type: "bar",
    data: {
      labels: moods.map(m => m.charAt(0).toUpperCase() + m.slice(1)), // Capitalize mood names.
      datasets: [{
        label: "Monthly Count",
        data: monthlyCounts,
        backgroundColor: moods.map(m => moodColors[m]),
        borderColor: moods.map(m => moodColors[m]),
        borderWidth: 1
      }]
    },
    options: {
      indexAxis: 'y', // Horizontal bars for bullet graph look.
      scales: {
        x: {
          beginAtZero: true,
          // Set a maximum value for the bullet graph gauge; adjust as needed.
          max: 20,
          ticks: { precision: 0 }
        },
        y: {
          beginAtZero: true
        }
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: (context) => `${context.parsed.x} times`
          }
        },
        legend: { display: false }
      },
      responsive: true,
      maintainAspectRatio: false
    }
  });
});
