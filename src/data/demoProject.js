export const demoProject = {
  id: 'demo-club-recap-001',
  title: 'Club Recap — Neon Pulse',
  owner: 'FotoBeat.me',
  status: 'draft',
  audio: {
    name: 'omen-night-pulse.mp3',
    duration: 45,
    bpm: 128,
    energy: 'high'
  },
  exportProfiles: [
    { id: 'reels', label: 'Reels / TikTok', ratio: '9:16', width: 1080, height: 1920 },
    { id: 'youtube', label: 'YouTube / TV', ratio: '16:9', width: 1920, height: 1080 },
    { id: 'square', label: 'Feed square', ratio: '1:1', width: 1080, height: 1080 }
  ],
  assets: [
    { id: 'img-001', type: 'image', name: 'entry-light.jpg', score: 92, tags: ['neon', 'people', 'motion'] },
    { id: 'img-002', type: 'image', name: 'laser-floor.jpg', score: 88, tags: ['club', 'laser', 'wide'] },
    { id: 'img-003', type: 'image', name: 'portrait-smoke.jpg', score: 95, tags: ['portrait', 'smoke', 'hero'] },
    { id: 'img-004', type: 'image', name: 'crowd-drop.jpg', score: 84, tags: ['crowd', 'drop', 'energy'] }
  ],
  timeline: [
    { start: 0, end: 4, assetId: 'img-001', effect: 'spiral-zoom', intensity: 0.8 },
    { start: 4, end: 8, assetId: 'img-002', effect: 'smoke-cut', intensity: 0.7 },
    { start: 8, end: 12, assetId: 'img-003', effect: 'neon-parallax', intensity: 0.9 },
    { start: 12, end: 16, assetId: 'img-004', effect: 'beat-shake', intensity: 0.65 }
  ]
};

export const effectPresets = [
  {
    id: 'neon-pulse',
    name: 'Neon Pulse',
    description: 'Szybki klubowy montaż: zoom, laser, glitch, dym.'
  },
  {
    id: 'dark-loft',
    name: 'Dark Loft Gold',
    description: 'Ciemny loft, złoto, ambient LED, wolniejsze przejścia.'
  },
  {
    id: 'cyber-bloom',
    name: 'Cyber Bloom',
    description: 'Kwiaty, cyberpunk, cząsteczki i płynne przejścia.'
  },
  {
    id: 'family-story',
    name: 'Family Story',
    description: 'Miękki, emocjonalny storytelling ze zdjęć rodzinnych.'
  }
];
