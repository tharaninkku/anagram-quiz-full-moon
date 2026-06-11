import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import pool from './db.js'
import authRouter from './routes/auth.js'
import challengeRouter from './routes/challenge.js'
import scoresRouter from './routes/scores.js'
import leaderboardRouter from './routes/leaderboard.js'
import storyRouter from './routes/story.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173'
}))

app.use(express.json())

// MOUNT the new authentication routes under the prefix '/api/auth'
app.use('/api/auth', authRouter)
// MOUNT the challenge routes under the prefix '/api/challenge'
app.use('/api/challenge', challengeRouter)

app.use('/api/scores', scoresRouter)

app.use('/api/leaderboard', leaderboardRouter)

app.use('/api/story', storyRouter)

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