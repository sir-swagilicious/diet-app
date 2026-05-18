"""Настройки приложения"""
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # База данных
    DATABASE_URL: str = "postgresql+asyncpg://diet_app_user:P%40ssw0rd@localhost:5432/diet_app_db"
    
    # Ollama
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "llama3.1:8b"
    
    # JWT
    SECRET_KEY: str = "jAYQmfg0Aw9KhBs58ZHj6F90wKqWtNcj"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:3000"]
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # Логи
    LOG_LEVEL: str = "INFO"
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()