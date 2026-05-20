import {
  expiringSoon,
  fridgeGroups,
  fridgeSuggestions,
  nutritionInsights,
  nutritionStats,
  recipes,
  shoppingGroups,
  todayMeals,
  todayStats,
  weekPlan,
  weeklyCalories,
} from "@/data/mockData";

export async function getDashboardData() {
  return {
    todayStats,
    todayMeals,
    weekPlan,
    expiringSoon,
  };
}

export async function getRecipes() {
  return recipes;
}

export async function getFridgeData() {
  return {
    fridgeGroups,
    fridgeSuggestions,
  };
}

export async function getShoppingData() {
  return shoppingGroups;
}

export async function getNutritionData() {
  return {
    nutritionStats,
    weeklyCalories,
    nutritionInsights,
  };
}

export async function generateAiMealPlan(prompt: string) {
  return {
    prompt,
    answer:
      "Based on your fridge items, I suggest a balanced meal plan with grilled chicken salad for lunch and vegetable rice stir fry for dinner.",
    recipes: [
      {
        title: "Grilled Chicken Salad",
        calories: "380 cal",
        reason: "Uses chicken breast, tomatoes, and greens from your fridge.",
      },
      {
        title: "Vegetable Rice Stir Fry",
        calories: "520 cal",
        reason: "Uses rice and vegetables, with only a few missing ingredients.",
      },
    ],
    missingItems: ["Olive oil", "Soy sauce", "Carrot"],
  };
}