# Spanish Poker Dice — Frontend

React frontend for the Spanish Poker Dice platform. Built with Vite, React 19, React Router, and SCSS.

## Requirements

- Node.js 18 or higher
- The backend API running on `http://localhost:3000` (see backend setup below)
- MongoDB running locally or a MongoDB Atlas connection string

## Project Structure

frontend/
  src/
    components/ # Reusable components (Header, Footer, AppearanceCustomizer)
    context/    # React context providers (AuthContext, AppearanceContext)
    pages/      # One file per page/route
    services/   # API service layer (api.js)
    styles/     # SCSS partials and variables


## Setup

### 1. Start the backend

```bash
cd backend/project
npm install
npm run seed  # populate the database with test data
npm start     # starts on http://localhost:3000
```

**Test users after seeding:**

| Username | Password  | Role  |
|----------|-----------|-------|
| admin    | admin123  | admin |
| Nicolai  | nico123   | user  |
| Marte    | marty123  | user  |
| Jonas    | joni123   | user  |
| Minnie   | dog123    | user  |

### 2. Start the frontend

```bash
cd frontend
npm install
npm run dev  # starts on http://localhost:5173
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

The frontend proxies all `/api` requests to the backend automatically, no extra configuration needed.

## Features

- **Homepage** - lobby preview, top games by Elo, upcoming tournaments
- **Lobby** - list of joinable games, filtered by user type
- **Create Game** - choose variant (rounds, straights, time per round)
- **Individual Game** - player info, game board area, live comments, auto-refresh every 15s
- **Tournaments** - list and individual tournament pages with join and comments
- **User Profile** - stats, trophies, recent games, editable profile
- **Auth** - login and registration with full form validation
- **Appearance Customizer** - dark/light theme, board color, sound toggle, lobby size slider. Preferences saved to both localStorage and backend (for logged-in users)

## Known limitations

- Actual gameplay (rolling dice, taking turns) is not implemented
- Viewing other users' profiles by username is not supported — the backend only exposes user lookup by ID
- Password reset is not implemented
- Desired opponent Elo is shown in the Create Game form but is not saved to the backend — Elo-based lobby filtering for registered users is therefore also not implemented

## Build for production

```bash
npm run build
```

Output goes to `frontend/dist/`.
