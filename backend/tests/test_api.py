from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_healthcheck():
    response = client.get('/health')
    assert response.status_code == 200
    assert response.json()['status'] == 'ok'


def test_project_asset_and_render_flow():
    project_response = client.post('/api/projects', json={'title': 'Smoke test project'})
    assert project_response.status_code == 200
    project = project_response.json()

    upload_response = client.post(
        f"/api/projects/{project['id']}/assets",
        files={'file': ('cover.jpg', b'fake-image-bytes', 'image/jpeg')},
    )
    assert upload_response.status_code == 200
    uploaded_asset = upload_response.json()
    assert uploaded_asset['type'] == 'image'

    assets_response = client.get(f"/api/projects/{project['id']}/assets")
    assert assets_response.status_code == 200
    assert len(assets_response.json()) == 1

    manifest = {
        'schemaVersion': 'fotobeat.render.v1',
        'project': {'id': project['id'], 'title': project['title']},
        'audio': {'name': 'demo.mp3', 'duration': 12, 'bpm': 128},
        'output': {'width': 1080, 'height': 1920, 'fps': 30, 'ratio': '9:16'},
        'assets': [uploaded_asset],
        'timeline': []
    }

    render_response = client.post(f"/api/projects/{project['id']}/renders", json={'manifest': manifest})
    assert render_response.status_code == 200
    render_job = render_response.json()
    assert render_job['status'] == 'queued'

    renders_response = client.get(f"/api/projects/{project['id']}/renders")
    assert renders_response.status_code == 200
    assert len(renders_response.json()) == 1

    advance_response = client.post(f"/api/renders/{render_job['id']}/advance")
    assert advance_response.status_code == 200
    assert advance_response.json()['progress'] == 25


def test_rejects_unsupported_asset_type():
    project_response = client.post('/api/projects', json={'title': 'Unsupported asset test'})
    project = project_response.json()

    upload_response = client.post(
        f"/api/projects/{project['id']}/assets",
        files={'file': ('payload.txt', b'not-supported', 'text/plain')},
    )

    assert upload_response.status_code == 400
