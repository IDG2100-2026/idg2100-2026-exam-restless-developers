# Put here your backend for the Spanish Poker Dice Platform

The backend should largely be a copy from Oblig 2. If something is changed, mention it here.

Leave in this file any comments that you want us to read.


## Modifications made for Oblig 3

The following changes were made to the backend to support frontend requirements:

### `src/models/User.js`
Added a `preferences` field to the User schema. The frontend appearance customizer (theme, board colour, sound, lobby size) needs to persist settings per user across devices — not just in localStorage. This field stores those preferences so they are loaded when the user logs in on any device.

### `src/controllers/userController.js`
Updated the `updateUser` controller to accept and save the `preferences` field from the request body. Without this, the PATCH `/api/users/:id` endpoint would silently ignore preference updates sent from the frontend.

### `src/models/User.js` (second change)
Added `eloByTimeControl` with three sub-fields (`five`, `ten`, `fifteen`) to track separate Elo ratings per time control. The frontend profile page is required to display Elo ratings for 5s, 10s and 15s variants separately.

### `src/controllers/gameController.js`
Updated the `updateElo` helper to also update the relevant `eloByTimeControl` field after each game, based on `game.variant.timePerRound`. The same ELO algorithm is applied independently per time control.

### `src/models/User.js` (third change)
Added `avatar` field (String, default null) to store a base64-encoded profile image. The frontend resizes uploaded images to max 200×200px before encoding so the stored string stays small.

### `src/models/User.js` (fourth change)
Added `aboutMe` field (String, default '', maxlength 500). The profile edit form collects a bio but it was never persisted — this field makes it work.

### `src/controllers/userController.js` (second change)
Updated `updateUser` to accept and save the `avatar` and `aboutMe` fields from the request body.

### `src/routes/commentRoutes.js`
Removed `requireUser` middleware from `POST /` so anonymous (not logged-in) users can post comments. The `requireAdmin` guard on admin routes is unchanged.

### `src/routes/gameRoutes.js`
Removed `requireUser` middleware from `POST /` so anonymous users can create games. Join and result routes still require login.

### `src/controllers/commentController.js`
Changed `author: req.user.userId` to `author: req.user?.userId || null` so comments from anonymous users are stored with a null author and displayed as "Anonymous" in the frontend.

### `src/controllers/gameController.js` (third change)
Removed the 403 block on anonymous games in `getGameById`. Anonymous games are already hidden from the public lobby (`getAllGames` filters them out). Blocking the direct URL too meant anonymous players who just created a game couldn't view it at all.

### `src/controllers/gameController.js` (second change)
Changed `playerOne: isAnonymous ? null : req.user.userId` to use optional chaining (`req.user?.userId || null`) so the controller does not crash when an anonymous user (no `x-user-id` header) creates a game. Anonymous games always have `playerOne: null`.

### `src/routes/gameRoutes.js` (second change)
Removed `requireUser` middleware from `POST /:id/join` so anonymous users can also join games (where the game creator allowed it via `isAnonymous: true`). The frontend enforces that anonymous users can only join games flagged as anonymous.

### `src/controllers/gameController.js` (fourth change)
Updated `joinGame` to handle a null `req.user`: the "you cannot join your own game" guard now uses optional chaining (`req.user?.userId`), and `playerTwo` is set to `req.user?.userId || null` so anonymous joiners are stored with a null `playerTwo`.

These are the only backend files modified. All other backend code is unchanged from Oblig 2.

---


This document contains the description and starter code for oblig2: IDG2100 Spring 2026.
