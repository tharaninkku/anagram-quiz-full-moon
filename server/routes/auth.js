import express from 'express'
import bcrypt from 'bcrypt'
import pool from '../db.js'

const router = express.Router()

// ==========================================
// 1. REGISTER ENDPOINT: POST /api/auth/register
// ==========================================

router.post('/register', async (req, res) => {
    const { username, pin } = req.body

    // 1. Basic Presence Validation
    if (!username || !pin) {
        return res.status(400).json({ error: 'Username and PIN are required' })
    }

    // 2. Clean and Validate Username Format
    const cleanUsername = username.trim()
    const usernameRegex = /^[a-zA-Z0-9 _-]{2,15}$/
    if (!usernameRegex.test(cleanUsername)) {
        return res.status(400).json({
            error: 'Username must be 2-15 characters and contain only letters, numbers, spaces, hyphens, or underscores.'
        })
    }

    // 3. Validate PIN Format (must be exactly 4 digits)
    const pinRegex = /^\d{4}$/
    if (!pinRegex.test(pin)) {
        return res.status(400).json({
            error: 'PIN must be exactly 4 digits.'
        })
    }

    try {
        // 4. Check if Username is Already Taken
        const existingUser = await pool.query(
            'SELECT id FROM users WHERE username = $1',
            [cleanUsername]
        )

        if (existingUser.rows.length > 0) {
            return res.status(409).json({ error: 'Username is already taken.' })
        }

        // 5. Hash the PIN using bcrypt
        const saltRounds = 10
        const pinHash = await bcrypt.hash(pin, saltRounds)

        // 6. Insert the New User into the Database
        const result = await pool.query(
            'INSERT INTO users (username, pin_hash) VALUES ($1, $2) RETURNING id, username',
            [cleanUsername, pinHash] 
        )

        const newUser = result.rows[0]

        // 7. Send Success Response (Status 201 Created)
        return res.status(201).json({
            success: true,
            message: 'Registration successful!',
            user: {
                id: newUser.id,
                username: newUser.username
            }
        })

    } catch (error) {
        console.error('Error during login:', error)
        return res.status(500).json({ error: 'Internal server error.' })
    }
})

// ==========================================
// 2. LOGIN ENDPOINT: POST /api/auth/login
// ==========================================

router.post('/login', async (req, res) => {
    const { username, pin } = req.body
    // 1. Basic Presence Validation
    if (!username || !pin) {
        return res.status(400).json({ error: 'Username and PIN are required' })
    }
    const cleanUsername = username.trim()
    try {
        // 2. Retrieve User from Database
        const result = await pool.query(
            'SELECT id, username, pin_hash FROM users WHERE username = $1',
            [cleanUsername]
        )
        // If no user matches the username
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid username or PIN.' })
        }
        const user = result.rows[0]
        // 3. Compare Input PIN with the Hashed PIN in DB
        const match = await bcrypt.compare(pin, user.pin_hash)
        // If PIN mismatch
        if (!match) {
            return res.status(401).json({ error: 'Invalid username or PIN.' })
        }
        // 4. Send Success Response (Status 200 OK)
        return res.json({
            success: true,
            message: 'Login successful!',
            user: {
                id: user.id,
                username: user.username
            }
        })
    } catch (error) {
        console.error('Error during login:', error)
        return res.status(500).json({ error: 'Internal server error.' })
    }
})

export default router   