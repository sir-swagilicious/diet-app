"""Эндпоинты для работы с продуктами пользователя (fridge_items)"""
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.security import HTTPAuthorizationCredentials
from pydantic import BaseModel
from app.api.auth import verify_token, security
import asyncpg

router = APIRouter()


class ProductAdd(BaseModel):
    product_name: str
    quantity: float
    unit: str
    category: str = "прочее"
    expiration_date: str | None = None


@router.get("/")
async def get_user_products(
    request: Request,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    token: dict = Depends(verify_token),
):
    """Получает список продуктов пользователя из fridge_items"""
    user_id = token.get("user_id")
    rows = await request.app.state.pool.fetch(
        "SELECT id, product_name, quantity, unit, category, expiration_date "
        "FROM fridge_items WHERE user_id = $1::uuid AND quantity > 0 "
        "ORDER BY category, product_name",
        user_id,
    )
    return [dict(row) for row in rows]


@router.post("/")
async def add_product(
    product: ProductAdd,
    request: Request,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    token: dict = Depends(verify_token),
):
    """Добавляет продукт в fridge_items"""
    user_id = token.get("user_id")
    await request.app.state.pool.execute(
        """
        INSERT INTO fridge_items (user_id, product_name, quantity, unit, category, expiration_date)
        VALUES ($1::uuid, $2, $3, $4, $5, $6::date)
        """,
        user_id,
        product.product_name,
        product.quantity,
        product.unit,
        product.category,
        product.expiration_date,
    )
    return {"status": "ok", "message": f"Продукт '{product.product_name}' добавлен"}