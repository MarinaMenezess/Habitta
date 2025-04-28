document.addEventListener('DOMContentLoaded', () => {
    const abrirModal = document.querySelector('.new-habit');
    const abrirEditModal = document.getElementById("btnEditHabit");
    const deleteHabit = document.getElementById("btnDeleteHabit")
    const modal = document.getElementById('HabitModalScreen');
    const editModal = document.getElementById('HabitEditModalScreen');

    // Carregar dados do usuário e hábitos ao iniciar a página
    carregarDadosUsuario();
    carregarHabitos();

    if (abrirModal) {
        abrirModal.addEventListener('click', () => {
            modal.style.display = 'block';
        });
    }

    if(abrirEditModal) {
        abrirEditModal.addEventListener('click', () =>{
            editModal.style.display = 'block'
        })
    }

    const closeModalButton = document.querySelector('.fecharModalHabit');
    if (closeModalButton) {
        closeModalButton.onclick = function() {
            modal.style.display = 'none'; 
            // Limpar o formulário ao fechar
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
            // Limpar o formulário ao fechar
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

const inputMetaDiaria = document.getElementById('metaDiaria');

if (inputMetaDiaria) {
inputMetaDiaria.addEventListener('input', function() {
  if (this.value < 0) {
    this.value = 0;
  }
});
}

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
    
    const usuario = JSON.parse(usuarioData);
    
    // Atualizar nome do usuário no cabeçalho
    const boasVindas = document.getElementById('boas-vindas');
    if (boasVindas) {
        boasVindas.innerHTML = `Olá, <b>${usuario.nome}</b>`;
    }
    
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
            atualizarEstatisticas(data.dados);
        }
    })
    .catch(error => {
        console.error('Erro ao carregar estatísticas:', error);
    });
}

