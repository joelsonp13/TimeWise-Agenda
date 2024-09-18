function realizarPagamento(index) {
    const user = firebase.auth().currentUser;
    if (!user) {
        alert("Você precisa estar logado para realizar o pagamento.");
        return;
    }

    db.collection("appointments").doc(user.uid).get()
        .then((doc) => {
            if (doc.exists) {
                const appointments = doc.data().appointments;
                if (appointments[index]) {
                    showPaymentModal(appointments[index], index);
                } else {
                    throw new Error("Agendamento não encontrado");
                }
            } else {
                throw new Error("Documento de agendamentos não encontrado");
            }
        })
        .catch((error) => {
            console.error("Erro ao buscar informações do agendamento:", error);
            alert("Ocorreu um erro ao processar o pagamento. Por favor, tente novamente.");
        });
}

function showPaymentModal(appointment, index) {
    const modal = document.getElementById('paymentModal');
    const modalTitle = document.getElementById('modalTitle');
    const paymentInfo = document.getElementById('paymentInfo');
    const paymentMethods = document.getElementById('paymentMethods');
    const pixPayment = document.getElementById('pixPayment');
    const cardPayment = document.getElementById('cardPayment');
    const cancelBtn = document.getElementById('cancelPayment');
    const confirmBtn = document.getElementById('confirmPayment');
    const backBtn = document.getElementById('backButton');

    paymentInfo.innerHTML = `
        <div class="space-y-2">
            <div class="flex items-center">
                <i class="fas fa-cut text-orange-custom mr-2 text-lg md:text-xl"></i>
                <p class="text-sm md:text-base"><strong>Serviço:</strong> ${appointment.serviceName}</p>
            </div>
            <div class="flex items-center justify-between bg-gray-800 p-3 rounded-lg">
                <div class="flex items-center">
                    <i class="fas fa-tag text-orange-custom mr-2 text-lg md:text-xl"></i>
                    <span class="text-sm md:text-base"><strong>Preço:</strong></span>
                </div>
                <span class="text-lg md:text-2xl font-bold text-orange-custom">R$ ${typeof appointment.price === 'number' ? appointment.price.toFixed(2) : appointment.price}</span>
            </div>
            <div class="flex items-center">
                <i class="fas fa-store text-orange-custom mr-2 text-lg md:text-xl"></i>
                <p class="text-sm md:text-base"><strong>Estabelecimento:</strong> ${appointment.establishmentName}</p>
            </div>
            <div class="flex items-center">
                <i class="fas fa-user text-orange-custom mr-2 text-lg md:text-xl"></i>
                <p class="text-sm md:text-base"><strong>Funcionário:</strong> ${appointment.workerName}</p>
            </div>
            <div class="flex items-center">
                <i class="far fa-calendar-alt text-orange-custom mr-2 text-lg md:text-xl"></i>
                <p class="text-sm md:text-base"><strong>Data:</strong> ${formatarData(getProximaData(appointment.day))}</p>
            </div>
            <div class="flex items-center">
                <i class="far fa-clock text-orange-custom mr-2 text-lg md:text-xl"></i>
                <p class="text-sm md:text-base"><strong>Horário:</strong> ${appointment.time}</p>
            </div>
        </div>
    `;

    modal.classList.remove('hidden');
    modal.classList.add('flex');

    function showInitialView() {
        paymentInfo.classList.remove('hidden');
        paymentMethods.classList.add('hidden');
        pixPayment.classList.add('hidden');
        cardPayment.classList.add('hidden');
        confirmBtn.classList.remove('hidden');
        backBtn.classList.add('hidden');
    }

    showInitialView();

    confirmBtn.onclick = () => {
        paymentInfo.classList.add('hidden');
        paymentMethods.classList.remove('hidden');
        confirmBtn.classList.add('hidden');
    };

    const paymentMethodBtns = document.querySelectorAll('.payment-method-btn');
    paymentMethodBtns.forEach(btn => {
        btn.onclick = () => {
            const method = btn.textContent.trim().toLowerCase();
            if (method.includes('pix')) {
                showPixPayment();
            } else if (method.includes('cartão')) {
                showCardPayment();
            } else {
                processPayment(index, method);
            }
        };
    });

    function showPixPayment() {
        paymentMethods.classList.add('hidden');
        pixPayment.classList.remove('hidden');
        backBtn.classList.remove('hidden');

        // Gerar QR Code e chave PIX (simulado)
        document.getElementById('pixQRCode').src = 'https://chart.googleapis.com/chart?cht=qr&chl=PIX1234567890&chs=200x200';
        document.getElementById('pixKey').textContent = 'PIX1234567890';

        document.getElementById('pixConfirmButton').onclick = () => {
            processPayment(index, 'PIX');
        };
    }

    function showCardPayment() {
        paymentMethods.classList.add('hidden');
        cardPayment.classList.remove('hidden');
        backBtn.classList.remove('hidden');

        const creditCardBtn = document.getElementById('creditCardBtn');
        const debitCardBtn = document.getElementById('debitCardBtn');
        const cardConfirmButton = document.getElementById('cardConfirmButton');

        let cardType = '';

        creditCardBtn.onclick = () => {
            cardType = 'Crédito';
            creditCardBtn.classList.add('bg-orange-custom');
            debitCardBtn.classList.remove('bg-orange-custom');
        };

        debitCardBtn.onclick = () => {
            cardType = 'Débito';
            debitCardBtn.classList.add('bg-orange-custom');
            creditCardBtn.classList.remove('bg-orange-custom');
        };

        cardConfirmButton.onclick = () => {
            if (!cardType) {
                alert('Por favor, selecione o tipo de cartão (Crédito ou Débito).');
                return;
            }
            const cardNumber = document.getElementById('cardNumber').value;
            const cardExpiry = document.getElementById('cardExpiry').value;
            const cardCVC = document.getElementById('cardCVC').value;
            const cardName = document.getElementById('cardName').value;

            if (!cardNumber || !cardExpiry || !cardCVC || !cardName) {
                alert('Por favor, preencha todos os campos do cartão.');
                return;
            }

            processPayment(index, `Cartão de ${cardType}`);
        };
    }

    backBtn.onclick = showInitialView;

    cancelBtn.onclick = () => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    };
}

function processPayment(index, paymentMethod) {
    const user = firebase.auth().currentUser;
    db.collection("appointments").doc(user.uid).get()
        .then((doc) => {
            if (doc.exists) {
                const appointments = doc.data().appointments;
                if (appointments[index]) {
                    appointments[index].pagamento = true;
                    appointments[index].metodoPagamento = paymentMethod;
                    return db.collection("appointments").doc(user.uid).update({
                        appointments: appointments
                    }).then(() => {
                        return appointments[index]; // Retorna o agendamento atualizado
                    });
                } else {
                    throw new Error("Agendamento não encontrado");
                }
            } else {
                throw new Error("Documento de agendamentos não encontrado");
            }
        })
        .then((updatedAppointment) => {
            alert(`Pagamento realizado com sucesso via ${paymentMethod}!`);
            carregarAgendamentos(user);
            // Chama a função para mostrar o alerta de avaliação
            showRatingAlert(updatedAppointment.workerName, index);
            // Esconde o modal de pagamento
            const modal = document.getElementById('paymentModal');
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        })
        .catch((error) => {
            console.error("Erro ao realizar pagamento:", error);
            alert("Ocorreu um erro ao processar o pagamento. Por favor, tente novamente.");
        });
}