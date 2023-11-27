const darkModeSwitch = document.getElementById('darkModeSwitch');
const body = document.body;
let dark = false;

// Check user's preference from localStorage
if (localStorage.getItem('darkMode') === 'enabled') {
    enableDarkMode();
}else{
    disableDarkMode()
}


// Toggle dark mode on switch change
darkModeSwitch.addEventListener('click', () => {
    if (!dark) {
        enableDarkMode();
        dark = true;
    } else {
        disableDarkMode();
        dark = false;
    }
});

// Functions to enable/disable dark mode
function enableDarkMode() {
    body.classList.add('dark-mode');
    localStorage.setItem('darkMode', 'enabled');
    darkModeSwitch.innerHTML = '<i class="fas fa-sun icon"></i>';
}

function disableDarkMode() {
    body.classList.remove('dark-mode');
    localStorage.setItem('darkMode', 'disabled');
    darkModeSwitch.innerHTML = '<i class="fas fa-moon icon"></i>';
}
