"""initial mealmaster schema  
  
Revision ID: 001_initial_mealmaster_schema  
Revises:  
Create Date: 2026-05-19  
"""  
  
from alembic import op  
  
  
revision = "001_initial_mealmaster_schema"  
down_revision = None  
branch_labels = None  
depends_on = None  
  
  
def upgrade() -> None:  
    op.execute("""  
    CREATE EXTENSION IF NOT EXISTS pgcrypto;  
    """)  
  
    op.execute("""  
    CREATE TABLE users (  
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),  
  
        email TEXT NOT NULL UNIQUE,  
        password_hash TEXT,  
  
        full_name TEXT,  
  
        auth_provider TEXT NOT NULL DEFAULT 'local',  
        is_mfa_enabled BOOLEAN NOT NULL DEFAULT FALSE,  
  
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()  
    );  
    """)  
  
    op.execute("""  
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
    """)  
  
    op.execute("""  
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
    """)  
  
    op.execute("""  
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
    """)  
  
    op.execute("""  
    CREATE TABLE recipe_ingredients (  
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),  
  
        recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,  
  
        product_name TEXT NOT NULL,  
        quantity NUMERIC(10, 2) NOT NULL CHECK (quantity > 0),  
        unit TEXT NOT NULL,  
  
        is_optional BOOLEAN NOT NULL DEFAULT FALSE  
    );  
    """)  
  
    op.execute("""  
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
    """)  
  
    op.execute("""  
    CREATE TABLE shopping_lists (  
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),  
  
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,  
  
        title TEXT NOT NULL DEFAULT 'Shopping list',  
  
        status TEXT NOT NULL DEFAULT 'draft'  
            CHECK (status IN ('draft', 'active', 'ordered', 'completed')),  
  
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()  
    );  
    """)  
  
    op.execute("""CREATE TABLE shopping_list_items (  
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),  
  
        shopping_list_id UUID NOT NULL REFERENCES shopping_lists(id) ON DELETE CASCADE,  
  
        product_name TEXT NOT NULL,  
        quantity NUMERIC(10, 2) NOT NULL CHECK (quantity > 0),  
        unit TEXT NOT NULL,  
  
        is_bought BOOLEAN NOT NULL DEFAULT FALSE,  
  
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()  
    );  
    """)  
  
    op.execute("""  
    CREATE TABLE ai_requests (  
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),  
  
        user_id UUID REFERENCES users(id) ON DELETE SET NULL,  
  
        request_type TEXT NOT NULL,  
        prompt TEXT NOT NULL,  
        response JSONB NOT NULL DEFAULT '{}'::jsonb,  
  
        model_name TEXT NOT NULL DEFAULT 'llama3',  
  
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()  
    );  
    """)  
  
    op.execute("CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);")  
    op.execute("CREATE INDEX idx_fridge_items_user_id ON fridge_items(user_id);")  
    op.execute("CREATE INDEX idx_recipes_created_by_user_id ON recipes(created_by_user_id);")  
    op.execute("CREATE INDEX idx_recipe_ingredients_recipe_id ON recipe_ingredients(recipe_id);")  
    op.execute("CREATE INDEX idx_meal_plans_user_id ON meal_plans(user_id);")  
    op.execute("CREATE INDEX idx_meal_plans_plan_date ON meal_plans(plan_date);")  
    op.execute("CREATE INDEX idx_shopping_lists_user_id ON shopping_lists(user_id);")  
    op.execute("CREATE INDEX idx_shopping_list_items_list_id ON shopping_list_items(shopping_list_id);")  
    op.execute("CREATE INDEX idx_ai_requests_user_id ON ai_requests(user_id);")  
  
    op.execute("CREATE INDEX idx_fridge_items_user_product ON fridge_items(user_id, product_name);")  
    op.execute("CREATE INDEX idx_fridge_items_expiration_date ON fridge_items(expiration_date);")  
    op.execute("CREATE INDEX idx_meal_plans_user_date ON meal_plans(user_id, plan_date);")  
    op.execute("CREATE INDEX idx_recipes_title ON recipes(title);")  
    op.execute("CREATE INDEX idx_shopping_lists_user_status ON shopping_lists(user_id, status);")  
  
    op.execute("CREATE INDEX idx_user_preferences_allergies ON user_preferences USING GIN (allergies);")  
    op.execute("CREATE INDEX idx_user_preferences_disliked_products ON user_preferences USING GIN (disliked_products);")  
    op.execute("CREATE INDEX idx_user_preferences_preferred_cuisines ON user_preferences USING GIN (preferred_cuisines);")  
    op.execute("CREATE INDEX idx_recipes_tags ON recipes USING GIN (tags);")  
    op.execute("CREATE INDEX idx_recipes_instructions ON recipes USING GIN (instructions);")  
    op.execute("CREATE INDEX idx_ai_requests_response ON ai_requests USING GIN (response);")  
  
  
def downgrade() -> None:  
    op.execute("DROP TABLE IF EXISTS ai_requests CASCADE;")  
    op.execute("DROP TABLE IF EXISTS shopping_list_items CASCADE;")  
    op.execute("DROP TABLE IF EXISTS shopping_lists CASCADE;")  
    op.execute("DROP TABLE IF EXISTS meal_plans CASCADE;")  
    op.execute("DROP TABLE IF EXISTS recipe_ingredients CASCADE;")  
    op.execute("DROP TABLE IF EXISTS recipes CASCADE;")  
    op.execute("DROP TABLE IF EXISTS fridge_items CASCADE;")  
    op.execute("DROP TABLE IF EXISTS user_preferences CASCADE;")  
    op.execute("DROP TABLE IF EXISTS users CASCADE;")