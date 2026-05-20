-- MealMaster database security
-- pgcrypto encryption + row-level security

CREATE EXTENSION IF NOT EXISTS pgcrypto;


-- 1. Function for getting current application user id
-- Backend must set app.current_user_id after user authentication.

CREATE OR REPLACE FUNCTION app_current_user_id()
RETURNS UUID
LANGUAGE SQL
STABLE
AS $$
    SELECT NULLIF(current_setting('app.current_user_id', true), '')::uuid;
$$;


-- 2. Table for linked grocery delivery accounts
-- Example: Yandex Lavka, Samokat.
-- Access token is stored encrypted.

CREATE TABLE IF NOT EXISTS delivery_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    provider TEXT NOT NULL
        CHECK (provider IN ('yandex_lavka', 'samokat', 'other')),

    account_label TEXT,

    access_token_encrypted BYTEA NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (user_id, provider)
);

CREATE INDEX IF NOT EXISTS idx_delivery_accounts_user_id
ON delivery_accounts(user_id);


-- 3. Example encrypted value
-- Important:
-- In a real project, encryption key must be stored in .env, not inside SQL file.
-- This key is only for local testing.

SELECT set_config('app.encryption_key', 'dev_secret_key_change_me', false);


INSERT INTO delivery_accounts (
    user_id,
    provider,
    account_label,
    access_token_encrypted
)
SELECT
    users.id,
    'yandex_lavka',
    'Demo Yandex Lavka account',
    pgp_sym_encrypt(
        'demo_yandex_lavka_access_token',
        current_setting('app.encryption_key')
    )
FROM users
WHERE users.email = 'test@example.com'
ON CONFLICT (user_id, provider)
DO UPDATE SET
    access_token_encrypted = EXCLUDED.access_token_encrypted;


-- 4. Enable Row-Level Security

ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE fridge_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_accounts ENABLE ROW LEVEL SECURITY;


-- 5. Create application role
-- Backend can use this database user later.

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_roles
        WHERE rolname = 'mealmaster_app'
    ) THEN
        CREATE ROLE mealmaster_app LOGIN PASSWORD 'mealmaster_app_password';
    END IF;
END
$$;

GRANT CONNECT ON DATABASE diet_app_db TO mealmaster_app;

GRANT USAGE ON SCHEMA public TO mealmaster_app;

GRANT SELECT, INSERT, UPDATE, DELETE
ON ALL TABLES IN SCHEMA public
TO mealmaster_app;


-- 6. Drop old policies if they already exist

DROP POLICY IF EXISTS user_preferences_isolation ON user_preferences;
DROP POLICY IF EXISTS fridge_items_isolation ON fridge_items;
DROP POLICY IF EXISTS recipes_isolation ON recipes;
DROP POLICY IF EXISTS recipe_ingredients_isolation ON recipe_ingredients;
DROP POLICY IF EXISTS meal_plans_isolation ON meal_plans;
DROP POLICY IF EXISTS shopping_lists_isolation ON shopping_lists;
DROP POLICY IF EXISTS shopping_list_items_isolation ON shopping_list_items;
DROP POLICY IF EXISTS ai_requests_isolation ON ai_requests;
DROP POLICY IF EXISTS delivery_accounts_isolation ON delivery_accounts;


-- 7. Policies for user-owned tables

CREATE POLICY user_preferences_isolation
ON user_preferences
FOR ALL
USING (user_id = app_current_user_id())
WITH CHECK (user_id = app_current_user_id());


CREATE POLICY fridge_items_isolation
ON fridge_items
FOR ALL
USING (user_id = app_current_user_id())
WITH CHECK (user_id = app_current_user_id());


CREATE POLICY meal_plans_isolation
ON meal_plans
FOR ALL
USING (user_id = app_current_user_id())
WITH CHECK (user_id = app_current_user_id());


CREATE POLICY shopping_lists_isolation
ON shopping_lists
FOR ALL
USING (user_id = app_current_user_id())
WITH CHECK (user_id = app_current_user_id());


CREATE POLICY ai_requests_isolation
ON ai_requests
FOR ALL
USING (user_id = app_current_user_id())
WITH CHECK (user_id = app_current_user_id());


CREATE POLICY delivery_accounts_isolation
ON delivery_accounts
FOR ALL
USING (user_id = app_current_user_id())
WITH CHECK (user_id = app_current_user_id());


-- 8. Policy for recipes
-- User can see system recipes and their own AI/manual recipes.

CREATE POLICY recipes_isolation
ON recipes
FOR ALL
USING (
    source = 'system'
    OR created_by_user_id = app_current_user_id()
)
WITH CHECK (
    created_by_user_id = app_current_user_id()
);


-- 9. Policy for recipe ingredients
-- User can see ingredients only for recipes available to them.

CREATE POLICY recipe_ingredients_isolation
ON recipe_ingredients
FOR ALL
USING (
    EXISTS (
        SELECT 1
        FROM recipes
        WHERE recipes.id = recipe_ingredients.recipe_id
        AND (
            recipes.source = 'system'
            OR recipes.created_by_user_id = app_current_user_id()
        )
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM recipes
        WHERE recipes.id = recipe_ingredients.recipe_id
        AND recipes.created_by_user_id = app_current_user_id()
    )
);


-- 10. Policy for shopping list items
-- Item is visible only if parent shopping list belongs to current user.

CREATE POLICY shopping_list_items_isolation
ON shopping_list_items
FOR ALL
USING (
    EXISTS (
        SELECT 1
        FROM shopping_lists
        WHERE shopping_lists.id = shopping_list_items.shopping_list_id
        AND shopping_lists.user_id = app_current_user_id()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM shopping_lists
        WHERE shopping_lists.id = shopping_list_items.shopping_list_id
        AND shopping_lists.user_id = app_current_user_id()
    )
);