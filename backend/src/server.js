// Importando as bibliotecas que vamos usar
const express = require('express');           // Framework para criar nosso servidor web
const path = require('path');                 // Ajuda a trabalhar com caminhos de arquivos
const cors = require('cors');                 // Permite que outros sites acessem nossa API
const db = require('./db_config');             // Nossas configurações do banco de dados

// Criando nosso servidor
const app = express();
const port = 3000;  // Porta onde o servidor vai rodar

// Configurações básicas do servidor
app.use(cors());                             // Permite requisições de outros sites
app.use(express.json());                     // Permite receber dados em formato JSON

// Configurando onde ficam nossos arquivos estáticos (imagens, HTML, CSS, etc)
app.use('/assets', express.static(path.join(__dirname, '../assets')));
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.static(path.join(__dirname, '..')));

// Middleware de verificação de login
const verificarLogin = (req, res, next) => {
  const idUsuario = req.headers['user-id'];
  if (!idUsuario) {
    return res.status(401).json({ 
      sucesso: false, 
      mensagem: 'Você precisa estar logado para fazer isso!' 
    });
  }
  db.query('SELECT * FROM usuarios WHERE id = ?', [idUsuario], (erro, usuarios) => {
    if (erro || usuarios.length === 0) {
      return res.status(403).json({ 
        sucesso: false, 
        mensagem: 'Usuário não encontrado!' 
      });
    }
    req.usuario = usuarios[0];
    next();
  });
};

//===================================================
// ROTAS DE USUÁRIOS
//===================================================

// Cadastro de novo usuário (Simplificado)
app.post('/api/users/register', (req, res) => {
  try {
    const { nome, email, senha } = req.body;
    if (!nome || !email || !senha) {
      return res.status(400).json({ 
        sucesso: false, 
        mensagem: 'Por favor, preencha todos os campos!' 
      });
    }
    db.query('SELECT id FROM usuarios WHERE email = ?', [email], (erro, resultados) => {
      if (erro) {
        return res.status(500).json({ 
          sucesso: false, 
          mensagem: 'Erro ao verificar email', 
          erro: erro 
        });
      }
      if (resultados.length > 0) {
        return res.status(409).json({ 
          sucesso: false, 
          mensagem: 'Este email já está sendo usado' 
        });
      }
      db.query(
        'INSERT INTO usuarios (nome, email, senha_hash) VALUES (?, ?, ?)',
        [nome, email, senha],
        (erro, resultado) => {
          if (erro) {
            return res.status(500).json({ 
              sucesso: false, 
              mensagem: 'Erro ao criar usuário', 
              erro: erro 
            });
          }
          db.query(
            'SELECT id, nome, email, data_criacao FROM usuarios WHERE id = ?', 
            [resultado.insertId], 
            (erro, usuarios) => {
              if (erro) {
                return res.status(500).json({ 
                  sucesso: false, 
                  mensagem: 'Erro ao buscar usuário criado', 
                  erro: erro 
                });
              }
              res.status(201).json({ 
                sucesso: true, 
                mensagem: 'Usuário criado com sucesso!', 
                dados: usuarios[0] 
              });
            }
          );
        }
      );
    });
  } catch (erro) {
    res.status(500).json({ 
      sucesso: false, 
      mensagem: 'Erro no servidor', 
      erro: erro.message 
    });
  }
});

// Login de usuário (Simplificado)
app.post('/api/users/login', (req, res) => {
  try {
    const { email, senha } = req.body;
    if (!email || !senha) {
      return res.status(400).json({ 
        sucesso: false, 
        mensagem: 'Por favor, informe email e senha!' 
      });
    }
    db.query(
      'SELECT * FROM usuarios WHERE email = ? AND senha_hash = ?', 
      [email, senha], 
      (erro, usuarios) => {
        if (erro) {
          return res.status(500).json({ 
            sucesso: false, 
            mensagem: 'Erro ao fazer login', 
            erro: erro 
          });
        }
        if (usuarios.length === 0) {
          return res.status(401).json({ 
            sucesso: false, 
            mensagem: 'Email ou senha incorretos' 
          });
        }
        const usuario = usuarios[0];
        delete usuario.senha_hash;
        res.status(200).json({
          sucesso: true,
          mensagem: 'Login realizado com sucesso!',
          usuario
        });
      }
    );
  } catch (erro) {
    res.status(500).json({ 
      sucesso: false, 
      mensagem: 'Erro no servidor', 
      erro: erro.message 
    });
  }
});

