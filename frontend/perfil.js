document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM carregado - inicializando página de perfil");
    
    // Usar setTimeout para garantir que o DOM esteja totalmente carregado
    setTimeout(() => {
        // Carregar dados do usuário ao carregar a página
        carregarDadosUsuario();
    }, 50);
    
    // Configurar modal de edição
    const modal = document.getElementById('ModalScreen');
    const editButton = document.getElementById('btnEdit');
    const closeModalButton = document.querySelector('.sair');
    const confirmButton = document.getElementById('Confirm');
    
    if (editButton) {
        editButton.addEventListener('click', () => {
            editarPerfil();
        });
    }
    
    if (closeModalButton) {
        closeModalButton.onclick = function() {
            modal.style.display = 'none';
        }
    }
    
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    }
    
    if (confirmButton) {
        confirmButton.onclick = function() {
            const novoNome = document.getElementById('ModifyName').value;
            const novoEmail = document.getElementById('ModifyEmail').value;
            atualizarPerfil(novoNome, novoEmail);
        }
    }
    
    // Configurar botão para deletar perfil
    const btnDelete = document.getElementById('btnDelete');
    if (btnDelete) {
        btnDelete.addEventListener('click', deletarPerfil);
    }
    
    // Configurar botão para logout
    const btnLogout = document.getElementById('btnLogout');
    if (btnLogout) {
        btnLogout.addEventListener('click', fazerLogout);
    }
});

// Função para carregar os dados do usuário na página
function carregarDadosUsuario() {
    console.log("Iniciando carregamento de dados do usuário");
    
    // Primeiro vamos atualizar a UI com o que temos localmente
    atualizarInterfaceComDadosLocais();
    
    // Depois vamos buscar dados atualizados do servidor
    buscarDadosAtualizadosDoServidor();
}

// Função para atualizar a interface com dados locais
function atualizarInterfaceComDadosLocais() {
    // Tentar primeiro com o objeto usuario completo
    const usuarioData = localStorage.getItem('usuario');
    
    if (usuarioData) {
        try {
            const usuario = JSON.parse(usuarioData);
            console.log("Dados locais encontrados:", usuario);
            
            // Atualizar os dados na página
            const nomeElement = document.querySelector('.profile-info:nth-child(1) p');
            const emailElement = document.querySelector('.profile-info:nth-child(2) p');
            
            if (nomeElement) {
                nomeElement.textContent = usuario.nome || "[Nome não disponível]";
                console.log("Nome atualizado para:", nomeElement.textContent);
            } else {
                console.log("Elemento de nome não encontrado");
            }
            
            if (emailElement) {
                emailElement.textContent = usuario.email || "[Email não disponível]";
                console.log("Email atualizado para:", emailElement.textContent);
            } else {
                console.log("Elemento de email não encontrado");
            }
            
            return true;
        } catch (e) {
            console.error("Erro ao analisar dados do usuário:", e);
        }
    }
    
    // Se não encontrou o objeto usuario, tentar com os campos individuais
    const usuarioId = localStorage.getItem('usuarioId');
    const usuarioNome = localStorage.getItem('usuarioNome');
    const usuarioEmail = localStorage.getItem('usuarioEmail');
    
    if (usuarioId && usuarioNome) {
        console.log("Dados individuais encontrados:", { id: usuarioId, nome: usuarioNome, email: usuarioEmail });
        
        // Construir o objeto usuario baseado nos campos individuais
        const usuario = {
            id: usuarioId,
            nome: usuarioNome,
            email: usuarioEmail,
            pontos: 0 // Valor padrão, será atualizado depois
        };
        
        // Salvar no localStorage no formato correto para futuros acessos
        localStorage.setItem('usuario', JSON.stringify(usuario));
        
        // Atualizar os dados na página
        const nomeElement = document.querySelector('.profile-info:nth-child(1) p');
        const emailElement = document.querySelector('.profile-info:nth-child(2) p');
        
        if (nomeElement) {
            nomeElement.textContent = usuarioNome;
            console.log("Nome atualizado para:", nomeElement.textContent);
        }
        
        if (emailElement) {
            emailElement.textContent = usuarioEmail;
            console.log("Email atualizado para:", emailElement.textContent);
        }
        
        return true;
    }
    
    // Se não encontrou dados de login em nenhum formato, redirecionar para login
    console.log("Nenhum dado de usuário encontrado, redirecionando para login");
    window.location.href = 'login.html';
    return false;
}

