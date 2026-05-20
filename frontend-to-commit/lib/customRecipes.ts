const STORAGE_KEY = "mealmaster_custom_recipes";

export type RecipeCard = {
  id: string;
  icon: string;
  title: string;
  time: string;
  calories: string;
  tags: string[];
  source: "builtin" | "custom";
};

export type CreateRecipeInput = {
  title: string;
  icon: string;
  time: string;
  calories: string;
  tags: string[];
};

export function loadLocalCustomRecipes(): RecipeCard[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as RecipeCard[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveLocalCustomRecipe(payload: CreateRecipeInput): RecipeCard {
  const existing = loadLocalCustomRecipes();
  const recipe: RecipeCard = {
    id: `local-${Date.now()}`,
    icon: payload.icon,
    title: payload.title,
    time: payload.time,
    calories: payload.calories,
    tags: payload.tags,
    source: "custom",
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify([recipe, ...existing]));
  return recipe;
}