// Buscar dados do usuário logado
app.get('/api/users/me', verificarLogin, (req, res) => {
  // Como já temos os dados do usuário da função verificarLogin, podemos retorná-los diretamente
  const usuario = { ...req.usuario };
  delete usuario.senha_hash;  // Remove a senha dos dados
  
  res.status(200).json({ 
    sucesso: true, 
    dados: usuario 
  });
});

// Atualizar perfil do usuário
app.put('/api/users/me', verificarLogin, (req, res) => {
  const { nome } = req.body;
  let updateFields = [];
  let queryParams = [];
  if (nome) {
    updateFields.push('nome = ?');
    queryParams.push(nome);
  }
  if (updateFields.length === 0) {
    return res.status(400).json({ sucesso: false, mensagem: 'Nenhum campo para atualizar' });
  }
  queryParams.push(req.usuario.id);
  db.query(
    `UPDATE usuarios SET ${updateFields.join(', ')} WHERE id = ?`,
    queryParams,
    (err) => {
      if (err) {
        return res.status(500).json({ sucesso: false, mensagem: 'Erro ao atualizar usuário', erro: err });
      }
      db.query(
        'SELECT id, nome, email, data_criacao FROM usuarios WHERE id = ?',
        [req.usuario.id],
        (err, rows) => {
          if (err) {
            return res.status(500).json({ sucesso: false, mensagem: 'Erro ao buscar usuário atualizado', erro: err });
          }
          res.status(200).json({ sucesso: true, mensagem: 'Perfil atualizado com sucesso', dados: rows[0] });
        }
      );
    }
  );
});

// Obter ranking de usuários
app.get('/api/users/ranking', (req, res) => {
  db.query(
    'SELECT id, nome, pontos FROM usuarios ORDER BY pontos DESC LIMIT 10',
    (err, rows) => {
      if (err) {
        return res.status(500).json({ sucesso: false, mensagem: 'Erro ao buscar ranking', erro: err });
      }
      res.status(200).json({ sucesso: true, dados: rows });
    }
  );
});

//===================================================
// ROTAS DE HÁBITOS
//===================================================

// Criar novo hábito
app.post('/api/habits', verificarLogin, (req, res) => {
  try {
    const { titulo, descricao, meta_diaria, recorrencia } = req.body;
    if (!titulo || !recorrencia) {
      return res.status(400).json({ sucesso: false, mensagem: 'Título e recorrência são obrigatórios' });
    }
    db.query(
      'INSERT INTO habitos (usuario_id, titulo, descricao, meta_diaria, recorrencia) VALUES (?, ?, ?, ?, ?)',
      [req.usuario.id, titulo, descricao, meta_diaria || 1, recorrencia],
      (err, result) => {
        if (err) {
          return res.status(500).json({ sucesso: false, mensagem: 'Erro ao criar hábito', erro: err });
        }
        db.query('SELECT * FROM habitos WHERE id = ?', [result.insertId], (err, rows) => {
          if (err) {
            return res.status(500).json({ sucesso: false, mensagem: 'Erro ao buscar hábito criado', erro: err });
          }
          res.status(201).json({ 
            sucesso: true, 
            mensagem: 'Hábito criado com sucesso', 
            dados: rows[0] 
          });
        });
      }
    );
  } catch (error) {
    res.status(500).json({ sucesso: false, mensagem: 'Erro no servidor', erro: error.message });
  }
});

// Listar hábitos do usuário
app.get('/api/habits', verificarLogin, (req, res) => {
  db.query(
    'SELECT * FROM habitos WHERE usuario_id = ? ORDER BY data_criacao DESC',
    [req.usuario.id],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ sucesso: false, mensagem: 'Erro ao buscar hábitos', erro: err });
      }
      
      res.status(200).json({ sucesso: true, dados: rows });
    }
  );
});

