import { app, BrowserWindow, ipcMain } from 'electron';
import { readFile, rename, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dirname = path.dirname(fileURLToPath(import.meta.url));

/** The saved run, in the app's data folder (e.g. ~/Library/Application Support/Slay the Fish on macOS). */
const savePath = () => path.join(app.getPath('userData'), 'save.json');

ipcMain.handle('save:load', async () => {
  try {
    return await readFile(savePath(), 'utf8');
  } catch {
    return null;
  }
});
// Write to a temporary file, then rename it over the save: a crash mid-write can't corrupt it.
ipcMain.handle('save:write', async (_event, json) => {
  const tmp = `${savePath()}.tmp`;
  await writeFile(tmp, json, 'utf8');
  await rename(tmp, savePath());
});
ipcMain.handle('save:delete', () => rm(savePath(), { force: true }));
ipcMain.handle('app:quit', () => app.quit());

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    autoHideMenuBar: true,
    title: 'Slay the Fish',
    webPreferences: { preload: path.join(dirname, 'preload.cjs') },
  });
  // `npm run electron:dev` points this at the Vite dev server; otherwise load the build.
  if (process.env.VITE_DEV_SERVER_URL) win.loadURL(process.env.VITE_DEV_SERVER_URL);
  else win.loadFile(path.join(dirname, '../dist/index.html'));
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => app.quit());
