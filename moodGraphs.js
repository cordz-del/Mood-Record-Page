document.addEventListener("DOMContentLoaded", () => {
  // Select all mood buttons on the page
  const moodButtons = document.querySelectorAll(".mood-button");

  // Function to calculate fallback data for the last 7 days (flat chart with zeros)
  const getFallbackData = () => {
    const fallbackDates = [];
    const fallbackCounts = [];
    // Create data for the past 7 days (e.g., Mon to Sun or simply last 7 calendar days)
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      // Format the date as M/D
      const formattedDate = `${d.getMonth() + 1}/${d.getDate()}`;
      fallbackDates.push(formattedDate);
      fallbackCounts.push(0);
    }
    return { dates: fallbackDates, counts: fallbackCounts };
  };

  // Process each mood button
  moodButtons.forEach(async (button) => {
    const mood = button.dataset.mood; // e.g., 'stressed', 'sad', etc.
    
    // Create a container div for the chart and a canvas element for Chart.js
    const chartContainer = document.createElement("div");
    chartContainer.className = "mood-chart-container";
    const canvas = document.createElement("canvas");
    canvas.id = `chart-${mood}`;
    chartContainer.appendChild(canvas);
    
    // Insert the chart container directly after the mood button in the DOM
    button.parentNode.insertBefore(chartContainer, button.nextSibling);
    
    // Prepare fallback data (flat graph)
    let graphData = getFallbackData();

    // Construct the URL to fetch historical data for the given mood
    // Replace "https://your-replit-url" with your actual backend URL.
    const fetchURL = `https://your-replit-url/mood-history?mood=${encodeURIComponent(mood)}`;

    try {
      // Fetch historical data from your backend.
      // Expected response format:
      // { dates: ["3/10", "3/11", ...], counts: [2, 3, ...] }
      const response = await fetch(fetchURL);
      const data = await response.json();

      // If data exists and has the expected arrays, use it.
      if (data && Array.isArray(data.dates) && Array.isArray(data.counts)) {
        graphData = data;
      }
    } catch (error) {
      console.error(`Error fetching mood history for ${mood}:`, error);
      // If there's an error, the graph will use fallback data (all zeros)
    }

    // Use the computed style of the mood button for the chart color.
    const moodColor =
      window.getComputedStyle(button).backgroundColor || "#0056b3";

    // Create a Chart.js bar chart that starts level and updates based on data
    new Chart(canvas, {
      type: "bar",
      data: {
        labels: graphData.dates,
        datasets: [
          {
            label: `Count for ${mood}`,
            data: graphData.counts,
            backgroundColor: moodColor,
            borderColor: moodColor,
            borderWidth: 1,
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              precision: 0, // ensures whole numbers on the y-axis
            },
          },
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: function (context) {
                return ` ${context.parsed.y} times`;
              },
            },
          },
          legend: {
            display: false,
          },
        },
        responsive: true,
        maintainAspectRatio: false,
      },
    });
  });
});
