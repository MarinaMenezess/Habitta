-- TABELA: Usuários
CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100),
  email VARCHAR(100) UNIQUE,
  senha_hash VARCHAR(255),
  data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
  pontos INT DEFAULT 0
);

-- TABELA: Temas (interesses do usuário)
CREATE TABLE temas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) UNIQUE
);

-- TABELA: Relacionamento entre Usuários e Temas
CREATE TABLE usuario_tema (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT,
  tema_id INT,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (tema_id) REFERENCES temas(id) ON DELETE CASCADE
);

-- TABELA: Hábitos sugeridos por tema
CREATE TABLE habitos_sugeridos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tema_id INT,
  titulo VARCHAR(100),
  descricao TEXT,
  meta_diaria INT,
  recorrencia ENUM('diario', 'semanal', 'mensal'),
  FOREIGN KEY (tema_id) REFERENCES temas(id) ON DELETE CASCADE
);

-- TABELA: Hábitos personalizados do usuário
CREATE TABLE habitos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT,
  titulo VARCHAR(100),
  descricao TEXT,
  meta_diaria INT,
  recorrencia ENUM('diario', 'semanal', 'mensal'),
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- TABELA: Progresso dos hábitos
CREATE TABLE progresso (
  id INT AUTO_INCREMENT PRIMARY KEY,
  habito_id INT,
  data DATE,
  quantidade INT,
  FOREIGN KEY (habito_id) REFERENCES habitos(id) ON DELETE CASCADE
);

-- TABELA: Recompensas
CREATE TABLE recompensas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100),
  descricao TEXT,
  pontos_necessarios INT
);

-- TABELA: Recompensas conquistadas pelo usuário
CREATE TABLE recompensas_usuario (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT,
  recompensa_id INT,
  data_resgate DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (recompensa_id) REFERENCES recompensas(id) ON DELETE CASCADE
);

-- TABELA: Notificações motivacionais
CREATE TABLE notificacoes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT,
  mensagem TEXT,
  data_envio DATETIME DEFAULT CURRENT_TIMESTAMP,
  visualizado BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- TABELA: Lembretes para hábitos
CREATE TABLE reminders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  habito_id INT,
  time TIME NOT NULL,
  days VARCHAR(50),
  message TEXT,
  active BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (habito_id) REFERENCES habitos(id) ON DELETE CASCADE
);

-- TABELA: Conquistas
CREATE TABLE conquistas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(100) NOT NULL,
  descricao TEXT,
  pontos INT NOT NULL,
  imagem_recompensa VARCHAR(255)
);

-- TABELA: Conquistas dos usuários
CREATE TABLE user_conquistas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT,
  conquista_id INT,
  data_ganho DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (conquista_id) REFERENCES conquistas(id) ON DELETE CASCADE
);