document.addEventListener('DOMContentLoaded', function() {
  const formElement = document.querySelector('.form');
  const loginButton = document.querySelector('.login-btn');
  
  // Botão de fazer cadastro redireciona para página de cadastro
  loginButton.addEventListener('click', function() {
    window.location.href = 'cadastro.html';
  });
  
  // Quando o botão de entrar for clicado
  formElement.querySelector('.confirmar').addEventListener('click', function(event) {
    event.preventDefault();
    
    // Pegar valores dos campos
    const email = document.getElementById('email').value.trim();
    const senha = document.getElementById('senha').value;
    
    // Validar campos
    if (!email || !senha) {
      mostrarMensagem('Por favor, preencha todos os campos.', 'erro');
      return;
    }
    
    // Validar email
    if (!validarEmail(email)) {
      mostrarMensagem('Por favor, insira um email válido.', 'erro');
      return;
    }
    
    // Dados para enviar para a API
    const dadosLogin = {
      email: email,
      senha: senha
    };
    
    // Enviar requisição para a API
    fetch('http://localhost:3000/api/users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dadosLogin)
    })
    .then(response => response.json())
    .then(data => {
      if (data.sucesso) {
        // Guardar dados do usuário no localStorage no formato compatível
        localStorage.setItem('usuario', JSON.stringify(data.usuario));
        
        // Manter também os campos individuais para compatibilidade
        localStorage.setItem('usuarioId', data.usuario.id);
        localStorage.setItem('usuarioNome', data.usuario.nome);
        localStorage.setItem('usuarioEmail', data.usuario.email);
        
        mostrarMensagem('Login realizado com sucesso!', 'sucesso');
        
        // Redirecionar para a página principal após 1 segundo
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 1000);
      } else {
        mostrarMensagem(data.mensagem || 'Email ou senha incorretos.', 'erro');
      }
    })
    .catch(error => {
      console.error('Erro:', error);
      mostrarMensagem('Erro ao conectar com o servidor.', 'erro');
    });
  });
  
  // Função para validar email
  function validarEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }
  
  // Função para mostrar mensagens de erro ou sucesso
  function mostrarMensagem(mensagem, tipo) {
    // Remover mensagem anterior se existir
    const mensagemAnterior = document.querySelector('.mensagem');
    if (mensagemAnterior) {
      mensagemAnterior.remove();
    }
    
    // Criar elemento de mensagem
    const mensagemElement = document.createElement('div');
    mensagemElement.className = `mensagem ${tipo}`;
    mensagemElement.textContent = mensagem;
    
    // Inserir mensagem após o formulário
    formElement.appendChild(mensagemElement);
    
    // Remover mensagem após 5 segundos
    setTimeout(() => {
      mensagemElement.remove();
    }, 5000);
  }
});