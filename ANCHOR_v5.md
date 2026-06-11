# Anchor Document v5 — Anagram Quiz Full Moon 🌕🦋

This anchor document tracks the complete project state, detailing the architectural specifications, API endpoints, gameplay mechanics, and frontend component states.

---

## 1. Project Identity
- **Name:** Anagram Quiz Full Moon
- **Theme:** Persona 3 — Dark Hour, Tartarus Tower climbing (50 Floors), neon blue butterflies, turn-based combat combo system.
- **Root Directory:** `D:\Anagram-quiz-full-moon\`
- **Stack:** PostgreSQL + Express + React (Vite) + Node.js (ES Modules, `"type": "module"`)
- **Port Layout:**
  - Express Server: Port 3000 (Backend)
  - Vite Dev Server: Port 5173 (Client)

---

## 2. Database Schema (`database/schema.sql` & Migrations)
- **`dictionary`**: Records words, lengths, and alphabetized signatures.
  - Columns: `id` (SERIAL), `word` (TEXT UNIQUE, stored in UPPERCASE), `length` (INTEGER), `signature` (TEXT)
- **`users`**: Manages member accounts, lifetime scores, and floor positions.
  - Columns: `id` (SERIAL), `username` (TEXT UNIQUE), `pin_hash` (TEXT), `total_score` (INTEGER DEFAULT 0), `current_floor` (INTEGER DEFAULT 1)
- **`user_scores`**: Logs individual Classic mode runs.
  - Columns: `id` (SERIAL), `user_id` (INTEGER REFERENCES users), `score` (INTEGER), `time_taken_seconds` (INTEGER), `word_length` (INTEGER), `created_at` (TIMESTAMP DEFAULT NOW)

---

## 3. Backend REST Endpoints (`server/routes/`)
All backend routes are validated and connected:
- **`POST /api/auth/register`**: Validates a 2-15 character username and a 4-digit PIN. Hashes the PIN using BCrypt.
- **`POST /api/auth/login`**: Compares a 4-digit PIN with the database hash.
- **`GET /api/challenge?length=X`**: Generates a random anagram challenge of length X (3-8 letters), returning scrambled letter arrays and answers.
- **`POST /api/scores`**: Records classic round score and prunes the score logs to the top 100 entries per difficulty length to prevent DB bloat.
- **`GET /api/leaderboard?length=X`**: Queries top-10 high scores.
- **`GET /api/story?username=X`**: Returns story stats (enemy type, player HP, shadow HP, round timers, and progressive word challenge chains of lengths 3–7 depending on floor difficulty).
- **`POST /api/story`**: Updates user floor progress when a floor is successfully cleared.

---

## 4. Frontend Client Architecture (`client/src/`)
Built using React and Vanilla CSS (designed to avoid Tailwind styling overhead):
- **`index.css`**: Global design guide containing:
  - Custom geometric skewed border tokens (`skewX(-12deg)` buttons, `skewX(-8deg)` panels).
  - Dark hour color palettes (Midnight dark blues, Velvet room navy, neon cyan highlights, and damage critical red).
  - Floating cloud drifting and butterfly flutter animations.
- **`App.jsx`**: Main state controller managing:
  - **`view` state machine**: `'start'` (Authentication Modals), `'lobby'` (Mode Selection), `'story-prep'` (Gothic double gates), `'classic-prep'` (Difficulty buttons), `'battle'` (RPG split layout), and `'result'` (Moonlit sea reflection).
  - **Stale Closure Safety**: Utilizes React Refs (`validAnswersPoolRef`, `solvedAnswersRef`, `accumulatedMissedRef`) to prevent the `setInterval` timer callbacks from closing over stale render states.

---

## 5. Core Gameplay & Custom Mechanics

### A. Skip Quiz Action
- **Story Mode**: Skips the active challenge at the cost of **5 HP**. If HP drops to 0 or below, it triggers a defeat.
- **Classic Mode**: Skips the challenge at the cost of **5 seconds** of global round time.
- **Progressive Continuation**: If a player skips the final pre-loaded word in Story Mode, the client queries `/api/story` to fetch and append a brand new progressive chain (starting back at easy 3-letter words) to keep the battle going.

### B. Solve Streak System (Multiples of 3)
- Counts consecutive correct answers without skipping or taking shadow hits.
- **Streak Bonus (Streak 3, 6, 9...)**:
  - **Story Mode**: Deals **+25 bonus damage** (All-Out Attack) to the shadow.
  - **Classic Mode**: Adds **5 seconds** back to the global countdown clock.

### C. Accumulative Missed Words Tracker
- When skipping, all unsolved anagrams are saved to an `accumulatedMissed` state list.
- When the round ends, skipped entries are combined with the final unsolved words to show the total missed list for player reviews.
- On Story Mode victory, any skipped words remain listed in the results view.

### D. Story Mode Result Stats
- Story results screen displays an RPG performance report (combat elapsed duration and surviving player HP/remaining enemy HP bars) instead of the standard Classic mode leaderboard.

---

## 6. Current Milestones & Next Steps
- **Current Status:** 100% of the game loops, timers, DB updates, and custom skip/streak features are complete and verified.
- **Next Steps:**
  1. Design custom handcrafted SVG assets or load sketch files inside the `client/public` folder as styling overlays.
  2. Implement local audio controllers for Persona 3 battle tracks and evoker flash bullet sounds.
