# ByProduct (frontend)

**One business's waste is another business's raw material.**

Small Nairobi businesses that make products from other businesses' leftovers can't easily find enough of them. Briquette makers need sawdust, upcyclers need fabric offcuts, and insect farms need food waste. ByProduct lets businesses list their leftovers and post what they need. For each need, it suggests the nearest sellers and how much to ask each one for, then tracks every pickup until the buyer confirms it was collected. Only collected kilos count as **kilos reused**.

This is the React app. It talks to the ByProduct Django REST API.

- **Live site:** <https://byproduct-frontend.vercel.app>
- **API:** <https://byproduct-api.onrender.com/api>
- **API docs (Swagger):** <https://byproduct-api.onrender.com/api/docs/>

## Tech stack

- React 19 and Vite 8, plain JavaScript (no TypeScript)
- `react-router` 7.18.5 for pages, the only extra package
- `fetch` for API calls, plain CSS, `useState`/`useEffect`, and one React context for the login
- ESLint (the Vite template's setup)

## Run it

You need Node 20 or newer.

```powershell
npm install
```

Create a file called `.env.local` in this folder with the API's address (copy `.env.example`):

```
VITE_API_URL=https://byproduct-api.onrender.com/api
```

`.env.local` is git-ignored. To use a backend running on your laptop instead, set `VITE_API_URL=http://127.0.0.1:8000/api` (the backend must allow `http://localhost:5173` in `CORS_ALLOWED_ORIGINS`).

Then:

```powershell
npm run dev      # start the app at http://localhost:5173
npm run lint     # check the code with ESLint
npm run build    # build the finished site into dist/
```

The API runs on Render's free plan, which sleeps when nobody uses it. The first request can take up to a minute, and the app says so while it loads.

**Demo logins** (made by the backend's `seed_demo` command; the password is the backend's `DEMO_PASSWORD`): `moto` is a briquette maker who needs sawdust; `doors`, `kamukunji`, `joinery`, `bedmakers` and `sofas` are carpenters within 10 km; `timber` is 14.5 km away.

## Pages

| Address | Who | What |
|---|---|---|
| `/` | everyone | Browse live listings, filter by material and area, "Load more" |
| `/impact` | everyone | Total kilos reused and kilos by material |
| `/login`, `/sign-up` | everyone | Log in, or sign up a business |
| `/dashboard` | logged in | Requests to answer, agreed pickups, my listings, my open needs |
| `/listings/new`, `/listings/:id/edit` | logged in | List leftovers, or edit a listing |
| `/needs/new`, `/needs/:id/edit` | logged in | Post or edit a need |
| `/needs/:id` | logged in, the buyer | Progress, suggested sellers, ask one or all, my requests |
| `/profile` | logged in | Edit my business, log out, delete my account |

Anything else shows a "Page not found" page.

## Folder layout

```
public/favicon.svg        the tab icon
index.html                the page shell, with the Google Fonts links
src/
  main.jsx                starts React inside BrowserRouter and AuthProvider
  App.jsx                 the list of routes (address -> page)
  api.js                  every API request goes through api() here; also the login tokens
  AuthContext.jsx         who is logged in: login, register, logout, delete account
  useApi.js               a hook that loads data for a page: { data, error, loading, reload }
  helpers.js              formatting (kg, price, dates, distance) and form-error helpers
  index.css               the design: colour tokens (with dark mode), layout, cards, buttons
  components/             pieces used by several pages
    Layout.jsx            header and nav around every page
    RequireAuth.jsx       sends logged-out visitors to /login and back
    ListingCard.jsx       one listing as a card
    PickupRow.jsx         one pickup with the buttons the viewer may press
    ProgressBar.jsx       a need's stacked bar: collected, agreed, waiting
    StatusPill.jsx        the coloured status of a pickup
    ActionButton.jsx      a button that calls the API and shows its result or error
    Notice.jsx            the short message after an action
    ErrorList.jsx, FieldError.jsx, BusinessFields.jsx
  pages/                  one file per screen
```

## How login works

1. **Log in or sign up.** `POST /auth/login/` (or `/auth/register/`) answers with two tokens and the business.
2. **The access token** lasts 30 minutes. It's kept **only in memory** (a variable in `api.js`), never in `localStorage`, and `api()` sends it on every request as `Authorization: Bearer <token>`.
3. **The refresh token** lasts 7 days. It's kept in **`localStorage`**, so a page reload can log you back in: on start-up, `AuthContext` calls `GET /me/`, and `api()` uses the refresh token to get a new access token first.
4. **When the access token runs out**, the API answers 401. `api()` then calls `POST /auth/refresh/` **once** and tries the request again. The server sends a new refresh token each time and the old one stops working, so it's saved straight away. If several requests get a 401 at the same moment, they all wait for **one shared refresh** instead of each starting their own (which would fail, because the first refresh cancels the old token).
5. **If the refresh fails** (after 7 days, or after logging out elsewhere), the tokens are cleared and the request is tried once more without a token, so public pages like Browse still load.
6. **Log out** sends the refresh token to `POST /auth/logout/` so the server blocks it, then clears both tokens.

Pages that need a login are wrapped in `<RequireAuth>`, which sends logged-out visitors to `/login` and back to the page they wanted afterwards.

## Design

The colours, fonts and rules match the ByProduct concept page: buyer things are teal, seller things are amber; status pills are amber (waiting), teal (agreed), green (collected) and red (declined or cancelled). It's built mobile first, for cheap phones 360px wide, with every button at least 44px tall, and it follows the phone's dark mode.
