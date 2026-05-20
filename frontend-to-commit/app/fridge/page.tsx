"use client";

import { useMemo, useState } from "react";
import AppShell from "@/components/AppShell";
import { fridgeGroups as initialFridgeGroups, fridgeSuggestions } from "@/data/mockData";

type FridgeItem = {
  name: string;
  quantity: string;
  expiry: string;
  status: string;
  danger: boolean;
};

type FridgeGroup = {
  category: string;
  items: FridgeItem[];
};

function fridgeItemKey(category: string, name: string) {
  return `${category}:${name}`;
}

const emptyFridgeItem: FridgeItem = {
  name: "",
  quantity: "",
  expiry: "",
  status: "Fresh",
  danger: false,
};

export default function FridgePage() {
  const [groups, setGroups] = useState<FridgeGroup[]>(
    () => structuredClone(initialFridgeGroups) as FridgeGroup[]
  );
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<FridgeItem>(emptyFridgeItem);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({
    category: initialFridgeGroups[0]?.category ?? "Protein",
    name: "",
    quantity: "",
    expiry: "",
    status: "Fresh",
  });

  const categories = useMemo(
    () => groups.map((group) => group.category),
    [groups]
  );

  const totalItems = useMemo(
    () => groups.reduce((sum, group) => sum + group.items.length, 0),
    [groups]
  );

  const expiringSoon = useMemo(
    () =>
      groups.reduce(
        (sum, group) => sum + group.items.filter((item) => item.danger).length,
        0
      ),
    [groups]
  );

  const startEdit = (category: string, item: FridgeItem) => {
    const key = fridgeItemKey(category, item.name);
    setEditingKey(key);
    setEditDraft({ ...item });
  };

  const cancelEdit = () => {
    setEditingKey(null);
    setEditDraft(emptyFridgeItem);
  };

  const saveEdit = (category: string, originalName: string) => {
    if (!editDraft.name.trim() || !editDraft.quantity.trim()) {
      return;
    }

    setGroups((current) =>
      current.map((group) => {
        if (group.category !== category) {
          return group;
        }

        return {
          ...group,
          items: group.items.map((item) =>
            item.name === originalName
              ? {
                  ...editDraft,
                  name: editDraft.name.trim(),
                  quantity: editDraft.quantity.trim(),
                  expiry: editDraft.expiry.trim() || item.expiry,
                  status: editDraft.status.trim() || "Fresh",
                  danger:
                    editDraft.status.toLowerCase().includes("day") ||
                    editDraft.danger,
                }
              : item
          ),
        };
      })
    );

    cancelEdit();
  };

  const removeItem = (category: string, name: string) => {
    if (!window.confirm(`Remove "${name}" from your fridge?`)) {
      return;
    }

    if (editingKey === fridgeItemKey(category, name)) {
      cancelEdit();
    }

    setGroups((current) =>
      current
        .map((group) =>
          group.category === category
            ? {
                ...group,
                items: group.items.filter((item) => item.name !== name),
              }
            : group
        )
        .filter((group) => group.items.length > 0)
    );
  };

  const addItem = () => {
    if (!newItem.name.trim() || !newItem.quantity.trim()) {
      return;
    }

    const item: FridgeItem = {
      name: newItem.name.trim(),
      quantity: newItem.quantity.trim(),
      expiry: newItem.expiry.trim() || "—",
      status: newItem.status.trim() || "Fresh",
      danger: newItem.status.toLowerCase().includes("day"),
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
      quantity: "",
      expiry: "",
      status: "Fresh",
    });
    setShowAddForm(false);
  };

  return (
    <AppShell>
      <div className="page-header-row">
        <div>
          <h1 className="page-title">My Fridge</h1>
          <div className="page-subtitle">
            Track what you have and what you need
          </div>
        </div>

        <button
          type="button"
          className="primary-btn"
          onClick={() => setShowAddForm((open) => !open)}
        >
          {showAddForm ? "Close" : "+ Add Item"}
        </button>
      </div>

      {showAddForm && (
        <div className="inline-form-panel">
          <div className="meal-name">Add fridge item</div>
          <div className="inline-form-grid">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="fridge-category">
                Category
              </label>
              <select
                id="fridge-category"
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
              <label className="form-label" htmlFor="fridge-name">
                Item name
              </label>
              <input
                id="fridge-name"
                className="form-input"
                value={newItem.name}
                onChange={(event) =>
                  setNewItem((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                placeholder="e.g. Butter"
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="fridge-quantity">
                Quantity
              </label>
              <input
                id="fridge-quantity"
                className="form-input"
                value={newItem.quantity}
                onChange={(event) =>
                  setNewItem((current) => ({
                    ...current,
                    quantity: event.target.value,
                  }))
                }
                placeholder="e.g. 250 g"
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="fridge-expiry">
                Expiry date
              </label>
              <input
                id="fridge-expiry"
                className="form-input"
                value={newItem.expiry}
                onChange={(event) =>
                  setNewItem((current) => ({
                    ...current,
                    expiry: event.target.value,
                  }))
                }
                placeholder="May 25, 2026"
              />
            </div>
          </div>

          <div className="inline-form-actions">
            <button type="button" className="primary-btn" onClick={addItem}>
              Add to fridge
            </button>
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

      <div className="summary-grid">
        <div className="stat-card">
          <div className="stat-top">Total Items</div>
          <div className="stat-value">{totalItems}</div>
        </div>

        <div className="stat-card">
          <div className="stat-top">Expiring Soon</div>
          <div className="stat-value">{expiringSoon}</div>
        </div>

        <div className="stat-card">
          <div className="stat-top">Categories</div>
          <div className="stat-value">{groups.length}</div>
        </div>
      </div>

      {groups.map((group) => (
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
                {group.items.map((item) => {
                  const key = fridgeItemKey(group.category, item.name);
                  const isEditing = editingKey === key;

                  if (isEditing) {
                    return (
                      <tr key={key}>
                        <td>
                          <input
                            className="table-input"
                            value={editDraft.name}
                            onChange={(event) =>
                              setEditDraft((current) => ({
                                ...current,
                                name: event.target.value,
                              }))
                            }
                          />
                        </td>
                        <td>
                          <input
                            className="table-input"
                            value={editDraft.quantity}
                            onChange={(event) =>
                              setEditDraft((current) => ({
                                ...current,
                                quantity: event.target.value,
                              }))
                            }
                          />
                        </td>
                        <td>
                          <input
                            className="table-input"
                            value={editDraft.expiry}
                            onChange={(event) =>
                              setEditDraft((current) => ({
                                ...current,
                                expiry: event.target.value,
                              }))
                            }
                          />
                        </td>
                        <td>
                          <input
                            className="table-input"
                            value={editDraft.status}
                            onChange={(event) =>
                              setEditDraft((current) => ({
                                ...current,
                                status: event.target.value,
                              }))
                            }
                          />
                        </td>
                        <td>
                          <button
                            type="button"
                            className="table-action-btn edit-link"
                            onClick={() => saveEdit(group.category, item.name)}
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            className="table-action-btn table-actions"
                            onClick={cancelEdit}
                          >
                            Cancel
                          </button>
                        </td>
                      </tr>
                    );
                  }

                  return (
                    <tr key={key}>
                      <td>{item.name}</td>
                      <td>{item.quantity}</td>
                      <td>{item.expiry}</td>
                      <td className={item.danger ? "danger-status" : ""}>
                        {item.danger ? "⊙ " : ""}
                        {item.status}
                      </td>
                      <td>
                        <button
                          type="button"
                          className="table-action-btn edit-link"
                          onClick={() => startEdit(group.category, item)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="table-action-btn table-actions"
                          onClick={() => removeItem(group.category, item.name)}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  );
                })}
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
