const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

app.use(cors());
app.use(express.json());

// Conexão com o banco de dados
const db = new sqlite3.Database('./chamados.db', (err) => {
  if (err) return console.error('Erro ao conectar ao banco:', err);
  console.log('Conectado ao SQLite');
});

// Criação da tabela
db.run(`
  CREATE TABLE IF NOT EXISTS chamados (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sala TEXT,
    andar TEXT,
    status TEXT DEFAULT 'pendente',
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Rotas da API
app.get('/chamados', (req, res) => {
  db.all('SELECT * FROM chamados ORDER BY criado_em DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/chamados', (req, res) => {
  const { sala, andar } = req.body;
  db.run(
    'INSERT INTO chamados (sala, andar) VALUES (?, ?)',
    [sala, andar],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });

      const novoChamado = { id: this.lastID, sala, andar, status: 'pendente' };
      io.emit('novo_chamado', novoChamado);
      res.status(201).json(novoChamado);
    }
  );
});

app.put('/chamados/:id/resolver', (req, res) => {
  const { id } = req.params;
  db.run(
    'UPDATE chamados SET status = ? WHERE id = ?',
    ['resolvido', id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      io.emit('chamado_resolvido', { id });
      res.json({ id });
    }
  );
});

// Iniciar servidor
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Servidor backend rodando em http://localhost:${PORT}`);
});
