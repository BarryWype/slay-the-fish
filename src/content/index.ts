import { buildGameData, type ContentSource } from '../engine';
import { builds } from './builds';
import { cards } from './cards';
import { character } from './character';
import { creatureTypes } from './creatureTypes';
import { encounters } from './encounters';
import { enemies } from './enemies';
import { equipment } from './equipment';
import { events } from './events';
import { shop } from './shop';

export const contentSource: ContentSource = {
  character,
  cards,
  enemies,
  encounters,
  builds,
  creatureTypes: [...creatureTypes],
  equipment,
  events,
  shop,
};

/** Validated, id-indexed content. Throws at startup if any data is inconsistent. */
export const gameData = buildGameData(contentSource);
