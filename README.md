# Habitta - Aplicativo de Rastreamento de Hábitos

## Sobre o Projeto
O Habitta é uma aplicação web desenvolvida para auxiliar usuários a criar e manter hábitos saudáveis. O tema escolhido foi o acompanhamento de hábitos diários com gamificação, visando aumentar a motivação e engajamento dos usuários através de um sistema de recompensas.

O projeto surgiu da necessidade de organizar rotinas diárias e incentivar a consistência na prática de hábitos saudáveis, tornando essa jornada mais agradável através de elementos de jogos.

## Tecnologias Utilizadas

### Backend
- **Node.js e Express**: Framework para desenvolvimento da API RESTful
- **MySQL**: Sistema de gerenciamento de banco de dados relacional
- **Autenticação**: Sistema próprio de login e controle de acesso

### Frontend
- **HTML5, CSS3 e JavaScript**: Desenvolvimento da interface de usuário
- **API REST**: Comunicação cliente-servidor
- **LocalStorage**: Armazenamento local de dados do usuário

## Funcionalidades Principais

- **Gerenciamento de Hábitos**: Criação, edição e exclusão de hábitos personalizados
- **Categorização**: Organização por temas como Saúde Física, Mental e Produtividade
- **Sistema de Recompensas**: Pontuação e conquistas por consistência
- **Dashboard**: Visualização de estatísticas e progresso
- **Recursos Sociais**: Ranking e compartilhamento de conquistas

## Orientações de Uso

### Instalação

1. **Requisitos**:
   - Node.js (v14.0.0 ou superior)
   - MySQL (v5.7 ou superior)

2. **Configuração do Banco de Dados**:
   ```bash
   mysql -u root -p
   CREATE DATABASE habitta;
   USE habitta;
   ```

3. **Configuração do Servidor**:
   - Edite `backend/src/db_config.js` com suas credenciais
   - Execute:
     ```bash
     cd backend
     npm install
     node src/server.js
     ```

4. **Acesso**:
   - Abra `frontend/index.html` no navegador

### Utilização

1. **Cadastro**: Crie uma conta na plataforma
2. **Criação de Hábitos**: Adicione hábitos que deseja acompanhar
3. **Acompanhamento**: Marque os hábitos como concluídos diariamente
4. **Progresso**: Visualize estatísticas na página de progresso
5. **Recompensas**: Desbloquear conquistas conforme mantém a consistência