// Obter estatísticas do usuário - MOVIDA PARA ANTES DA ROTA COM :id
app.get('/api/habits/stats/summary', verificarLogin, (req, res) => {
  // Obter total de hábitos
  db.query(
    'SELECT COUNT(*) as total_habits FROM habitos WHERE usuario_id = ?',
    [req.usuario.id],
    (err, habitRows) => {
      if (err) {
        return res.status(500).json({ sucesso: false, mensagem: 'Erro ao buscar estatísticas', erro: err });
      }
      
      const totalHabits = habitRows[0].total_habits;
      
      // Obter total de dias com hábitos concluídos nos últimos 30 dias
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const formattedDate = thirtyDaysAgo.toISOString().split('T')[0];
      
      db.query(
        `SELECT COUNT(DISTINCT data) as active_days 
         FROM progresso p 
         JOIN habitos h ON p.habito_id = h.id 
         WHERE h.usuario_id = ? AND p.quantidade > 0 AND p.data >= ?`,
        [req.usuario.id, formattedDate],
        (err, daysRows) => {
          if (err) {
            return res.status(500).json({ sucesso: false, mensagem: 'Erro ao buscar estatísticas', erro: err });
          }
          
          const activeDays = daysRows[0].active_days;
          
          // Obter sequência atual
          db.query(
            `SELECT usuario_id, MAX(streak) as current_streak FROM (
              SELECT 
                h.usuario_id,
                DATEDIFF(@curr_date, data) - 
                  IF(@prev_completed = 1, 
                     DATEDIFF(@curr_date, @prev_date), 0) as streak,
                @prev_date := data,
                @prev_completed := quantidade > 0,
                @curr_date := CURRENT_DATE
              FROM 
                progresso p
                JOIN habitos h ON p.habito_id = h.id,
                (SELECT @curr_date := CURRENT_DATE, 
                        @prev_date := NULL, 
                        @prev_completed := NULL) as vars
              WHERE 
                h.usuario_id = ?
                AND p.quantidade > 0
              ORDER BY 
                data DESC
            ) as streak_calc`,
            [req.usuario.id],
            (err, streakRows) => {
              if (err) {
                return res.status(500).json({ sucesso: false, mensagem: 'Erro ao buscar estatísticas', erro: err });
              }
              
              const currentStreak = streakRows[0]?.current_streak || 0;
              
              // Obter hábitos mais consistentes
              db.query(
                `SELECT 
                  h.id, h.titulo, COUNT(*) as completion_count 
                FROM 
                  progresso p 
                  JOIN habitos h ON p.habito_id = h.id 
                WHERE 
                  h.usuario_id = ? AND p.quantidade > 0 
                GROUP BY 
                  h.id 
                ORDER BY 
                  completion_count DESC 
                LIMIT 3`,
                [req.usuario.id],
                (err, topHabits) => {
                  if (err) {
                    return res.status(500).json({ sucesso: false, mensagem: 'Erro ao buscar estatísticas', erro: err });
                  }
                  
                  res.status(200).json({ 
                    sucesso: true, 
                    dados: {
                      total_habits: totalHabits,
                      active_days: activeDays,
                      current_streak: currentStreak,
                      top_habits: topHabits
                    } 
                  });
                }
              );
            }
          );
        }
      );
    }
  );
});

// Obter detalhes de um hábito específico
app.get('/api/habits/:id', verificarLogin, (req, res) => {
  const habitId = req.params.id;
  
  db.query(
    'SELECT * FROM habitos WHERE id = ? AND usuario_id = ?',
    [habitId, req.usuario.id],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ sucesso: false, mensagem: 'Erro ao buscar hábito', erro: err });
      }
      
      if (rows.length === 0) {
        return res.status(404).json({ sucesso: false, mensagem: 'Hábito não encontrado' });
      }
      
      res.status(200).json({ sucesso: true, dados: rows[0] });
    }
  );
});

// Atualizar hábito
app.put('/api/habits/:id', verificarLogin, (req, res) => {
  const habitId = req.params.id;
  const { titulo, descricao, meta_diaria, recorrencia } = req.body;
  
  // Verificar se o hábito pertence ao usuário
  db.query(
    'SELECT * FROM habitos WHERE id = ? AND usuario_id = ?',
    [habitId, req.usuario.id],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ sucesso: false, mensagem: 'Erro ao verificar hábito', erro: err });
      }
      
      if (rows.length === 0) {
        return res.status(404).json({ sucesso: false, mensagem: 'Hábito não encontrado' });
      }
      
      // Atualizar o hábito
      db.query(
        'UPDATE habitos SET titulo = ?, descricao = ?, meta_diaria = ?, recorrencia = ? WHERE id = ?',
        [titulo, descricao, meta_diaria, recorrencia, habitId],
        (err) => {
          if (err) {
            return res.status(500).json({ sucesso: false, mensagem: 'Erro ao atualizar hábito', erro: err });
          }
          
          db.query('SELECT * FROM habitos WHERE id = ?', [habitId], (err, rows) => {
            if (err) {
              return res.status(500).json({ sucesso: false, mensagem: 'Erro ao buscar hábito atualizado', erro: err });
            }
            
            res.status(200).json({ sucesso: true, mensagem: 'Hábito atualizado com sucesso', dados: rows[0] });
          });
        }
      );
    }
  );
});

