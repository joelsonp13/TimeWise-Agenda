// Verificar o estado de autenticação
auth.onAuthStateChanged((user) => {
    if (user) {
        showUserProfile(user);
        carregarAgendamentos(user);
    } else {
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

document.addEventListener('DOMContentLoaded', () => {
    const userDropdown = document.getElementById('userDropdown');
    const dropdownMenu = document.getElementById('dropdownMenu');

    userDropdown.addEventListener('click', () => {
        dropdownMenu.classList.toggle('hidden');
    });

    // Fechar o dropdown quando clicar fora dele
    document.addEventListener('click', (event) => {
        if (!userDropdown.contains(event.target) && !dropdownMenu.contains(event.target)) {
            dropdownMenu.classList.add('hidden');
        }
    });

    document.getElementById('logoutButton').addEventListener('click', () => {
        auth.signOut().then(() => {
            window.location.href = '../login/LoginTimeWise.html';
        }).catch((error) => {
            console.error('Erro ao fazer logout:', error);
        });
    });
});