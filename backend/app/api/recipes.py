"""Эндпоинты для работы с рецептами"""
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.security import HTTPAuthorizationCredentials
from pydantic import ValidationError
from app.api.auth import verify_token, security
from app.services.recipe_generator import generate_recipe_for_user
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/generate")
async def generate_recipe(
    request: Request,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    token: dict = Depends(verify_token),
):
    """Генерирует рецепт на основе продуктов пользователя"""
    user_id = token.get("user_id")
    try:
        recipe = await generate_recipe_for_user(
            pool=request.app.state.pool,
            user_id=user_id,
        )
        return recipe
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail="Сервис генерации рецептов временно недоступен")
    except ValidationError as e:
        raise HTTPException(status_code=502, detail="Нейросеть вернула некорректный ответ")


@router.get("/history")
async def get_recipe_history(
    request: Request,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    token: dict = Depends(verify_token),
    limit: int = 10,
    offset: int = 0,
):
    """Возвращает историю сгенерированных рецептов пользователя"""
    user_id = token.get("user_id")
    rows = await request.app.state.pool.fetch(
        """
        SELECT id, title, description, cooking_time_minutes, 
               calories, tags, source, created_at
        FROM recipes
        WHERE created_by_user_id = $1::uuid
        ORDER BY created_at DESC
        LIMIT $2 OFFSET $3
        """,
        user_id, limit, offset,
    )
    return [dict(row) for row in rows]