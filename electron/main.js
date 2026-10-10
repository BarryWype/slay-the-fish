import { app, BrowserWindow, ipcMain } from 'electron';
import { readFile, rename, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * The game's data files, in the app's data folder (e.g. ~/Library/Application Support/Slay the Fish
 * on macOS): `save` is the run in progress, `profile` what lasts between runs (the home aquarium).
 * Only these names are accepted, so the page can't touch any other file.
 */
const DATA_FILES = new Set(['save', 'profile']);
function dataPath(name) {
  if (!DATA_FILES.has(name)) throw new Error(`Unknown data file "${name}"`);
  return path.join(app.getPath('userData'), `${name}.json`);
}

ipcMain.handle('data:read', async (_event, name) => {
  try {
    return await readFile(dataPath(name), 'utf8');
  } catch {
    return null;
  }
});
// Write to a temporary file, then rename it over the real one: a crash mid-write can't corrupt it.
ipcMain.handle('data:write', async (_event, name, json) => {
  const tmp = `${dataPath(name)}.tmp`;
  await writeFile(tmp, json, 'utf8');
  await rename(tmp, dataPath(name));
});
ipcMain.handle('data:delete', (_event, name) => rm(dataPath(name), { force: true }));
ipcMain.handle('app:quit', () => app.quit());

/**
 * Window options (fullscreen) live in settings.json, written only from here and kept apart
 * from the game's data files, so resetting progression doesn't touch them.
 */
const settingsPath = () => path.join(app.getPath('userData'), 'settings.json');
async function readSettings() {
  try {
    return JSON.parse(await readFile(settingsPath(), 'utf8'));
  } catch {
    return {};
  }
}
const writeSettings = (settings) => writeFile(settingsPath(), JSON.stringify(settings), 'utf8');

ipcMain.handle('window:isFullScreen', (event) => BrowserWindow.fromWebContents(event.sender)?.isFullScreen() ?? false);
ipcMain.handle('window:setFullScreen', (event, on) => BrowserWindow.fromWebContents(event.sender)?.setFullScreen(!!on));

async function createWindow() {
  const settings = await readSettings();
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    // Only ever pass `true`: on macOS, `fullscreen: false` disables fullscreen for the window.
    ...(settings.fullscreen ? { fullscreen: true } : {}),
    autoHideMenuBar: true,
    title: 'Slay the Fish',
    webPreferences: { preload: path.join(dirname, 'preload.cjs') },
  });
  // Remembered however fullscreen was toggled: the options, the OS button or a shortcut.
  const remember = (fullscreen) => writeSettings({ ...settings, fullscreen }).catch(() => {});
  win.on('enter-full-screen', () => remember(true));
  win.on('leave-full-screen', () => remember(false));
  // `npm run electron:dev` points this at the Vite dev server; otherwise load the build.
  if (process.env.VITE_DEV_SERVER_URL) win.loadURL(process.env.VITE_DEV_SERVER_URL);
  else win.loadFile(path.join(dirname, '../dist/index.html'));
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => app.quit());
