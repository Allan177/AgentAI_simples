

    const messagesEl = document.getElementById("messages");
    const inputEl = document.getElementById("msgInput");
    const fileInput = document.getElementById("fileInput");
    const sendBtn = document.getElementById("sendBtn");
    let welcomeScreen = document.getElementById("welcomeScreen");

    const userAvatarSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"></path></svg>`;
    const botAvatarSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27z"></path></svg>`;

    function clearWelcomeScreen() {
        if (welcomeScreen) {
            welcomeScreen.remove();
            welcomeScreen = null;
        }
    }
    
    function addMessage(text, from) {
        clearWelcomeScreen();

        const wrapper = document.createElement("div");
        wrapper.classList.add("message-wrapper", from);

        const avatar = document.createElement("div");
        avatar.classList.add("avatar", from);
        avatar.innerHTML = from === 'user' ? userAvatarSVG : botAvatarSVG;

        const messageDiv = document.createElement("div");
        messageDiv.classList.add("message-content");
        messageDiv.textContent = text;
        
        wrapper.appendChild(avatar);
        wrapper.appendChild(messageDiv);
        
        messagesEl.appendChild(wrapper);
        messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    function addLoading() {
        clearWelcomeScreen();
        
        const wrapper = document.createElement("div");
        wrapper.classList.add("message-wrapper", "bot");
        wrapper.id = "loading-indicator";

        const avatar = document.createElement("div");
        avatar.classList.add("avatar", "bot");
        avatar.innerHTML = botAvatarSVG;
        
        const loadingContainer = document.createElement("div");
        loadingContainer.classList.add("loading-container");
        for (let i = 0; i < 3; i++) {
            const dot = document.createElement("div");
            dot.classList.add("loading-dot");
            loadingContainer.appendChild(dot);
        }

        wrapper.appendChild(avatar);
        wrapper.appendChild(loadingContainer);

        messagesEl.appendChild(wrapper);
        messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    function removeLoading() {
        const loaderEl = document.getElementById("loading-indicator");
        if(loaderEl) loaderEl.remove();
    }

    // PASSO 2: FUNÇÃO ATUALIZADA COM AXIOS
    async function sendMessage() {
        const text = inputEl.value.trim();
        const file = fileInput.files[0];
        if (!text && !file) return;

        let userText = text;
        if (file) {
            userText += `\n[Anexo: ${file.name}]`;
        }

        addMessage(userText, "user");
        inputEl.value = "";
        fileInput.value = "";
        // Dispara um evento de input para o CSS atualizar o estilo do botão
        inputEl.dispatchEvent(new Event('input')); 

        addLoading();

        const formData = new FormData();
        formData.append("message", text);
        if (file) {
            formData.append("file", file);
        }

        try {
            // Usando Axios com um timeout de 30 segundos (30000 ms)
            const response = await axios.post("https://allansantos.app.n8n.cloud/webhook/ab38cb11-23de-446b-9279-f3eec34a5d74", formData, {
                timeout: 30000 
            });

            removeLoading();
            
            // Axios já trata o JSON. A resposta está em response.data
            const reply = response.data?.mensagem || JSON.stringify(response.data);
            addMessage(reply, "bot");

        } catch (error) {
            removeLoading();
            console.error("Erro detalhado na requisição Axios:", error);

            // Lógica de erro aprimorada
            if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
                addMessage("❌ O servidor demorou muito para responder. Tente uma pergunta mais simples ou verifique o status do servidor.", "bot");
            } else if (error.response) {
                // O servidor respondeu com um status de erro (4xx, 5xx)
                addMessage(`❌ Erro no servidor (Código: ${error.response.status}). Não foi possível processar a solicitação.`, "bot");
            } else if (error.request) {
                // A requisição foi feita, mas nenhuma resposta foi recebida
                addMessage("❌ Não foi possível conectar ao servidor. Verifique sua conexão com a internet.", "bot");
            } else {
                // Erro ao configurar a requisição
                addMessage("❌ Ocorreu um erro inesperado ao tentar enviar a mensagem.", "bot");
            }
        }
    }

    sendBtn.addEventListener("click", sendMessage);
    inputEl.addEventListener("keydown", e => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // Adiciona um listener para o CSS reagir à presença de texto
    inputEl.addEventListener('input', () => {
        // Esta função está vazia de propósito.
        // O CSS usa o seletor :not(:placeholder-shown) que já faz isso
        // de forma nativa e mais eficiente.
    });

    document.querySelectorAll('nav button')[1].addEventListener('click', () => {
    location.reload();
});
