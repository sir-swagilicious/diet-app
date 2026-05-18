"""Эндпоинты для работы с продуктами пользователя"""
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from app.api.auth import verify_token

router = APIRouter()


class ProductAdd(BaseModel):
    """Модель для добавления продукта"""
    name: str
    quantity: float
    unit: str  # г, мл, шт
    category: str = "прочее"


@router.get("/")
async def get_user_products(request: Request, token: dict = Depends(verify_token)):
    """Получает список продуктов пользователя"""
    user_id = token.get("user_id", 1)
    
    query = """
        SELECT p.id, p.name, up.quantity, p.unit, p.category
        FROM user_products up
        JOIN products p ON up.product_id = p.id
        WHERE up.user_id = $1 AND up.quantity > 0
        ORDER BY p.category, p.name
    """
    
    async with request.app.state.pool.acquire() as conn:
        rows = await conn.fetch(query, user_id)
    
    return [dict(row) for row in rows]


@router.post("/")
async def add_product(
    product: ProductAdd,
    request: Request,
    token: dict = Depends(verify_token)
):
    """Добавляет продукт в список пользователя"""
    user_id = token.get("user_id", 1)
    
    # В реальном проекте проверяем, есть ли продукт в БД продуктов
    # и если нет — создаём новый
    async with request.app.state.pool.acquire() as conn:
        # Упрощённый пример
        result = await conn.fetchval(
            """
            INSERT INTO user_products (user_id, product_id, quantity)
            VALUES ($1, (SELECT id FROM products WHERE name = $2 LIMIT 1), $3)
            ON CONFLICT (user_id, product_id) 
            DO UPDATE SET quantity = user_products.quantity + $3
            RETURNING quantity
            """,
            user_id, product.name, product.quantity
        )
    
    return {"status": "ok", "message": f"Продукт '{product.name}' добавлен"}