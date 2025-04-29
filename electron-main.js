const { app, BrowserWindow, Notification } = require('electron');
const path = require('path');
const io = require('socket.io-client');

const createWindow = () => {
  const win = new BrowserWindow({
    width: 400,
    height: 600,
    webPreferences: { nodeIntegration: true }
  });

  win.loadURL('data:text/html,<h1>Monitor de Chamados</h1>');
};

app.whenReady().then(() => {
  createWindow();

  const socket = io('http://localhost:3000');
  socket.on('novo_chamado', (data) => {
    new Notification({
      title: 'Novo Chamado',
      body: `Sala: ${data.sala}, Andar: ${data.andar}`,
    }).show();
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
