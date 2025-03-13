document.addEventListener("DOMContentLoaded", () => {
  // Insert a canvas into the mood tracker wheel container if not already present.
  const wheel = document.querySelector(".mood-tracker-wheel");
  let canvas = document.getElementById("moodCircleChart");
  if (!canvas) {
    canvas = document.createElement("canvas");
    canvas.id = "moodCircleChart";
    wheel.appendChild(canvas);
  }

  // Total segments: 2 moods per day for 7 days.
  const totalSegments = 14;
  const defaultColor = "#ccc"; // default gray for no mood input

  // Initial segment colors (all default)
  const segmentColors = new Array(totalSegments).fill(defaultColor);

  // Set up the Chart.js donut chart data.
  const chartData = {
    labels: Array.from({ length: totalSegments }, (_, i) => `Entry ${i + 1}`),
    datasets: [{
      data: new Array(totalSegments).fill(1), // each segment has equal weight
      backgroundColor: segmentColors,
      borderWidth: 0
    }]
  };

  // Configure the chart options.
  const chartOptions = {
    type: "doughnut",
    data: chartData,
    options: {
      cutout: "70%", // adjust the inner radius as needed
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function (context) {
              // Customize the tooltip: here we simply display the mood's color.
              // You can add additional information (e.g., mood name, count, etc.)
              const moodColor = context.dataset.backgroundColor[context.dataIndex];
              return `Color: ${moodColor}`;
            }
          }
        }
      },
      responsive: true,
      maintainAspectRatio: false
    }
  };

  // Initialize the Chart.js chart.
  const moodChart = new Chart(canvas, chartOptions);

  // Mood-to-color mapping (adjust colors as needed)
  const moodColors = {
    stressed: "#9F58B0",
    sad: "#003d82",
    angry: "#FF5A5F",
    anxiety: "#FFA500",
    depressed: "#002147",
    lonely: "#999999"
  };

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

  // Optional: update the entire mood circle at once.
  // Pass an array (up to 14 items) of mood names.
  window.updateMoodCircle = function(moodArray) {
    const newColors = moodArray.map(m => moodColors[m] || defaultColor);
    // Ensure we always have 14 segments.
    while (newColors.length < totalSegments) {
      newColors.push(defaultColor);
    }
    moodChart.data.datasets[0].backgroundColor = newColors;
    moodChart.update();
  };

  // For demonstration purposes, you might simulate mood inputs like so:
  // Uncomment the following code to simulate updating segments every 2 seconds.
  /*
  let demoIndex = 0;
  const demoMoods = ["stressed", "sad", "angry", "anxiety", "depressed", "lonely"];
  setInterval(() => {
    window.updateMoodSegment(demoIndex, demoMoods[demoIndex % demoMoods.length]);
    demoIndex = (demoIndex + 1) % totalSegments;
  }, 2000);
  */
});
