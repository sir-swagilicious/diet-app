/**
 * API client for the initial FastAPI backend (Diet Control API).
 *
 * Endpoints:
 *   POST /api/auth/login | register
 *   GET  /api/health
 *   GET  /api/products/        POST /api/products/
 *   GET  /api/recipes/generate GET /api/recipes/history
 */

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
  "http://localhost:8000";

const TOKEN_KEY = "mealmaster_token";

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearAuthToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function isApiConfigured() {
  return Boolean(API_BASE);
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  auth = true
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (auth) {
    const token = getAuthToken();
    if (!token) {
      throw new ApiError("Not authenticated", 401);
    }
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let detail = response.statusText;
    try {
      const body = await response.json();
      detail = body.detail ?? body.message ?? detail;
    } catch {
      /* ignore */
    }
    throw new ApiError(
      typeof detail === "string" ? detail : JSON.stringify(detail),
      response.status
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

// --- Auth ---

export async function login(email: string, password: string) {
  const data = await apiRequest<{ access_token: string; token_type: string }>(
    "/api/auth/login",
    {
      method: "POST",
      body: JSON.stringify({ email, password }),
    },
    false
  );
  setAuthToken(data.access_token);
  return data;
}

export async function register(
  email: string,
  password: string,
  name: string
) {
  const data = await apiRequest<{ access_token: string; token_type: string }>(
    "/api/auth/register",
    {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
    },
    false
  );
  setAuthToken(data.access_token);
  return data;
}

// --- Health ---

export async function checkHealth() {
  return apiRequest<{
    status: string;
    database: string;
    ollama: string;
  }>("/api/health", {}, false);
}

// --- Products (fridge) ---

export type ApiProduct = {
  id: number;
  name: string;
  quantity: number;
  unit: string;
  category: string;
};

export async function getProducts() {
  return apiRequest<ApiProduct[]>("/api/products/");
}

export async function addProduct(product: {
  name: string;
  quantity: number;
  unit: string;
  category?: string;
}) {
  return apiRequest<{ status: string; message: string }>("/api/products/", {
    method: "POST",
    body: JSON.stringify(product),
  });
}

// --- Recipes (AI) ---

export type GeneratedIngredient = {
  name: string;
  amount: string;
  notes?: string | null;
};

export type GeneratedRecipe = {
  title: string;
  description: string;
  cooking_time_minutes: number;
  difficulty: string;
  servings: number;
  ingredients_available: GeneratedIngredient[];
  ingredients_missing: GeneratedIngredient[];
  instructions: string[];
  nutritional_info: {
    calories_kcal: number;
    proteins_g: number;
    fats_g: number;
    carbs_g: number;
    sugars_g: number;
  };
  tips?: string | null;
};

export type RecipeHistoryItem = {
  id: number;
  title: string;
  description: string;
  cooking_time_minutes: number;
  difficulty: string;
  servings: number;
  created_at: string;
};

export async function generateAiRecipe() {
  return apiRequest<GeneratedRecipe>("/api/recipes/generate");
}

export async function getRecipeHistory(limit = 10, offset = 0) {
  return apiRequest<RecipeHistoryItem[]>(
    `/api/recipes/history?limit=${limit}&offset=${offset}`
  );
}

/** Map backend AI recipe to assistant UI shape */
export function mapGeneratedRecipeToAssistant(recipe: GeneratedRecipe) {
  const calories = `${Math.round(recipe.nutritional_info.calories_kcal)} kcal / 100g`;

  return {
    answer: recipe.description,
    recipes: [
      {
        title: recipe.title,
        calories: `${recipe.cooking_time_minutes} min · ${calories}`,
        reason:
          recipe.tips ??
          recipe.instructions[0] ??
          `Difficulty: ${recipe.difficulty}`,
      },
    ],
    missingItems: recipe.ingredients_missing.map((item) => item.name),
    fullRecipe: recipe,
  };
}
