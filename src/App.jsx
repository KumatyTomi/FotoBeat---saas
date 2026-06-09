import { useEffect, useMemo, useState } from 'react';
import { Activity, AudioLines, Camera, Clapperboard, Images, LayoutDashboard, Play, Rocket, Save, Sparkles, Trash2, Wand2 } from 'lucide-react';
import { demoProject, effectPresets } from './data/demoProject.js';
import { createImageAsset, formatBytes } from './lib/assetScoring.js';
import { createAudioAsset } from './lib/audioAnalyzer.js';
import { estimateBeatGrid, planCutsFromAssets } from './lib/beatPlanner.js';
import { clearStoredProject, loadSnapshots, loadStoredProject, saveSnapshot, saveStoredProject } from './lib/projectStorage.js';
import { createRenderJob, simulateRenderProgress } from './lib/renderQueue.js';

const tabs = [
  { id: 'editor', label: 'Editor', icon: Wand2 },
  { id: 'projects', label: 'Projects', icon: LayoutDashboard },
  { id: 'roadmap', label: 'Roadmap', icon: Rocket }
];

function createInitialProject() {
  const storedProject = loadStoredProject();

  return storedProject ?? {
    ...demoProject,
    assets: demoProject.assets.map((asset) => ({ ...asset, source: 'demo' })),
    audio: { ...demoProject.audio, source: 'demo' }
  };
}

export function App() {
  const [activeTab, setActiveTab] = useState('editor');
  const [project, setProject] = useState(createInitialProject);
  const [snapshots, setSnapshots] = useState(loadSnapshots);
  const [selectedPreset, setSelectedPreset] = useState(effectPresets[0]);
  const [selectedProfile, setSelectedProfile] = useState(project.exportProfiles[0]);
  const [renderJob, setRenderJob] = useState(null);

  const audioMeta = project.audio ?? demoProject.audio;

  const beats = useMemo(() => estimateBeatGrid({
    durationSeconds: audioMeta.duration,
    bpm: audioMeta.bpm
  }), [audioMeta.duration, audioMeta.bpm]);

  const plannedTimeline = useMemo(() => planCutsFromAssets({
    assets: project.assets,
    durationSeconds: audioMeta.duration,
    bpm: audioMeta.bpm
  }), [project.assets, audioMeta.duration, audioMeta.bpm]);

  useEffect(() => {
    saveStoredProject(project);
  }, [project]);

  function queueRender() {
    setRenderJob(createRenderJob({
      projectId: project.id,
      profile: selectedProfile,
      preset: selectedPreset,
      timeline: plannedTimeline
    }));
  }

  function progressRender() {
    setRenderJob((job) => job ? simulateRenderProgress(job) : job);
  }

  function handleImagesSelected(files) {
    const imageAssets = [...files]
      .filter((file) => file.type.startsWith('image/'))
      .map((file, index) => createImageAsset(file, index));

    if (!imageAssets.length) return;

    setProject((current) => ({
      ...current,
      status: 'editing',
      assets: [...imageAssets, ...current.assets]
    }));
  }

  async function handleAudioSelected(file) {
    if (!file) return;

    const audio = await createAudioAsset(file);
    setProject((current) => ({
      ...current,
      status: 'editing',
      audio
    }));
  }

  function removeAsset(assetId) {
    setProject((current) => ({
      ...current,
      assets: current.assets.filter((asset) => asset.id !== assetId)
    }));
  }

  function createManualSnapshot() {
    setSnapshots(saveSnapshot(project, `Snapshot — ${project.assets.length} assets`));
  }

  function resetProject() {
    clearStoredProject();
    setProject({
      ...demoProject,
      assets: demoProject.assets.map((asset) => ({ ...asset, source: 'demo' })),
      audio: { ...demoProject.audio, source: 'demo' }
    });
    setRenderJob(null);
  }

  return (
    <main className="app-shell">
      <section className="hero-grid">
        <div className="hero-copy">
          <p className="eyebrow">FotoBeat.me SaaS</p>
          <h1>Generator filmów ze zdjęć i muzyki, który montuje pod beat.</h1>
          <p className="hero-lead">
            Wrzuć paczkę zdjęć i MP3. FotoBeat wybierze kadry, zaplanuje cięcia,
            dobierze efekty i przygotuje eksport 9:16 albo 16:9.
          </p>
          <div className="hero-actions">
            <button className="primary-btn" onClick={() => setActiveTab('editor')}>
              <Play size={18} /> Otwórz edytor MVP
            </button>
            <button className="ghost-btn" onClick={() => setActiveTab('roadmap')}>
              Zobacz plan v1
            </button>
          </div>
        </div>
        <div className="hero-card">
          <div className="orb orb-a" />
          <div className="orb orb-b" />
          <div className="glass-panel">
            <Clapperboard size={34} />
            <strong>{project.title}</strong>
            <span>{audioMeta.bpm} BPM · {audioMeta.duration}s · {project.assets.length} zdjęć</span>
          </div>
        </div>
      </section>

      <nav className="tabbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className={activeTab === tab.id ? 'tab active' : 'tab'}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon size={18} /> {tab.label}
            </button>
          );
        })}
      </nav>

      {activeTab === 'editor' && (
        <Editor
          project={project}
          audioMeta={audioMeta}
          selectedPreset={selectedPreset}
          setSelectedPreset={setSelectedPreset}
          selectedProfile={selectedProfile}
          setSelectedProfile={setSelectedProfile}
          beats={beats}
          plannedTimeline={plannedTimeline}
          renderJob={renderJob}
          queueRender={queueRender}
          progressRender={progressRender}
          handleImagesSelected={handleImagesSelected}
          handleAudioSelected={handleAudioSelected}
          removeAsset={removeAsset}
          createManualSnapshot={createManualSnapshot}
          resetProject={resetProject}
        />
      )}

      {activeTab === 'projects' && <Projects project={project} snapshots={snapshots} />}
      {activeTab === 'roadmap' && <Roadmap />}
    </main>
  );
}

