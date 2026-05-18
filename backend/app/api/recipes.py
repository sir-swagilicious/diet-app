"""Эндпоинты для работы с рецептами"""
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, ValidationError
from app.api.auth import verify_token
from app.services.recipe_generator import generate_recipe_for_user
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


class RecipeResponse(BaseModel):
    """Упрощённая модель для ответа API"""
    id: int
    title: str
    description: str
    cooking_time_minutes: int
    difficulty: str
    servings: int
    ingredients_available: list
    ingredients_missing: list
    instructions: list
    nutritional_info: dict
    tips: str | None = None


@router.get("/generate")
async def generate_recipe(request: Request, token: dict = Depends(verify_token)):
    """
    Генерирует рецепт на основе продуктов пользователя.
    Вызывает нейросеть и сохраняет результат в БД.
    """
    user_id = token.get("user_id", 1)
    
    try:
        recipe = await generate_recipe_for_user(
            pool=request.app.state.pool,
            user_id=user_id,
        )
        return recipe
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except RuntimeError as e:
        raise HTTPException(
            status_code=503,
            detail="Сервис генерации рецептов временно недоступен",
        )
    except ValidationError as e:
        logger.error(f"Ошибка валидации ответа нейросети: {e}")
        raise HTTPException(
            status_code=502,
            detail="Нейросеть вернула некорректный ответ. Попробуйте снова.",
        )


@router.get("/history")
async def get_recipe_history(
    request: Request,
    token: dict = Depends(verify_token),
    limit: int = 10,
    offset: int = 0,
):
    """Возвращает историю сгенерированных рецептов пользователя"""
    user_id = token.get("user_id", 1)
    
    query = """
        SELECT id, title, description, cooking_time_minutes, 
               difficulty, servings, created_at
        FROM generated_recipes
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT $2 OFFSET $3
    """
    
    async with request.app.state.pool.acquire() as conn:
        rows = await conn.fetch(query, user_id, limit, offset)
    
    return [dict(row) for row in rows]