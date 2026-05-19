import AppShell from "@/components/AppShell";
import {
  nutritionInsights,
  nutritionStats,
  weeklyCalories,
} from "@/data/mockData";

export default function NutritionPage() {
  return (
    <AppShell>
      <h1 className="page-title">Nutrition Tracking</h1>
      <div className="page-subtitle">
        Monitor your daily intake and meet your goals
      </div>

      <div className="summary-grid four">
        {nutritionStats.map((stat) => (
          <div className="stat-card" key={stat.title}>
            <div className="stat-top">{stat.title}</div>
            <div className="stat-value">{stat.value}</div>

            <div className="progress-track">
              <div
                className={`progress-fill ${
                  stat.color === "green"
                    ? "green"
                    : stat.color === "orange"
                    ? "orange"
                    : ""
                }`}
                style={{ width: `${stat.progress}%` }}
              />
            </div>

            <div className="page-subtitle">{stat.subtitle}</div>
          </div>
        ))}
      </div>

      <div className="nutrition-grid">
        <div className="chart-panel">
          <div className="meal-name">Weekly Calorie Intake</div>

          {weeklyCalories.map((item) => (
            <div className="bar-row" key={item.day}>
              <span>{item.day}</span>
              <div className="bar-track">
                <div
                  className="bar-fill"
                  style={{ width: `${(item.value / 2300) * 100}%` }}
                />
              </div>
              <span>{item.value}</span>
            </div>
          ))}

          <div className="page-subtitle">■ Actual Calories — Goal 2000</div>
        </div>

        <div className="chart-panel">
          <div className="meal-name">Macro Distribution This Week</div>

          <div className="bar-row">
            <span>Protein</span>
            <div className="bar-track">
              <div className="progress-fill green" style={{ width: "65%" }} />
            </div>
            <span>98g</span>
          </div>

          <div className="bar-row">
            <span>Carbs</span>
            <div className="bar-track">
              <div className="progress-fill orange" style={{ width: "75%" }} />
            </div>
            <span>225g</span>
          </div>

          <div className="bar-row">
            <span>Fat</span>
            <div className="bar-track">
              <div className="progress-fill orange" style={{ width: "70%" }} />
            </div>
            <span>69g</span>
          </div>

          <div className="page-subtitle">
            Average daily intake from last 7 days
          </div>
        </div>
      </div>

      <div className="summary-grid" style={{ marginTop: 24 }}>
        <div className="stat-card">
          <div className="stat-value">🏅 7-Day Streak</div>
          <div className="page-subtitle">
            You&apos;ve logged your meals for 7 consecutive days
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-value">↗ Weekly Average</div>
          <div className="page-subtitle">1993 cal/day</div>
        </div>

        <div className="stat-card">
          <div className="stat-value">◎ Goals Met</div>
          <div className="page-subtitle">5 / 7 days</div>
        </div>
      </div>

      <div className="panel">
        <div className="meal-name">Nutritional Insights</div>

        {nutritionInsights.map((item) => (
          <div className="insight-card" key={item.title}>
            <div style={{ fontSize: 26 }}>{item.icon}</div>
            <div>
              <div className="meal-name">{item.title}</div>
              <div className="page-subtitle">{item.text}</div>
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}