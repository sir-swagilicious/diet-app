import AppShell from "@/components/AppShell";
import { shoppingGroups } from "@/data/mockData";

export default function ShoppingPage() {
  return (
    <AppShell>
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Shopping List</h1>
          <div className="page-subtitle">
            Items you need for this week&apos;s meals
          </div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button className="secondary-btn">+ Add Item</button>
          <button className="primary-btn">🛒 Order Online</button>
        </div>
      </div>

      <div className="summary-grid four">
        <div className="stat-card">
          <div className="stat-top">Total Items</div>
          <div className="stat-value">10</div>
        </div>

        <div className="stat-card">
          <div className="stat-top">Checked Off</div>
          <div className="stat-value">0 / 10</div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: "0%" }} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-top">Estimated Cost</div>
          <div className="stat-value">$80</div>
        </div>

        <div className="stat-card">
          <div className="stat-top">For Recipes</div>
          <div className="stat-value">5 meals</div>
        </div>
      </div>

      {shoppingGroups.map((group) => (
        <div key={group.category}>
          <h2 className="section-title">{group.category}</h2>

          {group.items.map((item) => (
            <div className="shopping-row" key={item.name}>
              <div className="shopping-left">
                <div className="checkbox" />
                <div>
                  <div className="meal-name">{item.name}</div>
                  <div className="page-subtitle">{item.amount}</div>
                </div>
              </div>

              <span className={`priority ${item.priority}`}>
                {item.priority}
              </span>
            </div>
          ))}
        </div>
      ))}

      <div className="panel">
        <div className="meal-name">Quick Actions</div>

        <div className="quick-actions-grid" style={{ marginTop: 14 }}>
          <button className="action-btn">
            📋 Import from Recipes
            <br />
            <span className="page-subtitle">
              Add ingredients from your meal plan
            </span>
          </button>

          <button className="action-btn">
            🛒 Auto-Complete List
            <br />
            <span className="page-subtitle">AI suggests missing staples</span>
          </button>

          <button className="action-btn">
            💰 Find Best Prices
            <br />
            <span className="page-subtitle">Compare stores in your area</span>
          </button>
        </div>
      </div>
    </AppShell>
  );
}