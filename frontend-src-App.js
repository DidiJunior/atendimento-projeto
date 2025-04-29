import React, { useState, useEffect } from 'react';
import socketIOClient from 'socket.io-client';

const ENDPOINT = process.env.REACT_APP_API_URL;

function App() {
  const [chamados, setChamados] = useState([]);
  const [sala, setSala] = useState('');
  const [andar, setAndar] = useState('');

  useEffect(() => {
    fetch(`${ENDPOINT}/chamados`)
      .then(res => res.json())
      .then(setChamados);

    const socket = socketIOClient(ENDPOINT);
    socket.on('novo_chamado', data => {
      setChamados(prev => [data, ...prev]);
    });
    socket.on('chamado_resolvido', data => {
      setChamados(prev => prev.map(c => c.id === data.id ? { ...c, status: 'resolvido' } : c));
    });

    return () => socket.disconnect();
  }, []);

  const criarChamado = async () => {
    const res = await fetch(`${ENDPOINT}/chamados`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sala, andar })
    });
    const novo = await res.json();
    setSala('');
    setAndar('');
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Chamados</h1>
      <input value={sala} onChange={e => setSala(e.target.value)} placeholder="Sala" />
      <input value={andar} onChange={e => setAndar(e.target.value)} placeholder="Andar" />
      <button onClick={criarChamado}>Criar Chamado</button>
      <ul>
        {chamados.map(c => (
          <li key={c.id}>
            Sala {c.sala} - Andar {c.andar} - Status: {c.status}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
