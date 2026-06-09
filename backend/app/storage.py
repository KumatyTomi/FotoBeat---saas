from pathlib import Path
from uuid import uuid4

from fastapi import UploadFile

UPLOAD_ROOT = Path('mock-storage/uploads')


async def save_upload(project_id: str, file: UploadFile) -> tuple[str, int]:
    project_dir = UPLOAD_ROOT / project_id
    project_dir.mkdir(parents=True, exist_ok=True)

    safe_name = file.filename.replace('/', '_').replace('\\', '_') if file.filename else 'upload.bin'
    target = project_dir / f'{uuid4()}-{safe_name}'
    size = 0

    with target.open('wb') as buffer:
      while chunk := await file.read(1024 * 1024):
          size += len(chunk)
          buffer.write(chunk)

    return f'/{target.as_posix()}', size


def infer_asset_type(content_type: str) -> str:
    if content_type.startswith('image/'):
        return 'image'
    if content_type.startswith('audio/'):
        return 'audio'
    return 'image'
