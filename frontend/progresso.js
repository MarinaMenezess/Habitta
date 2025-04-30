document.addEventListener('DOMContentLoaded', () => {
    // Inicializar a página
    carregarDadosUsuario();
    carregarEstatisticas();
    carregarTemasPorQuantidade();
    
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
}

// Função para carregar estatísticas do usuário
function carregarEstatisticas() {
    const usuarioData = localStorage.getItem('usuario');
    if (!usuarioData) {
        return;
    }
    
    const usuario = JSON.parse(usuarioData);
    
    // Buscar estatísticas do usuário da API
    fetch('http://localhost:3000/api/habits/stats/summary', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'user-id': usuario.id
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.sucesso) {
            atualizarEstatisticasProgresso(data.dados);
        }
    })
    .catch(error => {
        console.error('Erro ao carregar estatísticas:', error);
    });
}

// Função para atualizar as estatísticas na UI
function atualizarEstatisticasProgresso(stats) {
    // Atualizar recorde de dias seguidos
    const recordeDiasElement = document.querySelector('.progress-card h1');
    if (recordeDiasElement) {
        recordeDiasElement.textContent = stats.current_streak || '0';
    }
}

// Função para carregar temas por quantidade de hábitos
function carregarTemasPorQuantidade() {
    const usuarioData = localStorage.getItem('usuario');
    if (!usuarioData) {
        return;
    }
    
    const usuario = JSON.parse(usuarioData);
    
    // Buscar estatísticas por tema
    fetch('http://localhost:3000/api/habits/stats/by-theme', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'user-id': usuario.id
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.sucesso) {
            const estatisticas = data.dados;
            
            // Encontrar o tema com mais hábitos concluídos
            let temaMaisConcluido = null;
            let maxConclusoes = -1;
            
            for (const tema in estatisticas) {
                if (estatisticas[tema].concluidos > maxConclusoes) {
                    maxConclusoes = estatisticas[tema].concluidos;
                    temaMaisConcluido = tema;
                }
            }
            
            // Atualizar o elemento HTML do tema mais concluído
            const elemento = document.getElementById('tema-mais-concluido');
            if (elemento && temaMaisConcluido) {
                elemento.textContent = mapeamentoTemas[temaMaisConcluido] || temaMaisConcluido;
            }
            
            // Atualizar lista de temas
            const tasksList = document.getElementById('tasks');
            if (tasksList) {
                tasksList.innerHTML = '';
                
                // Filtrar apenas temas que têm hábitos
                const temasComHabitos = Object.entries(estatisticas)
                    .filter(([_, stats]) => stats.total > 0)
                    .sort(([,a], [,b]) => b.concluidos - a.concluidos);
                
                temasComHabitos.forEach(([tema, stats]) => {
                    const nomeTemaMostrar = mapeamentoTemas[tema] || tema;
                    const temaElement = document.createElement('li');
                    temaElement.className = 'task';
                    temaElement.innerHTML = `
                        <p class="task-name">${nomeTemaMostrar}</p>
                        <a href="./habitos.html?tema=${tema}">
                            <div class="task-info">
                                <p>${stats.total} ${stats.total === 1 ? 'hábito' : 'hábitos'} - ${stats.concluidos} ${stats.concluidos === 1 ? 'conclusão' : 'conclusões'}</p>
                                <img src="./assets/arrow-right-short.svg" alt="">
                            </div>
                        </a>
                    `;
                    tasksList.appendChild(temaElement);
                });

                // Se não houver hábitos em nenhum tema
                if (temasComHabitos.length === 0) {
                    const semHabitos = document.createElement('li');
                    semHabitos.className = 'task';
                    semHabitos.innerHTML = `
                        <p class="task-name">Nenhum hábito cadastrado</p>
                        <div class="task-info">
                            <p>Clique em "Criar novo hábito" para começar</p>
                        </div>
                    `;
                    tasksList.appendChild(semHabitos);
                }
            }
        }
    })
    .catch(error => {
        console.error('Erro ao carregar estatísticas por tema:', error);
    });
}

// Mapeamento de temas para nomes amigáveis
const mapeamentoTemas = {
    'saudeMental': 'Saúde e Bem-estar',
    'saudeFisica': 'Saúde Física',
    'produtividade': 'Produtividade / Desenvolvimento Pessoal',
    'rotinaPessoal': 'Autocuidado / Rotina Pessoal',
    'trabalhoEstudo': 'Trabalho / Estudo',
    'financasPessoais': 'Finanças Pessoais',
    'outros': 'Outros'
};

// Função para cadastrar um novo hábito
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
            
            // Recarregar os dados
            carregarEstatisticas();
            carregarTemasPorQuantidade();
        } else {
            alert('Erro ao cadastrar hábito: ' + data.mensagem);
        }
    })
    .catch(error => {
        console.error('Erro ao cadastrar hábito:', error);
        alert('Erro ao cadastrar hábito. Tente novamente mais tarde.');
    });
}