// Função para atualizar as estatísticas na UI
function atualizarEstatisticas(stats) {
    // Buscar dados do usuário para pontos
    const usuarioData = JSON.parse(localStorage.getItem('usuario'));
    
    // Calcular porcentagem de hábitos concluídos hoje
    let porcentagemConcluidos = 0;
    let habitosNaoConcluidos = 0;
    
    // Primeiro, buscamos todos os hábitos para verificar quantos não estão concluídos
    fetch('http://localhost:3000/api/habits', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'user-id': usuarioData.id
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.sucesso) {
            const habitos = data.dados;
            
            // Para cada hábito, verificamos o progresso de hoje
            const hoje = new Date().toISOString().split('T')[0];
            const promises = habitos.map(habito => {
                return fetch(`http://localhost:3000/api/habits/${habito.id}/history?start_date=${hoje}&end_date=${hoje}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'user-id': usuarioData.id
                    }
                })
                .then(response => response.json())
                .then(progressoData => {
                    if (progressoData.sucesso && progressoData.dados.length > 0) {
                        // Se tem progresso hoje, verificamos se foi concluído
                        return progressoData.dados[0].quantidade > 0 ? 'concluido' : 'nao_concluido';
                    } else {
                        return 'nao_concluido';
                    }
                })
                .catch(error => {
                    console.error(`Erro ao verificar progresso do hábito ${habito.id}:`, error);
                    return 'nao_concluido';
                });
            });
            
            Promise.all(promises).then(resultados => {
                // Contar hábitos não concluídos
                habitosNaoConcluidos = resultados.filter(resultado => resultado === 'nao_concluido').length;
                
                // Calcular porcentagem de concluídos
                const concluidos = resultados.filter(resultado => resultado === 'concluido').length;
                const total = resultados.length;
                porcentagemConcluidos = total > 0 ? Math.round((concluidos / total) * 100) : 0;
                
                // Atualizar cards de estatísticas
                const totalHabitsElement = document.querySelector('#card1 h3');
                if (totalHabitsElement) {
                    totalHabitsElement.textContent = habitosNaoConcluidos;
                }
                
                const habitosConcluidos = document.querySelector('#card2 h3');
                if (habitosConcluidos) {
                    habitosConcluidos.textContent = `${porcentagemConcluidos}%`;
                }
                
                const pontosElement = document.querySelector('#card3 h3');
                if (pontosElement) {
                    pontosElement.textContent = usuarioData.pontos || 0;
                }
            });
        }
    })
    .catch(error => {
        console.error('Erro ao carregar hábitos para estatísticas:', error);
        
        // Em caso de erro, atualizar com valores padrão
        const totalHabitsElement = document.querySelector('#card1 h3');
        if (totalHabitsElement) {
            totalHabitsElement.textContent = stats.total_habits || 0;
        }
        
        const habitosConcluidos = document.querySelector('#card2 h3');
        if (habitosConcluidos) {
            habitosConcluidos.textContent = `${porcentagemConcluidos}%`;
        }
        
        const pontosElement = document.querySelector('#card3 h3');
        if (pontosElement) {
            pontosElement.textContent = usuarioData.pontos || 0;
        }
    });
}

// Função para carregar hábitos do usuário
function carregarHabitos() {
    const usuarioData = localStorage.getItem('usuario');
    
    if (!usuarioData) {
        return;
    }
    
    const usuario = JSON.parse(usuarioData);
    
    // Primeiro, buscamos todos os hábitos
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
            
            // Para cada hábito, verificamos o progresso de hoje
            const hoje = new Date().toISOString().split('T')[0];
            const promises = habitos.map(habito => {
                return fetch(`http://localhost:3000/api/habits/${habito.id}/history?start_date=${hoje}&end_date=${hoje}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'user-id': usuario.id
                    }
                })
                .then(response => response.json())
                .then(progressoData => {
                    if (progressoData.sucesso && progressoData.dados.length > 0) {
                        // Se tem progresso hoje, verificamos se foi concluído
                        habito.concluido = progressoData.dados[0].quantidade > 0;
                    } else {
                        habito.concluido = false;
                    }
                    return habito;
                })
                .catch(error => {
                    console.error(`Erro ao verificar progresso do hábito ${habito.id}:`, error);
                    habito.concluido = false;
                    return habito;
                });
            });
            
            Promise.all(promises).then(habitosComProgresso => {
                exibirHabitos(habitosComProgresso);
            });
        }
    })
    .catch(error => {
        console.error('Erro ao carregar hábitos:', error);
    });
}

// Função para exibir os hábitos na lista
function exibirHabitos(habitos) {
    const listaHabitos = document.getElementById('habitos-lista');
    
    if (!listaHabitos) return;
    
    // Limpar lista atual
    listaHabitos.innerHTML = '';
    
    if (habitos.length === 0) {
        listaHabitos.innerHTML = '<p>Você ainda não tem hábitos cadastrados. Crie seu primeiro hábito!</p>';
        return;
    }
    
    // Para cada hábito, criar um item de lista
    habitos.forEach(habito => {
        const habitoElement = document.createElement('li');
        habitoElement.className = 'habit-card';
        habitoElement.setAttribute('data-id', habito.id);
        
        habitoElement.innerHTML = `
            <div class="info-check">
                <input type="checkbox" ${habito.concluido ? 'checked' : ''}/>
                <div class="habit-info">
                    <div>
                        <h4>${habito.titulo}</h4>
                        <p class="tipo">Meta diária: ${habito.meta_diaria || 1}</p>
                    </div>
                    <div>
                        <p><b>Descrição:</b> ${habito.descricao || 'Sem descrição'}</p>
                        <p><b>Recorrência:</b> ${habito.recorrencia || 'Diário'}</p>
                    </div>
                    <div class="bottom">
                        <p class="points">10 pontos</p>
                    </div>
                </div>
            </div>
            <div class="habit-buttons">
                <button class="btn-edit-habit" data-id="${habito.id}"><img src="./assets/pen-fill.svg" alt="Editar"></button>
                <button class="btn-delete-habit" data-id="${habito.id}"><img src="./assets/trash3-fill.svg" alt="Excluir"></button>
            </div>
        `;
        
        listaHabitos.appendChild(habitoElement);
        
        // Adicionar evento para o botão de editar
        const btnEditar = habitoElement.querySelector('.btn-edit-habit');
        if (btnEditar) {
            btnEditar.addEventListener('click', () => abrirModalEditarHabito(habito));
        }
        
        // Adicionar evento para o botão de excluir
        const btnExcluir = habitoElement.querySelector('.btn-delete-habit');
        if (btnExcluir) {
            btnExcluir.addEventListener('click', () => deletarHabito(habito.id));
        }
        
        // Adicionar evento para o checkbox
        const checkbox = habitoElement.querySelector('input[type="checkbox"]');
        if (checkbox) {
            checkbox.addEventListener('change', () => marcarHabitoComoConcluido(habito.id, checkbox.checked));
        }
    });
}

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
            
            // Recarregar a lista de hábitos e estatísticas
            carregarDadosUsuario();
            carregarHabitos();
        } else {
            alert('Erro ao cadastrar hábito: ' + data.mensagem);
        }
    })
    .catch(error => {
        console.error('Erro ao cadastrar hábito:', error);
        alert('Erro ao cadastrar hábito. Tente novamente mais tarde.');
    });
}

