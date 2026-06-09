import { useEffect, useMemo, useState } from 'react';
import { Activity, AlertTriangle, AudioLines, Camera, CheckCircle2, Clapperboard, Cloud, Download, Images, LayoutDashboard, Pause, Play, Rocket, Save, Server, Sparkles, Trash2, Wand2 } from 'lucide-react';
import { demoProject, effectPresets } from './data/demoProject.js';
import { apiClient } from './lib/apiClient.js';
import { createImageAsset, formatBytes } from './lib/assetScoring.js';
import { createAudioAsset } from './lib/audioAnalyzer.js';
import { estimateBeatGrid, planCutsFromAssets } from './lib/beatPlanner.js';
import { getClipAtTime, getPlaybackDuration, getPlaybackProgress, advancePreviewTime } from './lib/previewPlayback.js';
import { clearStoredProject, loadSnapshots, loadStoredProject, saveSnapshot, saveStoredProject } from './lib/projectStorage.js';
import { createRenderManifest, downloadManifest } from './lib/renderManifest.js';
import { createRenderJob, simulateRenderProgress } from './lib/renderQueue.js';
import { validateAudioFile, validateImageFiles } from './lib/uploadValidation.js';

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
  const [uploadErrors, setUploadErrors] = useState([]);
  const [previewTime, setPreviewTime] = useState(0);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const [backendStatus, setBackendStatus] = useState({ state: 'idle', label: 'Nie sprawdzono API' });
  const [remoteProject, setRemoteProject] = useState(null);
  const [remoteRenderJob, setRemoteRenderJob] = useState(null);
  const [apiError, setApiError] = useState(null);

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

  const playbackDuration = useMemo(() => getPlaybackDuration(plannedTimeline, audioMeta.duration), [plannedTimeline, audioMeta.duration]);
  const activeClip = useMemo(() => getClipAtTime(plannedTimeline, previewTime), [plannedTimeline, previewTime]);
  const activeAsset = useMemo(() => project.assets.find((asset) => asset.id === activeClip?.assetId), [project.assets, activeClip]);

  const renderManifest = useMemo(() => createRenderManifest({
    project,
    audio: audioMeta,
    preset: selectedPreset,
    profile: selectedProfile,
    timeline: plannedTimeline
  }), [project, audioMeta, selectedPreset, selectedProfile, plannedTimeline]);

  useEffect(() => {
    saveStoredProject(project);
  }, [project]);

  useEffect(() => {
    if (!isPreviewPlaying) return undefined;

    const interval = window.setInterval(() => {
      setPreviewTime((currentTime) => advancePreviewTime({
        currentTime,
        timeline: plannedTimeline,
        fallbackDuration: audioMeta.duration,
        delta: 0.5
      }));
    }, 500);

    return () => window.clearInterval(interval);
  }, [isPreviewPlaying, plannedTimeline, audioMeta.duration]);

  async function checkBackend() {
    setApiError(null);
    setBackendStatus({ state: 'loading', label: 'Sprawdzam API...' });

    try {
      const health = await apiClient.health();
      setBackendStatus({ state: 'online', label: `${health.service}: ${health.status}` });
    } catch (error) {
      setBackendStatus({ state: 'offline', label: 'API offline' });
      setApiError(error.message);
    }
  }

  async function syncProjectToBackend() {
    setApiError(null);
    setBackendStatus({ state: 'loading', label: 'Tworzę projekt w API...' });

    try {
      const createdProject = await apiClient.createProject({
        title: project.title,
        preset_id: selectedPreset.id
      });
      setRemoteProject(createdProject);
      setBackendStatus({ state: 'online', label: `Projekt API: ${createdProject.id.slice(0, 18)}...` });
    } catch (error) {
      setBackendStatus({ state: 'offline', label: 'Błąd sync projektu' });
      setApiError(error.message);
    }
  }

  async function createBackendRenderJob() {
    if (!remoteProject) {
      setApiError('Najpierw utwórz projekt w backendzie.');
      return;
    }

    setApiError(null);
    setBackendStatus({ state: 'loading', label: 'Wysyłam manifest renderu...' });

    try {
      const createdRenderJob = await apiClient.createRenderJob(remoteProject.id, {
        ...renderManifest,
        project: {
          ...renderManifest.project,
          id: remoteProject.id,
          title: remoteProject.title
        }
      });
      setRemoteRenderJob(createdRenderJob);
      setBackendStatus({ state: 'online', label: `Render API: ${createdRenderJob.status}` });
    } catch (error) {
      setBackendStatus({ state: 'offline', label: 'Błąd render joba' });
      setApiError(error.message);
    }
  }

  async function advanceBackendRenderJob() {
    if (!remoteRenderJob) return;

    setApiError(null);

    try {
      const advancedJob = await apiClient.advanceRenderJob(remoteRenderJob.id);
      setRemoteRenderJob(advancedJob);
      setBackendStatus({ state: 'online', label: `Render API: ${advancedJob.status} ${advancedJob.progress}%` });
    } catch (error) {
      setBackendStatus({ state: 'offline', label: 'Błąd postępu renderu' });
      setApiError(error.message);
    }
  }

  function queueRender() {
    setRenderJob(createRenderJob({
      projectId: project.id,
      profile: selectedProfile,
      preset: selectedPreset,
      timeline: plannedTimeline,
      manifest: renderManifest
    }));
  }

  function progressRender() {
    setRenderJob((job) => job ? simulateRenderProgress(job) : job);
  }

  function handleImagesSelected(files) {
    const { accepted, errors } = validateImageFiles(files, project.assets.length);
    setUploadErrors(errors);

    const imageAssets = accepted.map((file, index) => createImageAsset(file, index));

    if (!imageAssets.length) return;

    setProject((current) => ({
      ...current,
      status: 'editing',
      assets: [...imageAssets, ...current.assets]
    }));
  }

  async function handleAudioSelected(file) {
    const { accepted, errors } = validateAudioFile(file);
    setUploadErrors(errors);

    if (!accepted) return;

    const audio = await createAudioAsset(accepted);
    setProject((current) => ({
      ...current,
      status: 'editing',
      audio
    }));
    setPreviewTime(0);
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
    setUploadErrors([]);
    setPreviewTime(0);
    setIsPreviewPlaying(false);
    setRemoteProject(null);
    setRemoteRenderJob(null);
  }

  function togglePreview() {
    setIsPreviewPlaying((current) => !current);
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
          renderManifest={renderManifest}
          queueRender={queueRender}
          progressRender={progressRender}
          handleImagesSelected={handleImagesSelected}
          handleAudioSelected={handleAudioSelected}
          removeAsset={removeAsset}
          createManualSnapshot={createManualSnapshot}
          resetProject={resetProject}
          uploadErrors={uploadErrors}
          previewTime={previewTime}
          playbackDuration={playbackDuration}
          activeAsset={activeAsset}
          activeClip={activeClip}
          isPreviewPlaying={isPreviewPlaying}
          togglePreview={togglePreview}
          backendStatus={backendStatus}
          remoteProject={remoteProject}
          remoteRenderJob={remoteRenderJob}
          apiError={apiError}
          checkBackend={checkBackend}
          syncProjectToBackend={syncProjectToBackend}
          createBackendRenderJob={createBackendRenderJob}
          advanceBackendRenderJob={advanceBackendRenderJob}
        />
      )}

      {activeTab === 'projects' && <Projects project={project} snapshots={snapshots} remoteProject={remoteProject} remoteRenderJob={remoteRenderJob} />}
      {activeTab === 'roadmap' && <Roadmap />}
    </main>
  );
}

