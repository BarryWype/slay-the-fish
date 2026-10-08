import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const ENGINE_DIR = fileURLToPath(new URL('../src/engine', import.meta.url));

describe('engine architecture', () => {
  const files = readdirSync(ENGINE_DIR).filter((f) => f.endsWith('.ts'));

  it.each(files)('%s only imports from inside the engine', (file) => {
    const source = readFileSync(join(ENGINE_DIR, file), 'utf8');
    // Only real import/export statements (a statement can span lines, but never a `;`).
    const imports = [...source.matchAll(/^(?:import|export)\b[^;]*?\bfrom\s+['"]([^'"]+)['"]/gm)].map((m) => m[1]);    for (const path of imports) expect(path, `${file} imports "${path}"`).toMatch(/^\.\/[\w-]+$/);
  });

  it.each(files)('%s has no DOM access or unseeded randomness', (file) => {
    const source = readFileSync(join(ENGINE_DIR, file), 'utf8');
    expect(source).not.toMatch(/\b(window|document|localStorage)\b|Math\.random|Date\.now/);
  });
});
