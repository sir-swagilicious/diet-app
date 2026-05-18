"""
Главный модуль FastAPI приложения для диетического контроля
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import asyncpg
from app.config import settings
from app.api import recipes, auth, products


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Жизненный цикл приложения"""
    # Запуск: подключаемся к БД
    app.state.pool = await asyncpg.create_pool(
        settings.DATABASE_URL.replace("+asyncpg", ""),
        min_size=2,
        max_size=10,
    )
    print("✅ Подключение к БД установлено")
    yield
    # Остановка: закрываем соединения
    await app.state.pool.close()
    print("👋 Подключение к БД закрыто")


app = FastAPI(
    title="Diet Control API",
    description="API для приложения диетического контроля с ИИ-генерацией рецептов",
    version="1.0.0",
    lifespan=lifespan,
)

# Настройка CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Подключаем роутеры
app.include_router(auth.router, prefix="/api/auth", tags=["Аутентификация"])
app.include_router(products.router, prefix="/api/products", tags=["Продукты"])
app.include_router(recipes.router, prefix="/api/recipes", tags=["Рецепты"])


@app.get("/")
async def root():
    return {"message": "Diet Control API работает", "version": "1.0.0"}


@app.get("/api/health")
async def health_check():
    """Проверка здоровья сервиса"""
    try:
        # Проверяем подключение к БД
        async with app.state.pool.acquire() as conn:
            await conn.fetchval("SELECT 1")
        db_status = "ok"
    except Exception:
        db_status = "error"

    return {
        "status": "ok",
        "database": db_status,
        "ollama": settings.OLLAMA_BASE_URL,
    }