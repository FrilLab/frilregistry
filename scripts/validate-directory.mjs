import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

const maxBytes = 1024 * 1024;
const maxEntries = 256;
const reserved = new Map([
  ['frilcraft', 'frilcraft'],
  ['frilassets', 'frilassets'],
  ['frilremotion', 'frilremotion'],
  ['frilstudio', 'frilstudio'],
]);
const entryKeys = [
  'description', 'displayName', 'id', 'manifestSha256', 'publisher', 'registryUrl',
  'repository', 'review', 'reviewedRevision', 'status', 'tier',
];
const reviewKeys = ['notes', 'reviewedAt', 'reviewer'];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}
function exactKeys(object, expected, label) {
  assert(object && typeof object === 'object' && !Array.isArray(object), `${label} must be an object`);
  assert(Object.keys(object).sort().join('\0') === [...expected].sort().join('\0'), `${label} has unknown or missing fields`);
}
function cleanText(value, max, label) {
  assert(typeof value === 'string' && Buffer.byteLength(value, 'utf8') > 0 && Buffer.byteLength(value, 'utf8') <= max, `${label} length is invalid`);
  assert(!/[\u0000-\u001f\u007f]/u.test(value) && value.trim() === value, `${label} contains unsafe whitespace or controls`);
}
function githubRepo(value) {
  assert(typeof value === 'string' && value.startsWith('https://github.com/'), 'repository must use canonical GitHub HTTPS');
  const url = new URL(value);
  assert(url.protocol === 'https:' && url.hostname === 'github.com' && !url.port && !url.username && !url.password && !url.search && !url.hash, 'repository URL is unsafe');
  const parts = url.pathname.split('/').slice(1);
  assert(parts.length === 2 && parts.every(part => /^[A-Za-z0-9._-]+$/u.test(part)), 'repository must identify one canonical owner/repository');
  return parts;
}
function validateUrl(value, owner, repo, revision) {
  assert(typeof value === 'string' && value.startsWith('https://raw.githubusercontent.com/'), 'registryUrl origin is not approved');
  assert(!value.includes('%') && !value.includes('\\') && Buffer.byteLength(value, 'utf8') <= 2048, 'registryUrl uses unsafe encoding or exceeds limit');
  const url = new URL(value);
  assert(url.protocol === 'https:' && url.hostname === 'raw.githubusercontent.com' && !url.port && !url.username && !url.password && !url.search && !url.hash, 'registryUrl must use approved origin without suffix');
  const parts = url.pathname.split('/').slice(1);
  assert(parts.length >= 4 && parts[0] === owner && parts[1] === repo && parts[2] === revision, 'registryUrl must match reviewed repository and immutable revision');
  assert(parts.every(part => part && part !== '.' && part !== '..' && /^[A-Za-z0-9._@-]+$/u.test(part)), 'registryUrl path is unsafe');
}
function validUtc(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/u.test(value)) return false;
  const date = new Date(value);
  return Number.isFinite(date.valueOf()) && date.toISOString().startsWith(value.slice(0, 19));
}
function validateDirectory(value) {
  exactKeys(value, ['schemaVersion', 'registries'], 'directory');
  assert(value.schemaVersion === 1 && Array.isArray(value.registries) && value.registries.length <= maxEntries, 'directory version or entry count is invalid');
  const ids = new Set();
  const urls = new Set();
  const repos = new Set();
  for (const entry of value.registries) {
    exactKeys(entry, entryKeys, 'entry');
    assert(typeof entry.id === 'string' && /^[a-z][a-z0-9-]{0,62}$/u.test(entry.id), 'registry ID is invalid');
    cleanText(entry.displayName, 128, 'displayName');
    cleanText(entry.description, 512, 'description');
    cleanText(entry.publisher, 128, 'publisher');
    assert(['official', 'community'].includes(entry.tier), 'tier is invalid');
    assert(['active', 'deprecated', 'suspended'].includes(entry.status), 'status is invalid');
    assert(/^(?:[a-f0-9]{40}|[a-f0-9]{64})$/u.test(entry.reviewedRevision), 'reviewedRevision is invalid');
    assert(/^[a-f0-9]{64}$/u.test(entry.manifestSha256), 'manifestSha256 is invalid');
    exactKeys(entry.review, reviewKeys, 'review');
    assert(validUtc(entry.review.reviewedAt), 'review timestamp must be RFC3339 UTC');
    cleanText(entry.review.reviewer, 128, 'reviewer');
    cleanText(entry.review.notes, 1024, 'review notes');
    const [owner, repo] = githubRepo(entry.repository);
    assert(entry.publisher === `github:${owner}`, 'publisher does not match repository owner');
    validateUrl(entry.registryUrl, owner, repo, entry.reviewedRevision);
    if (entry.tier === 'official') {
      assert(reserved.get(entry.id) === repo && owner === 'FrilLab', 'official entry does not match reserved FrilLab identity');
    } else {
      assert(!reserved.has(entry.id) && owner !== 'FrilLab', 'community entry claims reserved or official identity');
    }
    assert(!ids.has(entry.id), `duplicate registry ID: ${entry.id}`);
    assert(!urls.has(entry.registryUrl), `duplicate registry URL: ${entry.registryUrl}`);
    const repoKey = entry.repository.toLowerCase();
    assert(!repos.has(repoKey), `duplicate repository: ${entry.repository}`);
    ids.add(entry.id); urls.add(entry.registryUrl); repos.add(repoKey);
  }
  const sorted = [...value.registries].sort((a, b) => a.id.localeCompare(b.id));
  assert(sorted.every((entry, i) => entry.id === value.registries[i].id), 'entries must be sorted by ID');
}

