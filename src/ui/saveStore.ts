import type { CombatState, RunState, ShopVisit } from '../engine';
import type { Screen } from './useGame';

/**
 * Two files, see ARCHITECTURE.md → Persistence:
 * - `save`: the run in progress, deleted when it ends;
 * - `profile`: what lasts between runs (the home aquarium).
 * Bump a version when that file's shape changes, and upgrade older files in its `upgrade…`.
 */
export const SAVE_VERSION = 2;
export const PROFILE_VERSION = 1;

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

/** What the player keeps from run to run. */
export interface Profile {
  version: number;
  /** Creature ids brought home from won runs (duplicates allowed). */
  homeAquarium: string[];
}

type DataFile = 'save' | 'profile';

/** A file in the app's data folder in the desktop app (see electron/main.js), localStorage in a browser. */
const storage = window.desktop ?? {
  readData: async (name: DataFile) => localStorage.getItem(`slay-the-fish:${name}`),
  writeData: async (name: DataFile, json: string) => localStorage.setItem(`slay-the-fish:${name}`, json),
  deleteData: async (name: DataFile) => localStorage.removeItem(`slay-the-fish:${name}`),
};

async function read<T>(name: DataFile): Promise<T | null> {
  try {
    const json = await storage.readData(name);
    return json ? (JSON.parse(json) as T) : null;
  } catch {
    return null;
  }
}

// Writes run one after another, so an older version of a file can never land after a newer one.
let queue: Promise<unknown> = Promise.resolve();
function enqueue(task: () => Promise<unknown>) {
  queue = queue.then(task).catch((error) => console.error('Saving failed:', error));
}

/** Older saves are turned into the current shape here; null means it can't be resumed. */
function upgradeSave(save: SavedGame): SavedGame | null {
  // v1 called the bucket `captured`.
  if (save.version === 1) {
    const { captured, ...run } = save.run as RunState & { captured: string[] };
    save = { ...save, version: 2, run: { ...run, bucket: captured } };
  }
  return save.version === SAVE_VERSION ? save : null;
}

export async function loadSavedGame(): Promise<SavedGame | null> {
  const save = await read<SavedGame>('save');
  return save ? upgradeSave(save) : null;
}

export function writeSavedGame(save: SavedGame) {
  const json = JSON.stringify(save);
  enqueue(() => storage.writeData('save', json));
}

export function clearSavedGame() {
  enqueue(() => storage.deleteData('save'));
}

/** The profile, or a fresh one (empty home aquarium) if there's none or it can't be read. */
export async function loadProfile(): Promise<Profile> {
  const profile = await read<Profile>('profile');
  return profile?.version === PROFILE_VERSION ? profile : { version: PROFILE_VERSION, homeAquarium: [] };
}

export function writeProfile(profile: Profile) {
  const json = JSON.stringify(profile);
  enqueue(() => storage.writeData('profile', json));
}
