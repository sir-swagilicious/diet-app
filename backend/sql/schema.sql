-- MealMaster database schema
-- Version 1

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Осторожно: эти команды удаляют таблицы, если они уже существуют.
-- Пока мы только учимся и создаем БД с нуля, это нормально.

DROP TABLE IF EXISTS ai_requests CASCADE;
DROP TABLE IF EXISTS delivery_accounts CASCADE;
DROP TABLE IF EXISTS shopping_list_items CASCADE;
DROP TABLE IF EXISTS shopping_lists CASCADE;
DROP TABLE IF EXISTS meal_plans CASCADE;
DROP TABLE IF EXISTS recipe_ingredients CASCADE;
DROP TABLE IF EXISTS recipes CASCADE;
DROP TABLE IF EXISTS fridge_items CASCADE;
DROP TABLE IF EXISTS user_preferences CASCADE;
DROP TABLE IF EXISTS users CASCADE;


-- 1. Пользователи
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    email TEXT NOT NULL UNIQUE,
    password_hash TEXT,

    full_name TEXT,

    auth_provider TEXT NOT NULL DEFAULT 'local',
    is_mfa_enabled BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- 2. Настройки пользователя: диета, аллергии, цель по калориям
CREATE TABLE user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,

    diet_type TEXT,
    calorie_goal INT CHECK (calorie_goal > 0),

    allergies JSONB NOT NULL DEFAULT '[]'::jsonb,
    disliked_products JSONB NOT NULL DEFAULT '[]'::jsonb,
    preferred_cuisines JSONB NOT NULL DEFAULT '[]'::jsonb,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- 3. Продукты в холодильнике пользователя
CREATE TABLE fridge_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    product_name TEXT NOT NULL,
    quantity NUMERIC(10, 2) NOT NULL CHECK (quantity >= 0),
    unit TEXT NOT NULL,

    category TEXT,
    expiration_date DATE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- 4. Рецепты
CREATE TABLE recipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    created_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,

    title TEXT NOT NULL,
    description TEXT,

    instructions JSONB NOT NULL DEFAULT '[]'::jsonb,

    cooking_time_minutes INT CHECK (cooking_time_minutes > 0),

    calories INT CHECK (calories >= 0),
    proteins NUMERIC(10, 2) CHECK (proteins >= 0),
    fats NUMERIC(10, 2) CHECK (fats >= 0),
    carbs NUMERIC(10, 2) CHECK (carbs >= 0),

    tags JSONB NOT NULL DEFAULT '[]'::jsonb,

    source TEXT NOT NULL DEFAULT 'manual'
        CHECK (source IN ('manual', 'ai', 'system')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- 5. Ингредиенты рецептов
CREATE TABLE recipe_ingredients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,

    product_name TEXT NOT NULL,
    quantity NUMERIC(10, 2) NOT NULL CHECK (quantity > 0),
    unit TEXT NOT NULL,

    is_optional BOOLEAN NOT NULL DEFAULT FALSE
);


-- 6. Планы питания
CREATE TABLE meal_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE RESTRICT,

    plan_date DATE NOT NULL,

    meal_type TEXT NOT NULL
        CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (user_id, plan_date, meal_type)
);


-- 7. Списки покупок
CREATE TABLE shopping_lists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    title TEXT NOT NULL DEFAULT 'Shopping list',

    status TEXT NOT NULL DEFAULT 'draft'
        CHECK (status IN ('draft', 'active', 'ordered', 'completed')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- 8. Товары внутри списка покупок
CREATE TABLE shopping_list_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    shopping_list_id UUID NOT NULL REFERENCES shopping_lists(id) ON DELETE CASCADE,

    product_name TEXT NOT NULL,
    quantity NUMERIC(10, 2) NOT NULL CHECK (quantity > 0),
    unit TEXT NOT NULL,

    is_bought BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- 9. Запросы к ИИ
CREATE TABLE ai_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID REFERENCES users(id) ON DELETE SET NULL,

    request_type TEXT NOT NULL,
    prompt TEXT NOT NULL,
    response JSONB NOT NULL DEFAULT '{}'::jsonb,

    model_name TEXT NOT NULL DEFAULT 'llama3',

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- Индексы для ускорения поиска

CREATE INDEX idx_user_preferences_user_id
ON user_preferences(user_id);

CREATE INDEX idx_fridge_items_user_id
ON fridge_items(user_id);

CREATE INDEX idx_recipes_created_by_user_id
ON recipes(created_by_user_id);

CREATE INDEX idx_recipe_ingredients_recipe_id
ON recipe_ingredients(recipe_id);

CREATE INDEX idx_meal_plans_user_id
ON meal_plans(user_id);

CREATE INDEX idx_meal_plans_plan_date
ON meal_plans(plan_date);

CREATE INDEX idx_shopping_lists_user_id
ON shopping_lists(user_id);

CREATE INDEX idx_shopping_list_items_list_id
ON shopping_list_items(shopping_list_id);

CREATE INDEX idx_ai_requests_user_id
ON ai_requests(user_id);

-- Additional indexes for application queries

CREATE INDEX idx_fridge_items_user_product
ON fridge_items(user_id, product_name);

CREATE INDEX idx_fridge_items_expiration_date
ON fridge_items(expiration_date);

CREATE INDEX idx_meal_plans_user_date
ON meal_plans(user_id, plan_date);

CREATE INDEX idx_recipes_title
ON recipes(title);

CREATE INDEX idx_shopping_lists_user_status
ON shopping_lists(user_id, status);

-- JSONB GIN indexes

CREATE INDEX idx_user_preferences_allergies
ON user_preferences
USING GIN (allergies);

CREATE INDEX idx_user_preferences_disliked_products
ON user_preferences
USING GIN (disliked_products);

CREATE INDEX idx_user_preferences_preferred_cuisines
ON user_preferences
USING GIN (preferred_cuisines);

CREATE INDEX idx_recipes_tags
ON recipes
USING GIN (tags);

CREATE INDEX idx_recipes_instructions
ON recipes
USING GIN (instructions);

CREATE INDEX idx_ai_requests_response
ON ai_requests
USING GIN (response);