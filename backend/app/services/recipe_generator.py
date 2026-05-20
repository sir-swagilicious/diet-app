"""
Скрипт для генерации рецепта нейросетью
Вызывается при нажатии кнопки пользователем в веб-интерфейсе
"""

import logging
from datetime import datetime
from typing import Optional

import asyncpg
import httpx
from pydantic import BaseModel, Field, TypeAdapter, ValidationError

# -------------------- Настройка логирования --------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("recipe_generator")

# -------------------- Конфигурация --------------------
# В реальном проекте эти значения берутся из переменных окружения
DATABASE_URL = "postgresql://user:password@localhost:5432/diet_app"
OLLAMA_URL = "http://localhost:11434/api/generate"
OLLAMA_MODEL = "llama3.1:8b"
MAX_RETRIES = 2
REQUEST_TIMEOUT = 90.0  # секунд — генерация может быть долгой
MAX_OUTPUT_TOKENS = 2048


# -------------------- Pydantic-схемы --------------------
class Ingredient(BaseModel):
    """Ингредиент в составе рецепта"""
    name: str = Field(description="Название ингредиента")
    amount: str = Field(description="Количество с единицей измерения, например '200 г' или '2 шт'")
    notes: Optional[str] = Field(default=None, description="Особые указания, например 'мелко нарезать'")


class NutritionalInfo(BaseModel):
    """Пищевая ценность на 100 г готового блюда"""
    calories_kcal: float = Field(description="Калорийность в ккал")
    proteins_g: float = Field(description="Белки в граммах")
    fats_g: float = Field(description="Жиры в граммах")
    carbs_g: float = Field(description="Углеводы в граммах")
    sugars_g: float = Field(description="Сахара в граммах")


class GeneratedRecipe(BaseModel):
    """Полная структура сгенерированного рецепта"""
    title: str = Field(description="Название блюда")
    description: str = Field(description="Краткое описание, 1-2 предложения")
    cooking_time_minutes: int = Field(description="Общее время приготовления в минутах")
    difficulty: str = Field(description="Сложность: легко, средне или сложно")
    servings: int = Field(description="Количество порций")

    ingredients_available: list[Ingredient] = Field(
        description="Ингредиенты, которые есть у пользователя"
    )
    ingredients_missing: list[Ingredient] = Field(
        default_factory=list,
        description="Ингредиенты, которых нет, но нужны (1-2 позиции). Пустой список, если ничего не нужно"
    )

    instructions: list[str] = Field(description="Пошаговая инструкция приготовления")
    nutritional_info: NutritionalInfo = Field(description="Расчётная пищевая ценность на 100 г")

    tips: Optional[str] = Field(default=None, description="Совет по приготовлению или замене ингредиента")


# -------------------- Работа с БД --------------------
async def get_user_products(pool, user_id: str) -> list[dict]:
    """Получает продукты пользователя из fridge_items"""
    query = """
        SELECT product_name, quantity, unit, category
        FROM fridge_items
        WHERE user_id = $1::uuid AND quantity > 0
        ORDER BY category, product_name
    """
    async with pool.acquire() as conn:
        rows = await conn.fetch(query, user_id)
    
    if not rows:
        return []
    
    return [dict(row) for row in rows]


async def get_user_diet_profile(pool: asyncpg.Pool, user_id: int) -> dict:
    """Получает диетический профиль пользователя для персонализации рецепта"""
    query = """
        SELECT 
            daily_calorie_target,
            protein_target_g,
            fat_target_g,
            carb_target_g,
            sugar_limit_g,
            allergies,
            diet_type
        FROM user_profiles
        WHERE user_id = $1
    """
    async with pool.acquire() as conn:
        row = await conn.fetchrow(query, user_id)

    if row:
        return dict(row)
    # Профиль по умолчанию
    return {
        "daily_calorie_target": 2000,
        "protein_target_g": 75,
        "fat_target_g": 65,
        "carb_target_g": 250,
        "sugar_limit_g": 50,
        "allergies": [],
        "diet_type": "сбалансированное",
    }


