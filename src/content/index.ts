import { buildGameData, type ContentSource } from '../engine';
import { cards } from './cards';
import { character } from './character';
import { encounters } from './encounters';
import { enemies } from './enemies';
import { starterDeck } from './starterDeck';

export const contentSource: ContentSource = { character, cards, enemies, encounters, starterDeck };

/** Validated, id-indexed content. Throws at startup if any data is inconsistent. */
export const gameData = buildGameData(contentSource);
