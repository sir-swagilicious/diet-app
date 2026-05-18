"""Эндпоинты аутентификации"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel, EmailStr
from datetime import datetime, timedelta
from jose import JWT, Error
from passlib.context import CryptContext
from app.config import settings

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


# --- Модели ---
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


# --- Утилиты ---
def create_access_token(data: dict) -> str:
    """Создаёт JWT токен"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def verify_token(token: str = Depends(oauth2_scheme)) -> dict:
    """Проверяет JWT токен и возвращает payload"""
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Недействительный токен",
            headers={"WWW-Authenticate": "Bearer"},
        )


# --- Эндпоинты ---
@router.post("/register", response_model=Token)
async def register(user: UserCreate):
    """Регистрация нового пользователя"""
    # В реальном проекте здесь будет запись в БД
    hashed_password = pwd_context.hash(user.password)
    token = create_access_token({"sub": user.email, "name": user.name})
    return Token(access_token=token)


@router.post("/login", response_model=Token)
async def login(user: UserLogin):
    """Вход пользователя"""
    # В реальном проекте — проверка по БД
    token = create_access_token({"sub": user.email})
    return Token(access_token=token)