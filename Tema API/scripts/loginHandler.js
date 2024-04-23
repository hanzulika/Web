document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const errorMsg = document.getElementById('error-msg');

    loginForm.addEventListener('submit', function(event) {
        event.preventDefault();

        // Check if username and password fields are empty
        if (usernameInput.value.trim() === '' || passwordInput.value.trim() === '') {
            errorMsg.textContent = 'Username and password are required.';
            return;
        }

        // Check if username is in email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(usernameInput.value.trim())) {
            errorMsg.textContent = 'Username must be a valid email address.';
            return;
        }

        // If all validations pass, submit the form
        loginForm.submit();
    });
});