async def save_generated_recipe(pool, user_id: str, recipe, prompt_used: str, model_used: str) -> str:
    """Сохраняет сгенерированный рецепт в recipes и recipe_ingredients"""
    async with pool.acquire() as conn:
        # Сохраняем рецепт
        recipe_id = await conn.fetchval(
            """
            INSERT INTO recipes (
                created_by_user_id, title, description, instructions,
                cooking_time_minutes, calories, proteins, fats, carbs,
                tags, source
            ) VALUES (
                $1::uuid, $2, $3, $4::jsonb,
                $5, $6, $7, $8, $9,
                $10::jsonb, 'ai_generated'
            )
            RETURNING id
            """,
            user_id,
            recipe.title,
            recipe.description,
            [{"step": i+1, "text": step} for i, step in enumerate(recipe.instructions)],
            recipe.cooking_time_minutes,
            int(recipe.nutritional_info.calories_kcal),
            recipe.nutritional_info.proteins_g,
            recipe.nutritional_info.fats_g,
            recipe.nutritional_info.carbs_g,
            [recipe.difficulty, "ai_generated"],
        )
        
        # Сохраняем ингредиенты
        for ing in recipe.ingredients_available + recipe.ingredients_missing:
            await conn.execute(
                """
                INSERT INTO recipe_ingredients (recipe_id, product_name, quantity, unit, is_optional)
                VALUES ($1::uuid, $2, $3, $4, $5)
                """,
                recipe_id,
                ing.name,
                float(ing.amount.split()[0]) if ing.amount.split()[0].replace('.', '').isdigit() else 0,
                ing.amount.split()[-1] if ing.amount.split()[-1].isalpha() else 'шт',
                ing in recipe.ingredients_missing,
            )
        
        return str(recipe_id)


# -------------------- Формирование промпта --------------------
def build_prompt(products: list[dict], diet_profile: dict) -> str:
    """
    Формирует подробный промпт для нейросети на русском языке.
    Включает: список продуктов, диетические цели, пожелания к рецепту.
    """
    # Форматируем список продуктов для промпта
    product_lines = []
    for p in products:
        line = f"- {p['name']} ({p['quantity']} {p['unit']})"
        if p.get("category"):
            line += f" [категория: {p['category']}]"
        product_lines.append(line)

    products_text = "\n".join(product_lines)

    # Собираем полный промпт
    prompt = f"""Ты — профессиональный шеф-повар и диетолог. Составь рецепт блюда, используя продукты, которые есть у пользователя.

**Продукты в наличии:**
{products_text}

**Диетический профиль пользователя:**
- Дневная норма калорий: {diet_profile['daily_calorie_target']} ккал
- Цель по белкам: {diet_profile['protein_target_g']} г
- Цель по жирам: {diet_profile['fat_target_g']} г
- Цель по углеводам: {diet_profile['carb_target_g']} г
- Лимит сахара: {diet_profile['sugar_limit_g']} г
- Аллергии: {', '.join(diet_profile['allergies']) if diet_profile['allergies'] else 'нет'}
- Тип диеты: {diet_profile['diet_type']}

**Требования к рецепту:**
1. Используй максимум продуктов из списка имеющихся.
2. Если нужны 1-2 дополнительных продукта — укажи их в ingredients_missing.
3. Блюдо должно вписываться в дневные нормы (одна порция — примерно 1/3 дневной нормы).
4. Учитывай аллергии и тип диеты пользователя.
5. Инструкции должны быть подробными, пошаговыми, на русском языке.
6. Рассчитай пищевую ценность на 100 г готового блюда.

Сгенерируй рецепт строго в соответствии с предоставленной JSON-схемой."""

    return prompt


# -------------------- Запрос к нейросети --------------------
async def call_ollama(prompt: str, json_schema: dict) -> dict:
    """
    Отправляет запрос к Ollama с JSON-схемой.
    Делает до MAX_RETRIES попыток при ошибках.
    Возвращает словарь с ответом нейросети.
    """
    recipe_adapter = TypeAdapter(GeneratedRecipe)

    payload = {
        "model": OLLAMA_MODEL,
        "prompt": prompt,
        "format": json_schema,
        "stream": False,
        "options": {
            "temperature": 0.7,
            "num_predict": MAX_OUTPUT_TOKENS,
            "top_p": 0.9,
        },
    }

    last_error = None

    for attempt in range(1, MAX_RETRIES + 2):  # 1 начальный + 2 ретрая
        try:
            logger.info(f"Отправка запроса к Ollama, модель={OLLAMA_MODEL} (попытка {attempt})")
            async with httpx.AsyncClient(timeout=REQUEST_TIMEOUT) as client:
                response = await client.post(OLLAMA_URL, json=payload)
                response.raise_for_status()
                data = response.json()

            # Извлекаем текст ответа
            raw_response = data.get("response", "")
            if not raw_response:
                raise ValueError("Пустой ответ от нейросети")

            logger.info(f"Ответ получен, длина={len(raw_response)} символов")
            return {"response": raw_response, "model": OLLAMA_MODEL}

        except httpx.TimeoutException:
            last_error = f"Таймаут запроса (попытка {attempt})"
            logger.warning(last_error)
        except httpx.HTTPError as e:
            last_error = f"HTTP ошибка: {e}"
            logger.error(last_error)
        except Exception as e:
            last_error = f"Неизвестная ошибка: {e}"
            logger.error(last_error)

    raise RuntimeError(f"Не удалось получить ответ от нейросети после {MAX_RETRIES + 1} попыток. Последняя ошибка: {last_error}")


