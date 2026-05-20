
"""security pgcrypto rls

Revision ID: 002_security_pgcrypto_rls
Revises: 001_initial_mealmaster_schema
Create Date: 2026-05-19
"""

from alembic import op

revision = "002_security_pgcrypto_rls"
down_revision = "001_initial_mealmaster_schema"
branch_labels = None
depends_on = None

def upgrade() -> None:
    op.execute("""
    CREATE EXTENSION IF NOT EXISTS pgcrypto;
    """)

    op.execute("""
    CREATE OR REPLACE FUNCTION app_current_user_id()
    RETURNS UUID
    LANGUAGE SQL
    STABLE
    AS $$
        SELECT NULLIF(current_setting('app.current_user_id', true), '')::uuid;
    $$;
    """)

    op.execute("""
    CREATE TABLE delivery_accounts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

        provider TEXT NOT NULL
            CHECK (provider IN ('yandex_lavka', 'samokat', 'other')),

        account_label TEXT,

        access_token_encrypted BYTEA NOT NULL,

        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

        UNIQUE (user_id, provider)
    );
    """)

    op.execute("CREATE INDEX idx_delivery_accounts_user_id ON delivery_accounts(user_id);")

    op.execute("""
    ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
    ALTER TABLE fridge_items ENABLE ROW LEVEL SECURITY;
    ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
    ALTER TABLE recipe_ingredients ENABLE ROW LEVEL SECURITY;
    ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;
    ALTER TABLE shopping_lists ENABLE ROW LEVEL SECURITY;
    ALTER TABLE shopping_list_items ENABLE ROW LEVEL SECURITY;
    ALTER TABLE ai_requests ENABLE ROW LEVEL SECURITY;
    ALTER TABLE delivery_accounts ENABLE ROW LEVEL SECURITY;
    """)

    op.execute("""
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
    """)

    op.execute("""
    GRANT CONNECT ON DATABASE diet_app_db TO mealmaster_app;
    GRANT USAGE ON SCHEMA public TO mealmaster_app;
    GRANT SELECT, INSERT, UPDATE, DELETE
    ON ALL TABLES IN SCHEMA public
    TO mealmaster_app;
    """)

    op.execute("""
    CREATE POLICY user_preferences_isolation
    ON user_preferences
    FOR ALL
    USING (user_id = app_current_user_id())
    WITH CHECK (user_id = app_current_user_id());
    """)

    op.execute("""
    CREATE POLICY fridge_items_isolation
    ON fridge_items
    FOR ALL
    USING (user_id = app_current_user_id())
    WITH CHECK (user_id = app_current_user_id());
    """)

    op.execute("""
    CREATE POLICY meal_plans_isolation
    ON meal_plans
    FOR ALL
    USING (user_id = app_current_user_id())
    WITH CHECK (user_id = app_current_user_id());
    """)

    op.execute("""
    CREATE POLICY shopping_lists_isolation
    ON shopping_lists
    FOR ALL
    USING (user_id = app_current_user_id())
    WITH CHECK (user_id = app_current_user_id());
    """)

    op.execute("""
    CREATE POLICY ai_requests_isolation
    ON ai_requests
    FOR ALL
    USING (user_id = app_current_user_id())
    WITH CHECK (user_id = app_current_user_id());
    """)

    op.execute("""
    CREATE POLICY delivery_accounts_isolation
    ON delivery_accounts
    FOR ALL
    USING (user_id = app_current_user_id())
    WITH CHECK (user_id = app_current_user_id());
    """)

    op.execute("""
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
    """)

    op.execute("""
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
    """)

    op.execute("""
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
    """)

def downgrade() -> None:
    op.execute("DROP POLICY IF EXISTS shopping_list_items_isolation ON shopping_list_items;")
    op.execute("DROP POLICY IF EXISTS recipe_ingredients_isolation ON recipe_ingredients;")
    op.execute("DROP POLICY IF EXISTS recipes_isolation ON recipes;")
    op.execute("DROP POLICY IF EXISTS delivery_accounts_isolation ON delivery_accounts;")
    op.execute("DROP POLICY IF EXISTS ai_requests_isolation ON ai_requests;")
    op.execute("DROP POLICY IF EXISTS shopping_lists_isolation ON shopping_lists;")
    op.execute("DROP POLICY IF EXISTS meal_plans_isolation ON meal_plans;")
    op.execute("DROP POLICY IF EXISTS fridge_items_isolation ON fridge_items;")
    op.execute("DROP POLICY IF EXISTS user_preferences_isolation ON user_preferences;")

    op.execute("DROP TABLE IF EXISTS delivery_accounts CASCADE;")
    op.execute("DROP FUNCTION IF EXISTS app_current_user_id();")