// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBrG14qUCGOIMucxBArrhzZ2hG2ilidwnU",
    authDomain: "time-wise-agendamentos.firebaseapp.com",
    projectId: "time-wise-agendamentos",
    storageBucket: "time-wise-agendamentos.appspot.com",
    messagingSenderId: "833338728870",
    appId: "1:833338728870:web:f4f87d0e3f9c7dc92f6f67",
    measurementId: "G-63ZD6V69EV"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firestore
const db = firebase.firestore();

// DOM references
const loginSection = document.getElementById('loginSection');
const registerSection = document.getElementById('registerSection');
const resetPasswordSection = document.getElementById('resetPasswordSection');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const resetPasswordForm = document.getElementById('resetPasswordForm');
const message = document.getElementById('message');

// Toggle between sections
document.getElementById('showRegister').addEventListener('click', () => {
    loginSection.style.display = 'none';
    registerSection.style.display = 'block';
});

document.getElementById('showLogin').addEventListener('click', () => {
    registerSection.style.display = 'none';
    loginSection.style.display = 'block';
});

document.getElementById('showResetPassword').addEventListener('click', () => {
    loginSection.style.display = 'none';
    resetPasswordSection.style.display = 'block';
});

document.getElementById('showLoginFromReset').addEventListener('click', () => {
    resetPasswordSection.style.display = 'none';
    loginSection.style.display = 'block';
});

// Login
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    firebase.auth().signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            message.textContent = "Login bem-sucedido!";
            message.style.color = "#4CAF50"; // Success message in green
            // Redirect handled by onAuthStateChanged
        })
        .catch((error) => {
            message.textContent = "Erro no login: " + error.message;
            message.style.color = "#ff4444"; // Error message in red
        });
});

// Register
registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;

    firebase.auth().createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            sessionStorage.setItem('isNewUser', true);

            // Save user data in Firestore
            return db.collection('usersweb').doc(user.uid).set({
                name: name,
                email: user.email,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        })
        .then(() => {
            message.textContent = "Cadastro realizado com sucesso!";
            message.style.color = "#4CAF50"; // Success message in green

            // Sign out the user to prevent automatic login after registration
            return firebase.auth().signOut();
        })
        .then(() => {
            // Redirect to the login page after signing out
            window.location.href = 'LoginTimeWise.html';
        })
        .catch((error) => {
            let errorMessage = "";
            switch (error.code) {
                case 'auth/weak-password':
                    errorMessage = "A senha deve ter pelo menos 6 caracteres.";
                    break;
                case 'auth/email-already-in-use':
                    errorMessage = "Este email já está em uso. Tente fazer login ou use outro email.";
                    break;
                case 'auth/invalid-email':
                    errorMessage = "Email inválido. Por favor, verifique o email inserido.";
                    break;
                default:
                    errorMessage = "Erro no cadastro: " + error.message;
            }
            message.textContent = errorMessage;
            message.style.color = "#ff4444"; // Error message in red
        });
});

// Password reset
resetPasswordForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('resetEmail').value;

    firebase.auth().sendPasswordResetEmail(email)
        .then(() => {
            message.textContent = "Email de recuperação de senha enviado. Verifique sua caixa de entrada.";
            resetPasswordSection.style.display = 'none';
            loginSection.style.display = 'block';
        })
        .catch((error) => {
            message.textContent = "Erro ao enviar email de recuperação: " + error.message;
            message.style.color = "#ff4444"; // Error message in red
        });
});

// Handle authentication state changes
firebase.auth().onAuthStateChanged((user) => {
    const currentPage = window.location.pathname; // Get current page path

    if (user) {
        // Check if the user is newly registered (sessionStorage flag is set)
        const isNewUser = sessionStorage.getItem('isNewUser');

        if (isNewUser) {
            sessionStorage.removeItem('isNewUser'); // Clean up the flag
            if (currentPage !== '/LoginTimeWise.html') {
                window.location.href = 'LoginTimeWise.html'; // Redirect to the login page
            }
        } else {
            // Otherwise, redirect logged-in users to 'estabelecimento.html'
            if (currentPage !== '/estabelecimento.html') {
                window.location.href = 'estabelecimento.html'; // Redirect to establishment page
            }
        }
    } else {
        // Ensure logged-out users stay on the login page
        if (currentPage !== '/LoginTimeWise.html') {
            window.location.href = 'LoginTimeWise.html'; // Redirect to login page
        }
    }
});
