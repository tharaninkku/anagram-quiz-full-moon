import pool from './db.js'

async function migrate() {
    console.log('🔄 Running database migrations...')
    try {
        // 1. Create dictionary table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS dictionary (
                id SERIAL PRIMARY KEY,
                word TEXT NOT NULL UNIQUE,
                length INTEGER NOT NULL,
                signature TEXT NOT NULL
            );
        `)

        // 2. Create users table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username TEXT NOT NULL UNIQUE,
                pin_hash TEXT NOT NULL,
                total_score INTEGER NOT NULL DEFAULT 0  
            );
        `)

        // 3. Create user_scores table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS user_scores (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id),
                score INTEGER NOT NULL,
                time_taken_seconds INTEGER NOT NULL,
                word_length INTEGER NOT NULL,
                created_at TIMESTAMP NOT NULL DEFAULT NOW()
            );
        `)

        // 4. Create indexes
        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_dictionary_length ON dictionary(length);
            CREATE INDEX IF NOT EXISTS idx_dictionary_signature ON dictionary(signature);
            CREATE INDEX IF NOT EXISTS idx_user_scores_user_id ON user_scores(user_id);
            CREATE INDEX IF NOT EXISTS idx_user_scores_length ON user_scores(word_length);
        `)

        // 5. Add current_floor column if missing
        await pool.query(`
            ALTER TABLE users
            ADD COLUMN IF NOT EXISTS current_floor INTEGER NOT NULL DEFAULT 1;
        `)

        console.log('✅ Database migration completed successfully! All tables, indexes, and columns are ready.')
    } catch (error) {
        console.error('❌ Database migration failed:', error.message)
    } finally {
        await pool.end()
    }
}

migrate()