import { useMemo, useState } from 'react';
import { Activity, AudioLines, Clapperboard, Images, LayoutDashboard, Play, Rocket, Sparkles, Wand2 } from 'lucide-react';
import { demoProject, effectPresets } from './data/demoProject.js';
import { estimateBeatGrid, planCutsFromAssets } from './lib/beatPlanner.js';
import { createRenderJob, simulateRenderProgress } from './lib/renderQueue.js';

const tabs = [
  { id: 'editor', label: 'Editor', icon: Wand2 },
  { id: 'projects', label: 'Projects', icon: LayoutDashboard },
  { id: 'roadmap', label: 'Roadmap', icon: Rocket }
];

export function App() {
  const [activeTab, setActiveTab] = useState('editor');
  const [selectedPreset, setSelectedPreset] = useState(effectPresets[0]);
  const [selectedProfile, setSelectedProfile] = useState(demoProject.exportProfiles[0]);
  const [renderJob, setRenderJob] = useState(null);

  const beats = useMemo(() => estimateBeatGrid({
    durationSeconds: demoProject.audio.duration,
    bpm: demoProject.audio.bpm
  }), []);

  const plannedTimeline = useMemo(() => planCutsFromAssets({
    assets: demoProject.assets,
    durationSeconds: demoProject.audio.duration,
    bpm: demoProject.audio.bpm
  }), []);

  function queueRender() {
    setRenderJob(createRenderJob({
      projectId: demoProject.id,
      profile: selectedProfile,
      preset: selectedPreset,
      timeline: plannedTimeline
    }));
  }

  function progressRender() {
    setRenderJob((job) => job ? simulateRenderProgress(job) : job);
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
              <Play size={18} /> Otwórz demo edytora
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
            <strong>{demoProject.title}</strong>
            <span>{demoProject.audio.bpm} BPM · {demoProject.audio.duration}s · {demoProject.assets.length} zdjęcia</span>
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
          selectedPreset={selectedPreset}
          setSelectedPreset={setSelectedPreset}
          selectedProfile={selectedProfile}
          setSelectedProfile={setSelectedProfile}
          beats={beats}
          plannedTimeline={plannedTimeline}
          renderJob={renderJob}
          queueRender={queueRender}
          progressRender={progressRender}
        />
      )}

      {activeTab === 'projects' && <Projects />}
      {activeTab === 'roadmap' && <Roadmap />}
    </main>
  );
}

function Editor({ selectedPreset, setSelectedPreset, selectedProfile, setSelectedProfile, beats, plannedTimeline, renderJob, queueRender, progressRender }) {
  return (
    <section className="workspace-grid">
      <UploadZone />

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
            </div>
          ))}
        </div>
        <div className="beat-row">
          {beats.slice(0, 32).map((beat) => (
            <span key={beat.index} className={beat.strength === 'downbeat' ? 'beat downbeat' : 'beat'} />
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
          {demoProject.exportProfiles.map((profile) => (
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

function UploadZone() {
  return (
    <div className="panel upload-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Upload</p>
          <h2>Zdjęcia + audio</h2>
        </div>
      </div>
      <div className="drop-grid">
        <div className="drop-card">
          <Images size={28} />
          <strong>Wrzuć zdjęcia</strong>
          <span>JPG, PNG, WEBP · auto scoring kadrów</span>
        </div>
        <div className="drop-card">
          <AudioLines size={28} />
          <strong>Wrzuć MP3</strong>
          <span>Analiza BPM, energii i dropów</span>
        </div>
      </div>
      <ul className="asset-list">
        {demoProject.assets.map((asset) => (
          <li key={asset.id}>
            <span>{asset.name}</span>
            <strong>{asset.score}/100</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Projects() {
  return (
    <section className="panel page-panel">
      <p className="eyebrow">Projects hub</p>
      <h2>Panel projektów</h2>
      <div className="project-card">
        <strong>{demoProject.title}</strong>
        <span>Status: {demoProject.status}</span>
        <span>Audio: {demoProject.audio.name}</span>
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
