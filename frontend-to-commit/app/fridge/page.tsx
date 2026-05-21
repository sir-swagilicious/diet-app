import AppShell from "@/components/AppShell";
import { fridgeGroups, fridgeSuggestions } from "@/data/mockData";

export default function FridgePage() {
  return (
    <AppShell>
      <div className="page-header-row">
        <div>
          <h1 className="page-title">My Fridge</h1>
          <div className="page-subtitle">
            Track what you have and what you need
          </div>
        </div>

        <button className="primary-btn">+ Add Item</button>
      </div>

      <div className="summary-grid">
        <div className="stat-card">
          <div className="stat-top">Total Items</div>
          <div className="stat-value">10</div>
        </div>

        <div className="stat-card">
          <div className="stat-top">Expiring Soon</div>
          <div className="stat-value">3</div>
        </div>

        <div className="stat-card">
          <div className="stat-top">Categories</div>
          <div className="stat-value">3</div>
        </div>
      </div>

      {fridgeGroups.map((group) => (
        <div className="fridge-table-block" key={group.category}>
          <h2 className="section-title">{group.category}</h2>

          <div className="table-card">
            <table className="simple-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Quantity</th>
                  <th>Expiry Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {group.items.map((item) => (
                  <tr key={item.name}>
                    <td>{item.name}</td>
                    <td>{item.quantity}</td>
                    <td>{item.expiry}</td>
                    <td className={item.danger ? "danger-status" : ""}>
                      {item.danger ? "⊙ " : ""}
                      {item.status}
                    </td>
                    <td>
                      <span className="edit-link">Edit</span>
                      <span className="table-actions">Remove</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      <div className="panel">
        <div className="meal-name">Recipe Suggestions Based on Your Fridge</div>
        <div className="page-subtitle">
          We found recipes you can make with ingredients you already have!
        </div>

        <div className="suggestion-grid">
          {fridgeSuggestions.map((item) => (
            <div className="suggestion-card" key={item.title}>
              <div className="food-icon">{item.icon}</div>
              <div className="meal-name">{item.title}</div>
              <div className="page-subtitle">{item.subtitle}</div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}