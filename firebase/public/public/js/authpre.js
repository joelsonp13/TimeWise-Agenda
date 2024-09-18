// Verificar o estado de autenticação
auth.onAuthStateChanged((user) => {
    if (user) {
        showUserProfile(user);
    } else {
        const currentPage = window.location.href;
        sessionStorage.setItem('returnUrl', currentPage);
        window.location.href = '../page/LoginTimeWise.html';
    }
});

function showUserProfile(user) {
    const userProfile = document.getElementById('userProfile');
    const userName = document.getElementById('userName');
    
    db.collection("usersweb").doc(user.uid).get().then((doc) => {
        if (doc.exists) {
            userName.textContent = `Olá, ${doc.data().name}`;
        } else {
            userName.textContent = `Olá, ${user.email}`;
        }
    }).catch((error) => {
        console.log("Erro ao buscar dados do usuário:", error);
    });

    userProfile.classList.remove('hidden');
}

function logout() {
    auth.signOut().then(() => {
        console.log('Usuário deslogado');
        // Redirecionar para a página de login
        window.location.href = '../page/LoginTimeWise.html';
    }).catch((error) => {
        console.error('Erro ao fazer logout:', error);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', logout);
    }
});