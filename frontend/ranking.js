document.addEventListener('DOMContentLoaded', () => {
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

    // Configurar função de logout (ícone de perfil)
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

    // Carregar dados do ranking
    carregarRanking();
});

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
        } else {
            alert('Erro ao cadastrar hábito: ' + data.mensagem);
        }
    })
    .catch(error => {
        console.error('Erro ao cadastrar hábito:', error);
        alert('Erro ao cadastrar hábito. Tente novamente mais tarde.');
    });
}

// Função para carregar o ranking
function carregarRanking() {
    fetch('http://localhost:3000/api/users/ranking', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.sucesso) {
            // Obter o usuário logado para destacar no ranking
            const usuarioData = localStorage.getItem('usuario');
            if (!usuarioData) {
                window.location.href = 'login.html';
                return;
            }
            
            const usuarioLogado = JSON.parse(usuarioData);
            
            // Exibir o ranking
            exibirRanking(data.dados, usuarioLogado);
        } else {
            console.error('Erro ao carregar ranking:', data.mensagem);
        }
    })
    .catch(error => {
        console.error('Erro ao carregar ranking:', error);
    });
}

// Função para exibir o ranking
function exibirRanking(usuarios, usuarioLogado) {
    const rankingList = document.getElementById('ranking');
    
    if (!rankingList) return;
    
    // Limpar o ranking atual
    rankingList.innerHTML = '';
    
    // Verificar se há dados no ranking
    if (usuarios.length === 0) {
        rankingList.innerHTML = '<li>Nenhum usuário no ranking</li>';
        return;
    }
    
    // Variável para verificar se o usuário está nos primeiros 5
    let usuarioEstaNoTop = false;
    let posicaoUsuario = -1;
    
    // Criar elementos para os 5 primeiros usuários
    for (let i = 0; i < Math.min(5, usuarios.length); i++) {
        const usuario = usuarios[i];
        
        // Verificar se este usuário é o usuário logado
        const isUsuarioLogado = usuario.id == usuarioLogado.id;
        
        if (isUsuarioLogado) {
            usuarioEstaNoTop = true;
            posicaoUsuario = i + 1;
        }
        
        // Criar o elemento li
        const li = document.createElement('li');
        li.className = 'ranking-user';
        li.id = isUsuarioLogado ? 'user' : `${i + 1}th`;
        
        // Determinar o conteúdo baseado na posição
        let position;
        if (i === 0) {
            position = '<img src="./assets/crown.svg" alt="" class="place">';
        } else {
            position = `<p class="place">${String(i + 1).padStart(2, '0')}</p>`;
        }
        
        // Definir o conteúdo HTML
        li.innerHTML = `
            ${position}
            <div>
                <p><b>${isUsuarioLogado ? 'Você' : usuario.nome}</b></p>
                <p>${usuario.pontos} pontos</p>
            </div>
        `;
        
        rankingList.appendChild(li);
    }
    
    // Se o usuário não estiver no top 5, adicionar a posição dele no final
    if (!usuarioEstaNoTop) {
        // Encontrar a posição do usuário no ranking completo
        posicaoUsuario = usuarios.findIndex(u => u.id == usuarioLogado.id) + 1;
        
        if (posicaoUsuario === 0) {
            // Usuário não está no ranking, provavelmente tem 0 pontos
            posicaoUsuario = usuarios.length + 1;
        }
        
        // Criar o elemento li para o usuário
        const userLi = document.createElement('li');
        userLi.className = 'ranking-user';
        userLi.id = 'user';
        userLi.innerHTML = `
            <p class="place">${String(posicaoUsuario).padStart(2, '0')}</p>
            <div>
                <p><b>Você</b></p>
                <p>${usuarioLogado.pontos || 0} pontos</p>
            </div>
        `;
        
        rankingList.appendChild(userLi);
    }
}
