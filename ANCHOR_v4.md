# Anchor Document v4 — Anagram Quiz Full Moon 🌕🦋

This anchor document tracks the complete project state, including the newly aligned UI layouts and custom visual elements based on your design sketches.

---

## 1. Project Identity
- **Name:** Anagram Quiz Full Moon
- **Theme:** Persona 3 — Dark Hour, Tartarus Tower (50 Floors), blue butterflies, turn-based RPG combo system
- **Folder:** `D:\Anagram-quiz-full-moon\`
- **Stack:** PostgreSQL + Express + React (Vite) + Node.js

---

## 2. Environment Configuration
- **Node.js:** v24.16.0
- **npm:** v11.13.0
- **PostgreSQL:** v18.4
- **Database name:** `anagram_quiz_full_moon`
- **Server port:** 3000 (Express Backend)
- **Client port:** 5173 (React Vite Dev Server)
- **package.json type:** `"module"` (ES Modules)

---

## 3. Database Schema (`database/schema.sql`)
- `dictionary`: `id` (SERIAL), `word` (TEXT UNIQUE), `length` (INTEGER), `signature` (TEXT)
- `users`: `id` (SERIAL), `username` (TEXT UNIQUE), `pin_hash` (TEXT), `total_score` (INTEGER), `current_floor` (INTEGER DEFAULT 1)
- `user_scores`: `id` (SERIAL), `user_id` (INTEGER REFERENCES users), `score` (INTEGER), `time_taken_seconds` (INTEGER), `word_length` (INTEGER), `created_at` (TIMESTAMP)

---

## 4. Completed Backend Endpoints
All backend files are located under `server/` and have been verified:
- **`POST /api/auth/register`**: User registration with BCrypt PIN hashing.
- **`POST /api/auth/login`**: User login with 4-digit PIN verification.
- **`GET /api/challenge?length=X`**: Practice Mode challenge generator.
- **`POST /api/scores`**: Saves Practice Mode score and prunes the DB to the top 100 per length.
- **`GET /api/leaderboard?length=X`**: Fetches the top 10 scores joining users and scores.
- **`GET /api/story?username=X`**: Retrieves user current floor progress and outputs floor parameters.
- **`POST /api/story`**: Validates floor completion and updates the floor progress.

---

## 5. UI Layout Design Specifications

We will build the frontend using React and CSS, integrating custom SVGs and animations to match the hand-drawn UI sketches:

### A. Landing Screen (`Start.jpg`)
- **Visuals**: A massive background SVG of Tartarus Tower, floating clouds moving slowly using horizontal translation, and glowing blue butterflies. A large, glowing Full Moon on the right.
- **Controls**: "Register" and "Login" select options styled with sharp, skewed, Persona-style borders.

### B. Login & Register Modals (`Login.jpg` / `Register.jpg`)
- **Visuals**: A central overlay styled as a curved, asymmetric Persona-themed modal.
- **Inputs**: Text fields for Username, PIN, and Confirm PIN, alongside stylized "Back" and "Submit/Login" buttons.

### C. Lobby & Game Mode Selector (`Start2.jpg`)
- **Controls**: Dual options: "Full Moon Story" (with an active angular border outline) and "Classic" (unselected).

### D. Story Mode Preparation Screen (`Story preparing.jpg`)
- **Visuals**: Displays the "Current Floor: X" and a corresponding moon phase. Renders the protagonist (school uniform, back facing the camera) looking up at the glowing double doors of the Tartarus entrance.

### E. Battle Arena Screen (`Classic fight.jpg` / `Story fight.jpg`)
- **Split Screen Layout**:
  - **Top Arena (RPG Action)**:
    - **Protagonist Sprite (Left)**: Renders a breathing idle stance, transitions to raising an Evoker gun to their temple to trigger a bright cyan bullet/butterfly flash on correct word entries, and shakes/flashes red on hits.
    - **Enemy Shadow (Right)**: Renders a levitating ghost-like figure that lunges forward to attack on player timeout and flashes red when hit.
    - **HP Status Bars**: Rendered above the portrait (Player HP out of 100) and below the shadow (Enemy HP) for Story Mode.
  - **Bottom Arena (Quiz Interface)**:
    - **Character Portrait**: A stylized red-haired portrait of Mitsuru Kirijo inside a skewed neon frame.
    - **Scrabble Tiles**: 3D letter button blocks with individual letter score subscripts.
    - **Moon Timer & Dusk Progress**: 
      - A circular moon phase timer that grows dark as time ticks down.
      - A "Moon Dusk" progress bar with rising smoke/waves particles representing the Dark Hour countdown.
    - **Input preview and Possible Words indicator** (e.g. `Possible word: [ 1 / 3 ]`).

### F. Result Screen (`Result leaderboard.jpg` / `Result missed word.jpg`)
- **Visuals**: A dark sea horizon with a full moon in the sky containing the final score. Below the horizon, a large glowing ellipse representing the "moon shadow reflection on the sea" serves as the display container.
- **Toggle Mode**: A skewed top-left button swaps between the leaderboard scores and the list of missed words, both rendered inside the glowing water reflection.

---

## 6. Next Step
Initialize the client directory at `D:\Anagram-quiz-full-moon\client` and write the global style guide (`index.css`) containing all HSL design variables and Persona keyframe animations.
