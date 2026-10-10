// Runs before the game page loads and exposes a tiny, safe API as `window.desktop`.
// Preload scripts must be CommonJS (hence .cjs), unlike the rest of the project.
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('desktop', {
  readData: (name) => ipcRenderer.invoke('data:read', name),
  writeData: (name, json) => ipcRenderer.invoke('data:write', name, json),
  deleteData: (name) => ipcRenderer.invoke('data:delete', name),
  quit: () => ipcRenderer.invoke('app:quit'),
});