// Excluir hábito
app.delete('/api/habits/:id', verificarLogin, (req, res) => {
  const habitId = req.params.id;
  
  // Verificar se o hábito pertence ao usuário
  db.query(
    'SELECT * FROM habitos WHERE id = ? AND usuario_id = ?',
    [habitId, req.usuario.id],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ sucesso: false, mensagem: 'Erro ao verificar hábito', erro: err });
      }
      
      if (rows.length === 0) {
        return res.status(404).json({ sucesso: false, mensagem: 'Hábito não encontrado' });
      }
      
      // Excluir o hábito
      db.query('DELETE FROM habitos WHERE id = ?', [habitId], (err) => {
        if (err) {
          return res.status(500).json({ sucesso: false, mensagem: 'Erro ao excluir hábito', erro: err });
        }
        
        res.status(200).json({ sucesso: true, mensagem: 'Hábito excluído com sucesso' });
      });
    }
  );
});

// Registrar rastreamento de hábito (marcar como concluído ou progresso)
app.post('/api/habits/:id/track', verificarLogin, (req, res) => {
  const habitId = req.params.id;
  const { data, quantidade } = req.body;
  const today = new Date().toISOString().split('T')[0];
  db.query(
    'SELECT * FROM habitos WHERE id = ? AND usuario_id = ?',
    [habitId, req.usuario.id],
    (err, habitRows) => {
      if (err) {
        return res.status(500).json({ sucesso: false, mensagem: 'Erro ao verificar hábito', erro: err });
      }
      if (habitRows.length === 0) {
        return res.status(404).json({ sucesso: false, mensagem: 'Hábito não encontrado' });
      }
      const trackDate = data || today;
      db.query(
        'SELECT * FROM progresso WHERE habito_id = ? AND data = ?',
        [habitId, trackDate],
        (err, trackRows) => {
          if (err) {
            return res.status(500).json({ sucesso: false, mensagem: 'Erro ao verificar progresso', erro: err });
          }
          const trackCount = quantidade !== undefined ? quantidade : 1;
          if (trackRows.length > 0) {
            db.query(
              'UPDATE progresso SET quantidade = ? WHERE id = ?',
              [trackCount, trackRows[0].id],
              (err) => {
                if (err) {
                  return res.status(500).json({ sucesso: false, mensagem: 'Erro ao atualizar progresso', erro: err });
                }
                res.status(200).json({ 
                  sucesso: true, 
                  mensagem: 'Progresso atualizado com sucesso'
                });
              }
            );
          } else {
            db.query(
              'INSERT INTO progresso (habito_id, data, quantidade) VALUES (?, ?, ?)',
              [habitId, trackDate, trackCount],
              (err) => {
                if (err) {
                  return res.status(500).json({ sucesso: false, mensagem: 'Erro ao criar progresso', erro: err });
                }
                res.status(201).json({ 
                  sucesso: true, 
                  mensagem: 'Progresso criado com sucesso'
                });
              }
            );
          }
        }
      );
    }
  );
});

// Obter histórico de rastreamento de um hábito
app.get('/api/habits/:id/history', verificarLogin, (req, res) => {
  const habitId = req.params.id;
  const { start_date, end_date } = req.query;
  
  // Verificar se o hábito pertence ao usuário
  db.query(
    'SELECT * FROM habitos WHERE id = ? AND usuario_id = ?',
    [habitId, req.usuario.id],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ sucesso: false, mensagem: 'Erro ao verificar hábito', erro: err });
      }
      
      if (rows.length === 0) {
        return res.status(404).json({ sucesso: false, mensagem: 'Hábito não encontrado' });
      }
      
      // Construir a consulta com datas opcionais
      let query = 'SELECT * FROM progresso WHERE habito_id = ?';
      let params = [habitId];
      
      if (start_date) {
        query += ' AND data >= ?';
        params.push(start_date);
      }
      
      if (end_date) {
        query += ' AND data <= ?';
        params.push(end_date);
      }
      
      query += ' ORDER BY data DESC';
      
      db.query(query, params, (err, rows) => {
        if (err) {
          return res.status(500).json({ sucesso: false, mensagem: 'Erro ao buscar histórico', erro: err });
        }
        
        res.status(200).json({ sucesso: true, dados: rows });
      });
    }
  );
});

//===================================================
// ROTAS DE LEMBRETES
//===================================================

app.get('/api/reminders', verificarLogin, (req, res) => {
  db.query(
    `SELECT r.*, h.titulo as habit_title 
     FROM reminders r 
     JOIN habitos h ON r.habito_id = h.id 
     WHERE h.usuario_id = ? 
     ORDER BY r.time`,
    [req.usuario.id],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ sucesso: false, mensagem: 'Erro ao buscar lembretes', erro: err });
      }
      
      res.status(200).json({ sucesso: true, dados: rows });
    }
  );
});

