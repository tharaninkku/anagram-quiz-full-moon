CREATE TABLE IF NOT EXISTS dictionary (
    id SERIAL PRIMARY KEY,
    word TEXT NOT NULL UNIQUE,
    length INTEGER NOT NULL,
    signature TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    pin_hash TEXT NOT NULL,
    total_score INTEGER NOT NULL DEFAULT 0  
);

CREATE TABLE IF NOT EXISTS user_scores (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    score INTEGER NOT NULL,
    time_taken_seconds INTEGER NOT NULL,
    word_length INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dictionary_length ON dictionary(length);
CREATE INDEX IF NOT EXISTS idx_dictionary_signature ON dictionary(signature);
CREATE INDEX IF NOT EXISTS idx_user_scores_user_id ON user_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_user_scores_length ON user_scores(word_length);

