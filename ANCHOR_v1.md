# Anchor Document — Anagram Quiz Full Moon 🌕🦋

Here is your complete project state document. **Save this somewhere safe** — copy it to a text file in your project folder.

---

## PROJECT IDENTITY
- **Name:** Anagram Quiz Full Moon
- **Theme:** Persona 3 — Dark Hour, Tartarus Tower, blue butterflies
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
- **package.json type:** `"module"` (ES Modules — use `import/export` everywhere, never `require`)

---

## MISTAKES WE DISCOVERED & FIXED
These are critical — don't repeat them:

| Mistake | Wrong | Correct |
|---|---|---|
| File path | `'/db.js'` | `'./db.js'` |
| SQL typo | `INTERGER` | `INTEGER` |
| SQL typo | `SELECT_NOW()` | `SELECT NOW()` |
| JS typo | `result.row[0]` | `result.rows[0]` |
| Protocol | `https://localhost:5173` | `http://localhost:5173` |
| dotenv timing | only in `index.js` | in **both** `index.js` AND `db.js` |
| Missing code | `app.listen()` was absent | must be at bottom of `index.js` |

---

## COMPLETED FILES

### `database/schema.sql` ✅
```sql
CREATE TABLE IF NOT EXISTS dictionary (
  id        SERIAL PRIMARY KEY,
  word      TEXT NOT NULL UNIQUE,
  length    INTEGER NOT NULL,
  signature TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
  id          SERIAL PRIMARY KEY,
  username    TEXT NOT NULL UNIQUE,
  pin_hash    TEXT NOT NULL,
  total_score INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS user_scores (
  id                 SERIAL PRIMARY KEY,
  user_id            INTEGER NOT NULL REFERENCES users(id),
  score              INTEGER NOT NULL,
  time_taken_seconds INTEGER NOT NULL,
  word_length        INTEGER NOT NULL,
  created_at         TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dictionary_length    ON dictionary(length);
CREATE INDEX IF NOT EXISTS idx_dictionary_signature ON dictionary(signature);
CREATE INDEX IF NOT EXISTS idx_user_scores_user_id  ON user_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_user_scores_length   ON user_scores(word_length);
```

---

### `server/package.json` ✅
```json
{
  "name": "server",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js"
  },
  "dependencies": {
    "bcrypt": "^6.0.0",
    "cors": "^2.8.6",
    "dotenv": "^17.4.2",
    "express": "^5.2.1",
    "pg": "^8.21.0"
  },
  "devDependencies": {
    "nodemon": "^3.1.14"
  }
}
```

---

### `server/.env` ✅
```env
DATABASE_URL=postgresql://postgres:YOURPASSWORD@localhost:5432/anagram_quiz_full_moon
PORT=3000
```

---

### `server/.gitignore` ✅
```
node_modules
.env
```

---

### `server/db.js` ✅
```js
import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const { Pool } = pg

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : false
})

pool.connect((err, client, release) => {
  if (err) {
    console.error('Database connection failed:', err.message)
  } else {
    console.log('Database connected successfully!')
    release()
  }
})

export default pool
```

---

### `server/index.js` ✅
```js
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import pool from './db.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173'
}))

app.use(express.json())

app.get('/api/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()')
    res.json({
      status: 'ok',
      time: result.rows[0].now
    })
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message })
  }
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
```

---

## CURRENT FOLDER STRUCTURE
```
D:\Anagram-quiz-full-moon\
├── database/
│   └── schema.sql          ✅
└── server/
    ├── routes/             ⬜ empty, not started
    ├── .env                ✅
    ├── .gitignore          ✅
    ├── db.js               ✅
    ├── index.js            ✅
    └── package.json        ✅
```

---

## WHAT WORKS RIGHT NOW
- `npm run dev` starts server successfully
- Terminal shows `Server running on port 3000`
- Terminal shows `Database connected successfully!`
- `http://localhost:3000/api/health` returns JSON in browser

---

## WHAT COMES NEXT
Build these route files in this order:

| Priority | File | Endpoint |
|---|---|---|
| 1st | `routes/auth.js` | `POST /api/auth/register` + `POST /api/auth/login` |
| 2nd | `routes/challenge.js` | `GET /api/challenge?length=X` |
| 3rd | `routes/scores.js` | `POST /api/scores` |
| 4th | `routes/leaderboard.js` | `GET /api/leaderboard?length=X` |
| 5th | `routes/story.js` | `GET/POST /api/story` |

---

## DESIGN DECISIONS LOCKED IN
- ✅ PIN authentication (4-digit, stored as bcrypt hash)
- ✅ Story Mode — Tartarus Tower, floor 1-150, boss at floor 150
- ✅ Persona 3 theme — dark navy, teal glow, blue butterfly sprites
- ✅ User draws their own sprites (shadow_basic, shadow_miniboss, shadow_boss, butterfly, protagonist)
- ✅ ES Modules throughout (`import/export`)

---

## FOR THE NEXT AI SESSION
Paste this entire document and say:

> *"Continue building Anagram Quiz Full Moon. We finished the server foundation. Next step is writing `server/routes/auth.js`. Use ES Modules, Express 5, bcrypt for PIN hashing, and pg pool for database queries. Coach me step by step — explain every line."*

---

Save this document as `ANCHOR_v1.md` inside your `D:\Anagram-quiz-full-moon\` folder. 🌕🦋