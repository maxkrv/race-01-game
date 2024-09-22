document.addEventListener('DOMContentLoaded', () => {
    checkAuthenticationStatus();
});

// Check if the user is authenticated
function checkAuthenticationStatus() {
    fetch('/user-status')
        .then(response => {
            if (response.status !== 200) {
                redirectToLogin();
            }
        })
        .catch(error => {
            console.error('Error checking authentication status:', error);
        });
}

// Redirect to the login page
function redirectToLogin() {
    window.location.href = 'login.html';
}

// Open and close the avatar panel
function toggleAvatarPanel(show) {
    const avatarPanel = document.getElementById('avatar-panel');
    avatarPanel.style.display = show ? 'block' : 'none';
}

function openAvatarPanel() {
    toggleAvatarPanel(true);
}

function closeAvatarPanel() {
    toggleAvatarPanel(false);
}
