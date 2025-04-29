document.addEventListener('DOMContentLoaded', () => {
    // Inicializar a página
    carregarDadosUsuario();
    carregarRecompensas();
    
    // Adicionar eventos para botões e elementos interativos
    const abrirModal = document.querySelector('.new-habit');
    const modal = document.getElementById('HabitModalScreen');
    
    if (abrirModal) {
        abrirModal.addEventListener('click', () => {
            modal.style.display = 'block';
        });
    }
    
    const closeModalButton = document.querySelector('.fecharModalHabit');
    if (closeModalButton) {
        closeModalButton.onclick = function() {
            modal.style.display = 'none';
            limparFormularioHabito();
        }
    }
    
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
            limparFormularioHabito();
        }
    };
    
    // Adicionar evento para cadastrar hábito
    const btnCadastrarHabito = document.getElementById('cadastrarHabito');
    if (btnCadastrarHabito) {
        btnCadastrarHabito.addEventListener('click', cadastrarHabito);
    }
    
    // Configurar função de perfil (ícone de perfil)
    const perfilBtn = document.getElementById('perfil');
    if (perfilBtn) {
        perfilBtn.addEventListener('click', (e) => {
            // Não fazer nada especial, deixar o link navegar normalmente para a página de perfil
            // O comportamento padrão de navegação será mantido
        });
    }
});

// Função para limpar o formulário de hábito
function limparFormularioHabito() {
    const tituloHabito = document.getElementById('tituloHabito');
    const descricaoHabito = document.getElementById('descricaoHabito');
    const metaDiaria = document.getElementById('metaDiaria');
    
    if (tituloHabito) tituloHabito.value = '';
    if (descricaoHabito) descricaoHabito.value = '';
    if (metaDiaria) metaDiaria.value = '';
}

// Função para carregar dados do usuário logado
function carregarDadosUsuario() {
    // Verificar primeiro se temos o usuario no localStorage
    let usuarioData = localStorage.getItem('usuario');
    
    // Se não encontrar, tentar buscar pelos campos individuais (compatibilidade com login.js)
    if (!usuarioData) {
        const usuarioId = localStorage.getItem('usuarioId');
        const usuarioNome = localStorage.getItem('usuarioNome');
        const usuarioEmail = localStorage.getItem('usuarioEmail');
        
        if (usuarioId && usuarioNome) {
            // Construir o objeto usuario baseado nos campos individuais
            const usuario = {
                id: usuarioId,
                nome: usuarioNome,
                email: usuarioEmail,
                pontos: 0 // Valor padrão, será atualizado depois
            };
            
            // Salvar no localStorage no formato correto para futuros acessos
            localStorage.setItem('usuario', JSON.stringify(usuario));
            usuarioData = JSON.stringify(usuario);
        } else {
            // Se não encontrar dados de login em nenhum formato, redirecionar para login
            window.location.href = 'login.html';
            return;
        }
    }
    
    // Atualizar pontos do usuário
    atualizarInformacoesPerfil();
}

// Função para atualizar informações do perfil do usuário
function atualizarInformacoesPerfil() {
    const usuarioData = localStorage.getItem('usuario');
    if (!usuarioData) return;
    
    const usuario = JSON.parse(usuarioData);
    
    // Buscar informações do usuário da API
    fetch(`http://localhost:3000/api/users/me`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'user-id': usuario.id
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.sucesso) {
            const usuarioAtualizado = data.dados;
            usuario.pontos = usuarioAtualizado.pontos || 0;
            localStorage.setItem('usuario', JSON.stringify(usuario));
        }
    })
    .catch(error => {
        console.error('Erro ao buscar informações do usuário:', error);
    });
}

