document.addEventListener('DOMContentLoaded', () => {
    // Carregar notificações do localStorage
    carregarNotificacoes();
    
    // Adicionar botão para marcar todas como lidas
    marcarTodasComoLidas();
    
    // Configurar modal de hábito (já presente no HTML)
    const abrirModal = document.querySelector('.new-habit');
    const modal = document.getElementById('HabitModalScreen');
    const editModal = document.getElementById('HabitEditModalScreen');

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

    const fecharEditModalHabit = document.querySelector('.fecharEditModalHabit');
    if (fecharEditModalHabit) {
        fecharEditModalHabit.onclick = function() {
            editModal.style.display = 'none'; 
        }  
    }

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
            limparFormularioHabito();
        }
        if (event.target == editModal) {
            editModal.style.display = 'none';
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

// Função para atualizar o indicador de notificações
function atualizarIndicadorNotificacoes() {
    // Buscar notificações no localStorage
    const notificacoes = JSON.parse(localStorage.getItem('notificacoes') || '[]');
    
    // Contar notificações não lidas
    const naoLidas = notificacoes.filter(n => !n.lida).length;
    
    // Buscar elementos de notificação em todos os links do menu
    const linksNotificacao = document.querySelectorAll('a[href="notificacoes.html"]');
    
    linksNotificacao.forEach(link => {
        // Remover contador anterior, se existir
        const contador = link.querySelector('.contador-notificacoes');
        if (contador) {
            contador.remove();
        }
        
        // Adicionar contador se houver notificações não lidas
        if (naoLidas > 0) {
            const span = document.createElement('span');
            span.className = 'contador-notificacoes';
            span.textContent = naoLidas > 9 ? '9+' : naoLidas;
            link.appendChild(span);
        }
    });
}

// Carregar as notificações do localStorage e exibi-las
function carregarNotificacoes() {
    console.log("Carregando notificações...");
    // Buscar notificações no localStorage
    let notificacoes = JSON.parse(localStorage.getItem('notificacoes') || '[]');
    
    // Ordenar por data (mais recentes primeiro)
    notificacoes.sort((a, b) => new Date(b.data) - new Date(a.data));
    
    // Referência à lista de notificações
    const listaNotificacoes = document.querySelector('.notificacoes ul');
    
    // Limpar a lista atual
    if (listaNotificacoes) {
        listaNotificacoes.innerHTML = '';
        
        if (notificacoes.length === 0) {
            listaNotificacoes.innerHTML = '<li class="notificacao-vazia"><p>Você não tem notificações</p></li>';
            return;
        }
        
        // Adicionar cada notificação à lista
        notificacoes.forEach(notificacao => {
            const tempoPassado = calcularTempoPassado(new Date(notificacao.data));
            
            const li = document.createElement('li');
            li.className = 'notificacao';
            li.innerHTML = `
                <div class="not-info">
                    <h3>${notificacao.mensagem}</h3>
                    <p>${tempoPassado}</p>
                </div>
                <div class="nao-visto"></div>
            `;
            
            // Adicionar evento de clique para marcar como lido
            li.addEventListener('click', () => marcarNotificacaoComoLida(notificacao.id, li));
            
            // Se já estiver lida, remover o indicador
            if (notificacao.lida) {
                const indicador = li.querySelector('.nao-visto');
                if (indicador) {
                    indicador.remove();
                }
            }
            
            listaNotificacoes.appendChild(li);
        });
    } else {
        console.error("Lista de notificações não encontrada no DOM");
    }
    
    // Atualizar o contador de notificações não lidas
    atualizarIndicadorNotificacoes();
}

// Calcular o tempo passado desde uma data (2 min, 3h, 1d, etc.)
function calcularTempoPassado(data) {
    const agora = new Date();
    const diff = agora - data; // diferença em milissegundos
    
    const minutos = Math.floor(diff / (1000 * 60));
    const horas = Math.floor(diff / (1000 * 60 * 60));
    const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (minutos < 60) {
        return `${minutos} min`;
    } else if (horas < 24) {
        return `${horas}h`;
    } else {
        return `${dias}d`;
    }
}

// Marcar uma notificação como lida
function marcarNotificacaoComoLida(id, elemento) {
    let notificacoes = JSON.parse(localStorage.getItem('notificacoes') || '[]');
    
    // Encontrar e atualizar a notificação
    const notificacaoIndex = notificacoes.findIndex(n => n.id === id);
    if (notificacaoIndex !== -1) {
        notificacoes[notificacaoIndex].lida = true;
        localStorage.setItem('notificacoes', JSON.stringify(notificacoes));
        
        // Remover o indicador visual
        const indicador = elemento.querySelector('.nao-visto');
        if (indicador) {
            indicador.remove();
        }
    }
}

// Função para limpar o formulário de hábito (copiada do index.js para consistência)
function limparFormularioHabito() {
    const tituloHabito = document.getElementById('tituloHabito');
    const descricaoHabito = document.getElementById('descricaoHabito');
    const metaDiaria = document.getElementById('metaDiaria');
    
    if (tituloHabito) tituloHabito.value = '';
    if (descricaoHabito) descricaoHabito.value = '';
    if (metaDiaria) metaDiaria.value = '';
}

// Função para cadastrar hábito (copiada do index.js para consistência)
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
            recorrencia
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
            
            // Adicionar notificação sobre novo hábito criado
            adicionarNotificacao(`Novo hábito criado: <b>${titulo}</b>`);
        } else {
            alert('Erro ao cadastrar hábito: ' + data.mensagem);
        }
    })
    .catch(error => {
        console.error('Erro ao cadastrar hábito:', error);
        alert('Erro ao cadastrar hábito. Tente novamente mais tarde.');
    });
}