// Função para buscar dados atualizados do servidor
function buscarDadosAtualizadosDoServidor() {
    const usuarioData = localStorage.getItem('usuario');
    if (!usuarioData) return;
    
    try {
        const usuario = JSON.parse(usuarioData);
        
        // Buscar dados atualizados do usuário da API
        fetch('http://localhost:3000/api/users/me', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'user-id': usuario.id
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log("Dados atualizados do servidor:", data);
            if (data.sucesso) {
                // Atualizar os dados do localStorage com os dados mais recentes
                const usuarioAtualizado = data.dados;
                localStorage.setItem('usuario', JSON.stringify(usuarioAtualizado));
                localStorage.setItem('usuarioNome', usuarioAtualizado.nome);
                localStorage.setItem('usuarioEmail', usuarioAtualizado.email);
                
                // Atualizar os elementos na página
                const nomeElement = document.querySelector('.profile-info:nth-child(1) p');
                const emailElement = document.querySelector('.profile-info:nth-child(2) p');
                
                if (nomeElement) {
                    nomeElement.textContent = usuarioAtualizado.nome;
                    console.log("Nome atualizado do servidor para:", nomeElement.textContent);
                }
                
                if (emailElement) {
                    emailElement.textContent = usuarioAtualizado.email;
                    console.log("Email atualizado do servidor para:", emailElement.textContent);
                }
            }
        })
        .catch(error => {
            console.error('Erro ao buscar dados atualizados do usuário:', error);
        });
    } catch (e) {
        console.error("Erro ao analisar dados do usuário para busca no servidor:", e);
    }
}

// Função para abrir o modal de edição
function editarPerfil() {
    const usuarioData = localStorage.getItem('usuario');
    
    if (usuarioData) {
        const usuario = JSON.parse(usuarioData);
        
        // Preencher os campos do modal com os dados atuais
        document.getElementById('ModifyName').value = usuario.nome;
        document.getElementById('ModifyEmail').value = usuario.email;
        
        // Mostrar o modal
        document.getElementById('ModalScreen').style.display = 'block';
    } else {
        alert('Erro ao carregar informações do usuário.');
    }
}

// Função para atualizar o perfil
function atualizarPerfil(novoNome, novoEmail) {
    const usuarioData = localStorage.getItem('usuario');
    
    if (!usuarioData) {
        alert('Você precisa estar logado para atualizar seu perfil!');
        return;
    }
    
    const usuario = JSON.parse(usuarioData);
    
    // Validar campos
    if (!novoNome || !novoEmail) {
        alert('Por favor, preencha todos os campos.');
        return;
    }
    
    // Validar email
    if (!validarEmail(novoEmail)) {
        alert('Por favor, insira um email válido.');
        return;
    }
    
    // Preparar dados para enviar para a API
    const dadosAtualizados = {
        nome: novoNome,
        email: novoEmail
    };
    
    console.log("Enviando dados para atualização:", dadosAtualizados);
    
    // Enviar requisição para a API
    fetch('http://localhost:3000/api/users/me', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'user-id': usuario.id
        },
        body: JSON.stringify(dadosAtualizados)
    })
    .then(response => {
        if (!response.ok) {
            console.error("Erro na resposta da API:", response.status, response.statusText);
            throw new Error(`Erro HTTP: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log("Resposta da API:", data);
        if (data.sucesso) {
            // Atualizar os dados do usuário no localStorage
            usuario.nome = novoNome;
            usuario.email = novoEmail;
            localStorage.setItem('usuario', JSON.stringify(usuario));
            localStorage.setItem('usuarioNome', novoNome);
            localStorage.setItem('usuarioEmail', novoEmail);
            
            // Atualizar os dados na página
            const nomeElement = document.querySelector('.profile-info:nth-child(1) p');
            const emailElement = document.querySelector('.profile-info:nth-child(2) p');
            
            if (nomeElement) nomeElement.textContent = novoNome;
            if (emailElement) emailElement.textContent = novoEmail;
            
            // Fechar o modal
            document.getElementById('ModalScreen').style.display = 'none';
            
            alert('Perfil atualizado com sucesso!');
        } else {
            alert('Erro ao atualizar perfil: ' + data.mensagem);
        }
    })
    .catch(error => {
        console.error('Erro ao atualizar perfil:', error);
        alert('Erro ao atualizar perfil. Tente novamente mais tarde.');
    });
}

// Função para validar email
function validarEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Função para deletar perfil
function deletarPerfil() {
    if (!confirm('Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita.')) {
        return;
    }
    
    const usuarioData = localStorage.getItem('usuario');
    
    if (!usuarioData) {
        alert('Você precisa estar logado para excluir seu perfil!');
        return;
    }
    
    const usuario = JSON.parse(usuarioData);
    
    fetch('http://localhost:3000/api/users/me', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'user-id': usuario.id
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (data.sucesso) {
            // Limpar dados do localStorage
            localStorage.removeItem('usuario');
            localStorage.removeItem('usuarioId');
            localStorage.removeItem('usuarioNome');
            localStorage.removeItem('usuarioEmail');
            
            alert('Conta excluída com sucesso!');
            
            // Redirecionar para a página de login
            window.location.href = 'login.html';
        } else {
            alert('Erro ao excluir conta: ' + data.mensagem);
        }
    })
    .catch(error => {
        console.error('Erro ao excluir conta:', error);
        alert('Erro ao excluir conta. Tente novamente mais tarde.');
    });
}

// Função para fazer logout
function fazerLogout() {
    if (confirm('Tem certeza que deseja sair da sua conta?')) {
        // Limpar dados do usuário do localStorage
        localStorage.removeItem('usuario');
        localStorage.removeItem('usuarioId');
        localStorage.removeItem('usuarioNome');
        localStorage.removeItem('usuarioEmail');
        
        // Redirecionar para a página de login
        window.location.href = 'login.html';
    }
}
    