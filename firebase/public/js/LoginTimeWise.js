// Handle authentication state changes
firebase.auth().onAuthStateChanged((user) => {
    const currentPage = window.location.pathname; // Get current page path

    if (user) {
        // User is authenticated
        // Check if the user is newly registered (sessionStorage flag is set)
        const isNewUser = sessionStorage.getItem('isNewUser');

        // If the user is newly registered, remove the flag and reload the login form (just for security).
        if (isNewUser) {
            sessionStorage.removeItem('isNewUser'); // Clean up the flag
            // Simply hide the registration form and show the login form
            registerSection.style.display = 'none';
            loginSection.style.display = 'block';
        } else {
            // If the user is logged in, make sure they're redirected to the correct page (estabelecimento.html)
            if (currentPage !== '/estabelecimento.html') {
                window.location.href = 'estabelecimento.html'; // Redirect to the establishment page
            }
        }
    } 
});
