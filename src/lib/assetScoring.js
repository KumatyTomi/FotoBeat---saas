const IMAGE_TAG_RULES = [
  { test: /club|laser|neon|party|omen|night/i, tag: 'club' },
  { test: /portrait|face|person|girl|boy|people/i, tag: 'portrait' },
  { test: /smoke|fog|haze/i, tag: 'smoke' },
  { test: /wide|room|stage|floor/i, tag: 'wide' },
  { test: /family|kid|child|birthday/i, tag: 'family' }
];

export function createImageAsset(file, index = 0) {
  const score = scoreImageFile(file, index);
  const tags = inferImageTags(file.name);

  return {
    id: createId('img'),
    type: 'image',
    name: file.name,
    size: file.size,
    mimeType: file.type,
    score,
    tags,
    source: 'local',
    previewUrl: URL.createObjectURL(file),
    createdAt: new Date().toISOString()
  };
}

export function scoreImageFile(file, index = 0) {
  const sizeScore = Math.min(28, Math.round(file.size / 120000));
  const nameScore = /hero|best|main|cover|portrait|club|neon/i.test(file.name) ? 18 : 8;
  const typeScore = /webp|png|jpeg|jpg/i.test(file.type) ? 24 : 8;
  const varietyScore = 20 - Math.min(10, index % 10);
  const randomStable = stableNameScore(file.name);

  return Math.max(42, Math.min(98, sizeScore + nameScore + typeScore + varietyScore + randomStable));
}

export function inferImageTags(fileName) {
  const tags = IMAGE_TAG_RULES
    .filter((rule) => rule.test.test(fileName))
    .map((rule) => rule.tag);

  if (!tags.length) tags.push('image');
  if (!tags.includes('motion')) tags.push('motion');

  return [...new Set(tags)];
}

export function formatBytes(bytes = 0) {
  if (!bytes) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB'];
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / Math.pow(1024, exponent);

  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[exponent]}`;
}

function stableNameScore(name) {
  const sum = [...name].reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return sum % 16;
}

function createId(prefix) {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