// Função para carregar recompensas do usuário
function carregarRecompensas() {
    const usuarioData = localStorage.getItem('usuario');
    if (!usuarioData) return;
    
    const usuario = JSON.parse(usuarioData);
    
    // Carregar conquistas disponíveis e o progresso do usuário
    Promise.all([
        fetch('http://localhost:3000/api/achievements', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(response => response.json()),
        
        fetch('http://localhost:3000/api/achievements/user', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'user-id': usuario.id
            }
        }).then(response => response.json()),
        
        fetch('http://localhost:3000/api/achievements/progress', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'user-id': usuario.id
            }
        }).then(response => response.json())
    ])
    .then(([todasRecompensas, recompensasUsuario, progressoUsuario]) => {
        if (todasRecompensas.sucesso && progressoUsuario.sucesso) {
            const recompensasData = progressoUsuario.dados.conquistas;
            atualizarListaRecompensas(recompensasData, usuario.pontos);
            adicionarEventosColetarRecompensa();
        }
    })
    .catch(error => {
        console.error('Erro ao carregar recompensas:', error);
    });
}

// Função para atualizar a lista de recompensas na UI
function atualizarListaRecompensas(recompensas, pontosUsuario) {
    const recompensasList = document.getElementById('recompensas');
    if (!recompensasList) return;
    
    console.log("Pontos do usuário:", pontosUsuario);  // Debug para verificar os pontos
    
    // Limpar lista atual
    recompensasList.innerHTML = '';
    
    // Se não houver recompensas, mostrar mensagem
    if (!recompensas || recompensas.length === 0) {
        recompensasList.innerHTML = '<p>Não há recompensas disponíveis no momento.</p>';
        return;
    }
    
    // Ordenar recompensas: primeiro as não conquistadas, depois as conquistadas
    recompensas.sort((a, b) => {
        if (a.achieved === b.achieved) return 0;
        return a.achieved ? 1 : -1;
    });
    
    // Para cada recompensa, criar um item na lista
    recompensas.forEach(recompensa => {
        const item = document.createElement('li');
        item.className = `recompensa ${recompensa.achieved ? '' : 'blocked'}`;
        item.dataset.id = recompensa.id;
        item.dataset.pontos = recompensa.pontos;
        item.dataset.achieved = recompensa.achieved;
        
        console.log("Recompensa:", recompensa.titulo, "Pontos necessários:", recompensa.pontos, "Achieved:", recompensa.achieved);  // Debug
        
        if (recompensa.achieved) {
            // Recompensa já conquistada
            item.innerHTML = `
                <div class="recomp">
                    <img src="./assets/star-fill.svg" alt="">
                    <h1 class="recomp-title">${recompensa.titulo}</h1>
                </div>
                <p>Recompensa já coletada</p>
                <h3>${recompensa.pontos} pontos</h3>
            `;
        } else {
            // Verificar se o usuário tem pontos suficientes para esta recompensa
            // Converter para números para garantir comparação correta
            const pontosRecompensa = parseInt(recompensa.pontos) || 0;
            const pontosAtual = parseInt(pontosUsuario) || 0;
            const podeResgatar = pontosAtual >= pontosRecompensa;
            
            console.log(`Pode resgatar ${recompensa.titulo}? ${podeResgatar} (Usuário: ${pontosAtual}, Necessário: ${pontosRecompensa})`);  // Debug
            
            if (podeResgatar) {
                // Recompensa disponível para coleta
                item.classList.remove('blocked');  // Remover classe blocked para evitar inconsistências
                item.innerHTML = `
                    <div class="recomp">
                        <img src="./assets/star-fill.svg" alt="">
                        <h1 class="recomp-title">${recompensa.titulo}</h1>
                    </div>
                    <p class="coletar-recompensa" style="cursor: pointer; color: #703ACF; font-weight: bold;">Coletar recompensa</p>
                    <h3>${recompensa.pontos} pontos</h3>
                `;
            } else {
                // Recompensa bloqueada
                item.innerHTML = `
                    <h1 class="recomp-title blocked">${recompensa.titulo}</h1>
                    <p>Conclua para coletar a recompensa</p>
                    <h3>${recompensa.pontos} pontos</h3>
                `;
            }
        }
        
        recompensasList.appendChild(item);
    });
    
    // Adicionar eventos após renderizar todos os itens
    adicionarEventosColetarRecompensa();
}

