# Anchor Document v2 — Anagram Quiz Full Moon 🌕🦋

Here is your updated project state document. **Save this somewhere safe** — save it as `ANCHOR_v2.md` inside your project folder.

---

## PROJECT IDENTITY
- **Name:** Anagram Quiz Full Moon
- **Theme:** Persona 3 — Dark Hour, Tartarus Tower, blue butterflies, turn-based RPG combo system
- **Folder:** `D:\Anagram-quiz-full-moon\`
- **Stack:** PostgreSQL + Express + React (Vite) + Node.js

---

## ENVIRONMENT
- **Node.js:** v24.16.0
- **npm:** v11.13.0
- **PostgreSQL:** version 18.4
- **Database name:** `anagram_quiz_full_moon`
- **Server port:** 3000
- **Client port:** 5173 (Vite default)
- **package.json type:** `"module"` (ES Modules)

---

## COMPLETED ENDPOINTS & SCHEMAS

### Database Schema (`database/schema.sql`)
- `dictionary`: `id` (SERIAL), `word` (TEXT UNIQUE), `length` (INTEGER), `signature` (TEXT)
- `users`: `id` (SERIAL), `username` (TEXT UNIQUE), `pin_hash` (TEXT), `total_score` (INTEGER), `current_floor` (INTEGER DEFAULT 1)
- `user_scores`: `id` (SERIAL), `user_id` (INTEGER REFERENCES users), `score` (INTEGER), `time_taken_seconds` (INTEGER), `word_length` (INTEGER), `created_at` (TIMESTAMP)

### Express Routing Map (`server/index.js`)
- `POST /api/auth/register` + `POST /api/auth/login` (`routes/auth.js`)
- `GET /api/challenge?length=X` (`routes/challenge.js`)
- `POST /api/scores` (`routes/scores.js`)
- `GET /api/leaderboard?length=X` (`routes/leaderboard.js`)

---

## COMPLETED FILES AND SCRIPTS

- **`server/routes/auth.js`** ✅: User registration and PIN login validation using bcrypt hashing.
- **`server/routes/challenge.js`** ✅: Fetches a random target word and resolves all anagrams. Returns a guaranteed scrambled array of letters.
- **`server/routes/scores.js`** ✅: Saves scores, increments user total score, and cleans database logs using SQL transactions (`BEGIN`/`COMMIT`).
- **`server/routes/leaderboard.js`** ✅: Fetches top 10 scores using a `JOIN` between users and scores tables.
- **`server/importWords.js`** ✅: Downloads and batch-inserts 50,000+ dictionary words.
- **`server/migrate.js`** ✅: Database column migration helper (adds `current_floor` to users).
- **`brain/game_design_document.md`** ✅: Turn-based RPG combat system GDD (with HP systems and the Combo/Multi-Hit mechanic).

---

## CURRENT FOLDER STRUCTURE

D:\Anagram-quiz-full-moon
├── database/ │ └── schema.sql ✅ └── server/ ├── routes/
│ ├── auth.js ✅ │ ├── challenge.js ✅ │ ├── scores.js ✅ │ └── leaderboard.js ✅ ├── .env ✅ ├── .gitignore ✅ ├── db.js ✅ ├── index.js ✅ ├── importWords.js ✅ ├── migrate.js ✅ ├── package.json ✅ └── ANCHOR_v2.md ⬜ save this now


---

## FOR THE NEXT AI SESSION
Paste this entire document and say:

> *"Continue building Anagram Quiz Full Moon. We completed the core API routes (Auth, Challenge, Scores, Leaderboard) and populated the database. The next step is writing `server/routes/story.js` to implement the Story Mode battle-recipe system and progression backend, following the rules inside `brain/game_design_document.md`. Coach me step-by-step — explain every line."*