document.addEventListener("DOMContentLoaded", async () => {
  // Register a custom shadow plugin to simulate a 3D effect for the chart
  const shadowPlugin = {
    id: 'shadowPlugin',
    beforeDatasetDraw(chart, args, options) {
      const ctx = chart.ctx;
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
    },
    afterDatasetDraw(chart, args, options) {
      chart.ctx.restore();
    }
  };
  Chart.register(shadowPlugin);

  // Create container for the monthly stats graph
  const container = document.createElement("div");
  container.className = "monthly-stats-container";
  
  // Create a canvas element for the chart
  const canvas = document.createElement("canvas");
  canvas.id = "monthlyStatsChart";
  container.appendChild(canvas);
  
  // Append the container in the designated section (#monthlyStatsSection)
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
  
  // Define mood-to-color mapping (consistent with your app)
  const moodColors = {
    stressed: "#9F58B0",
    sad: "#003d82",
    angry: "#FF5A5F",
    anxiety: "#FFA500",
    depressed: "#002147",
    lonely: "#999999"
  };
  
  try {
    // Use the defined API_BASE_URL to fetch monthly stats
    const response = await fetch(`${API_BASE_URL}/mood-stats`);
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
  
  // Create the Chart.js bar chart with two bars
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
          ticks: { precision: 0 }
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
