"use client";

import AppShell from "@/components/AppShell";
import { generateAiMealPlan } from "@/services/mockApi";
import { useState } from "react";

type AiRecipe = {
  title: string;
  calories: string;
  reason: string;
};

type AiResult = {
  prompt: string;
  answer: string;
  recipes: AiRecipe[];
  missingItems: string[];
};

export default function AssistantPage() {
  const [prompt, setPrompt] = useState(
    "What can I cook with chicken breast, rice, tomato and cucumber?"
  );
  const [result, setResult] = useState<AiResult | null>(null);
  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: "Hello! I can help you plan meals based on your fridge, diet goals, and missing ingredients.",
    },
  ]);

  const handleGenerate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!prompt.trim()) {
      return;
    }

    const aiResult = await generateAiMealPlan(prompt);

    setMessages((current) => [
      ...current,
      { role: "user", text: prompt },
      { role: "ai", text: aiResult.answer },
    ]);

    setResult(aiResult);
  };

  return (
    <AppShell>
      <h1 className="page-title">AI Assistant</h1>
      <div className="page-subtitle">
        Ask MealMaster to generate meals from your fridge and preferences
      </div>

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

            <button className="primary-btn" type="submit">
              Generate
            </button>
          </form>
        </section>

        <aside className="panel">
          <div className="meal-name">AI Context</div>

          <div className="ai-result-card">
            <div className="expiring-title">Current fridge</div>
            <div className="page-subtitle">
              Chicken breast, tomato, cucumber, rice, milk
            </div>
          </div>

          <div className="ai-result-card">
            <div className="expiring-title">User preferences</div>
            <div className="page-subtitle">
              Balanced diet, 2200 calories, allergic to nuts
            </div>
          </div>

          <div className="ai-result-card">
            <div className="expiring-title">Model</div>
            <div className="page-subtitle">Llama 3 via Ollama</div>
          </div>
        </aside>
      </div>

      {result && (
        <div className="panel" style={{ marginTop: 18 }}>
          <div className="meal-name">Generated Meal Plan</div>
          <div className="page-subtitle">{result.answer}</div>

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

          <h2 className="section-title">Missing Ingredients</h2>

          <div className="tag-row">
            {result.missingItems.map((item) => (
              <span className="small-tag" key={item}>
                {item}
              </span>
            ))}
          </div>
        </div>
      )}
    </AppShell>
  );
}