// Listar lembretes de um hábito específico
app.get('/api/reminders/habit/:id', verificarLogin, (req, res) => {
  const habitId = req.params.id;
  
  // Verificar se o hábito pertence ao usuário
  db.query(
    'SELECT * FROM habitos WHERE id = ? AND usuario_id = ?',
    [habitId, req.usuario.id],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ sucesso: false, mensagem: 'Erro ao verificar hábito', erro: err });
      }
      
      if (rows.length === 0) {
        return res.status(404).json({ sucesso: false, mensagem: 'Hábito não encontrado' });
      }
      
      // Buscar lembretes do hábito
      db.query(
        'SELECT * FROM reminders WHERE habito_id = ? ORDER BY time',
        [habitId],
        (err, rows) => {
          if (err) {
            return res.status(500).json({ sucesso: false, mensagem: 'Erro ao buscar lembretes', erro: err });
          }
          
          res.status(200).json({ sucesso: true, dados: rows });
        }
      );
    }
  );
});

// Obter detalhes de um lembrete específico
app.get('/api/reminders/:id', verificarLogin, (req, res) => {
  const reminderId = req.params.id;
  
  db.query(
    `SELECT r.*, h.titulo as habit_title 
     FROM reminders r 
     JOIN habitos h ON r.habito_id = h.id 
     WHERE r.id = ? AND h.usuario_id = ?`,
    [reminderId, req.usuario.id],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ sucesso: false, mensagem: 'Erro ao buscar lembrete', erro: err });
      }
      
      if (rows.length === 0) {
        return res.status(404).json({ sucesso: false, mensagem: 'Lembrete não encontrado' });
      }
      
      res.status(200).json({ sucesso: true, dados: rows[0] });
    }
  );
});

// Atualizar lembrete
app.put('/api/reminders/:id', verificarLogin, (req, res) => {
  const reminderId = req.params.id;
  const { time, days, message, active } = req.body;
  
  // Verificar se o lembrete pertence ao usuário
  db.query(
    `SELECT r.*, h.usuario_id 
     FROM reminders r 
     JOIN habitos h ON r.habito_id = h.id 
     WHERE r.id = ? AND h.usuario_id = ?`,
    [reminderId, req.usuario.id],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ sucesso: false, mensagem: 'Erro ao verificar lembrete', erro: err });
      }
      
      if (rows.length === 0) {
        return res.status(404).json({ sucesso: false, mensagem: 'Lembrete não encontrado' });
      }
      
      // Atualizar o lembrete
      const updateFields = [];
      const queryParams = [];
      
      if (time !== undefined) {
        updateFields.push('time = ?');
        queryParams.push(time);
      }
      
      if (days !== undefined) {
        updateFields.push('days = ?');
        queryParams.push(days);
      }
      
      if (message !== undefined) {
        updateFields.push('message = ?');
        queryParams.push(message);
      }
      
      if (active !== undefined) {
        updateFields.push('active = ?');
        queryParams.push(active);
      }
      
      if (updateFields.length === 0) {
        return res.status(400).json({ sucesso: false, mensagem: 'Nenhum campo para atualizar' });
      }
      
      // Adiciona o ID do lembrete aos parâmetros
      queryParams.push(reminderId);
      
      db.query(
        `UPDATE reminders SET ${updateFields.join(', ')} WHERE id = ?`,
        queryParams,
        (err) => {
          if (err) {
            return res.status(500).json({ sucesso: false, mensagem: 'Erro ao atualizar lembrete', erro: err });
          }
          
          db.query(
            `SELECT r.*, h.titulo as habit_title 
             FROM reminders r 
             JOIN habitos h ON r.habito_id = h.id 
             WHERE r.id = ?`,
            [reminderId],
            (err, rows) => {
              if (err) {
                return res.status(500).json({ sucesso: false, mensagem: 'Erro ao buscar lembrete atualizado', erro: err });
              }
              
              res.status(200).json({ sucesso: true, mensagem: 'Lembrete atualizado com sucesso', dados: rows[0] });
            }
          );
        }
      );
    }
  );
});

