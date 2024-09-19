// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBrG14qUCGOIMucxBArrhzZ2hG2ilidwnU",
    authDomain: "time-wise-agendamentos.firebaseapp.com",
    projectId: "time-wise-agendamentos",
    storageBucket: "time-wise-agendamentos.appspot.com",
    messagingSenderId: "833338728870",
    appId: "1:833338728870:web:f4f87d0e3f9c7dc92f6f67",
    measurementId: "G-63ZD6V69EV"
};

// Inicializar o Firebase
firebase.initializeApp(firebaseConfig);

// Inicializar Firestore
const db = firebase.firestore();

// Referências aos elementos do DOM
const loginSection = document.getElementById('loginSection');
const registerSection = document.getElementById('registerSection');
const resetPasswordSection = document.getElementById('resetPasswordSection');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const resetPasswordForm = document.getElementById('resetPasswordForm');
const message = document.getElementById('message');

// Funções para alternar entre as seções
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
            message.style.color = "#4CAF50"; // Verde para sucesso
            // O redirecionamento será tratado pelo onAuthStateChanged
        })
        .catch((error) => {
            // ... (mantenha o código de tratamento de erro existente)
        });
});

// Cadastro
registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;

    firebase.auth().createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            sessionStorage.setItem('isNewUser', true);
            const user = userCredential.user;
            
            // Salvar dados do usuário no Firestore
            return db.collection('usersweb').doc(user.uid).set({
                name: name,
                email: user.email,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        })
        .then(() => {
            message.textContent = "Cadastro realizado com sucesso!";
            message.style.color = "#4CAF50"; // Verde para sucesso
            registerSection.style.display = 'none';
            loginSection.style.display = 'block';
                 setTimeout(() => {
                message.textContent = "";
            }, 4000);
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
            message.style.color = "#ff4444"; // Vermelho para erro
        });
});

// Recuperação de senha
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
        });
});

// No início do arquivo, após a inicialização do Firebase:
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        const isNewUser = sessionStorage.getItem('isNewUser');

        // Verifica se o usuário acabou de se registrar
        if (isNewUser) {
            sessionStorage.removeItem('isNewUser'); // Remove a flag após o uso
            window.location.href = 'LoginTimeWise.html'; // Redireciona para a página de login
        } else {
            // Caso contrário, o usuário está fazendo login
            const returnUrl = sessionStorage.getItem('returnUrl');
            if (returnUrl) {
                sessionStorage.removeItem('returnUrl');
                window.location.href = returnUrl;
            } else {
                window.location.href = 'estabelecimento.html'; // Redireciona para a página padrão
            }
        }
    }
});

