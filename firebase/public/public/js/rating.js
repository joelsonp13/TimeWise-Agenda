function showRatingAlert(workerName, appointmentIndex) {
    const ratingAlert = document.createElement('div');
    ratingAlert.id = 'ratingAlert';
    ratingAlert.className = 'fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50';
    ratingAlert.innerHTML = `
        <div class="bg-white p-6 rounded-lg shadow-lg w-96 text-center">
            <p class="mb-4 text-lg font-semibold text-gray-800">Como foi seu atendimento com ${workerName}?</p>
            <div class="flex space-x-2 justify-center mb-4">
                <button class="star-btn text-3xl" data-rating="1"><i class="fas fa-star"></i></button>
                <button class="star-btn text-3xl" data-rating="2"><i class="fas fa-star"></i></button>
                <button class="star-btn text-3xl" data-rating="3"><i class="fas fa-star"></i></button>
                <button class="star-btn text-3xl" data-rating="4"><i class="fas fa-star"></i></button>
                <button class="star-btn text-3xl" data-rating="5"><i class="fas fa-star"></i></button>
            </div>
            <button id="confirmRating" class="bg-green-500 text-white py-2 px-4 rounded mr-2">Confirmar</button>
            <button id="closeRatingAlert" class="bg-red-500 text-white py-2 px-4 rounded">Fechar</button>
        </div>
    `;
    document.body.appendChild(ratingAlert);

    let selectedRating = 0;

    const starButtons = ratingAlert.querySelectorAll('.star-btn');
    starButtons.forEach(button => {
        button.addEventListener('click', () => {
            selectedRating = parseInt(button.getAttribute('data-rating'));
            updateStars(selectedRating);
        });
    });

    function updateStars(rating) {
        starButtons.forEach((btn, index) => {
            if (index < rating) {
                btn.querySelector('i').classList.add('text-yellow-400');
            } else {
                btn.querySelector('i').classList.remove('text-yellow-400');
            }
        });
    }

    document.getElementById('confirmRating').addEventListener('click', () => {
        if (selectedRating > 0) {
            updateWorkerRating(workerName, selectedRating, appointmentIndex);
        } else {
            alert('Por favor, selecione uma avaliação antes de confirmar.');
        }
    });

    document.getElementById('closeRatingAlert').addEventListener('click', () => {
        ratingAlert.remove();
    });

    // Adiciona evento para fechar o modal
    document.getElementById('closeRatingAlert').addEventListener('click', () => {
        ratingAlert.remove();
    });

    setTimeout(() => {
        if (document.getElementById('ratingAlert')) {
            document.getElementById('ratingAlert').remove();
        }
    }, 30000); // Remove o alerta após 30 segundos se não houver interação
}

function updateWorkerRating(workerName, rating, appointmentIndex) {
    console.log("Iniciando atualização da avaliação para:", workerName, "com nota:", rating);
    const user = firebase.auth().currentUser;
    if (!user) {
        console.error("Usuário não está autenticado");
        alert("Você precisa estar logado para enviar uma avaliação.");
        return;
    }

    db.collection("appointments").doc(user.uid).get()
        .then((doc) => {
            console.log("Documento de agendamentos obtido");
            if (doc.exists) {
                const appointments = doc.data().appointments;
                const appointment = appointments[appointmentIndex];
                if (appointment && appointment.workerId) {
                    // Buscar o funcionário na coleção "workers"
                    return db.collection("workers").where("id", "==", appointment.workerId).get();
                } else {
                    throw new Error("ID do funcionário não encontrado no agendamento");
                }
            } else {
                throw new Error("Documento de agendamentos não encontrado");
            }
        })
        .then((querySnapshot) => {
            if (!querySnapshot.empty) {
                const workerDoc = querySnapshot.docs[0];
                const workerData = workerDoc.data();
                const newTotalRatings = (workerData.totalRatings || 0) + 1;
                const newAverageRating = ((workerData.rating || 0) * (newTotalRatings - 1) + rating) / newTotalRatings;
                console.log("Atualizando avaliação do funcionário:", newAverageRating);
                return workerDoc.ref.update({
                    rating: newAverageRating,
                    totalRatings: newTotalRatings
                });
            } else {
                throw new Error("Funcionário não encontrado");
            }
        })
        .then(() => {
            console.log("Avaliação atualizada com sucesso");
            alert('Obrigado pela sua avaliação!');
            document.getElementById('ratingAlert').remove();
            carregarAgendamentos(user);
        })
        .catch((error) => {
            console.error("Erro ao atualizar avaliação:", error);
            alert("Ocorreu um erro ao enviar a avaliação. Por favor, tente novamente.");
        });
}

