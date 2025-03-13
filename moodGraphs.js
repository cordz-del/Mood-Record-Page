document.addEventListener("DOMContentLoaded", async () => {
  // Define the moods (must match the mood button data-mood values)
  const moods = ["stressed", "sad", "angry", "anxiety", "depressed", "lonely"];

  // Create container for the monthly gauge graph
  const container = document.createElement("div");
  container.className = "monthly-gauge";
  
  // Create a canvas element for the chart
  const canvas = document.createElement("canvas");
  canvas.id = "monthlyGaugeChart";
  container.appendChild(canvas);
  
  // Append the container into the designated section (e.g., #monthlyStatsSection)
  let statsSection = document.getElementById("monthlyStatsSection");
  if (!statsSection) {
    statsSection = document.createElement("div");
    statsSection.id = "monthlyStatsSection";
    document.querySelector("main.container").appendChild(statsSection);
  }
  // Place the monthly gauge at the top of the stats section so it's aligned directly underneath the mood buttons.
  statsSection.insertBefore(container, statsSection.firstChild);
  
  // Define mood-to-color mapping (should be consistent with other parts of your app)
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
      // Expected response format:
      // { dates: ["3/01", "3/02", ...], counts: [2, 3, ...] }
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

  // Create a Chart.js bar chart that displays a bar for each mood.
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
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0 // Ensure whole numbers on the y-axis.
          }
        }
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: (context) => `${context.parsed.y} times`
          }
        },
        legend: { display: false }
      },
      responsive: true,
      maintainAspectRatio: false
    }
  });
});
