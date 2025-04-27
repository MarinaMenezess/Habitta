document.addEventListener('DOMContentLoaded', () => {
    const abrirModal = document.querySelector('.new-habit');
    const abrirEditModal = document.getElementById("btnEditHabit");
    const deleteHabit = document.getElementById("btnDeleteHabit")
    const modal = document.getElementById('HabitModalScreen');
    const editModal = document.getElementById('HabitEditModalScreen');

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
        }
        if (event.target == editModal) {
            editModal.style.display = 'none';
        }
    };
    
});

const inputMetaDiaria = document.getElementById('metaDiaria');

inputMetaDiaria.addEventListener('input', function() {
  if (this.value < 0) {
    this.value = 0;
  }
});

function deletarHabito() {
    const confirmacao = confirm('Tem certeza que deseja deletar esse hábito?');
    if (confirmacao) {

        // Exibe uma mensagem ou redireciona o usuário
        alert('Hábito deletado com sucesso!');
    }
}


