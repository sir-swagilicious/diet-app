-- MealMaster useful SQL queries
-- These queries show how the database can be used by the application.


-- 1. Show all users

SELECT
    id,
    email,
    full_name,
    auth_provider,
    is_mfa_enabled,
    created_at
FROM users;


-- 2. Show user preferences

SELECT
    users.email,
    user_preferences.diet_type,
    user_preferences.calorie_goal,
    user_preferences.allergies,
    user_preferences.disliked_products,
    user_preferences.preferred_cuisines
FROM users
JOIN user_preferences
    ON user_preferences.user_id = users.id;


-- 3. Show user's fridge items

SELECT
    users.email,
    fridge_items.product_name,
    fridge_items.quantity,
    fridge_items.unit,
    fridge_items.category,
    fridge_items.expiration_date,
    CASE
        WHEN fridge_items.expiration_date < CURRENT_DATE THEN 'expired'
        WHEN fridge_items.expiration_date <= CURRENT_DATE + 2 THEN 'expires soon'
        ELSE 'fresh'
    END AS product_status
FROM fridge_items
JOIN users
    ON users.id = fridge_items.user_id
ORDER BY fridge_items.expiration_date;


-- 4. Show recipes with calories and macros

SELECT
    title,
    calories,
    proteins,
    fats,
    carbs,
    cooking_time_minutes,
    tags,
    source
FROM recipes
ORDER BY title;


-- 5. Show recipe ingredients

SELECT
    recipes.title AS recipe_title,
    recipe_ingredients.product_name,
    recipe_ingredients.quantity,
    recipe_ingredients.unit,
    recipe_ingredients.is_optional
FROM recipes
JOIN recipe_ingredients
    ON recipe_ingredients.recipe_id = recipes.id
ORDER BY recipes.title, recipe_ingredients.product_name;


-- 6. Show today's meal plan

SELECT
    users.email,
    meal_plans.plan_date,
    meal_plans.meal_type,
    recipes.title AS recipe_title,
    recipes.calories,
    recipes.proteins,
    recipes.fats,
    recipes.carbs
FROM meal_plans
JOIN users
    ON users.id = meal_plans.user_id
JOIN recipes
    ON recipes.id = meal_plans.recipe_id
WHERE meal_plans.plan_date = CURRENT_DATE
ORDER BY meal_plans.meal_type;


-- 7. Calculate missing ingredients for today's meal plan

WITH required_products AS (
    SELECT
        meal_plans.user_id,
        recipe_ingredients.product_name,
        recipe_ingredients.unit,
        SUM(recipe_ingredients.quantity) AS required_quantity
    FROM meal_plans
    JOIN recipe_ingredients
        ON recipe_ingredients.recipe_id = meal_plans.recipe_id
    WHERE meal_plans.plan_date = CURRENT_DATE
    GROUP BY
        meal_plans.user_id,
        recipe_ingredients.product_name,
        recipe_ingredients.unit
),

available_products AS (
    SELECT
        user_id,
        product_name,
        unit,
        SUM(quantity) AS available_quantity
    FROM fridge_items
    GROUP BY
        user_id,
        product_name,
        unit
)

SELECT
    required_products.product_name,
    required_products.required_quantity,
    COALESCE(available_products.available_quantity, 0) AS available_quantity,
    GREATEST(
        required_products.required_quantity - COALESCE(available_products.available_quantity, 0),
        0
    ) AS missing_quantity,
    required_products.unit,
    CASE
        WHEN COALESCE(available_products.available_quantity, 0) >= required_products.required_quantity
            THEN 'green'
        ELSE 'red'
    END AS ingredient_status
FROM required_products
LEFT JOIN available_products
    ON available_products.user_id = required_products.user_id
    AND LOWER(available_products.product_name) = LOWER(required_products.product_name)
    AND available_products.unit = required_products.unit
ORDER BY ingredient_status DESC, required_products.product_name;


-- 8. Show only missing products

WITH required_products AS (
    SELECT
        meal_plans.user_id,
        recipe_ingredients.product_name,
        recipe_ingredients.unit,
        SUM(recipe_ingredients.quantity) AS required_quantity
    FROM meal_plans
    JOIN recipe_ingredients
        ON recipe_ingredients.recipe_id = meal_plans.recipe_id
    WHERE meal_plans.plan_date = CURRENT_DATE
    GROUP BY
        meal_plans.user_id,
        recipe_ingredients.product_name,
        recipe_ingredients.unit
),

available_products AS (
    SELECT
        user_id,
        product_name,
        unit,
        SUM(quantity) AS available_quantity
    FROM fridge_items
    GROUP BY
        user_id,
        product_name,
        unit
)

SELECT
    required_products.product_name,
    GREATEST(
        required_products.required_quantity - COALESCE(available_products.available_quantity, 0),
        0
    ) AS missing_quantity,
    required_products.unit
FROM required_products
LEFT JOIN available_products
    ON available_products.user_id = required_products.user_id
    AND LOWER(available_products.product_name) = LOWER(required_products.product_name)
    AND available_products.unit = required_products.unit
WHERE COALESCE(available_products.available_quantity, 0) < required_products.required_quantity
ORDER BY required_products.product_name;


-- 9. Show shopping list

SELECT
    shopping_lists.title,
    shopping_lists.status,
    shopping_list_items.product_name,
    shopping_list_items.quantity,
    shopping_list_items.unit,
    shopping_list_items.is_bought
FROM shopping_lists
JOIN shopping_list_items
    ON shopping_list_items.shopping_list_id = shopping_lists.id
ORDER BY shopping_list_items.product_name;


-- 10. Show AI request history

SELECT
    users.email,
    ai_requests.request_type,
    ai_requests.prompt,
    ai_requests.response,
    ai_requests.model_name,
    ai_requests.created_at
FROM ai_requests
LEFT JOIN users
    ON users.id = ai_requests.user_id
ORDER BY ai_requests.created_at DESC;