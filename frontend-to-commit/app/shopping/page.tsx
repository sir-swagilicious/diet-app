"use client";

import { useMemo, useState } from "react";
import AppShell from "@/components/AppShell";
import { shoppingGroups as initialShoppingGroups } from "@/data/mockData";

type ShoppingItem = {
  name: string;
  amount: string;
  priority: "high" | "medium" | "low";
};

type ShoppingGroup = {
  category: string;
  items: ShoppingItem[];
};

function itemKey(category: string, name: string) {
  return `${category}:${name}`;
}

export default function ShoppingPage() {
  const [groups, setGroups] = useState<ShoppingGroup[]>(
    () => structuredClone(initialShoppingGroups) as ShoppingGroup[]
  );
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({
    category: initialShoppingGroups[0]?.category ?? "Pantry",
    name: "",
    amount: "",
    priority: "medium" as ShoppingItem["priority"],
  });

  const categories = useMemo(
    () => groups.map((group) => group.category),
    [groups]
  );

  const totalItems = useMemo(
    () => groups.reduce((sum, group) => sum + group.items.length, 0),
    [groups]
  );

  const checkedCount = checked.size;
  const progressPercent = totalItems
    ? Math.round((checkedCount / totalItems) * 100)
    : 0;

  const remainingCount = totalItems - checkedCount;

  const toggleItem = (key: string) => {
    setChecked((current) => {
      const next = new Set(current);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const highPriorityTotal = useMemo(
    () =>
      groups.reduce(
        (sum, group) =>
          sum + group.items.filter((item) => item.priority === "high").length,
        0
      ),
    [groups]
  );

  const highPriorityRemaining = useMemo(() => {
    return groups.reduce((count, group) => {
      return (
        count +
        group.items.filter(
          (item) =>
            item.priority === "high" &&
            !checked.has(itemKey(group.category, item.name))
        ).length
      );
    }, 0);
  }, [checked, groups]);

  const highPriorityProgress = highPriorityTotal
    ? Math.round(
        ((highPriorityTotal - highPriorityRemaining) / highPriorityTotal) * 100
      )
    : 0;

  const addItem = () => {
    if (!newItem.name.trim() || !newItem.amount.trim()) {
      return;
    }

    const item: ShoppingItem = {
      name: newItem.name.trim(),
      amount: newItem.amount.trim(),
      priority: newItem.priority,
    };

    setGroups((current) => {
      const existing = current.find(
        (group) => group.category === newItem.category
      );

      if (existing) {
        return current.map((group) =>
          group.category === newItem.category
            ? { ...group, items: [...group.items, item] }
            : group
        );
      }

      return [...current, { category: newItem.category, items: [item] }];
    });

    setNewItem({
      category: newItem.category,
      name: "",
      amount: "",
      priority: "medium",
    });
    setShowAddForm(false);
  };

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
          <button
            type="button"
            className="secondary-btn"
            onClick={() => setShowAddForm((open) => !open)}
          >
            {showAddForm ? "Close" : "+ Add Item"}
          </button>
          <button type="button" className="primary-btn">
            🛒 Order Online
          </button>
        </div>
      </div>

      {showAddForm && (
        <div className="inline-form-panel">
          <div className="meal-name">Add shopping item</div>
          <div className="inline-form-grid shopping-add">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="shop-category">
                Category
              </label>
              <select
                id="shop-category"
                className="form-input"
                value={newItem.category}
                onChange={(event) =>
                  setNewItem((current) => ({
                    ...current,
                    category: event.target.value,
                  }))
                }
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="shop-name">
                Item name
              </label>
              <input
                id="shop-name"
                className="form-input"
                value={newItem.name}
                onChange={(event) =>
                  setNewItem((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                placeholder="e.g. Olive oil"
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="shop-amount">
                Amount
              </label>
              <input
                id="shop-amount"
                className="form-input"
                value={newItem.amount}
                onChange={(event) =>
                  setNewItem((current) => ({
                    ...current,
                    amount: event.target.value,
                  }))
                }
                placeholder="e.g. 1 bottle"
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="shop-priority">
                Priority
              </label>
              <select
                id="shop-priority"
                className="form-input"
                value={newItem.priority}
                onChange={(event) =>
                  setNewItem((current) => ({
                    ...current,
                    priority: event.target.value as ShoppingItem["priority"],
                  }))
                }
              >
                <option value="high">high</option>
                <option value="medium">medium</option>
                <option value="low">low</option>
              </select>
            </div>

            <button type="button" className="primary-btn" onClick={addItem}>
              Add
            </button>
          </div>

          <div className="inline-form-actions">
            <button
              type="button"
              className="secondary-btn"
              onClick={() => setShowAddForm(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="summary-grid four">
        <div className="stat-card">
          <div className="stat-top">Total Items</div>
          <div className="stat-value">{totalItems}</div>
        </div>

        <div className="stat-card">
          <div className="stat-top">Checked Off</div>
          <div className="stat-value">
            {checkedCount} / {totalItems}
          </div>
          <div className="progress-track">
            <div
              className={`progress-fill ${progressPercent === 100 ? "green" : ""}`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-top">Estimated Cost</div>
          <div className="stat-value">
            ${Math.max(0, 80 - checkedCount * 6)}
          </div>
          <div className="page-subtitle" style={{ marginTop: 10 }}>
            {remainingCount} items left
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-top">High Priority</div>
          <div className="stat-value">{highPriorityRemaining} left</div>
          <div className="progress-track">
            <div
              className="progress-fill orange"
              style={{ width: `${highPriorityProgress}%` }}
            />
          </div>
        </div>
      </div>

      {groups.map((group) => (
        <div key={group.category}>
          <h2 className="section-title">{group.category}</h2>

          {group.items.map((item) => {
            const key = itemKey(group.category, item.name);
            const isChecked = checked.has(key);

            return (
              <div
                className={`shopping-row ${isChecked ? "checked" : ""}`}
                key={key}
              >
                <div className="shopping-left">
                  <button
                    type="button"
                    className={`checkbox ${isChecked ? "checked" : ""}`}
                    onClick={() => toggleItem(key)}
                    aria-label={`${isChecked ? "Uncheck" : "Check"} ${item.name}`}
                    aria-pressed={isChecked}
                  >
                    {isChecked ? "✓" : ""}
                  </button>
                  <div>
                    <div className="meal-name">{item.name}</div>
                    <div className="page-subtitle">{item.amount}</div>
                  </div>
                </div>

                <span className={`priority ${item.priority}`}>
                  {item.priority}
                </span>
              </div>
            );
          })}
        </div>
      ))}

      <div className="panel">
        <div className="meal-name">Quick Actions</div>

        <div className="quick-actions-grid" style={{ marginTop: 14 }}>
          <button type="button" className="action-btn">
            📋 Import from Recipes
            <br />
            <span className="page-subtitle">
              Add ingredients from your meal plan
            </span>
          </button>

          <button type="button" className="action-btn">
            🛒 Auto-Complete List
            <br />
            <span className="page-subtitle">AI suggests missing staples</span>
          </button>

          <button type="button" className="action-btn">
            💰 Find Best Prices
            <br />
            <span className="page-subtitle">Compare stores in your area</span>
          </button>
        </div>
      </div>
    </AppShell>
  );
}
