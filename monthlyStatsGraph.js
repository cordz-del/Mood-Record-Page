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

  // Create container for the monthly stats chart
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
  
  // Define mood-to-color mapping (consistent with your app)
  const moodColors = {
    stressed: "#9F58B0",
    sad: "#003d82",
    angry: "#FF5A5F",
    anxiety: "#FFA500",
    depressed: "#002147",
    lonely: "#999999"
  };

  // Define the moods to display
  const moods = ["stressed", "sad", "angry", "anxiety", "depressed", "lonely"];

  // Attempt to fetch monthly stats from your backend.
  let fetchedData;
  try {
    const response = await fetch(`${API_BASE_URL}/mood-stats`);
    if (response.ok) {
      fetchedData = await response.json();
    }
  } catch (error) {
    console.error("Error fetching monthly stats:", error);
  }
  
  // Process fetched data: assume fetchedData.moods is an object like
  // { stressed: count, sad: count, ... }
  let placeholder = false;
  let moodData = [];
  if (fetchedData && fetchedData.moods) {
    moodData = moods.map(m => ({
      mood: m,
      count: fetchedData.moods[m] || 0
    }));
    // If all counts are zero, we'll use placeholder data.
    if (moodData.every(d => d.count === 0)) {
      placeholder = true;
    }
  } else {
    placeholder = true;
  }

  // Generate placeholder data if needed
  if (placeholder) {
    moodData = moods.map(m => ({
      mood: m,
      count: Math.floor(Math.random() * 10) + 1  // random count between 1 and 10
    }));
  }

  // Prepare data arrays for the polarArea chart (Nightingale chart style)
  const labels = moodData.map(d => d.mood.charAt(0).toUpperCase() + d.mood.slice(1));
  const counts = moodData.map(d => d.count);
  const bgColors = moodData.map(d => moodColors[d.mood] || "#ccc");

  // Create the Chart.js polarArea chart (Nightingale style)
  new Chart(canvas, {
    type: "polarArea",
    data: {
      labels: labels,
      datasets: [{
        data: counts,
        backgroundColor: bgColors
      }]
    },
    options: {
      plugins: {
        legend: { display: true },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `${context.label}: ${context.parsed} times`;
            }
          }
        }
      },
      scales: {
        r: {
          beginAtZero: true
        }
      },
      responsive: true,
      maintainAspectRatio: false
    }
  });
});
