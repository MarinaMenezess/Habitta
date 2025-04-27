function editarPerfil() {
    const dados = JSON.parse(localStorage.getItem('informacoes'));
    
    if (dados) {
        // Preenche os campos do modal com os dados atuais
        document.getElementById('ModifyName').value = dados.nome;
        document.getElementById('ModifyEmail').value = dados.email;
 
        // Mostra o modal
        document.getElementById('ModalScreen').style.display = 'block';
    } else {
        alert('Erro ao carregar informações do usuário.');
    }
}
const editButton = document.querySelector('.edit-button');
const modal = document.getElementById('ModalScreen');

if (editButton) {
    editButton.addEventListener('click', () => {
        editarPerfil(); // Função para editar o perfil
    });
}

const closeModalButton = document.querySelector('.sair');
if (closeModalButton) {
    closeModalButton.onclick = function() {
        modal.style.display = 'none'; // Fecha o modal
    }
}
window.onclick = function (event) {
    if (event.target == modal) {
        modal.style.display = 'none'; // Fecha o modal ao clicar fora
    }
}

    const confirmButton = document.getElementById('Confirm');;
    if(confirmButton) {
        confirmButton.onclick = function() {
        const novoNome = document.getElementById('ModifyName').value;
        const novoEmail = document.getElementById('ModifyEmail').value;
        atualizarPerfil(novoNome, novoEmail);                           
        }
    };

    function deletarPerfil() {
        const confirmacao = confirm('Tem certeza que deseja deletar seu perfil?');
        if (confirmacao) {
            // Remove as informações do perfil do localStorage
            localStorage.removeItem('informacoes');
    
            // Exibe uma mensagem ou redireciona o usuário
            alert('Perfil deletado com sucesso!');
            
            // Opcional: Redireciona o usuário para a página inicial ou de login
            window.location.href = 'index.html'; // Altere para a URL desejada
        }
    }
    