import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { validateDirectoryBytes } from './validate-directory.mjs';

const source = new URL('../registries.json', import.meta.url);
const output = new URL('../dist/', import.meta.url);
const bytes = await readFile(source);
validateDirectoryBytes(bytes);
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await writeFile(new URL('registries.json', output), bytes);
await writeFile(new URL('_headers', output), [
  '/registries.json',
  '  Content-Type: application/json; charset=utf-8',
  '  Cache-Control: public, max-age=60, must-revalidate',
  '  CDN-Cache-Control: public, max-age=60',
  '  X-Content-Type-Options: nosniff',
  '',
].join('\n'));
