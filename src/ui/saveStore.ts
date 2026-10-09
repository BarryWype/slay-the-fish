import type { CombatState, RunState, ShopVisit } from '../engine';
import type { Screen } from './useGame';

/** Bump when the saved shape changes, and upgrade older saves in `upgrade`. */
export const SAVE_VERSION = 1;

/** Everything needed to pick a run up exactly where it was left. */
export interface SavedGame {
  version: number;
  seed: number;
  screen: Screen;
  run: RunState;
  combat: CombatState | null;
  rewardChoices: string[];
  eventId: string | null;
  shopVisit: ShopVisit;
}

const STORAGE_KEY = 'slay-the-fish:save';

/**
 * Where the save lives: a file in the app's data folder in the desktop app
 * (see electron/main.js), localStorage in a browser.
 */
const storage = window.desktop
  ? { load: window.desktop.loadSave, write: window.desktop.writeSave, remove: window.desktop.deleteSave }
  : {
      load: async () => localStorage.getItem(STORAGE_KEY),
      write: async (json: string) => localStorage.setItem(STORAGE_KEY, json),
      remove: async () => localStorage.removeItem(STORAGE_KEY),
    };

/** Older saves are turned into the current shape here; null means it can't be resumed. */
function upgrade(save: SavedGame): SavedGame | null {
  return save.version === SAVE_VERSION ? save : null;
}

export async function loadSavedGame(): Promise<SavedGame | null> {
  try {
    const json = await storage.load();
    return json ? upgrade(JSON.parse(json) as SavedGame) : null;
  } catch {
    return null;
  }
}

// Writes run one after another, so an older save can never land after a newer one.
let queue: Promise<unknown> = Promise.resolve();
function enqueue(task: () => Promise<unknown>) {
  queue = queue.then(task).catch((error) => console.error('Saving failed:', error));
}

export function writeSavedGame(save: SavedGame) {
  const json = JSON.stringify(save);
  enqueue(() => storage.write(json));
}

export function clearSavedGame() {
  enqueue(() => storage.remove());
}
