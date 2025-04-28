// Importando o pacote mysql2
const mysql = require('mysql2');

// Configuração da conexão com o banco de dados
const connection = mysql.createConnection({
  host: 'localhost', 
  user: 'clinica',
  password: 'root',
  database: 'root' 
});

// Conectando ao banco de dados e verificando se há algum erro
connection.connect((err) => {
  if (err) {
    console.error('Erro de conexão ao banco de dados:', err.stack);
    return;
  }
  console.log('Conectado ao banco de dados');
});

// Exportando a conexão para ser usada em outros arquivos
module.exports = connection;