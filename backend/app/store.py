import json
import os
from datetime import datetime
from pathlib import Path
from threading import RLock

from .schemas import Asset, Project, ProjectCreate, ProjectStatus, RenderJob, RenderStatus


class JsonBackedStore:
    def __init__(self, store_path: str | os.PathLike[str] | None = None) -> None:
        self.path = Path(store_path or os.getenv('FOTOBEAT_STORE_PATH', 'mock-storage/store.json'))
        self.lock = RLock()
        self.projects: dict[str, Project] = {}
        self.assets: dict[str, Asset] = {}
        self.render_jobs: dict[str, RenderJob] = {}
        self._load()

    def create_project(self, payload: ProjectCreate) -> Project:
        with self.lock:
            project = Project(title=payload.title, preset_id=payload.preset_id)
            self.projects[project.id] = project
            self._save()
            return project

    def list_projects(self) -> list[Project]:
        with self.lock:
            return sorted(self.projects.values(), key=lambda project: project.created_at, reverse=True)

    def get_project(self, project_id: str) -> Project | None:
        with self.lock:
            return self.projects.get(project_id)

    def touch_project(self, project_id: str, status: ProjectStatus | None = None) -> Project | None:
        project = self.projects.get(project_id)
        if not project:
            return None
        if status:
            project.status = status
        project.updated_at = datetime.utcnow()
        self.projects[project_id] = project
        return project

    def add_asset(self, asset: Asset) -> Asset:
        with self.lock:
            self.assets[asset.id] = asset
            self.touch_project(asset.project_id, ProjectStatus.EDITING)
            self._save()
            return asset

    def list_assets(self, project_id: str) -> list[Asset]:
        with self.lock:
            return [asset for asset in self.assets.values() if asset.project_id == project_id]

    def add_render_job(self, job: RenderJob) -> RenderJob:
        with self.lock:
            self.render_jobs[job.id] = job
            self.touch_project(job.project_id, ProjectStatus.RENDERING)
            self._save()
            return job

    def list_render_jobs(self, project_id: str) -> list[RenderJob]:
        with self.lock:
            return sorted([job for job in self.render_jobs.values() if job.project_id == project_id], key=lambda job: job.created_at, reverse=True)

    def get_render_job(self, render_id: str) -> RenderJob | None:
        with self.lock:
            return self.render_jobs.get(render_id)

    def advance_render_job(self, render_id: str, step: int = 25) -> RenderJob | None:
        with self.lock:
            job = self.render_jobs.get(render_id)
            if not job:
                return None
            if job.status in {RenderStatus.DONE, RenderStatus.FAILED}:
                return job
            job.progress = min(100, job.progress + step)
            job.status = RenderStatus.DONE if job.progress >= 100 else RenderStatus.RENDERING
            job.logs.append(self._render_log(job.progress, job.status))
            job.updated_at = datetime.utcnow()
            if job.status == RenderStatus.DONE:
                job.output_url = f'/mock-storage/renders/{job.id}.mp4'
                self.touch_project(job.project_id, ProjectStatus.DONE)
            self.render_jobs[render_id] = job
            self._save()
            return job

    def _load(self) -> None:
        if not self.path.exists():
            return
        try:
            raw = json.loads(self.path.read_text(encoding='utf8'))
        except (OSError, json.JSONDecodeError):
            return
        self.projects = self._load_items(raw.get('projects', {}), Project)
        self.assets = self._load_items(raw.get('assets', {}), Asset)
        self.render_jobs = self._load_items(raw.get('render_jobs', {}), RenderJob)

    def _save(self) -> None:
        self.path.parent.mkdir(parents=True, exist_ok=True)
        payload = {
            'schemaVersion': 'fotobeat.mock-store.v1',
            'updatedAt': datetime.utcnow().isoformat(),
            'projects': self._dump_items(self.projects),
            'assets': self._dump_items(self.assets),
            'render_jobs': self._dump_items(self.render_jobs),
        }
        temp_path = self.path.with_name(f'{self.path.name}.tmp')
        temp_path.write_text(json.dumps(payload, indent=2, ensure_ascii=False), encoding='utf8')
        temp_path.replace(self.path)

    @staticmethod
    def _dump_items(items):
        return {key: value.model_dump(mode='json') for key, value in items.items()}

    @staticmethod
    def _load_items(items, model):
        loaded = {}
        for key, value in items.items():
            try:
                loaded[key] = model.model_validate(value)
            except ValueError:
                continue
        return loaded

    @staticmethod
    def _render_log(progress: int, status: RenderStatus) -> str:
        if status == RenderStatus.DONE:
            return 'Render complete and output URL attached'
        if progress < 30:
            return 'Resolving assets and validating manifest'
        if progress < 60:
            return 'Compositing timeline layers'
        return 'Encoding MP4 mock output'


store = JsonBackedStore()
