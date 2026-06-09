from datetime import datetime
from enum import Enum
from typing import Any, Literal
from uuid import uuid4

from pydantic import BaseModel, Field


class ProjectStatus(str, Enum):
    DRAFT = 'draft'
    EDITING = 'editing'
    RENDERING = 'rendering'
    DONE = 'done'


class RenderStatus(str, Enum):
    QUEUED = 'queued'
    RENDERING = 'rendering'
    DONE = 'done'
    FAILED = 'failed'


class ProjectCreate(BaseModel):
    title: str = Field(min_length=2, max_length=120)
    preset_id: str = 'neon-pulse'


class Project(BaseModel):
    id: str = Field(default_factory=lambda: f'project-{uuid4()}')
    title: str
    preset_id: str = 'neon-pulse'
    status: ProjectStatus = ProjectStatus.DRAFT
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class Asset(BaseModel):
    id: str = Field(default_factory=lambda: f'asset-{uuid4()}')
    project_id: str
    type: Literal['image', 'audio']
    filename: str
    content_type: str
    size_bytes: int
    storage_url: str
    created_at: datetime = Field(default_factory=datetime.utcnow)


class RenderManifest(BaseModel):
    schemaVersion: str = 'fotobeat.render.v1'
    project: dict[str, Any]
    audio: dict[str, Any]
    output: dict[str, Any]
    assets: list[dict[str, Any]]
    timeline: list[dict[str, Any]]
    preset: dict[str, Any] | None = None


class RenderJobCreate(BaseModel):
    manifest: RenderManifest


class RenderJob(BaseModel):
    id: str = Field(default_factory=lambda: f'render-{uuid4()}')
    project_id: str
    status: RenderStatus = RenderStatus.QUEUED
    progress: int = 0
    manifest: RenderManifest
    output_url: str | None = None
    logs: list[str] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