function showRatingModal(index) {
    const user = firebase.auth().currentUser;
    db.collection("appointments").doc(user.uid).get()
        .then((doc) => {
            if (doc.exists) {
                const appointments = doc.data().appointments;
                if (appointments[index]) {
                    const appointment = appointments[index];
                    const ratingModal = document.getElementById('ratingModal');
                    const workerName = document.getElementById('workerName');
                    const establishmentName = document.getElementById('establishmentName');
                    const workerRating = document.getElementById('workerRating');
                    const establishmentRating = document.getElementById('establishmentRating');
                    const submitRating = document.getElementById('submitRating');

                    workerName.textContent = appointment.workerName;
                    establishmentName.textContent = appointment.establishmentName;

                    let workerScore = 0;
                    let establishmentScore = 0;

                    function updateStars(container, score) {
                        const stars = container.querySelectorAll('.fa-star');
                        stars.forEach((star, i) => {
                            if (i < score) {
                                star.classList.remove('text-gray-400');
                                star.classList.add('text-yellow-400');
                            } else {
                                star.classList.remove('text-yellow-400');
                                star.classList.add('text-gray-400');
                            }
                        });
                    }

                    workerRating.querySelectorAll('.fa-star').forEach((star, i) => {
                        star.onclick = () => {
                            workerScore = i + 1;
                            updateStars(workerRating, workerScore);
                        };
                    });

                    establishmentRating.querySelectorAll('.fa-star').forEach((star, i) => {
                        star.onclick = () => {
                            establishmentScore = i + 1;
                            updateStars(establishmentRating, establishmentScore);
                        };
                    });

                    submitRating.onclick = () => {
                        if (workerScore === 0 || establishmentScore === 0) {
                            alert('Por favor, avalie tanto o funcionário quanto o estabelecimento.');
                            return;
                        }

                        // Atualizar a avaliação do funcionário
                        const workerRef = db.collection("workers").doc(appointment.workerId);
                        workerRef.get().then((workerDoc) => {
                            if (workerDoc.exists) {
                                const workerData = workerDoc.data();
                                const totalRatings = (workerData.totalRatings || 0) + 1;
                                const newRating = ((workerData.rating || 0) * (totalRatings - 1) + workerScore) / totalRatings;

                                return workerRef.update({
                                    totalRatings: totalRatings,
                                    rating: newRating
                                });
                            } else {
                                return workerRef.set({
                                    totalRatings: 1,
                                    rating: workerScore,
                                    cnpj: appointment.establishmentCNPJ,
                                    id: appointment.workerId
                                });
                            }
                        }).then(() => {
                            // Atualizar o agendamento com as avaliações
                            appointments[index].workerRating = workerScore;
                            appointments[index].establishmentRating = establishmentScore;

                            return db.collection("appointments").doc(user.uid).update({
                                appointments: appointments
                            });
                        }).then(() => {
                            alert('Obrigado pela sua avaliação!');
                            ratingModal.classList.add('hidden');
                            ratingModal.classList.remove('flex');
                            carregarAgendamentos(user);
                        }).catch((error) => {
                            console.error("Erro ao salvar avaliação:", error);
                            alert("Ocorreu um erro ao salvar sua avaliação. Por favor, tente novamente.");
                        });
                    };

                    ratingModal.classList.remove('hidden');
                    ratingModal.classList.add('flex');
                } else {
                    throw new Error("Agendamento não encontrado");
                }
            } else {
                throw new Error("Documento de agendamentos não encontrado");
            }
        })
        .catch((error) => {
            console.error("Erro ao carregar informações do agendamento:", error);
            alert("Ocorreu um erro ao carregar as informações do agendamento. Por favor, tente novamente.");
        });
}