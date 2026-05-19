import AppShell from "@/components/AppShell";
import { recipes } from "@/data/mockData";

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

export default function RecipesPage() {
  return (
    <AppShell>
      <h1 className="page-title">Recipe Collection</h1>

      <input
        className="search-input"
        placeholder="Search recipes or ingredients..."
      />

      <div className="filter-row">
        {filters.map((filter) => (
          <button
            className={`filter-pill ${filter === "All" ? "active" : ""}`}
            key={filter}
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="recipe-grid">
        {recipes.map((recipe) => (
          <div className="recipe-card" key={recipe.title}>
            <div className="recipe-icon">{recipe.icon}</div>
            <div className="recipe-title">{recipe.title}</div>

            <div className="recipe-meta">
              <span>◷ {recipe.time}</span>
              <span>♨ {recipe.calories}</span>
            </div>

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
    </AppShell>
  );
}