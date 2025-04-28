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
    
    // Adicionar função de logout
    const perfilBtn = document.getElementById('perfil');
    if (perfilBtn) {
        perfilBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm('Deseja sair da sua conta?')) {
                localStorage.removeItem('usuario');
                localStorage.removeItem('usuarioId');
                localStorage.removeItem('usuarioNome');
                localStorage.removeItem('usuarioEmail');
                window.location.href = 'login.html';
            }
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
    
    // Buscar hábitos do usuário agrupados por tema
    fetch('http://localhost:3000/api/habits', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'user-id': usuario.id
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.sucesso) {
            const habitos = data.dados;
            
            // Agrupar hábitos por tema
            const temasPorQuantidade = contarHabitosPorTema(habitos);
            
            // Atualizar lista de temas
            atualizarListaTemas(temasPorQuantidade);
            
            // Atualizar tema com mais hábitos
            const temaMaisHabitos = encontrarTemaMaisHabitos(temasPorQuantidade);
            const temaMaisHabitosElement = document.querySelector('.progress-card:nth-child(2) b');
            if (temaMaisHabitosElement) {
                temaMaisHabitosElement.textContent = temaMaisHabitos || 'Nenhum tema';
            }
        }
    })
    .catch(error => {
        console.error('Erro ao carregar hábitos por tema:', error);
    });
}

// Função para contar hábitos por tema
function contarHabitosPorTema(habitos) {
    const temasPorQuantidade = {};
    
    // Mapeamento de valores de tema do banco para nomes exibidos no frontend
    const mapeamentoTemas = {
        'saudeMental': 'Saúde e Bem-estar',
        'saudeFisica': 'Saúde Física',
        'produtividade': 'Produtividade / Desenvolvimento Pessoal',
        'rotinaPessoal': 'Autocuidado / Rotina Pessoal',
        'trabalhoEstudo': 'Trabalho / Estudo',
        'financasPessoais': 'Finanças Pessoais'
    };
    
    // Contar hábitos por tema
    habitos.forEach(habito => {
        const tema = habito.tema || 'trabalhoEstudo'; // Usar valor padrão se não tiver tema
        const temaExibicao = mapeamentoTemas[tema] || 'Outros';
        
        if (!temasPorQuantidade[temaExibicao]) {
            temasPorQuantidade[temaExibicao] = [];
        }
        
        temasPorQuantidade[temaExibicao].push(habito);
    });
    
    return temasPorQuantidade;
}

// Função para encontrar o tema com mais hábitos
function encontrarTemaMaisHabitos(temasPorQuantidade) {
    let temaMaisHabitos = null;
    let maxQuantidade = 0;
    
    for (const tema in temasPorQuantidade) {
        const quantidade = temasPorQuantidade[tema].length;
        
        if (quantidade > maxQuantidade) {
            maxQuantidade = quantidade;
            temaMaisHabitos = tema;
        }
    }
    
    return temaMaisHabitos;
}

// Função para atualizar a lista de temas na UI
function atualizarListaTemas(temasPorQuantidade) {
    const tasksList = document.getElementById('tasks');
    
    if (!tasksList) return;
    
    // Limpar lista atual
    tasksList.innerHTML = '';
    
    // Se não tiver temas, exibir mensagem
    if (Object.keys(temasPorQuantidade).length === 0) {
        tasksList.innerHTML = '<p>Você ainda não tem hábitos cadastrados.</p>';
        return;
    }
    
    // Para cada tema, criar um item de lista
    for (const tema in temasPorQuantidade) {
        const habitos = temasPorQuantidade[tema];
        const quantidade = habitos.length;
        
        const temaElement = document.createElement('li');
        temaElement.className = 'task';
        temaElement.innerHTML = `
            <p class="task-name">${tema}</p>
            <a href="./habitos.html">
              <div class="task-info">
                  <p>${quantidade} hábitos a fazer</p>
                  <img src="./assets/arrow-right-short.svg" alt="">
              </div>
            </a>
        `;
        
        tasksList.appendChild(temaElement);
    }
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
            
            // Recarregar a página para mostrar os dados atualizados
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