// Excluir lembrete
app.delete('/api/reminders/:id', verificarLogin, (req, res) => {
  const reminderId = req.params.id;
  
  // Verificar se o lembrete pertence ao usuário
  db.query(
    `SELECT r.*, h.usuario_id 
     FROM reminders r 
     JOIN habitos h ON r.habito_id = h.id 
     WHERE r.id = ? AND h.usuario_id = ?`,
    [reminderId, req.usuario.id],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ sucesso: false, mensagem: 'Erro ao verificar lembrete', erro: err });
      }
      
      if (rows.length === 0) {
        return res.status(404).json({ sucesso: false, mensagem: 'Lembrete não encontrado' });
      }
      
      // Excluir o lembrete
      db.query('DELETE FROM reminders WHERE id = ?', [reminderId], (err) => {
        if (err) {
          return res.status(500).json({ sucesso: false, mensagem: 'Erro ao excluir lembrete', erro: err });
        }
        
        res.status(200).json({ sucesso: true, mensagem: 'Lembrete excluído com sucesso' });
      });
    }
  );
});

// Ativar/desativar lembrete
app.patch('/api/reminders/:id/toggle', verificarLogin, (req, res) => {
  const reminderId = req.params.id;
  
  // Verificar se o lembrete pertence ao usuário
  db.query(
    `SELECT r.*, h.usuario_id 
     FROM reminders r 
     JOIN habitos h ON r.habito_id = h.id 
     WHERE r.id = ? AND h.usuario_id = ?`,
    [reminderId, req.usuario.id],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ sucesso: false, mensagem: 'Erro ao verificar lembrete', erro: err });
      }
      
      if (rows.length === 0) {
        return res.status(404).json({ sucesso: false, mensagem: 'Lembrete não encontrado' });
      }
      
      const currentActive = rows[0].active;
      
      // Inverter o estado atual
      db.query(
        'UPDATE reminders SET active = ? WHERE id = ?',
        [!currentActive, reminderId],
        (err) => {
          if (err) {
            return res.status(500).json({ sucesso: false, mensagem: 'Erro ao atualizar lembrete', erro: err });
          }
          
          const mensagem = !currentActive ? 'Lembrete ativado com sucesso' : 'Lembrete desativado com sucesso';
          
          res.status(200).json({ 
            sucesso: true, 
            mensagem,
            ativo: !currentActive 
          });
        }
      );
    }
  );
});

//===================================================
// ROTAS DE CONQUISTAS
//===================================================

app.get('/api/achievements', (req, res) => {
  db.query('SELECT * FROM conquistas ORDER BY pontos', (err, rows) => {
    if (err) {
      return res.status(500).json({ sucesso: false, mensagem: 'Erro ao buscar conquistas', erro: err });
    }
    
    res.status(200).json({ sucesso: true, dados: rows });
  });
});

// Listar conquistas do usuário
app.get('/api/achievements/user', verificarLogin, (req, res) => {
  db.query(
    `SELECT a.*, ua.data_ganho 
     FROM conquistas a
     JOIN user_conquistas ua ON a.id = ua.conquista_id
     WHERE ua.usuario_id = ?
     ORDER BY ua.data_ganho DESC`,
    [req.usuario.id],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ sucesso: false, mensagem: 'Erro ao buscar conquistas do usuário', erro: err });
      }
      
      res.status(200).json({ sucesso: true, dados: rows });
        }
    );
});

// Obter progresso das conquistas do usuário
app.get('/api/achievements/progress', verificarLogin, (req, res) => {
  // Buscar todas as conquistas
  db.query('SELECT * FROM conquistas ORDER BY pontos', (err, allAchievements) => {
    if (err) {
      return res.status(500).json({ sucesso: false, mensagem: 'Erro ao buscar conquistas', erro: err });
    }
    
    // Buscar conquistas do usuário
    db.query(
      'SELECT conquista_id FROM user_conquistas WHERE usuario_id = ?',
      [req.usuario.id],
      (err, userAchievements) => {
        if (err) {
          return res.status(500).json({ sucesso: false, mensagem: 'Erro ao buscar conquistas do usuário', erro: err });
        }
        
        // Criar conjunto de IDs de conquistas do usuário para facilitar a busca
        const achievedIds = new Set(userAchievements.map(ua => ua.conquista_id));
        
        // Adicionar status de conclusão a cada conquista
        const achievementsWithStatus = allAchievements.map(achievement => ({
          ...achievement,
          achieved: achievedIds.has(achievement.id)
        }));
        
        // Calcular estatísticas
        const total = allAchievements.length;
        const completed = userAchievements.length;
        const percentComplete = total > 0 ? Math.round((completed / total) * 100) : 0;
        
        res.status(200).json({ 
          sucesso: true, 
          dados: {
            conquistas: achievementsWithStatus,
            stats: {
              total,
              completed,
              percentComplete
            }
          } 
        });
      }
    );
  });
});