// Função para gerar um ID único para as notificações
function gerarIdUnico() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// Função para adicionar uma notificação
function adicionarNotificacao(mensagem, tipo = 'info') {
    // Obter o array de notificações existente
    let notificacoes = JSON.parse(localStorage.getItem('notificacoes') || '[]');
    
    // Criar nova notificação
    const novaNotificacao = {
        id: gerarIdUnico(),
        mensagem: mensagem,
        tipo: tipo,
        data: new Date(),
        lida: false
    };
    
    // Adicionar no início do array (para aparecer primeiro)
    notificacoes.unshift(novaNotificacao);
    
    // Limitar a 50 notificações para não sobrecarregar o localStorage
    if (notificacoes.length > 50) {
        notificacoes = notificacoes.slice(0, 50);
    }
    
    // Salvar no localStorage
    localStorage.setItem('notificacoes', JSON.stringify(notificacoes));
    
    console.log('Notificação adicionada:', novaNotificacao);
    
    // Se estivermos na página de notificações, atualizar a visualização
    if (window.location.pathname.includes('notificacoes.html')) {
        carregarNotificacoes();
    }
    
    return novaNotificacao;
}

// Marcar todas as notificações como lidas
function marcarTodasComoLidas() {
    const botaoMarcarLidas = document.createElement('button');
    botaoMarcarLidas.id = 'marcarTodasLidas';
    botaoMarcarLidas.textContent = 'Marcar todas como lidas';
    
    // Adicionar o botão após o título
    const tituloPagina = document.getElementById('title');
    if (tituloPagina && !document.getElementById('marcarTodasLidas')) {
        tituloPagina.parentNode.insertBefore(botaoMarcarLidas, tituloPagina.nextSibling);
        
        botaoMarcarLidas.addEventListener('click', () => {
            let notificacoes = JSON.parse(localStorage.getItem('notificacoes') || '[]');
            
            // Marcar todas como lidas
            notificacoes = notificacoes.map(n => ({...n, lida: true}));
            localStorage.setItem('notificacoes', JSON.stringify(notificacoes));
            
            // Recarregar a página para atualizar a visualização
            carregarNotificacoes();
        });
    }
}
