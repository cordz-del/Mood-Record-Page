document.addEventListener("DOMContentLoaded", () => {
  // Get today's date
  const today = new Date();

  // Calculate the offset to get Monday (JavaScript: Sunday=0, Monday=1, etc.)
  const dayOfWeek = today.getDay(); // 0 (Sun) to 6 (Sat)
  const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  // Determine Monday's date of the current week
  const monday = new Date(today);
  monday.setDate(today.getDate() - mondayOffset);

  // Define day labels starting from Monday
  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const weekDates = [];

  // Build an array with each day's information for the week
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const month = d.getMonth() + 1;
    const date = d.getDate();
    weekDates.push({
      label: daysOfWeek[i],
      displayDate: `${month}/${date}`,
      isoDate: d.toISOString().split("T")[0]
    });
  }

  // Select all the day bubble elements from the page
  const dayBubbles = document.querySelectorAll('.day-bubble');

  // Update each day bubble with the proper day label and date
  dayBubbles.forEach((bubble, index) => {
    if (weekDates[index]) {
      // Replace the inner HTML with day label and date in two lines
      bubble.innerHTML = `
        <span class="day-label">${weekDates[index].label}</span><br/>
        <span class="day-date">${weekDates[index].displayDate}</span>
      `;
      // Optionally store the ISO date for later use (e.g., fetching mood data)
      bubble.setAttribute('data-iso-date', weekDates[index].isoDate);
    }
  });
});
