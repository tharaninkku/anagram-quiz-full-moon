import express from 'express'
import pool from '../db.js'

const router = express.Router()

// ==========================================
// SCORE SUBMISSION ENDPOINT: POST /api/scores
// ==========================================
router.post('/', async (req, res) => {
    const { username, score, timeTaken, wordLength } = req.body

    // 1. Basic presence validation
    if (!username || score === undefined) {
        return res.status(400).json({ error: 'Username and score are required.'})
    }  

    // 2. Strict Input Validation (Anti-Cheat & Formatting)
    const cleanUsername = username.trim()
    const usernameRegex = /^[a-zA-Z0-9 _-]{2,15}$/
    if (!usernameRegex.test(cleanUsername)) {
        return res.status(400).json({ error: 'Invalid username format.'})
    }

    const numScore = parseInt(score)
    const numTime = parseInt(timeTaken) || 0
    const numLen = parseInt(wordLength) || 3 // Default length to 3

    if (isNaN(numScore) || numScore < 0 || numScore > 1000000) {
        return res.status(400).json({ error: 'Invalid score value. Must be between 0 and 1000000.'})
    }

    if (isNaN(numTime) || numTime < 0 || numTime > 3600) {
        return res.status(400).json({ error: 'Invalid round duration.'})
    }

    if (isNaN(numLen) || numLen < 3 || numLen > 8) {
        return res.status(400).json({ error: 'Invalid word length.'})
    }

    try {
        // 3. Find if the user exists in our system
        const userResult = await pool.query(
            'SELECT id FROM users WHERE username = $1',
        [cleanUsername]
        )

        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: 'User not found. Please log in first.'})
        }

        const userId = userResult.rows[0].id

        // Start a Transaction block
        await pool.query('BEGIN')

        // 4. Save the score record
        const scoreInsertQuery = `
            INSERT INTO user_scores (user_id, score, time_taken_seconds, word_length)
            VALUES ($1, $2, $3, $4);
        `

        await pool.query(scoreInsertQuery, [userId, numScore, numTime, numLen])

        // 5. Update user's lifetime accumulated total score
        const updateScoreQuery = `
            UPDATE users
            SET total_score = total_score + $1
            WHERE id = $2
        `

        await pool.query(updateScoreQuery, [numScore, userId])

        // 6. DB SELF-CLEANING: Keep only top 100 scores for this difficulty (prevents bloat)
        // Note: We do NOT delete users, only score entries!
        const pruneScoresQuery = `
            DELETE FROM user_scores
            WHERE word_length = $1 AND id NOT IN (
                SELECT id FROM (
                    SELECT id FROM user_scores
                    WHERE word_length = $1
                    ORDER BY score DESC, created_at DESC
                    LIMIT 100
                ) sub
            );        
        `

        await pool.query(pruneScoresQuery, [numLen])

        // Commit Transaction (make changes permanent)
        await pool.query('COMMIT')
    
        return res.json({
            success: true,
            message: 'Score saved successfully!'
        })

    } catch (error) {
        //Undo everything in case of query failures
        await pool.query('ROLLBACK')
        console.error('Error saving score:', error)
        return res.status(500).json({ error: 'Internal server error.'})
    }
})

export default router