document.querySelector('.btnLogin').addEventListener('click', async (e) => {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value;
    const senha = document.getElementById('loginSenha').value;

    try {
      const response = await fetch('https://seu-servidor.com/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, senha })
      });

      const data = await response.json();

      if (response.ok) {
        alert("Login realizado com sucesso!");
        // redirecionar ou armazenar token
        // localStorage.setItem('token', data.token);
        window.location.href = 'index.html';
      } else {
        alert(`Erro no login: ${data.mensagem || 'Verifique seu email e senha.'}`);
      }
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      alert("Erro ao conectar com o servidor.");
    }
  });