// Função para abrir o modal de edição com os dados do hábito
function abrirModalEditarHabito(habito) {
    const modal = document.getElementById('HabitEditModalScreen');
    
    if (!modal) return;
    
    // Preencher campos do formulário com os dados do hábito
    const tituloElement = modal.querySelector('h2');
    if (tituloElement) {
        tituloElement.textContent = habito.titulo;
    }
    
    const descricaoElement = document.getElementById('descricaoHabitoEdit');
    if (descricaoElement) {
        descricaoElement.value = habito.descricao || '';
    }
    
    const metaDiariaElement = document.getElementById('metaDiariaEdit');
    if (metaDiariaElement) {
        metaDiariaElement.value = habito.meta_diaria || 1;
    }
    
    const recorrenciaElement = document.getElementById('recorrenciaEdit');
    if (recorrenciaElement) {
        recorrenciaElement.value = habito.recorrencia || 'diario';
    }
    
    // Guardar o ID do hábito no botão para uso posterior
    const btnSalvar = document.getElementById('editarHabitoBtn');
    if (btnSalvar) {
        btnSalvar.setAttribute('data-id', habito.id);
        
        // Remover qualquer evento anterior para evitar acumulação
        const novoBtn = btnSalvar.cloneNode(true);
        btnSalvar.parentNode.replaceChild(novoBtn, btnSalvar);
        
        // Adicionar novo evento
        novoBtn.addEventListener('click', salvarEdicaoHabito);
    }
    
    // Exibir o modal
    modal.style.display = 'block';
}

// Função para salvar as alterações de um hábito
function salvarEdicaoHabito(event) {
    event.preventDefault();
    
    const btnSalvar = event.target;
    const habitoId = btnSalvar.getAttribute('data-id');
    
    if (!habitoId) {
        alert('ID do hábito não encontrado!');
        return;
    }
    
    const descricao = document.getElementById('descricaoHabitoEdit').value;
    const metaDiaria = document.getElementById('metaDiariaEdit').value;
    const recorrencia = document.getElementById('recorrenciaEdit').value;
    
    const usuarioData = localStorage.getItem('usuario');
    if (!usuarioData) {
        alert('Você precisa estar logado para editar um hábito!');
        return;
    }
    
    const usuario = JSON.parse(usuarioData);
    
    // Buscar título original para manter
    fetch(`http://localhost:3000/api/habits/${habitoId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'user-id': usuario.id
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.sucesso) {
            const titulo = data.dados.titulo;
            
            // Atualizar o hábito
            return fetch(`http://localhost:3000/api/habits/${habitoId}`, {
                method: 'PUT',
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
            });
        } else {
            throw new Error('Não foi possível recuperar os dados do hábito');
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.sucesso) {
            alert('Hábito atualizado com sucesso!');
            
            // Fechar o modal
            const modal = document.getElementById('HabitEditModalScreen');
            if (modal) {
                modal.style.display = 'none';
            }
            
            // Recarregar a lista de hábitos e estatísticas
            carregarDadosUsuario();
            carregarHabitos();
        } else {
            alert('Erro ao atualizar hábito: ' + data.mensagem);
        }
    })
    .catch(error => {
        console.error('Erro ao atualizar hábito:', error);
        alert('Erro ao atualizar hábito. Tente novamente mais tarde.');
    });
}

