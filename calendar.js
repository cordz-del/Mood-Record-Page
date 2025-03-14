document.addEventListener("DOMContentLoaded", () => {
  // Get today's date
  const today = new Date();

  // Calculate offset to get Monday (JavaScript: Sunday=0, Monday=1, etc.)
  const dayOfWeek = today.getDay(); // 0 (Sun) to 6 (Sat)
  const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  // Determine Monday's date of the current week
  const monday = new Date(today);
  monday.setDate(today.getDate() - mondayOffset);

  // Define day labels starting from Monday
  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const weekDates = [];

  // Build an array with each day's info for the week
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const month = d.getMonth() + 1;
    const date = d.getDate();
    weekDates.push({
      label: daysOfWeek[i],             // e.g., "Mon"
      displayDate: `${month}/${date}`,  // e.g., "3/10"
      isoDate: d.toISOString().split("T")[0]
    });
  }

  // Select each wrapper that contains the bubble (.day-bubble) and the date (.day-date)
  const dayBubbleWrappers = document.querySelectorAll(".day-bubble-wrapper");

  // Update each day-bubble-wrapper with the proper day label and date
  dayBubbleWrappers.forEach((wrapper, index) => {
    if (weekDates[index]) {
      const bubble = wrapper.querySelector(".day-bubble");
      const dateElement = wrapper.querySelector(".day-date");

      // Set the bubble text to the day label (e.g., "Mon")
      bubble.textContent = weekDates[index].label;

      // Set the date below the bubble (e.g., "3/10")
      if (dateElement) {
        dateElement.textContent = weekDates[index].displayDate;
      }

      // Optionally store the ISO date for future use (e.g., data fetch)
      bubble.setAttribute("data-iso-date", weekDates[index].isoDate);
    }
  });
});
