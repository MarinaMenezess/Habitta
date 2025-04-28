document.addEventListener('DOMContentLoaded', function() {
  const formElement = document.querySelector('.form');
  const loginButton = document.querySelector('.botoes button:nth-child(2)');
  
  // Botão de fazer login redireciona para página de login
  loginButton.addEventListener('click', function() {
    window.location.href = 'login.html';
  });
  
  // Quando o botão de cadastro for clicado
  formElement.querySelector('.confirmar').addEventListener('click', function(event) {
    event.preventDefault();
    
    // Pegar valores dos campos
    const nome = document.getElementById('nome').value.trim();
    const email = document.getElementById('email').value.trim();
    const senha = document.getElementById('senha').value;
    const confirmarSenha = document.getElementById('confirmarSenha').value;
    
    // Validar campos
    if (!nome || !email || !senha || !confirmarSenha) {
      mostrarMensagem('Por favor, preencha todos os campos.', 'erro');
      return;
    }
    
    // Validar email
    if (!validarEmail(email)) {
      mostrarMensagem('Por favor, insira um email válido.', 'erro');
      return;
    }
    
    // Validar senha
    if (senha.length < 6) {
      mostrarMensagem('A senha deve ter pelo menos 6 caracteres.', 'erro');
      return;
    }
    
    // Verificar se as senhas coincidem
    if (senha !== confirmarSenha) {
      mostrarMensagem('As senhas não coincidem.', 'erro');
      return;
    }
    
    // Dados para enviar para a API
    const dadosCadastro = {
      nome: nome,
      email: email,
      senha: senha
    };
    
    // Enviar requisição para a API
    fetch('http://localhost:3000/api/users/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dadosCadastro)
    })
    .then(response => response.json())
    .then(data => {
      if (data.sucesso) {
        mostrarMensagem('Cadastro realizado com sucesso!', 'sucesso');
        
        // Redirecionar para a página de login após 2 segundos
        setTimeout(() => {
          window.location.href = 'login.html';
        }, 2000);
      } else {
        mostrarMensagem(data.mensagem || 'Erro ao realizar cadastro.', 'erro');
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
