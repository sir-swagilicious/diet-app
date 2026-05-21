/**
 * API client for MealMaster FastAPI backend.
 *
 * Auth: POST /api/auth/login | /api/auth/register → JWT Bearer token
 * Protected routes require Authorization: Bearer <access_token>
 */

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
  "http://localhost:8000";

const TOKEN_KEY = "mealmaster_token";
const USER_KEY = "mealmaster_user";

export type AuthUser = {
  id: string;
  email: string;
  full_name?: string;
  auth_provider?: string;
  created_at?: string;
};

export type TokenResponse = {
  access_token: string;
  token_type: string;
  refresh_token?: string | null;
  user: AuthUser;
};

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getAuthUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function setAuthToken(token: string) {
  const normalized = token.trim();
  if (!normalized || normalized.split(".").length !== 3) {
    throw new ApiError("Invalid token received from server", 500);
  }
  localStorage.setItem(TOKEN_KEY, normalized);
}

export function setAuthUser(user: AuthUser) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function clearAuthToken() {
  clearAuth();
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
      throw new ApiError("Not authenticated. Please log in.", 401);
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

    if (response.status === 401 && auth) {
      clearAuth();
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

function saveAuthSession(data: TokenResponse) {
  if (!data?.access_token) {
    throw new ApiError("Response missing access_token", 500);
  }
  setAuthToken(data.access_token);
  if (data.user) {
    setAuthUser(data.user);
  }
}

// --- Auth ---

export async function login(email: string, password: string) {
  const data = await apiRequest<TokenResponse>(
    "/api/auth/login",
    {
      method: "POST",
      body: JSON.stringify({ email, password }),
    },
    false
  );
  saveAuthSession(data);
  return data;
}

export async function register(
  email: string,
  password: string,
  fullName: string
) {
  const data = await apiRequest<TokenResponse>(
    "/api/auth/register",
    {
      method: "POST",
      body: JSON.stringify({
        email,
        password,
        full_name: fullName,
      }),
    },
    false
  );
  saveAuthSession(data);
  return data;
}

export async function getCurrentUser() {
  return apiRequest<AuthUser>("/api/auth/me");
}

export async function debugToken() {
  return apiRequest<Record<string, unknown>>("/api/auth/debug-token");
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
  id: string;
  product_name: string;
  quantity: number;
  unit: string;
  category: string;
  expiration_date?: string | null;
};

export async function getProducts() {
  return apiRequest<ApiProduct[]>("/api/products/");
}

export async function addProduct(product: {
  product_name: string;
  quantity: number;
  unit: string;
  category?: string;
  expiration_date?: string | null;
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
  id: string;
  title: string;
  description: string;
  cooking_time_minutes: number;
  calories?: number;
  tags?: string[];
  source?: string;
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