function Editor({ project, audioMeta, selectedPreset, setSelectedPreset, selectedProfile, setSelectedProfile, beats, plannedTimeline, renderJob, renderManifest, queueRender, progressRender, handleImagesSelected, handleAudioSelected, removeAsset, createManualSnapshot, resetProject, uploadErrors, previewTime, playbackDuration, activeAsset, activeClip, isPreviewPlaying, togglePreview, backendStatus, remoteProject, remoteRenderJob, apiError, checkBackend, syncProjectToBackend, createBackendRenderJob, advanceBackendRenderJob }) {
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
        uploadErrors={uploadErrors}
      />

      <div className="panel timeline-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">AI timeline</p>
            <h2>Automatyczny montaż</h2>
          </div>
          <span className="pill">{beats.length} beatów</span>
        </div>
        <PreviewPlayer
          activeAsset={activeAsset}
          activeClip={activeClip}
          selectedPreset={selectedPreset}
          previewTime={previewTime}
          playbackDuration={playbackDuration}
          isPreviewPlaying={isPreviewPlaying}
          togglePreview={togglePreview}
        />
        <WaveformPreview audioMeta={audioMeta} beats={beats} />
        <div className="timeline">
          {plannedTimeline.map((clip) => (
            <div key={`${clip.assetId}-${clip.start}`} className={activeClip === clip ? 'clip active' : 'clip'} style={{ width: `${Math.max(12, (clip.end - clip.start) * 3)}%` }}>
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
        <BackendPanel
          backendStatus={backendStatus}
          remoteProject={remoteProject}
          remoteRenderJob={remoteRenderJob}
          apiError={apiError}
          checkBackend={checkBackend}
          syncProjectToBackend={syncProjectToBackend}
          createBackendRenderJob={createBackendRenderJob}
          advanceBackendRenderJob={advanceBackendRenderJob}
        />
        <div className="manifest-card">
          <strong>Render manifest</strong>
          <span>{renderManifest.timeline.length} klipów · {renderManifest.output.width}×{renderManifest.output.height} · {renderManifest.output.fps} FPS</span>
          <button className="ghost-btn full" onClick={() => downloadManifest(renderManifest)}>
            <Download size={16} /> Pobierz manifest JSON
          </button>
        </div>
        <button className="primary-btn full" onClick={queueRender}>Dodaj render lokalny</button>
        {renderJob && (
          <div className="job-card">
            <div className="job-topline">
              <strong>{renderJob.status}</strong>
              <span>{renderJob.progress}%</span>
            </div>
            <div className="progress"><span style={{ width: `${renderJob.progress}%` }} /></div>
            <p>{renderJob.manifest?.output.width}×{renderJob.manifest?.output.height} · {renderJob.manifest?.timeline.length} klipów</p>
            {renderJob.output ? <p>Gotowe: {renderJob.output}</p> : <button className="ghost-btn full" onClick={progressRender}>Symuluj postęp</button>}
            <RenderLogs logs={renderJob.logs} />
          </div>
        )}
      </div>
    </section>
  );
}

function BackendPanel({ backendStatus, remoteProject, remoteRenderJob, apiError, checkBackend, syncProjectToBackend, createBackendRenderJob, advanceBackendRenderJob }) {
  const StatusIcon = backendStatus.state === 'online' ? CheckCircle2 : backendStatus.state === 'loading' ? Cloud : Server;

  return (
    <div className="backend-card">
      <div className="backend-topline">
        <div>
          <p className="eyebrow">Backend Sync</p>
          <strong>FastAPI · {apiClient.baseUrl}</strong>
        </div>
        <span className={`backend-status ${backendStatus.state}`}><StatusIcon size={15} /> {backendStatus.label}</span>
      </div>
      <div className="backend-actions">
        <button className="ghost-btn" onClick={checkBackend}>Sprawdź API</button>
        <button className="ghost-btn" onClick={syncProjectToBackend}>Utwórz projekt API</button>
        <button className="ghost-btn" onClick={createBackendRenderJob}>Wyślij render API</button>
        <button className="ghost-btn" onClick={advanceBackendRenderJob} disabled={!remoteRenderJob}>Advance API render</button>
      </div>
      {remoteProject && <p>Projekt API: <code>{remoteProject.id}</code></p>}
      {remoteRenderJob && (
        <div className="remote-job">
          <div className="job-topline">
            <strong>{remoteRenderJob.status}</strong>
            <span>{remoteRenderJob.progress}%</span>
          </div>
          <div className="progress"><span style={{ width: `${remoteRenderJob.progress}%` }} /></div>
          {remoteRenderJob.output_url && <p>Output: {remoteRenderJob.output_url}</p>}
          <RenderLogs logs={remoteRenderJob.logs} />
        </div>
      )}
      {apiError && <p className="api-error"><AlertTriangle size={15} /> {apiError}</p>}
    </div>
  );
}

function PreviewPlayer({ activeAsset, activeClip, selectedPreset, previewTime, playbackDuration, isPreviewPlaying, togglePreview }) {
  const progress = getPlaybackProgress(previewTime, playbackDuration);

  return (
    <div className="preview-card">
      <div className="preview-stage">
        {activeAsset?.previewUrl ? (
          <img src={activeAsset.previewUrl} alt={activeAsset.name} />
        ) : (
          <div className="preview-placeholder"><Camera size={36} /></div>
        )}
        <div className="preview-overlay">
          <span>{selectedPreset.name}</span>
          <strong>{activeClip?.effect ?? 'waiting-for-timeline'}</strong>
        </div>
      </div>
      <div className="preview-controls">
        <button className="primary-btn" onClick={togglePreview}>
          {isPreviewPlaying ? <Pause size={16} /> : <Play size={16} />}
          {isPreviewPlaying ? 'Pauza' : 'Preview'}
        </button>
        <div className="preview-progress">
          <span style={{ width: `${progress}%` }} />
        </div>
        <small>{previewTime.toFixed(1)}s / {playbackDuration.toFixed(1)}s</small>
      </div>
    </div>
  );
}

function WaveformPreview({ audioMeta, beats }) {
  const peaks = audioMeta.waveform ?? [];

  return (
    <div className="waveform-card">
      <div className="waveform-meta">
        <strong>{audioMeta.name}</strong>
        <span>{audioMeta.bpm} BPM · {audioMeta.duration}s · {audioMeta.energy}</span>
      </div>
      <div className="waveform-bars" aria-label="Audio waveform preview">
        {(peaks.length ? peaks : Array.from({ length: 96 }, () => 0.18)).map((peak, index) => (
          <span
            key={`${index}-${peak}`}
            className={beats[index]?.strength === 'downbeat' ? 'wave-bar downbeat' : 'wave-bar'}
            style={{ height: `${Math.max(8, peak * 74)}px` }}
          />
        ))}
      </div>
    </div>
  );
}

function UploadZone({ project, audioMeta, handleImagesSelected, handleAudioSelected, removeAsset, createManualSnapshot, resetProject, uploadErrors }) {
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

      {uploadErrors.length > 0 && (
        <div className="error-list">
          {uploadErrors.map((error) => (
            <p key={error}><AlertTriangle size={15} /> {error}</p>
          ))}
        </div>
      )}

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

function RenderLogs({ logs = [] }) {
  if (!logs.length) return null;

  return (
    <div className="render-logs">
      {logs.slice(-5).map((log, index) => (
        <code key={`${log}-${index}`}>{log}</code>
      ))}
    </div>
  );
}

function Projects({ project, snapshots, remoteProject, remoteRenderJob }) {
  return (
    <section className="panel page-panel">
      <p className="eyebrow">Projects hub</p>
      <h2>Panel projektów</h2>
      <div className="project-card">
        <strong>{project.title}</strong>
        <span>Status lokalny: {project.status}</span>
        <span>Audio: {project.audio?.name}</span>
        <span>Assets: {project.assets.length}</span>
      </div>
      {remoteProject && (
        <div className="project-card">
          <strong>Backend project</strong>
          <span>ID: {remoteProject.id}</span>
          <span>Status API: {remoteProject.status}</span>
        </div>
      )}
      {remoteRenderJob && (
        <div className="project-card">
          <strong>Backend render</strong>
          <span>ID: {remoteRenderJob.id}</span>
          <span>Status: {remoteRenderJob.status} · {remoteRenderJob.progress}%</span>
        </div>
      )}
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
