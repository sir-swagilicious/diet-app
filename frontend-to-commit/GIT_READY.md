# Frontend — ready to upload / commit

This folder is a clean copy of the MealMaster frontend (no `node_modules`, no `.next`).

## Upload to GitHub (new repo)

1. Create an empty repository on GitHub.
2. Open a terminal **inside this folder** (`frontend-to-commit`).
3. Run:

```powershell
git init
git add .
git commit -m "Add MealMaster frontend"
git branch -M main
git remote add origin https://github.com/YOUR_USER/YOUR_REPO.git
git push -u origin main
```

## Before running the app

```powershell
npm install
copy .env.local.example .env.local
npm run dev
```

Open http://localhost:3000

## Backend (separate — not included here)

Start the FastAPI API on port 8000 and set in `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Log in at `/login` to use API features (Assistant AI recipes).

## What is included

- All pages: Dashboard, Recipes, Fridge, Shopping, Nutrition, Assistant, Preferences, Login
- `services/api.ts` — client for initial backend API
- `data/foodEmojis.ts` — emoji picker for new recipes
- `lib/customRecipes.ts` — local storage for user-created recipes
