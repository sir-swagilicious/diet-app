import Link from "next/link";
import ApiStatus from "@/components/ApiStatus";
import AppShell from "@/components/AppShell";
import { expiringSoon, todayMeals, todayStats, weekPlan } from "@/data/mockData";

export default function DashboardPage() {
  return (
    <AppShell>
      <section>
        <ApiStatus />
        <h1 className="page-title">Welcome back!</h1>
        <div className="page-subtitle">Here&apos;s your meal plan for today</div>

        <div className="stats-grid">
          {todayStats.map((stat) => (
            <div className="stat-card" key={stat.title}>
              <div className="stat-top">
                <span>{stat.title}</span>
                <span>{stat.icon}</span>
              </div>

              <div className="stat-value">{stat.value}</div>

              {stat.progress > 0 && (
                <div className="progress-track">
                  <div
                    className={`progress-fill ${stat.color === "green"
                      ? "green"
                      : stat.color === "orange"
                        ? "orange"
                        : ""
                      }`}
                    style={{ width: `${stat.progress}%` }}
                  />
                </div>
              )}

              {stat.note && <div className="page-subtitle">{stat.note}</div>}
            </div>
          ))}
        </div>

        <h2 className="section-title">Today&apos;s Meal Plan</h2>

        <div className="meal-grid">
          {todayMeals.map((meal) => (
            <div className="meal-card" key={meal.name}>
              <div className="meal-card-head">
                <span>{meal.mealType}</span>
                <span className="meal-time">{meal.time}</span>
              </div>

              <div className="food-icon">{meal.icon}</div>

              <div className="meal-name">{meal.name}</div>

              <div className="meal-meta">
                <span>{meal.calories}</span>
                <span>{meal.cookTime}</span>
              </div>

              <div className="tag-row">
                {meal.tags.map((tag) => (
                  <span className="small-tag" key={tag}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2 className="section-title">This Week&apos;s Plan</h2>
          <span style={{ marginTop: 20, fontWeight: 600 }}>View Calendar</span>
        </div>

        <div className="table-card">
          <table className="simple-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Breakfast</th>
                <th>Lunch</th>
                <th>Dinner</th>
                <th>Calories</th>
              </tr>
            </thead>
            <tbody>
              {weekPlan.map((day) => (
                <tr key={day.date}>
                  <td>{day.date}</td>
                  <td>{day.breakfast}</td>
                  <td>{day.lunch}</td>
                  <td>{day.dinner}</td>
                  <td>{day.calories}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bottom-grid">
          <div className="panel">
            <div className="meal-name">Quick Actions</div>

            <Link href="/recipes" className="action-btn">
              🔍 Browse New Recipes
            </Link>

            <Link href="/shopping" className="action-btn">
              🛒 View Shopping List
            </Link>

            <Link href="/fridge" className="action-btn">
              🧊 Check Fridge Inventory
            </Link>
          </div>

          <div className="panel">
            <div className="meal-name">Expiring Soon</div>

            <div className="expiring-list">
              {expiringSoon.map((item) => (
                <div className="expiring-item" key={item.name}>
                  <div>
                    <div className="expiring-title">{item.name}</div>
                    <div className="expiring-subtitle">{item.expires}</div>
                  </div>
                  <div>{item.icon}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </AppShell>
  );
}