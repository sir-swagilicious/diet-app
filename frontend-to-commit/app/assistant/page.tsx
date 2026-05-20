"use client";

import AppShell from "@/components/AppShell";
import { generateAiMealPlan } from "@/services/mockApi";
import {
  ApiError,
  generateAiRecipe,
  getAuthToken,
  mapGeneratedRecipeToAssistant,
  type GeneratedRecipe,
} from "@/services/api";
import { useState } from "react";

type AssistantResult = {
  answer: string;
  recipes: Array<{
    title: string;
    calories: string;
    reason: string;
  }>;
  missingItems: string[];
  fullRecipe?: GeneratedRecipe;
  source: "api" | "mock";
};

export default function AssistantPage() {
  const [prompt, setPrompt] = useState(
    "What can I cook with chicken breast, rice, tomato and cucumber?"
  );
  const [result, setResult] = useState<AssistantResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: "Hello! Log in and start the backend to generate recipes from your fridge via GET /api/recipes/generate.",
    },
  ]);

  const handleGenerate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!prompt.trim()) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      if (getAuthToken()) {
        const recipe = await generateAiRecipe();
        const mapped = mapGeneratedRecipeToAssistant(recipe);

        setMessages((current) => [
          ...current,
          { role: "user", text: prompt },
          {
            role: "ai",
            text: mapped.answer,
          },
        ]);

        setResult({
          ...mapped,
          source: "api",
        });
      } else {
        throw new ApiError("Log in to use the backend API", 401);
      }
    } catch (err) {
      const mockResult = await generateAiMealPlan(prompt);

      setMessages((current) => [
        ...current,
        { role: "user", text: prompt },
        { role: "ai", text: mockResult.answer },
      ]);

      setResult({
        answer: mockResult.answer,
        recipes: mockResult.recipes,
        missingItems: mockResult.missingItems,
        source: "mock",
      });

      if (err instanceof ApiError) {
        setError(`${err.message} — showing demo data instead.`);
      } else {
        setError(
          "Backend unavailable — showing demo data. Start API on port 8000."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <h1 className="page-title">AI Assistant</h1>
      <div className="page-subtitle">
        Uses backend <code>GET /api/recipes/generate</code> when logged in
      </div>

      {error && (
        <div className="panel" style={{ marginTop: 14 }}>
          <div className="page-subtitle" style={{ color: "#d97706" }}>
            {error}
          </div>
        </div>
      )}

      <div className="assistant-layout">
        <section className="chat-card">
          <div className="chat-window">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`chat-message ${message.role}`}
              >
                {message.text}
              </div>
            ))}
          </div>

          <form className="chat-form" onSubmit={handleGenerate}>
            <input
              className="chat-input"
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="Ask AI what to cook today..."
            />

            <button className="primary-btn" type="submit" disabled={loading}>
              {loading ? "Generating..." : "Generate"}
            </button>
          </form>
        </section>

        <aside className="panel">
          <div className="meal-name">AI Context</div>

          <div className="ai-result-card">
            <div className="expiring-title">Backend</div>
            <div className="page-subtitle">
              {getAuthToken()
                ? "JWT set — calls /api/recipes/generate"
                : "Not logged in — demo mode only"}
            </div>
          </div>

          <div className="ai-result-card">
            <div className="expiring-title">Model</div>
            <div className="page-subtitle">Llama 3 via Ollama (backend)</div>
          </div>
        </aside>
      </div>

      {result && (
        <div className="panel" style={{ marginTop: 18 }}>
          <div className="meal-name">
            Generated Meal Plan
            {result.source === "api" ? " (from API)" : " (demo)"}
          </div>
          <div className="page-subtitle">{result.answer}</div>

          {result.fullRecipe && (
            <div className="page-subtitle" style={{ marginTop: 8 }}>
              {result.fullRecipe.difficulty} · {result.fullRecipe.servings}{" "}
              servings · {result.fullRecipe.cooking_time_minutes} min
            </div>
          )}

          <div className="ai-recipe-list">
            {result.recipes.map((recipe) => (
              <div className="ai-recipe-card" key={recipe.title}>
                <div className="meal-name">{recipe.title}</div>
                <div className="meal-meta">
                  <span>{recipe.calories}</span>
                </div>
                <div className="page-subtitle">{recipe.reason}</div>
              </div>
            ))}
          </div>

          {result.fullRecipe && result.fullRecipe.instructions.length > 0 && (
            <>
              <h2 className="section-title">Instructions</h2>
              <ol className="page-subtitle" style={{ paddingLeft: 18 }}>
                {result.fullRecipe.instructions.map((step) => (
                  <li key={step} style={{ marginBottom: 8 }}>
                    {step}
                  </li>
                ))}
              </ol>
            </>
          )}

          <h2 className="section-title">Missing Ingredients</h2>

          <div className="tag-row">
            {result.missingItems.length > 0 ? (
              result.missingItems.map((item) => (
                <span className="small-tag" key={item}>
                  {item}
                </span>
              ))
            ) : (
              <span className="page-subtitle">None — you have everything!</span>
            )}
          </div>
        </div>
      )}
    </AppShell>
  );
}
