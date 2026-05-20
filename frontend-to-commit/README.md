# MealMaster Frontend

Next.js UI for the Diet Control API backend.

## Setup

```powershell
npm install
copy .env.local.example .env.local
npm run dev
```

Open http://localhost:3000

## Backend connection

Set in `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

1. Start the FastAPI backend on port 8000
2. Log in at `/login` to store a JWT
3. Use **Assistant** for `GET /api/recipes/generate`

Without the backend, the app still works with mock/local data.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Run production build |
| `npm run lint` | ESLint |

## Project structure

```
app/           # Pages (App Router)
components/    # AppShell, ApiStatus
data/          # mockData, foodEmojis
lib/           # customRecipes (localStorage)
services/      # api.ts (backend client), mockApi.ts
```

## Custom recipes + emojis

- Emoji list: `data/foodEmojis.ts`
- Create flow: Recipes → **+ New Recipe**
- Saved in `localStorage` (not sent to initial backend)
