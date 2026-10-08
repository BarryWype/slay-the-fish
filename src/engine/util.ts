import { MAX_LOG_ENTRIES } from './constants';
import type { CombatState } from './types';

/** Deep copy of plain JSON data. All engine state is plain data by design. */
export function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function addLog(state: CombatState, message: string): void {
  state.log.push(message);
  if (state.log.length > MAX_LOG_ENTRIES) {
    state.log.splice(0, state.log.length - MAX_LOG_ENTRIES);
  }
}
