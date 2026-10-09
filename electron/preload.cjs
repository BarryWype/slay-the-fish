// Runs before the game page loads and exposes a tiny, safe API as `window.desktop`.
// Preload scripts must be CommonJS (hence .cjs), unlike the rest of the project.
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('desktop', {
  loadSave: () => ipcRenderer.invoke('save:load'),
  writeSave: (json) => ipcRenderer.invoke('save:write', json),
  deleteSave: () => ipcRenderer.invoke('save:delete'),
  quit: () => ipcRenderer.invoke('app:quit'),
});
