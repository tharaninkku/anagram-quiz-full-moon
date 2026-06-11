import express from 'express'
import pool from '../db.js'

const router = express.Router()

// Helper function to scramble a word's letters
function scrambleWord(word) {
  const letters = word.toLowerCase().split('')
  const scrambled = letters.sort(() => Math.random() - 0.5).join('')
  if (scrambled === word.toLowerCase() && word.length > 1) {
    return scrambleWord(word)
  }
  return scrambled
}

// Helper function to fetch and format a random word challenge from the database
async function generateWordChallenge(length) {
  const result = await pool.query(
    'SELECT word, signature FROM dictionary WHERE length = $1 ORDER BY RANDOM() LIMIT 1',
    [length]
  )
  if (result.rows.length === 0) {
    throw new Error(`No dictionary words found of length ${length}`)
  }
  const targetWord = result.rows[0].word
  const signature = result.rows[0].signature

  const anagramsResult = await pool.query(
    'SELECT word FROM dictionary WHERE signature = $1',
    [signature]
  )
  const answers = anagramsResult.rows.map(row => row.word)
  const scrambled = scrambleWord(targetWord)

  return {
    letters: scrambled.split(''),
    answers: answers
  }
}

// ==========================================
// 1. GET CURRENT STORY CHALLENGE: GET /api/story
// ==========================================
router.get('/', async (req, res) => {
  const { username } = req.query

  // Validation
  if (!username) {
    return res.status(400).json({ error: 'Username parameter is required.' })
  }

  const cleanUsername = username.trim()

  try {
    // Retrieve player's current floor progress from database
    const userResult = await pool.query(
      'SELECT id, current_floor FROM users WHERE username = $1',
      [cleanUsername]
    )

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found. Please log in first.' })
    }

    const currentFloor = userResult.rows[0].current_floor

    // Enforce Tartarus Tower bounds (Max Floor 50)
    if (currentFloor > 50) {
      return res.json({
        gameCleared: true,
        currentFloor: currentFloor,
        message: 'Congratulations! You have cleared Tartarus Tower.'
      })
    }

    // Initialize battle recipe variables
    let enemyType = 'shadow'
    let enemyHP = 50
    let playerHP = 100
    let timeLimit = 45
    let wordChainPromise // Holds the promises for the word queries

    if (currentFloor === 50) {
      // Final Boss
      enemyType = 'boss'
      enemyHP = 300
      playerHP = 120
      timeLimit = 40 // I think 20 is too low i use more than a minute to figure 7 word length
      // Boss Battle Word Chain: 8 words total (progressive lengths 3 to 7)
      wordChainPromise = Promise.all([
        generateWordChallenge(3),
        generateWordChallenge(3),
        generateWordChallenge(4),
        generateWordChallenge(4),
        generateWordChallenge(5),
        generateWordChallenge(5),
        generateWordChallenge(6),
        generateWordChallenge(7)
      ])
    } else if (currentFloor % 10 === 0) {
      // Mini-boss every 10 floors (10, 20, 30, 40)
      enemyType = 'miniboss'
      enemyHP = Math.floor(100 + (currentFloor * 2.0))
      playerHP = 100
      timeLimit = 40
      // Mini-Boss Word Chain: 5 words total
      wordChainPromise = Promise.all([
        generateWordChallenge(3),
        generateWordChallenge(3),
        generateWordChallenge(4),
        generateWordChallenge(4),
        generateWordChallenge(5)
      ])
    } else {
      // Regular shadow floors
      enemyType = 'shadow'
      enemyHP = Math.floor(50 + (currentFloor * 1.5))
      playerHP = 100
      timeLimit = 45
      // Regular Shadow Word Chain: 3 words total
      wordChainPromise = Promise.all([
        generateWordChallenge(3),
        generateWordChallenge(3),
        generateWordChallenge(4)
      ])
    }

    // Run the word queries in parallel
    const battleWords = await wordChainPromise

    // Respond with the battle recipe
    return res.json({
      username: cleanUsername,
      currentFloor: currentFloor,
      enemyType: enemyType,
      playerMaxHP: playerHP,
      enemyMaxHP: enemyHP,
      timeLimit: timeLimit,
      damageConfig: {
        "3": 15, // make a cap for all-out-attack dmg. If we use 20, I think the shadow will die quickly
        "4": 30,
        "5": 50,
        "6": 75,
        "7": 100,
        "8": 100
      },
      battleWords: battleWords
    })

  } catch (error) {
    console.error('Error fetching story mode:', error)
    return res.status(500).json({ error: 'Internal server error.' })
  }
})

// ==========================================
// 2. COMPLETE CURRENT FLOOR: POST /api/story
// ==========================================
router.post('/', async (req, res) => {
  const { username, floorCompleted } = req.body // <-- Only need username and the floor they completed!

  // Validation
  if (!username || floorCompleted === undefined) {
    return res.status(400).json({ error: 'Username and floorCompleted are required.' })
  }

  const cleanUsername = username.trim()
  const numFloorCompleted = parseInt(floorCompleted)

  try {
    // Find user and their current floor progress
    const userResult = await pool.query(
      'SELECT id, current_floor FROM users WHERE username = $1',
      [cleanUsername]
    )

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' })
    }

    const userId = userResult.rows[0].id
    const currentFloor = userResult.rows[0].current_floor

    // Anti-Cheat Check: Check if they are trying to skip floors
    if (numFloorCompleted !== currentFloor) {
      return res.status(400).json({ 
        error: `Anti-cheat trigger: You attempted to complete floor ${numFloorCompleted} but you are currently on floor ${currentFloor}.` 
      })
    }

    // Since we only run a single query now (just advancing the floor), 
    // we don't even need a transaction block (BEGIN/COMMIT)! We can just run it.
    const newFloor = currentFloor + 1
    await pool.query(
      'UPDATE users SET current_floor = $1 WHERE id = $2;',
      [newFloor, userId]
    )

    return res.json({
      success: true,
      message: `Floor ${currentFloor} completed successfully!`,
      newFloor: newFloor,
      gameCleared: newFloor > 50
    })

  } catch (error) {
    console.error('Error saving story progress:', error)
    return res.status(500).json({ error: 'Internal server error.' })
  }
})

export default router