async function validateFile() {
  const bytes = await readFile(new URL('../registries.json', import.meta.url));
  assert(bytes.byteLength <= maxBytes, 'registries.json exceeds the byte limit');
  validateDirectory(JSON.parse(bytes.toString('utf8')));
  const schema = JSON.parse(await readFile(new URL('../schema.json', import.meta.url), 'utf8'));
  assert(schema.$schema === 'https://json-schema.org/draft/2020-12/schema' && schema.properties.schemaVersion.const === 1, 'schema.json is not the expected directory schema');
}

function sample(overrides = {}) {
  const revision = '0123456789abcdef0123456789abcdef01234567';
  return {
    schemaVersion: 1,
    registries: [{
      id: 'frilcraft', displayName: 'FrilCraft', description: 'Reviewed public components',
      registryUrl: `https://raw.githubusercontent.com/FrilLab/frilcraft/${revision}/registry.json`,
      repository: 'https://github.com/FrilLab/frilcraft', publisher: 'github:FrilLab',
      tier: 'official', status: 'active', reviewedRevision: revision, manifestSha256: 'a'.repeat(64),
      review: { reviewedAt: '2026-11-27T00:00:00Z', reviewer: 'maintainer', notes: 'Review scope recorded' },
      ...overrides,
    }],
  };
}
function selfTest() {
  validateDirectory({ schemaVersion: 1, registries: [] });
  validateDirectory(sample());
  for (const invalid of [
    { ...sample(), arbitraryUrl: 'http://127.0.0.1/' },
    sample({ tier: 'community' }),
    sample({ registryUrl: 'https://raw.githubusercontent.com/other/repo/main/registry.json' }),
    sample({ registryUrl: 'https://raw.githubusercontent.com/FrilLab/frilcraft/0123456789abcdef0123456789abcdef01234567/%2e%2e/secret' }),
    sample({ review: { reviewedAt: '2026-02-29T00:00:00Z', reviewer: 'maintainer', notes: 'x' } }),
  ]) {
    let rejected = false;
    try { validateDirectory(invalid); } catch { rejected = true; }
    assert(rejected, 'self-test accepted an unsafe fixture');
  }
  const duplicate = sample(); duplicate.registries.push({ ...duplicate.registries[0] });
  let rejected = false;
  try { validateDirectory(duplicate); } catch { rejected = true; }
  assert(rejected, 'self-test accepted duplicate IDs');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (process.argv.includes('--self-test')) selfTest();
  await validateFile();
  process.stdout.write('Static directory validation passed. This is not provider approval.\n');
}
