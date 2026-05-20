-- MealMaster test data
-- This file adds sample data for testing the database.

-- Осторожно:
-- Эта команда очищает все таблицы.
-- Пока проект учебный и база тестовая — это нормально.

TRUNCATE TABLE
    ai_requests,
    shopping_list_items,
    shopping_lists,
    meal_plans,
    recipe_ingredients,
    recipes,
    fridge_items,
    user_preferences,
    users
RESTART IDENTITY CASCADE;


WITH new_user AS (
    INSERT INTO users (
        email,
        password_hash,
        full_name,
        auth_provider,
        is_mfa_enabled
    )
    VALUES (
        'test@example.com',
        'test_password_hash',
        'Test User',
        'local',
        false
    )
    RETURNING id
),

new_preferences AS (
    INSERT INTO user_preferences (
        user_id,
        diet_type,
        calorie_goal,
        allergies,
        disliked_products,
        preferred_cuisines
    )
    SELECT
        id,
        'balanced',
        2200,
        '["nuts"]'::jsonb,
        '["onion"]'::jsonb,
        '["italian", "asian"]'::jsonb
    FROM new_user
    RETURNING id
),

fridge_insert AS (
    INSERT INTO fridge_items (
        user_id,
        product_name,
        quantity,
        unit,
        category,
        expiration_date
    )
    SELECT id, 'Chicken breast', 500, 'g', 'meat', CURRENT_DATE + 3
    FROM new_user

    UNION ALL

    SELECT id, 'Tomato', 4, 'pcs', 'vegetables', CURRENT_DATE + 5
    FROM new_user

    UNION ALL

    SELECT id, 'Cucumber', 2, 'pcs', 'vegetables', CURRENT_DATE + 4
    FROM new_user

    UNION ALL

    SELECT id, 'Rice', 1000, 'g', 'grains', CURRENT_DATE + 60
    FROM new_user

    UNION ALL

    SELECT id, 'Milk', 1, 'l', 'dairy', CURRENT_DATE + 2
    FROM new_user

    RETURNING id
),

recipe_chicken_salad AS (
    INSERT INTO recipes (
        created_by_user_id,
        title,
        description,
        instructions,
        cooking_time_minutes,
        calories,
        proteins,
        fats,
        carbs,
        tags,
        source
    )
    SELECT
        id,
        'Chicken Salad',
        'Simple healthy salad with chicken and vegetables.',
        '["Boil or fry chicken breast", "Cut tomato and cucumber", "Mix all ingredients", "Serve fresh"]'::jsonb,
        25,
        430,
        38,
        14,
        28,
        '["healthy", "high protein", "quick"]'::jsonb,
        'ai'
    FROM new_user
    RETURNING id
),

recipe_stir_fry AS (
    INSERT INTO recipes (
        created_by_user_id,
        title,
        description,
        instructions,
        cooking_time_minutes,
        calories,
        proteins,
        fats,
        carbs,
        tags,
        source
    )
    SELECT
        id,
        'Vegetable Rice Stir Fry',
        'Rice with vegetables for a simple dinner.',
        '["Boil rice", "Cut vegetables", "Fry vegetables", "Add rice and mix"]'::jsonb,
        30,
        520,
        12,
        10,
        95,
        '["vegetarian", "dinner", "budget"]'::jsonb,
        'manual'
    FROM new_user
    RETURNING id
),

chicken_salad_ingredients AS (
    INSERT INTO recipe_ingredients (
        recipe_id,
        product_name,
        quantity,
        unit,
        is_optional
    )
    SELECT
        recipe_chicken_salad.id,
        ingredient.product_name,
        ingredient.quantity,
        ingredient.unit,
        ingredient.is_optional
    FROM recipe_chicken_salad
    CROSS JOIN (
        VALUES
            ('Chicken breast', 200, 'g', false),
            ('Tomato', 2, 'pcs', false),
            ('Cucumber', 1, 'pcs', false),
            ('Olive oil', 20, 'ml', true)
    ) AS ingredient(product_name, quantity, unit, is_optional)
    RETURNING id
),

stir_fry_ingredients AS (
    INSERT INTO recipe_ingredients (
        recipe_id,
        product_name,
        quantity,
        unit,
        is_optional
    )
    SELECT
        recipe_stir_fry.id,
        ingredient.product_name,
        ingredient.quantity,
        ingredient.unit,
        ingredient.is_optional
    FROM recipe_stir_fry
    CROSS JOIN (
        VALUES
            ('Rice', 150, 'g', false),
            ('Tomato', 1, 'pcs', false),
            ('Carrot', 1, 'pcs', false),
            ('Soy sauce', 15, 'ml', true)
    ) AS ingredient(product_name, quantity, unit, is_optional)
    RETURNING id
),

meal_plan_lunch AS (
    INSERT INTO meal_plans (
        user_id,
        recipe_id,
        plan_date,
        meal_type
    )
    SELECT
        new_user.id,
        recipe_chicken_salad.id,
        CURRENT_DATE,
        'lunch'
    FROM new_user, recipe_chicken_salad
    RETURNING id
),

meal_plan_dinner AS (
    INSERT INTO meal_plans (
        user_id,
        recipe_id,
        plan_date,
        meal_type
    )
    SELECT
        new_user.id,
        recipe_stir_fry.id,
        CURRENT_DATE,
        'dinner'
    FROM new_user, recipe_stir_fry
    RETURNING id
),

shopping_list AS (
    INSERT INTO shopping_lists (
        user_id,
        title,
        status
    )
    SELECT
        id,
        'Missing products for today',
        'active'
    FROM new_user
    RETURNING id
),

shopping_items AS (
    INSERT INTO shopping_list_items (
        shopping_list_id,
        product_name,
        quantity,
        unit,
        is_bought
    )
    SELECT
        shopping_list.id,
        item.product_name,
        item.quantity,
        item.unit,
        false
    FROM shopping_list
    CROSS JOIN (
        VALUES
            ('Olive oil', 1, 'bottle'),
            ('Carrot', 2, 'pcs'),
            ('Soy sauce', 1, 'bottle')
    ) AS item(product_name, quantity, unit)
    RETURNING id
),

ai_request AS (
    INSERT INTO ai_requests (
        user_id,
        request_type,
        prompt,
        response,
        model_name
    )
    SELECT
        id,
        'meal_plan',
        'Create a meal plan using chicken breast, tomato, cucumber, rice and milk.',
        '{
            "message": "Generated meal plan for lunch and dinner.",
            "recipes": ["Chicken Salad", "Vegetable Rice Stir Fry"]
        }'::jsonb,
        'llama3'
    FROM new_user
    RETURNING id
)

SELECT 'Seed data inserted successfully' AS result;