// Obter últimas conquistas desbloqueadas por todos os usuários (feed público) - MOVIDA PARA ANTES DA ROTA COM :id
app.get('/api/achievements/feed/recent', (req, res) => {
  db.query(
    `SELECT ua.id, ua.data_ganho, u.nome as user_name, u.foto_perfil, 
            a.titulo as achievement_title, a.descricao, a.pontos, a.imagem_recompensa
     FROM user_conquistas ua
     JOIN usuarios u ON ua.usuario_id = u.id
     JOIN conquistas a ON ua.conquista_id = a.id
     ORDER BY ua.data_ganho DESC
     LIMIT 20`,
    (err, rows) => {
      if (err) {
        return res.status(500).json({ sucesso: false, mensagem: 'Erro ao buscar feed de conquistas', erro: err });
      }
      
      res.status(200).json({ sucesso: true, dados: rows });
    }
  );
});

// Obter detalhes de uma conquista específica
app.get('/api/achievements/:id', (req, res) => {
  const achievementId = req.params.id;
  
  db.query('SELECT * FROM conquistas WHERE id = ?', [achievementId], (err, rows) => {
    if (err) {
      return res.status(500).json({ sucesso: false, mensagem: 'Erro ao buscar conquista', erro: err });
    }
    
    if (rows.length === 0) {
      return res.status(404).json({ sucesso: false, mensagem: 'Conquista não encontrada' });
    }
    
    res.status(200).json({ sucesso: true, dados: rows[0] });
    });
});

// [ADMIN] Criar nova conquista (rota protegida por admin)
app.post('/api/achievements', verificarLogin, (req, res) => {
  // Esta rota seria apenas para administradores em um ambiente de produção
  // Aqui estamos simplificando sem a verificação de admin
  try {
    const { titulo, descricao, pontos, imagem_recompensa } = req.body;
    
    // Validação básica
    if (!titulo || !pontos) {
      return res.status(400).json({ sucesso: false, mensagem: 'Título e pontos são obrigatórios' });
    }
    
    db.query(
      'INSERT INTO conquistas (titulo, descricao, pontos, imagem_recompensa) VALUES (?, ?, ?, ?)',
      [titulo, descricao, pontos, imagem_recompensa],
      (err, result) => {
        if (err) {
          return res.status(500).json({ sucesso: false, mensagem: 'Erro ao criar conquista', erro: err });
        }
        
        db.query('SELECT * FROM conquistas WHERE id = ?', [result.insertId], (err, rows) => {
          if (err) {
            return res.status(500).json({ sucesso: false, mensagem: 'Erro ao buscar conquista criada', erro: err });
          }
          
          res.status(201).json({ 
            sucesso: true, 
            mensagem: 'Conquista criada com sucesso', 
            dados: rows[0] 
          });
        });
      }
    );
  } catch (error) {
    res.status(500).json({ sucesso: false, mensagem: 'Erro no servidor', erro: error.message });
  }
});

