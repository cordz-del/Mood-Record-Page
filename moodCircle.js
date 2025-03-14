document.addEventListener("DOMContentLoaded", () => {
  // Insert (or reuse) a canvas inside the mood tracker wheel container.
  const wheel = document.querySelector(".mood-tracker-wheel");
  let canvas = document.getElementById("moodCircleChart");
  if (!canvas) {
    canvas = document.createElement("canvas");
    canvas.id = "moodCircleChart";
    wheel.appendChild(canvas);
  }

  // Total segments: 2 moods per day for 7 days = 14 segments.
  const totalSegments = 14;
  const defaultColor = "#ccc"; // default gray for no mood input

  // Mood-to-color mapping (for when real data is available)
  const moodColors = {
    stressed: "#9F58B0",
    sad: "#003d82",
    angry: "#FF5A5F",
    anxiety: "#FFA500",
    depressed: "#002147",
    lonely: "#999999"
  };

  // Create a placeholder array with random colors from the moodColors mapping
  const moodKeys = Object.keys(moodColors);
  const segmentColors = Array.from({ length: totalSegments }, () => {
    const randomMood = moodKeys[Math.floor(Math.random() * moodKeys.length)];
    return moodColors[randomMood];
  });

  // Set up the Chart.js donut chart data.
  const chartData = {
    labels: Array.from({ length: totalSegments }, (_, i) => `Entry ${i + 1}`),
    datasets: [{
      data: new Array(totalSegments).fill(1), // Each segment has equal weight.
      backgroundColor: segmentColors,
      borderWidth: 0
    }]
  };

  // Configure the chart options.
  const chartOptions = {
    type: "doughnut",
    data: chartData,
    options: {
      cutout: "70%", // Adjust the inner radius for visual style.
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function(context) {
              const color = context.dataset.backgroundColor[context.dataIndex];
              return `Color: ${color}`;
            }
          }
        }
      },
      responsive: true,
      maintainAspectRatio: false
    }
  };

  // Initialize the Chart.js donut chart.
  const moodChart = new Chart(canvas, chartOptions);

  // Expose a function to update a specific segment when a mood is recorded.
  // segmentIndex should be between 0 and 13 (14 segments total).
  window.updateMoodSegment = function(segmentIndex, mood) {
    if (segmentIndex < 0 || segmentIndex >= totalSegments) {
      console.error("Invalid segment index:", segmentIndex);
      return;
    }
    const color = moodColors[mood] || defaultColor;
    moodChart.data.datasets[0].backgroundColor[segmentIndex] = color;
    moodChart.update();
  };

  // Expose a function to update the entire mood circle at once.
  // Pass an array (up to 14 items) of mood names.
  window.updateMoodCircle = function(moodArray) {
    const newColors = moodArray.map(m => moodColors[m] || defaultColor);
    // Ensure we always have exactly 14 segments.
    while (newColors.length < totalSegments) {
      newColors.push(defaultColor);
    }
    moodChart.data.datasets[0].backgroundColor = newColors;
    moodChart.update();
  };

  // For demonstration purposes, you can simulate mood updates by uncommenting the following:
  /*
  let demoIndex = 0;
  const demoMoods = ["stressed", "sad", "angry", "anxiety", "depressed", "lonely"];
  setInterval(() => {
    window.updateMoodSegment(demoIndex, demoMoods[demoIndex % demoMoods.length]);
    demoIndex = (demoIndex + 1) % totalSegments;
  }, 2000);
  */
});
