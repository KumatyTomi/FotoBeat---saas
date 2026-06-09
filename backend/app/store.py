from datetime import datetime

from .schemas import Asset, Project, ProjectCreate, ProjectStatus, RenderJob, RenderStatus


class InMemoryStore:
    def __init__(self) -> None:
        self.projects: dict[str, Project] = {}
        self.assets: dict[str, Asset] = {}
        self.render_jobs: dict[str, RenderJob] = {}

    def create_project(self, payload: ProjectCreate) -> Project:
        project = Project(title=payload.title, preset_id=payload.preset_id)
        self.projects[project.id] = project
        return project

    def list_projects(self) -> list[Project]:
        return sorted(self.projects.values(), key=lambda project: project.created_at, reverse=True)

    def get_project(self, project_id: str) -> Project | None:
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
        self.assets[asset.id] = asset
        self.touch_project(asset.project_id, ProjectStatus.EDITING)
        return asset

    def list_assets(self, project_id: str) -> list[Asset]:
        return [asset for asset in self.assets.values() if asset.project_id == project_id]

    def add_render_job(self, job: RenderJob) -> RenderJob:
        self.render_jobs[job.id] = job
        self.touch_project(job.project_id, ProjectStatus.RENDERING)
        return job

    def get_render_job(self, render_id: str) -> RenderJob | None:
        return self.render_jobs.get(render_id)

    def advance_render_job(self, render_id: str, step: int = 25) -> RenderJob | None:
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
        return job

    @staticmethod
    def _render_log(progress: int, status: RenderStatus) -> str:
        if status == RenderStatus.DONE:
            return 'Render complete and output URL attached'
        if progress < 30:
            return 'Resolving assets and validating manifest'
        if progress < 60:
            return 'Compositing timeline layers'
        return 'Encoding MP4 mock output'


store = InMemoryStore()
