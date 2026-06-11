import express from 'express'
import pool from '../db.js'

const router = express.Router()

// ==========================================
// GET LEADERBOARD: GET /api/leaderboard
// ==========================================
router.get('/', async (req, res) => {
    // 1. Parse the "length" query parameter. If empty or invalid, default to 3.
    let length = parseInt(req.query.length)
    if (isNaN(length)) {
        length = 3
    }

    // 2. Validate that the length is between 3 and 8 
    if (length < 3 || length > 8) {
        return res.status(400).json({ error: 'Word length must be between 3 and 8'})
    }

    try {
        // 3. Query the top 10 scores by joining users and user_scores tables
        const leaderboardQuery = `
            SELECT u.username, us.score, us.time_taken_seconds, us.created_at
            FROM user_scores us
            JOIN users u ON us.user_id = u.id
            WHERE us.word_length = $1
            ORDER BY us.score DESC, us.created_at DESC
            LIMIT 10;
        `

        const result = await pool.query(leaderboardQuery, [length])

        // 4. Return the result rows as JSON 
        return res.json(result.rows)

    } catch (error) {
        console.error('Error fetching leaderboard:', error)
        return res.status(500).json({ error: 'Internal server error.'})
    }
})

export default router