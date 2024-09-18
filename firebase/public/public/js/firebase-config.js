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

console.log("Inicializando Firebase...");
firebase.initializeApp(firebaseConfig);
console.log("Firebase inicializado");

const auth = firebase.auth();
const db = firebase.firestore();
console.log("Auth e Firestore inicializados");