from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from .schemas import Asset, Project, ProjectCreate, RenderJob, RenderJobCreate
from .storage import infer_asset_type, save_upload
from .store import store

app = FastAPI(title='FotoBeat API', version='0.1.0')

app.add_middleware(
    CORSMiddleware,
    allow_origins=['http://localhost:5173', 'http://127.0.0.1:5173'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)


@app.get('/health')
def health() -> dict[str, str]:
    return {'status': 'ok', 'service': 'fotobeat-api'}


@app.post('/api/projects', response_model=Project)
def create_project(payload: ProjectCreate) -> Project:
    return store.create_project(payload)


@app.get('/api/projects', response_model=list[Project])
def list_projects() -> list[Project]:
    return store.list_projects()


@app.get('/api/projects/{project_id}', response_model=Project)
def get_project(project_id: str) -> Project:
    project = store.get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail='Project not found')
    return project


@app.post('/api/projects/{project_id}/assets', response_model=Asset)
async def upload_asset(project_id: str, file: UploadFile = File(...)) -> Asset:
    if not store.get_project(project_id):
        raise HTTPException(status_code=404, detail='Project not found')

    asset_type = infer_asset_type(file.content_type or '')
    if asset_type == 'unknown':
        raise HTTPException(status_code=400, detail='Unsupported asset content type')

    storage_url, size = await save_upload(project_id, file)
    asset = Asset(
        project_id=project_id,
        type=asset_type,
        filename=file.filename or 'upload.bin',
        content_type=file.content_type or 'application/octet-stream',
        size_bytes=size,
        storage_url=storage_url,
    )
    return store.add_asset(asset)


@app.get('/api/projects/{project_id}/assets', response_model=list[Asset])
def list_assets(project_id: str) -> list[Asset]:
    if not store.get_project(project_id):
        raise HTTPException(status_code=404, detail='Project not found')
    return store.list_assets(project_id)


@app.post('/api/projects/{project_id}/renders', response_model=RenderJob)
def create_render_job(project_id: str, payload: RenderJobCreate) -> RenderJob:
    if not store.get_project(project_id):
        raise HTTPException(status_code=404, detail='Project not found')

    job = RenderJob(
        project_id=project_id,
        manifest=payload.manifest,
        logs=['Render job accepted by API'],
    )
    return store.add_render_job(job)


@app.get('/api/projects/{project_id}/renders', response_model=list[RenderJob])
def list_project_render_jobs(project_id: str) -> list[RenderJob]:
    if not store.get_project(project_id):
        raise HTTPException(status_code=404, detail='Project not found')
    return store.list_render_jobs(project_id)


@app.get('/api/renders/{render_id}', response_model=RenderJob)
def get_render_job(render_id: str) -> RenderJob:
    job = store.get_render_job(render_id)
    if not job:
        raise HTTPException(status_code=404, detail='Render job not found')
    return job


@app.post('/api/renders/{render_id}/advance', response_model=RenderJob)
def advance_render_job(render_id: str) -> RenderJob:
    job = store.advance_render_job(render_id)
    if not job:
        raise HTTPException(status_code=404, detail='Render job not found')
    return job