// Função para deletar um hábito
function deletarHabito(habitoId) {
    const confirmacao = confirm('Tem certeza que deseja deletar esse hábito?');
    
    if (!confirmacao) return;
    
    const usuarioData = localStorage.getItem('usuario');
    if (!usuarioData) {
        alert('Você precisa estar logado para excluir um hábito!');
        return;
    }
    
    const usuario = JSON.parse(usuarioData);
    
    fetch(`http://localhost:3000/api/habits/${habitoId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'user-id': usuario.id
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.sucesso) {
        alert('Hábito deletado com sucesso!');
            
            // Recarregar a lista de hábitos e estatísticas
            carregarDadosUsuario();
            carregarHabitos();
        } else {
            alert('Erro ao deletar hábito: ' + data.mensagem);
        }
    })
    .catch(error => {
        console.error('Erro ao deletar hábito:', error);
        alert('Erro ao deletar hábito. Tente novamente mais tarde.');
    });
}

// Função para marcar um hábito como concluído
function marcarHabitoComoConcluido(habitoId, concluido) {
    const usuarioData = localStorage.getItem('usuario');
    if (!usuarioData) {
        alert('Você precisa estar logado para registrar progresso em um hábito!');
        return;
    }
    
    const usuario = JSON.parse(usuarioData);
    
    fetch(`http://localhost:3000/api/habits/${habitoId}/track`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'user-id': usuario.id
        },
        body: JSON.stringify({
            quantidade: concluido ? 1 : 0
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.sucesso) {
            // Após registrar o progresso, atualizar os pontos do usuário localmente
            if (concluido) {
                // Adicionar 10 pontos ao concluir o hábito
                usuario.pontos = (parseInt(usuario.pontos) || 0) + 10;
            } else {
                // Remover 10 pontos ao desmarcar o hábito (garantindo que não fique negativo)
                usuario.pontos = Math.max(0, (parseInt(usuario.pontos) || 0) - 10);
            }
            
            // Atualizar o localStorage
            localStorage.setItem('usuario', JSON.stringify(usuario));
            
            // Chamar a função que atualiza pontução do usuário no banco de dados
            atualizarPontuacaoUsuario(usuario.id, usuario.pontos);
            
            // Recarregar a interface com os novos dados
            carregarDadosUsuario();
            carregarHabitos();
        } else {
            alert('Erro ao atualizar progresso: ' + data.mensagem);
        }
    })
    .catch(error => {
        console.error('Erro ao atualizar progresso:', error);
        alert('Erro ao atualizar progresso. Tente novamente mais tarde.');
    });
}

// Função auxiliar para atualizar pontuação do usuário no banco de dados
function atualizarPontuacaoUsuario(usuarioId, pontos) {
    fetch(`http://localhost:3000/api/users/me`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'user-id': usuarioId
        },
        body: JSON.stringify({
            pontos: pontos
        })
    })
    .then(response => response.json())
    .then(data => {
        if (!data.sucesso) {
            console.error('Erro ao atualizar pontuação no servidor:', data.mensagem);
        } else {
            console.log('Pontuação atualizada com sucesso!');
        }
    })
    .catch(error => {
        console.error('Erro ao atualizar pontuação no servidor:', error);
    });
}