// Por último, inclua as rotas para servir a aplicação frontend
// Importante que esta rota seja definida APÓS todas as rotas de API
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.get('/app', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Para todas as outras rotas não definidas explicitamente, redirecione para a página inicial
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

//===================================================
// FUNÇÕES AUXILIARES
//===================================================

// Função para verificar conquistas do usuário
function checkAchievements(userId) {
  // Verificar quantos hábitos foram concluídos no total
  db.query(
    `SELECT COUNT(*) as total_completed 
     FROM progresso p 
     JOIN habitos h ON p.habito_id = h.id 
     WHERE h.usuario_id = ? AND p.quantidade > 0`,
    [userId],
    (err, rows) => {
      if (err || !rows.length) return;
      
      const totalCompleted = rows[0].total_completed;
      
      // Definir conquistas baseadas no número total de hábitos concluídos
      const milestones = [
        { id: 1, count: 1, title: 'Primeiro Passo', points: 50 },
        { id: 2, count: 10, title: 'Consistência Inicial', points: 100 },
        { id: 3, count: 30, title: 'Hábitos em Formação', points: 200 },
        { id: 4, count: 60, title: 'Mestre dos Hábitos', points: 300 },
        { id: 5, count: 100, title: 'Estilo de Vida Saudável', points: 500 }
      ];
      
      milestones.forEach(milestone => {
        if (totalCompleted >= milestone.count) {
          // Verificar se o usuário já tem essa conquista
          db.query(
            `SELECT * FROM user_conquistas ua
             JOIN conquistas a ON ua.conquista_id = a.id
             WHERE ua.usuario_id = ? AND a.titulo = ?`,
            [userId, milestone.title],
            (err, rows) => {
              if (err || rows.length > 0) return; // Já tem ou erro
              
              // Verificar se a conquista existe
              db.query(
                'SELECT * FROM conquistas WHERE titulo = ?',
                [milestone.title],
                (err, achievementRows) => {
                  if (err) return;
                  
                  let achievementId;
                  
                  if (achievementRows.length === 0) {
                    // Criar a conquista se não existir
                    db.query(
                      'INSERT INTO conquistas (titulo, descricao, pontos) VALUES (?, ?, ?)',
                      [milestone.title, `Complete ${milestone.count} hábitos`, milestone.points],
                      (err, result) => {
                        if (err || !result.insertId) return;
                        achievementId = result.insertId;
                        
                        // Atribuir a conquista ao usuário
                        assignAchievement(userId, achievementId, milestone.points);
                      }
                    );
                  } else {
                    // Usar a conquista existente
                    achievementId = achievementRows[0].id;
                    
                    // Atribuir a conquista ao usuário
                    assignAchievement(userId, achievementId, milestone.points);
                  }
                }
              );
            }
          );
        }
      });
      
      // Verificar sequência atual de dias
      db.query(
        `SELECT MAX(consecutive_days) as max_streak
         FROM (
           SELECT 
             COUNT(*) as consecutive_days
           FROM (
             SELECT 
               data,
               @row_num := IF(@prev_date = DATE_SUB(data, INTERVAL 1 DAY), @row_num, @row_num + 1) as group_num,
               @prev_date := data
             FROM 
               (
                 SELECT DISTINCT data
                 FROM progresso p
                 JOIN habitos h ON p.habito_id = h.id
                 WHERE h.usuario_id = ? AND p.quantidade > 0
                 ORDER BY data DESC
               ) dates,
               (SELECT @row_num := 0, @prev_date := NULL) vars
           ) grouped
           GROUP BY group_num
           ORDER BY consecutive_days DESC
           LIMIT 1
         ) streak`,
        [userId],
        (err, rows) => {
          if (err || !rows.length) return;
          
          const maxStreak = rows[0].max_streak || 0;
          
          // Conquistas por sequência
          const streakMilestones = [
            { id: 6, count: 3, title: 'Sequência de 3 Dias', points: 30 },
            { id: 7, count: 7, title: 'Sequência Semanal', points: 70 },
            { id: 8, count: 14, title: 'Duas Semanas Perfeitas', points: 140 },
            { id: 9, count: 30, title: 'Mês de Dedicação', points: 300 },
            { id: 10, count: 60, title: 'Mestre da Consistência', points: 600 }
          ];
          
          streakMilestones.forEach(milestone => {
            if (maxStreak >= milestone.count) {
              // Verificar se o usuário já tem essa conquista
              db.query(
                `SELECT * FROM user_conquistas ua
                 JOIN conquistas a ON ua.conquista_id = a.id
                 WHERE ua.usuario_id = ? AND a.titulo = ?`,
                [userId, milestone.title],
                (err, rows) => {
                  if (err || rows.length > 0) return; // Já tem ou erro
                  
                  // Verificar se a conquista existe
                  db.query(
                    'SELECT * FROM conquistas WHERE titulo = ?',
                    [milestone.title],
                    (err, achievementRows) => {
                      if (err) return;
                      
                      let achievementId;
                      
                      if (achievementRows.length === 0) {
                        // Criar a conquista se não existir
                        db.query(
                          'INSERT INTO conquistas (titulo, descricao, pontos) VALUES (?, ?, ?)',
                          [milestone.title, `Mantenha uma sequência de ${milestone.count} dias`, milestone.points],
                          (err, result) => {
                            if (err || !result.insertId) return;
                            achievementId = result.insertId;
                            
                            // Atribuir a conquista ao usuário
                            assignAchievement(userId, achievementId, milestone.points);
                          }
                        );
                      } else {
                        // Usar a conquista existente
                        achievementId = achievementRows[0].id;
                        
                        // Atribuir a conquista ao usuário
                        assignAchievement(userId, achievementId, milestone.points);
                      }
                    }
                  );
                }
              );
            }
          });
        }
      );
    }
  );
}

// Função para atribuir conquista ao usuário
function assignAchievement(userId, achievementId, points) {
  // Inserir na tabela user_conquistas
  db.query(
    'INSERT INTO user_conquistas (usuario_id, conquista_id) VALUES (?, ?)',
    [userId, achievementId],
    (err) => {
      if (err) return;
      
      // Adicionar pontos ao usuário
      db.query(
        'UPDATE usuarios SET pontos = pontos + ? WHERE id = ?',
        [points, userId]
      );
    }
  );
}

// Inicia o servidor
app.listen(port, () => console.log(`Servidor rodando na porta ${port}`)); 