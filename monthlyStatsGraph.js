document.addEventListener("DOMContentLoaded", async () => {
  // Create container for the monthly stats graph
  const container = document.createElement("div");
  container.className = "monthly-stats-container";
  
  // Create a canvas element for the chart
  const canvas = document.createElement("canvas");
  canvas.id = "monthlyStatsChart";
  container.appendChild(canvas);
  
  // Append the container in a designated section.
  // For example, if you have a dedicated section for monthly stats in index.html,
  // ensure it has an id="monthlyStatsSection". Otherwise, append to the main container.
  let statsSection = document.getElementById("monthlyStatsSection");
  if (!statsSection) {
    statsSection = document.createElement("div");
    statsSection.id = "monthlyStatsSection";
    document.querySelector("main.container").appendChild(statsSection);
  }
  statsSection.appendChild(container);
  
  // Fallback data in case fetching fails
  let mostTracked = { mood: "none", count: 0 };
  let leastTracked = { mood: "none", count: 0 };
  
  // Define mood-to-color mapping (should be consistent with other parts of your app)
  const moodColors = {
    stressed: "#9F58B0",
    sad: "#003d82",
    angry: "#FF5A5F",
    anxiety: "#FFA500",
    depressed: "#002147",
    lonely: "#999999"
  };
  
  try {
    // Replace with your actual backend URL
    const response = await fetch("https://your-replit-url/mood-stats");
    const data = await response.json();
    // Expected data format:
    // { mostTracked: { mood: "stressed", count: 15 }, leastTracked: { mood: "lonely", count: 3 } }
    if (data) {
      mostTracked = data.mostTracked || mostTracked;
      leastTracked = data.leastTracked || leastTracked;
    }
  } catch (error) {
    console.error("Error fetching monthly stats:", error);
  }
  
  // Create the Chart.js bar chart with two bars: one for most tracked and one for least tracked mood
  new Chart(canvas, {
    type: "bar",
    data: {
      labels: ["Most Tracked Mood", "Least Tracked Mood"],
      datasets: [{
        label: "Mood Count",
        data: [mostTracked.count, leastTracked.count],
        backgroundColor: [
          moodColors[mostTracked.mood] || "#0056b3",
          moodColors[leastTracked.mood] || "#0056b3"
        ],
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0
          }
        }
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: (context) => `${context.parsed.y} times`
          }
        },
        legend: {
          display: false
        }
      },
      responsive: true,
      maintainAspectRatio: false
    }
  });
});
