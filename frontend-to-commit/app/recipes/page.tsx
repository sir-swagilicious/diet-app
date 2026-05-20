"use client";

import { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/AppShell";
import { recipes as builtinRecipes } from "@/data/mockData";
import {
  DEFAULT_FOOD_EMOJI,
  FOOD_EMOJIS,
  type FoodEmoji,
} from "@/data/foodEmojis";
import {
  loadLocalCustomRecipes,
  saveLocalCustomRecipe,
  type RecipeCard,
} from "@/lib/customRecipes";
import { getAuthToken } from "@/services/api";

const filters = [
  "All",
  "Healthy",
  "High Protein",
  "Low Carb",
  "Quick",
  "Comfort Food",
  "Italian",
  "Vegan",
  "Omega-3",
  "Mexican",
  "Family Favorite",
  "Breakfast",
];

const builtinCards: RecipeCard[] = builtinRecipes.map((recipe) => ({
  id: `builtin-${recipe.title}`,
  icon: recipe.icon,
  title: recipe.title,
  time: recipe.time,
  calories: recipe.calories,
  tags: recipe.tags,
  source: "builtin" as const,
}));

export default function RecipesPage() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [customRecipes, setCustomRecipes] = useState<RecipeCard[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const [newRecipe, setNewRecipe] = useState({
    title: "",
    icon: DEFAULT_FOOD_EMOJI as FoodEmoji,
    time: "30 min",
    calories: "400 cal",
    tags: "",
  });

  useEffect(() => {
    setCustomRecipes(loadLocalCustomRecipes());
  }, []);

  const allRecipes = useMemo(
    () => [...customRecipes, ...builtinCards],
    [customRecipes]
  );

  const filteredRecipes = useMemo(() => {
    const query = search.trim().toLowerCase();

    return allRecipes.filter((recipe) => {
      const matchesFilter =
        activeFilter === "All" || recipe.tags.includes(activeFilter);

      const matchesSearch =
        !query ||
        recipe.title.toLowerCase().includes(query) ||
        recipe.tags.some((tag) => tag.toLowerCase().includes(query));

      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, search, allRecipes]);

  const handleCreateRecipe = () => {
    if (!newRecipe.title.trim()) {
      return;
    }

    const payload = {
      title: newRecipe.title.trim(),
      icon: newRecipe.icon,
      time: newRecipe.time.trim() || "30 min",
      calories: newRecipe.calories.trim() || "400 cal",
      tags: newRecipe.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    };

    const saved = saveLocalCustomRecipe(payload);
    setCustomRecipes((current) => [saved, ...current]);
    setSaveMessage(
      getAuthToken()
        ? "Recipe saved locally. AI recipes sync via /api/recipes when you use Assistant."
        : "Recipe saved in this browser. Log in to use the backend API."
    );

    setNewRecipe({
      title: "",
      icon: DEFAULT_FOOD_EMOJI,
      time: "30 min",
      calories: "400 cal",
      tags: "",
    });
    setShowCreateForm(false);
    window.setTimeout(() => setSaveMessage(""), 4000);
  };

  return (
    <AppShell>
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Recipe Collection</h1>
          <div className="page-subtitle">
            Built-in recipes plus your own (emoji icons from{" "}
            <code>data/foodEmojis.ts</code>)
          </div>
        </div>

        <button
          type="button"
          className="primary-btn"
          onClick={() => setShowCreateForm((open) => !open)}
        >
          {showCreateForm ? "Close" : "+ New Recipe"}
        </button>
      </div>

      {saveMessage && (
        <div className="panel" style={{ marginBottom: 16 }}>
          <div className="page-subtitle">{saveMessage}</div>
        </div>
      )}

      {showCreateForm && (
        <div className="inline-form-panel">
          <div className="meal-name">Create recipe</div>
          <div className="page-subtitle" style={{ marginTop: 6 }}>
            Pick a food emoji for the card
          </div>

          <div className="emoji-picker" style={{ marginTop: 14 }}>
            {FOOD_EMOJIS.map((item) => (
              <button
                type="button"
                key={item.emoji}
                className={`emoji-option ${
                  newRecipe.icon === item.emoji ? "active" : ""
                }`}
                title={item.label}
                onClick={() =>
                  setNewRecipe((current) => ({
                    ...current,
                    icon: item.emoji,
                  }))
                }
              >
                {item.emoji}
              </button>
            ))}
          </div>

          <div className="inline-form-grid" style={{ marginTop: 16 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="recipe-title">
                Title
              </label>
              <input
                id="recipe-title"
                className="form-input"
                value={newRecipe.title}
                onChange={(event) =>
                  setNewRecipe((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
                placeholder="e.g. Avocado Toast"
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="recipe-time">
                Cook time
              </label>
              <input
                id="recipe-time"
                className="form-input"
                value={newRecipe.time}
                onChange={(event) =>
                  setNewRecipe((current) => ({
                    ...current,
                    time: event.target.value,
                  }))
                }
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="recipe-calories">
                Calories
              </label>
              <input
                id="recipe-calories"
                className="form-input"
                value={newRecipe.calories}
                onChange={(event) =>
                  setNewRecipe((current) => ({
                    ...current,
                    calories: event.target.value,
                  }))
                }
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="recipe-tags">
                Tags (comma-separated)
              </label>
              <input
                id="recipe-tags"
                className="form-input"
                value={newRecipe.tags}
                onChange={(event) =>
                  setNewRecipe((current) => ({
                    ...current,
                    tags: event.target.value,
                  }))
                }
                placeholder="Healthy, Quick"
              />
            </div>
          </div>

          <div className="recipe-preview-row">
            <span className="recipe-preview-label">Preview:</span>
            <span className="recipe-preview-icon">{newRecipe.icon}</span>
            <span className="meal-name">
              {newRecipe.title.trim() || "Your recipe title"}
            </span>
          </div>

          <div className="inline-form-actions">
            <button
              type="button"
              className="primary-btn"
              onClick={handleCreateRecipe}
            >
              Save recipe
            </button>
            <button
              type="button"
              className="secondary-btn"
              onClick={() => setShowCreateForm(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <input
        className="search-input"
        placeholder="Search recipes or ingredients..."
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />

      <div className="filter-row">
        {filters.map((filter) => (
          <button
            type="button"
            className={`filter-pill ${activeFilter === filter ? "active" : ""}`}
            key={filter}
            onClick={() => setActiveFilter(filter)}
          >
            {filter}
          </button>
        ))}
      </div>

      {filteredRecipes.length === 0 ? (
        <div className="panel">
          <div className="meal-name">No recipes found</div>
          <div className="page-subtitle">
            Try another filter or search term.
          </div>
        </div>
      ) : (
        <div className="recipe-grid">
          {filteredRecipes.map((recipe) => (
            <div className="recipe-card" key={recipe.id}>
              <div className="recipe-icon">{recipe.icon}</div>
              <div className="recipe-title">{recipe.title}</div>

              <div className="recipe-meta">
                <span>◷ {recipe.time}</span>
                <span>♨ {recipe.calories}</span>
              </div>

              {recipe.source === "custom" && (
                <div className="page-subtitle" style={{ marginBottom: 8 }}>
                  Your recipe
                </div>
              )}

              <div className="tag-row">
                {recipe.tags.map((tag) => (
                  <span className="small-tag" key={tag}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
