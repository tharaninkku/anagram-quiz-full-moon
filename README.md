# Anagram Quiz Full Moon 🌕🗡️

A sleek, Persona 3 Reload-themed anagram battle game featuring a full-moon combat system, Tartarus progression (Story Mode), and high-score rankings (Classic Mode). Built with React, Express, and PostgreSQL.

---

## 📂 Project Structure

This project is organized as a **monorepo** containing both the client and server codebases:

*   **[`client/`](./client/)**: React frontend built with Vite. Implements HSL theme styling, custom animations (evoker flash, tarot slash, persona summons), responsive mobile views, and the practice result leaderboard.
*   **[`server/`](./server/)**: Node.js & Express REST API managing authentication, Tartarus floor progression state, classic mode scoring endpoints, database clean-up queries, and progressive challenge recipes.
*   **[`database/`](./database/)**: Schema SQL files outlining tables, constraints, and indexes.

---

## 🛠️ Local Development Setup

### 1. Database Configuration
1. Initialize a PostgreSQL database locally or host it on a provider like [Neon](https://neon.tech/).
2. Run the migration script in the server directory to generate the schema structure:
    ```bash
    cd server
    node migrate.js
    ```
3. Populate the dictionary with the default wordlist:
    ```bash
    node importWords.js
    ```

### 2. Run Backend API Server
1. Create a `server/.env` file with your connection credentials:
    ```env
    DATABASE_URL=postgresql://user:password@localhost:5432/db_name
    PORT=3000
    ```
2. Start the server:
    ```bash
    npm run dev
    ```

### 3. Run Frontend Dev Client
1. Start the Vite development server:
    ```bash
    cd client
    npm run dev
    ```
2. Open your browser and navigate to `http://localhost:5173`.