function Editor({ project, audioMeta, selectedPreset, setSelectedPreset, selectedProfile, setSelectedProfile, beats, plannedTimeline, renderJob, queueRender, progressRender, handleImagesSelected, handleAudioSelected, removeAsset, createManualSnapshot, resetProject }) {
  return (
    <section className="workspace-grid">
      <UploadZone
        project={project}
        audioMeta={audioMeta}
        handleImagesSelected={handleImagesSelected}
        handleAudioSelected={handleAudioSelected}
        removeAsset={removeAsset}
        createManualSnapshot={createManualSnapshot}
        resetProject={resetProject}
      />

      <div className="panel timeline-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">AI timeline</p>
            <h2>Automatyczny montaż</h2>
          </div>
          <span className="pill">{beats.length} beatów</span>
        </div>
        <div className="timeline">
          {plannedTimeline.map((clip) => (
            <div key={`${clip.assetId}-${clip.start}`} className="clip" style={{ width: `${Math.max(12, (clip.end - clip.start) * 3)}%` }}>
              <strong>{clip.effect}</strong>
              <span>{clip.start}s — {clip.end}s</span>
              <small>{clip.assetId.slice(0, 10)}</small>
            </div>
          ))}
        </div>
        <div className="beat-row">
          {beats.slice(0, 48).map((beat) => (
            <span key={beat.index} className={beat.strength === 'downbeat' ? 'beat downbeat' : 'beat'} title={`${beat.time}s`} />
          ))}
        </div>
      </div>

      <div className="panel presets-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Presety</p>
            <h2>Styl filmu</h2>
          </div>
          <Sparkles size={22} />
        </div>
        <div className="preset-list">
          {effectPresets.map((preset) => (
            <button
              key={preset.id}
              className={selectedPreset.id === preset.id ? 'preset active' : 'preset'}
              onClick={() => setSelectedPreset(preset)}
            >
              <strong>{preset.name}</strong>
              <span>{preset.description}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="panel render-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Export</p>
            <h2>Kolejka renderowania</h2>
          </div>
          <Activity size={22} />
        </div>
        <div className="profile-grid">
          {project.exportProfiles.map((profile) => (
            <button
              key={profile.id}
              className={selectedProfile.id === profile.id ? 'profile active' : 'profile'}
              onClick={() => setSelectedProfile(profile)}
            >
              <strong>{profile.ratio}</strong>
              <span>{profile.label}</span>
            </button>
          ))}
        </div>
        <button className="primary-btn full" onClick={queueRender}>Dodaj render</button>
        {renderJob && (
          <div className="job-card">
            <div className="job-topline">
              <strong>{renderJob.status}</strong>
              <span>{renderJob.progress}%</span>
            </div>
            <div className="progress"><span style={{ width: `${renderJob.progress}%` }} /></div>
            {renderJob.output ? <p>Gotowe: {renderJob.output}</p> : <button className="ghost-btn full" onClick={progressRender}>Symuluj postęp</button>}
          </div>
        )}
      </div>
    </section>
  );
}

function UploadZone({ project, audioMeta, handleImagesSelected, handleAudioSelected, removeAsset, createManualSnapshot, resetProject }) {
  return (
    <div className="panel upload-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Upload</p>
          <h2>Zdjęcia + audio</h2>
        </div>
      </div>
      <div className="drop-grid">
        <label className="drop-card input-card">
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            multiple
            onChange={(event) => handleImagesSelected(event.target.files)}
          />
          <Images size={28} />
          <strong>Wrzuć zdjęcia</strong>
          <span>JPG, PNG, WEBP · lokalny scoring kadrów</span>
        </label>
        <label className="drop-card input-card">
          <input
            type="file"
            accept="audio/mpeg,audio/mp3,audio/wav,audio/x-wav"
            onChange={(event) => handleAudioSelected(event.target.files?.[0])}
          />
          <AudioLines size={28} />
          <strong>Wrzuć MP3/WAV</strong>
          <span>{audioMeta.name} · {audioMeta.bpm} BPM · {audioMeta.duration}s</span>
        </label>
      </div>

      <div className="toolbar-row">
        <button className="ghost-btn" onClick={createManualSnapshot}><Save size={16} /> Snapshot</button>
        <button className="ghost-btn" onClick={resetProject}><Trash2 size={16} /> Reset</button>
      </div>

      <div className="asset-grid">
        {project.assets.map((asset) => (
          <article className="asset-card" key={asset.id}>
            {asset.previewUrl ? (
              <img src={asset.previewUrl} alt={asset.name} />
            ) : (
              <div className="asset-placeholder"><Camera size={24} /></div>
            )}
            <div>
              <strong>{asset.name}</strong>
              <span>{asset.score}/100 · {asset.source ?? 'asset'} · {formatBytes(asset.size)}</span>
              <small>{asset.tags?.join(' · ')}</small>
            </div>
            <button className="icon-btn" onClick={() => removeAsset(asset.id)} aria-label={`Usuń ${asset.name}`}>
              <Trash2 size={16} />
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}

function Projects({ project, snapshots }) {
  return (
    <section className="panel page-panel">
      <p className="eyebrow">Projects hub</p>
      <h2>Panel projektów</h2>
      <div className="project-card">
        <strong>{project.title}</strong>
        <span>Status: {project.status}</span>
        <span>Audio: {project.audio?.name}</span>
        <span>Assets: {project.assets.length}</span>
      </div>
      <div className="snapshot-list">
        <h3>Snapshoty localStorage</h3>
        {snapshots.length === 0 ? <p className="muted">Brak snapshotów. Utwórz pierwszy w edytorze.</p> : snapshots.map((snapshot) => (
          <div className="snapshot-card" key={snapshot.id}>
            <strong>{snapshot.label}</strong>
            <span>{new Date(snapshot.createdAt).toLocaleString()}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function Roadmap() {
  const items = [
    'Prawdziwy upload plików i walidacja limitów.',
    'Web Audio API: odczyt długości, waveform, BPM i dropów.',
    'AI scoring zdjęć: ostrość, twarz, kompozycja, duplikaty.',
    'Timeline editor: drag, trim, reorder, beat snapping.',
    'Render worker: FFmpeg/WASM lokalnie albo backend queue.',
    'Auth, projekty użytkownika, płatności i limity renderów.'
  ];

  return (
    <section className="panel page-panel">
      <p className="eyebrow">Roadmap v1</p>
      <h2>Najbliższe duże kroki</h2>
      <div className="roadmap-list">
        {items.map((item, index) => (
          <div className="roadmap-item" key={item}>
            <span>{String(index + 1).padStart(2, '0')}</span>
            <p>{item}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