# -------------------- Главная функция (точка входа) --------------------
async def generate_recipe_for_user(
    pool: asyncpg.Pool,
    user_id: int,
) -> GeneratedRecipe:
    """
    Основная функция, вызываемая при нажатии кнопки "Сгенерировать рецепт".
    
    Аргументы:
        pool: пул соединений asyncpg к PostgreSQL
        user_id: ID пользователя, запросившего рецепт
    
    Возвращает:
        GeneratedRecipe — валидированный объект рецепта
    
    Исключения:
        ValueError — если у пользователя нет продуктов
        RuntimeError — если нейросеть не ответила
        ValidationError — если ответ нейросети не прошёл валидацию
    """
    # Шаг 1: Получаем данные пользователя из БД
    products = await get_user_products(pool, user_id)
    if not products:
        raise ValueError("У вас нет добавленных продуктов. Добавьте продукты в свой список.")

    diet_profile = await get_user_diet_profile(pool, user_id)

    # Шаг 2: Формируем промпт
    prompt = build_prompt(products, diet_profile)
    logger.info(f"Промпт сформирован, длина={len(prompt)} символов")

    # Шаг 3: Получаем JSON-схему из Pydantic-модели
    recipe_adapter = TypeAdapter(GeneratedRecipe)
    json_schema = recipe_adapter.json_schema()
    logger.info("JSON-схема для structured output сформирована")

    # Шаг 4: Отправляем запрос к нейросети
    response_data = await call_ollama(prompt, json_schema)
    raw_response = response_data["response"]

    # Шаг 5: Валидируем ответ через Pydantic
    try:
        recipe = recipe_adapter.validate_json(raw_response)
        logger.info(f"Рецепт '{recipe.title}' успешно сгенерирован и валидирован")
    except ValidationError as e:
        logger.error(f"Ответ нейросети не прошёл валидацию: {e}")
        # Логируем сырой ответ для отладки
        logger.debug(f"Сырой ответ нейросети:\n{raw_response}")
        raise

    # Шаг 6: Сохраняем в БД
    await save_generated_recipe(
        pool=pool,
        user_id=user_id,
        recipe=recipe,
        prompt_used=prompt,
        model_used=response_data["model"],
    )

    return recipe


# -------------------- Пример использования --------------------
async def main():
    """
    Демонстрация работы скрипта.
    В реальном проекте эта логика вызывается из FastAPI-эндпоинта.
    """
    # Создаём пул соединений к БД
    pool = await asyncpg.create_pool(DATABASE_URL, min_size=1, max_size=5)

    try:
        user_id = 1  # ID пользователя, запросившего рецепт

        logger.info(f"=== Начало генерации рецепта для пользователя {user_id} ===")
        recipe = await generate_recipe_for_user(pool, user_id)

        # Выводим результат в консоль
        print("\n" + "=" * 60)
        print(f"🍽️  {recipe.title}")
        print("=" * 60)
        print(f"\n{recipe.description}\n")
        print(f"⏱️  Время приготовления: {recipe.cooking_time_minutes} мин")
        print(f"📊 Сложность: {recipe.difficulty}")
        print(f"👥 Порций: {recipe.servings}")

        print("\n✅ Ингредиенты в наличии:")
        for ing in recipe.ingredients_available:
            note = f" ({ing.notes})" if ing.notes else ""
            print(f"  • {ing.name} — {ing.amount}{note}")

        if recipe.ingredients_missing:
            print("\n🛒 Нужно докупить:")
            for ing in recipe.ingredients_missing:
                note = f" ({ing.notes})" if ing.notes else ""
                print(f"  • {ing.name} — {ing.amount}{note}")
        else:
            print("\n🛒 Докупать ничего не нужно!")

        print("\n📝 Инструкция:")
        for i, step in enumerate(recipe.instructions, 1):
            print(f"  {i}. {step}")

        print(f"\n📊 Пищевая ценность (на 100 г):")
        ni = recipe.nutritional_info
        print(f"  Калории: {ni.calories_kcal} ккал")
        print(f"  Белки: {ni.proteins_g} г")
        print(f"  Жиры: {ni.fats_g} г")
        print(f"  Углеводы: {ni.carbs_g} г")
        print(f"  Сахара: {ni.sugars_g} г")

        if recipe.tips:
            print(f"\n💡 Совет: {recipe.tips}")

        print("\n" + "=" * 60)

    except ValueError as e:
        logger.error(f"Ошибка данных пользователя: {e}")
    except RuntimeError as e:
        logger.error(f"Ошибка нейросети: {e}")
    except ValidationError as e:
        logger.error(f"Ошибка валидации ответа нейросети: {e}")
    finally:
        await pool.close()


if __name__ == "__main__":
    import asyncio
    asyncio.run(main())