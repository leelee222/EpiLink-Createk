import asyncio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.connector import MongoConnectionManager
from app.routers.auth.oauth2 import oauth2_router
from app.routers.api.api import user_router
from app.routers.post.post import post_router
from app.routers.follow.follow import follow_router
from app.routers.post.feed import feed_router
from app.routers.post.notif import notification_router
from app.routers.search.search import search_router
from app.routers.message.message import message_router
from app.credentials.config import REDIS_HOST, REDIS_PORT
from fastapi import FastAPI
from fastapi_cache import FastAPICache
from fastapi_cache.backends.redis import RedisBackend
from redis import asyncio as aioredis
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse

async def startup_logic(app: FastAPI) -> tuple[asyncio.Task, asyncio.Task]:
    connection_manager = MongoConnectionManager()
    app.state.mongo = connection_manager

    redis = aioredis.from_url(f"redis://{REDIS_HOST}:{REDIS_PORT}", decode_responses=True)
    FastAPICache.init(RedisBackend(redis), prefix="fastapi-cache")

async def shutdown_logic(app: FastAPI):
    await app.state.mongo.close_all()
    print("Shutting down background tasks.")

app = FastAPI(
    title="EPILINK API Documentation",
    summary="EPILINK API Documentation",
    description="""
    Ce projet a pour objectif de créer une plateforme en ligne où les étudiants peuvent partager leurs idées de création d’entreprise et convaincre d’autres étudiants de
    les rejoindre pour collaborer sur ces projets. Il s’agit d’un réseau social centrés l’entrepreneuriat étudiant, permettant aux utilisateurs de créer des profils, publie des idées de projets, interagir via des commentaires, et se connecter entre eux pour former des équipes.
    """,
    license_info={
        "name": "MIT License",
        "url": "https://opensource.org/licenses/MIT"
    },
    version="1.0.0",
    docs_url=None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(oauth2_router)
app.include_router(user_router)
app.include_router(post_router)
app.include_router(follow_router)
app.include_router(feed_router)
app.include_router(notification_router)
app.include_router(search_router)
app.include_router(message_router)

app.mount("/template", StaticFiles(directory="app/template"), name="template")

@app.get("/docs", include_in_schema=False)
async def custom_swagger_ui_html():
    with open("app/template/custom_swagger.html") as f:
        template = f.read()
    
    return HTMLResponse(
        template.replace(
            "{{ title }}", 
            "EPILINK API Documentation"
        ).replace(
            "{{ openapi_url }}", 
            "/openapi.json"
        )
    )