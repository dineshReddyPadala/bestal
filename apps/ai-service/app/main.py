from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse

from app.background.router import router as background_router
from app.core.config import get_settings
from app.evaluation.router import router as evaluation_router
from app.resume.router import router as resume_router

settings = get_settings()

app = FastAPI(title=settings.app_name, debug=settings.debug)

origins = [origin.strip() for origin in settings.cors_origins.split(",") if origin.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(resume_router)
app.include_router(evaluation_router)
app.include_router(background_router)


@app.get("/", include_in_schema=False)
def root():
    return RedirectResponse(url="/docs")


@app.get("/health")
def health_check():
    return {"status": "ok"}
