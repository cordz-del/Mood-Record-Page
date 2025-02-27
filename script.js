// Time-based color scheme
function updateTimeBasedTheme() {
    const hour = new Date().getHours();
    const body = document.body;
    
    body.classList.remove('morning', 'afternoon', 'evening', 'night');
    
    if (hour >= 5 && hour < 12) {
        body.classList.add('morning');
    } else if (hour >= 12 && hour < 17) {
        body.classList.add('afternoon');
    } else if (hour >= 17 && hour < 20) {
        body.classList.add('evening');
    } else {
        body.classList.add('night');
    }
}

// Update theme on load and every hour
updateTimeBasedTheme();
setInterval(updateTimeBasedTheme, 3600000); // Update every hour
