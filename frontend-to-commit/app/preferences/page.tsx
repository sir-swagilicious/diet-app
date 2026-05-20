"use client";

import AppShell from "@/components/AppShell";
import { useState } from "react";

const dietTypes = ["Balanced", "Vegan", "Vegetarian", "Keto", "Low Carb"];
const allergies = ["Nuts", "Milk", "Eggs", "Seafood", "Gluten"];
const cuisines = ["Italian", "Asian", "Mexican", "Mediterranean", "Russian"];
const dislikedProducts = ["Onion", "Mushrooms", "Broccoli", "Fish", "Beans"];

export default function PreferencesPage() {
  const [saved, setSaved] = useState(false);
  const [selectedDiet, setSelectedDiet] = useState("Balanced");
  const [selectedAllergies, setSelectedAllergies] = useState(["Nuts"]);
  const [selectedCuisines, setSelectedCuisines] = useState([
    "Italian",
    "Asian",
  ]);
  const [selectedDisliked, setSelectedDisliked] = useState(["Onion"]);

  const toggleValue = (
    value: string,
    list: string[],
    setList: (values: string[]) => void
  ) => {
    if (list.includes(value)) {
      setList(list.filter((item) => item !== value));
    } else {
      setList([...list, value]);
    }
  };

  return (
    <AppShell>
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Preferences</h1>
          <div className="page-subtitle">
            Set your diet, allergies, calorie goal and food preferences
          </div>
        </div>

        <button
          type="button"
          className="primary-btn"
          onClick={() => {
            setSaved(true);
            window.setTimeout(() => setSaved(false), 2200);
          }}
        >
          {saved ? "Saved ✓" : "Save Preferences"}
        </button>
      </div>

      <div className="preference-grid">
        <section className="preference-card">
          <div className="meal-name">Diet Type</div>
          <div className="page-subtitle">
            Choose the main diet style for your meal plan
          </div>

          <div className="preference-options">
            {dietTypes.map((diet) => (
              <button
                type="button"
                key={diet}
                className={`option-pill ${
                  selectedDiet === diet ? "active" : ""
                }`}
                onClick={() => setSelectedDiet(diet)}
              >
                {diet}
              </button>
            ))}
          </div>
        </section>

        <section className="preference-card">
          <div className="meal-name">Calorie Goal</div>
          <div className="page-subtitle">
            Daily target used for meal planning
          </div>

          <div className="form-group" style={{ marginTop: 16 }}>
            <label className="form-label" htmlFor="calories">
              Daily calories
            </label>
            <input
              id="calories"
              className="form-input"
              type="number"
              defaultValue={2200}
            />
          </div>
        </section>

        <section className="preference-card">
          <div className="meal-name">Allergies</div>
          <div className="page-subtitle">
            AI should avoid these ingredients
          </div>

          <div className="preference-options">
            {allergies.map((item) => (
              <button
                type="button"
                key={item}
                className={`option-pill ${
                  selectedAllergies.includes(item) ? "active" : ""
                }`}
                onClick={() =>
                  toggleValue(item, selectedAllergies, setSelectedAllergies)
                }
              >
                {item}
              </button>
            ))}
          </div>
        </section>

        <section className="preference-card">
          <div className="meal-name">Preferred Cuisines</div>
          <div className="page-subtitle">
            MealMaster will use these cuisines more often
          </div>

          <div className="preference-options">
            {cuisines.map((item) => (
              <button
                type="button"
                key={item}
                className={`option-pill ${
                  selectedCuisines.includes(item) ? "active" : ""
                }`}
                onClick={() =>
                  toggleValue(item, selectedCuisines, setSelectedCuisines)
                }
              >
                {item}
              </button>
            ))}
          </div>
        </section>

        <section className="preference-card full">
          <div className="meal-name">Disliked Products</div>
          <div className="page-subtitle">
            These products will be used less often or excluded from recipes
          </div>

          <div className="preference-options">
            {dislikedProducts.map((item) => (
              <button
                type="button"
                key={item}
                className={`option-pill ${
                  selectedDisliked.includes(item) ? "active" : ""
                }`}
                onClick={() =>
                  toggleValue(item, selectedDisliked, setSelectedDisliked)
                }
              >
                {item}
              </button>
            ))}
          </div>
        </section>

        <section className="preference-card full">
          <div className="meal-name">Connected Database Fields</div>
          <div className="page-subtitle">
            This page matches the database table user_preferences.
          </div>

          <div className="table-card" style={{ marginTop: 14 }}>
            <table className="simple-table">
              <thead>
                <tr>
                  <th>Frontend field</th>
                  <th>Database field</th>
                  <th>Type</th>
                </tr>
              </thead>

              <tbody>
                <tr>
                  <td>Diet Type</td>
                  <td>diet_type</td>
                  <td>TEXT</td>
                </tr>
                <tr>
                  <td>Calorie Goal</td>
                  <td>calorie_goal</td>
                  <td>INT</td>
                </tr>
                <tr>
                  <td>Allergies</td>
                  <td>allergies</td>
                  <td>JSONB</td>
                </tr>
                <tr>
                  <td>Disliked Products</td>
                  <td>disliked_products</td>
                  <td>JSONB</td>
                </tr>
                <tr>
                  <td>Preferred Cuisines</td>
                  <td>preferred_cuisines</td>
                  <td>JSONB</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AppShell>
  );
}