// Função para adicionar eventos aos botões de coletar recompensa
function adicionarEventosColetarRecompensa() {
    const botoesColetar = document.querySelectorAll('.coletar-recompensa');
    console.log(`Encontrado ${botoesColetar.length} botões de coleta`);  // Debug
    
    botoesColetar.forEach(botao => {
        botao.addEventListener('click', function() {
            const item = this.closest('.recompensa');
            const recompensaId = item.dataset.id;
            console.log(`Clicado em coletar recompensa ID: ${recompensaId}`);  // Debug
            coletarRecompensa(recompensaId, item);
        });
    });
}

// Função para coletar uma recompensa
function coletarRecompensa(recompensaId, elementoRecompensa) {
    const usuarioData = localStorage.getItem('usuario');
    if (!usuarioData) return;
    
    const usuario = JSON.parse(usuarioData);
    console.log(`Coletando recompensa ${recompensaId} para usuário ${usuario.id} com ${usuario.pontos} pontos`);  // Debug
    
    // Mostrar feedback de sucesso imediatamente
    const mensagemElement = document.createElement('div');
    mensagemElement.className = 'mensagem sucesso';
    mensagemElement.textContent = 'Recompensa coletada com sucesso!';
    
    const mainContent = document.querySelector('.main-content');
    mainContent.insertBefore(mensagemElement, mainContent.firstChild);
    
    try {
        // Atualizar o elemento na UI
        const tituloRecompensa = elementoRecompensa.querySelector('.recomp-title').textContent;
        const pontosRecompensa = elementoRecompensa.dataset.pontos;
        
        elementoRecompensa.innerHTML = `
            <div class="recomp">
                <img src="./assets/star-fill.svg" alt="">
                <h1 class="recomp-title">${tituloRecompensa}</h1>
            </div>
            <p>Recompensa já coletada</p>
            <h3>${pontosRecompensa} pontos</h3>
        `;
        elementoRecompensa.dataset.achieved = "true";
        elementoRecompensa.classList.remove('blocked');
        
        // Atualizar os pontos do usuário (simulação)
        usuario.pontos = (parseInt(usuario.pontos) || 0) + (parseInt(pontosRecompensa) || 0);
        localStorage.setItem('usuario', JSON.stringify(usuario));
        console.log(`Pontos atualizados: ${usuario.pontos}`);  // Debug
        
        // Aqui você poderia adicionar uma chamada real à API para persistir a mudança
        // fetch('/api/achievements/collect', {...})
    } catch (error) {
        console.error("Erro ao processar recompensa:", error);
        mensagemElement.className = 'mensagem erro';
        mensagemElement.textContent = 'Erro ao coletar recompensa. Tente novamente.';
    }
    
    // Remover mensagem após 3 segundos
    setTimeout(() => {
        mensagemElement.remove();
    }, 3000);
}

// Função para cadastrar um novo hábito (reaproveitada do index.js)
function cadastrarHabito(event) {
    event.preventDefault();
    
    const titulo = document.getElementById('tituloHabito').value;
    const descricao = document.getElementById('descricaoHabito').value;
    const metaDiaria = document.getElementById('metaDiaria').value;
    const recorrencia = document.getElementById('recorrencia').value;
    const temaHabito = document.getElementById('temaHabito').value;
    
    if (!titulo) {
        alert('O título do hábito é obrigatório!');
        return;
    }
    
    const usuarioData = localStorage.getItem('usuario');
    if (!usuarioData) {
        alert('Você precisa estar logado para criar um hábito!');
        return;
    }
    
    const usuario = JSON.parse(usuarioData);
    
    fetch('http://localhost:3000/api/habits', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'user-id': usuario.id
        },
        body: JSON.stringify({
            titulo,
            descricao,
            meta_diaria: metaDiaria || 1,
            recorrencia,
            tema: temaHabito
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.sucesso) {
            alert('Hábito cadastrado com sucesso!');
            
            // Fechar o modal
            const modal = document.getElementById('HabitModalScreen');
            if (modal) {
                modal.style.display = 'none';
            }
            
            // Limpar o formulário
            limparFormularioHabito();
        } else {
            alert('Erro ao cadastrar hábito: ' + data.mensagem);
        }
    })
    .catch(error => {
        console.error('Erro ao cadastrar hábito:', error);
        alert('Erro ao cadastrar hábito. Tente novamente mais tarde.');
    });
}
