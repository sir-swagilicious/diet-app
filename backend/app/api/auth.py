"""Эндпоинты аутентификации — адаптированы под реальную структуру БД"""
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from datetime import datetime, timedelta
import jwt
from jwt import PyJWTError as JWTError
from passlib.context import CryptContext
from app.config import settings
import asyncpg

router = APIRouter()
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")
security = HTTPBearer()


# --- Модели ---
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str | None = None
    token_type: str = "bearer"
    user: dict


# --- Утилиты ---
def create_access_token(user_data: dict) -> str:
    """Создаёт JWT токен с UUID пользователя"""
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {
        "sub": str(user_data["id"]),
        "user_id": str(user_data["id"]),
        "email": user_data["email"],
        "full_name": user_data.get("full_name", ""),
        "type": "access",
        "iat": datetime.utcnow(),
        "exp": expire,
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """Проверяет Bearer токен"""
    token = credentials.credentials
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=401,
            detail="Недействительный токен",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_db_pool(request: Request) -> asyncpg.Pool:
    """Зависимость: получить пул соединений из состояния приложения"""
    return request.app.state.pool


async def get_current_user(
    token: dict = Depends(verify_token),
    pool: asyncpg.Pool = Depends(get_db_pool),
) -> dict:
    """Получает пользователя из БД по токену"""
    user_id = token.get("user_id")
    row = await pool.fetchrow(
        "SELECT id, email, full_name, auth_provider, created_at FROM users WHERE id = $1::uuid",
        user_id,
    )
    if not row:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    return dict(row)


# --- Эндпоинты ---
@router.post("/register", response_model=TokenResponse)
async def register(user: UserRegister, pool: asyncpg.Pool = Depends(get_db_pool)):
    """Регистрация нового пользователя (local auth)"""
    
    # Проверяем, не занят ли email
    existing = await pool.fetchval("SELECT id FROM users WHERE email = $1", user.email)
    if existing:
        raise HTTPException(status_code=409, detail="Пользователь с таким email уже существует")
    
    # Хешируем пароль
    password_hash = pwd_context.hash(user.password)
    
    # Создаём пользователя (UUID генерируется автоматически)
    row = await pool.fetchrow(
        """
        INSERT INTO users (email, password_hash, full_name, auth_provider)
        VALUES ($1, $2, $3, 'local')
        RETURNING id, email, full_name, auth_provider, created_at
        """,
        user.email,
        password_hash,
        user.full_name,
    )
    
    user_data = dict(row)
    # UUID конвертируем в строку для JSON
    user_data["id"] = str(user_data["id"])
    user_data["created_at"] = user_data["created_at"].isoformat()
    
    access_token = create_access_token(user_data)
    return TokenResponse(access_token=access_token, user=user_data)


@router.post("/login", response_model=TokenResponse)
async def login(user: UserLogin, pool: asyncpg.Pool = Depends(get_db_pool)):
    """Вход пользователя"""
    
    # Ищем пользователя
    row = await pool.fetchrow(
        """
        SELECT id, email, password_hash, full_name, auth_provider
        FROM users
        WHERE email = $1 AND auth_provider = 'local'
        """,
        user.email,
    )
    
    if not row:
        raise HTTPException(status_code=401, detail="Неверный email или пароль")
    
    # Проверяем пароль
    if not row["password_hash"] or not pwd_context.verify(user.password, row["password_hash"]):
        raise HTTPException(status_code=401, detail="Неверный email или пароль")
    
    user_data = dict(row)
    user_data["id"] = str(user_data["id"])
    # Убираем хеш пароля из ответа
    user_data.pop("password_hash", None)
    
    access_token = create_access_token(user_data)
    return TokenResponse(access_token=access_token, user=user_data)


@router.get("/me")
async def get_me(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    current_user: dict = Depends(get_current_user),
):
    current_user["id"] = str(current_user["id"])
    current_user["created_at"] = current_user["created_at"].isoformat()
    return current_user
@router.get("/debug-token")

async def debug_token(
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    """Диагностика: показывает содержимое токена и заголовков"""
    token = credentials.credentials
    
    # Декодируем без проверки срока (для отладки)
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
            options={"verify_exp": False},
        )
        return {
            "raw_token_preview": token[:50] + "...",
            "token_length": len(token),
            "payload": payload,
            "token_type": payload.get("type", "не указан"),
            "user_id": payload.get("user_id") or payload.get("sub"),
            "email": payload.get("email"),
        }
    except JWTError as e:
        return {
            "error": str(e),
            "raw_token_preview": token[:50] + "...",
            "token_length": len(token),
        }