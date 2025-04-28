# Habitta - Aplicativo de Rastreamento de Hábitos

![Logo Habitta](frontend/assets/habitta-high-resolution-logo-removebg-preview.png)

## Sobre o Projeto

O Habitta é uma aplicação web completa para o acompanhamento e gerenciamento de hábitos diários. Desenvolvida com o objetivo de ajudar os usuários a criar e manter hábitos saudáveis, a plataforma oferece um sistema de recompensas e gamificação para incentivar a consistência.

## Funcionalidades Principais

### Controle de Hábitos
- Criação de hábitos personalizados com metas diárias
- Categorização por temas (Saúde Física, Saúde Mental, Produtividade, etc.)
- Acompanhamento de progresso diário, semanal e mensal
- Sistema de marcação de tarefas concluídas

### Sistema de Recompensas
- Pontos por hábitos concluídos diariamente
- Conquistas desbloqueadas por metas alcançadas
- Painel de conquistas para visualizar progressos
- Recompensas especiais por marcos importantes

### Monitoramento de Progresso
- Estatísticas detalhadas de desempenho
- Visualização de hábitos pendentes e concluídos
- Histórico de atividades e sequências de dias
- Gráficos de progresso por categoria

### Recursos Sociais
- Ranking de usuários por pontuação
- Visualização de conquistas de outros usuários
- Sistema de notificações para interações

## Tecnologias Utilizadas

### Backend
- **Node.js e Express**: Framework para API RESTful
- **MySQL**: Banco de dados relacional para armazenamento de dados
- **Autenticação**: Sistema de login e controle de acesso personalizado

### Frontend
- **HTML5, CSS3 e JavaScript**: Interface de usuário responsiva
- **API REST**: Comunicação com o servidor através de requisições HTTP
- **LocalStorage**: Armazenamento de dados do usuário logado

## Estrutura do Projeto

```
habitta/
├── backend/                  # Servidor e API
│   ├── node_modules/         # Dependências do Node.js
│   ├── src/                  # Código-fonte do backend
│   │   ├── server.js         # Servidor Express e rotas da API
│   │   └── db_config.js      # Configuração da conexão com o banco de dados
│   ├── db.sql                # Script de criação do banco de dados
│   ├── package.json          # Dependências e scripts do Node.js
│   └── postman_examples.json # Exemplos de requisições para testes
│
└── frontend/                 # Interface do usuário
    ├── assets/               # Imagens e recursos estáticos
    ├── index.html            # Página principal
    ├── index.js              # JavaScript da página principal
    ├── login.html            # Página de login
    ├── login.js              # Lógica de autenticação
    ├── cadastro.html         # Página de cadastro de usuário
    ├── cadastro.js           # Lógica de cadastro de usuário
    ├── habitos.html          # Página de gerenciamento de hábitos
    ├── habitos.js            # Lógica de gerenciamento de hábitos
    ├── recompensas.html      # Página de recompensas e conquistas
    ├── recompensas.js        # Lógica de recompensas
    ├── progresso.html        # Página de acompanhamento de progresso
    ├── progresso.js          # Lógica de exibição de estatísticas
    ├── ranking.html          # Página de ranking de usuários
    ├── ranking.js            # Lógica do sistema de ranking
    ├── notificacoes.html     # Página de notificações
    ├── notificacoes.js       # Lógica de notificações
    ├── perfil.html           # Página de perfil do usuário
    ├── perfil.js             # Lógica de edição de perfil
    └── style.css             # Estilos globais da aplicação
```

## Instalação e Configuração

### Pré-requisitos
- Node.js (v14.0.0 ou superior)
- MySQL (v5.7 ou superior)

### Passos para Instalação

1. **Clone o repositório**
   ```bash
   git clone https://github.com/seu-usuario/habitta.git
   cd habitta
   ```

2. **Configure o banco de dados**
   ```bash
   # Acesse o MySQL e crie o banco de dados
   mysql -u root -p
   CREATE DATABASE habitta;
   USE habitta;
   
   # Execute o script SQL para criar as tabelas
   # (Você pode fazer isso diretamente no MySQL ou usar:)
   mysql -u root -p habitta < backend/db.sql
   ```

3. **Configure as variáveis do banco de dados**
   - Edite o arquivo `backend/src/db_config.js` com as credenciais do seu banco de dados

4. **Instale as dependências do backend e inicie o servidor**
   ```bash
   cd backend
   npm install
   node src/server.js
   ```

5. **Acesse a aplicação**
   - Abra o arquivo `frontend/index.html` no seu navegador ou configure um servidor web para servir os arquivos estáticos

## Como Usar

1. **Cadastre-se na plataforma**
   - Acesse a página de cadastro e crie sua conta

2. **Selecione seus temas de interesse**
   - Após o cadastro, escolha as categorias que mais te interessam

3. **Crie seus primeiros hábitos**
   - Na página principal, clique em "Criar novo hábito"
   - Preencha as informações como título, descrição e meta diária

4. **Acompanhe seu progresso**
   - Marque os hábitos como concluídos conforme você os realiza
   - Acumule pontos e conquistas

5. **Colete recompensas**
   - Visite a página de recompensas para coletar pontos por conquistas