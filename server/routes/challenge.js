import express from 'express'
import pool from '../db.js'

const router = express.Router()

//Help function to shuffle a word's letters
function scrambleWord(word) {
    //1. convert the word to lowercase and turn it in an array of letters
    const letters = word.toLowerCase().split('')

    //2. sort the array randomly using Math.random()
    const scrambled = letters.sort(() => Math.random() - 0.5).join('')

    //3. make sure the scrambles word isn't identical to the original word
    if (scrambled === word.toLowerCase() && word.length > 1) {
        return scrambleWord(word) // try again if they are identical
    }

    return scrambled
}

// ==========================================
// CHALLENGE ENDPOINT: GET /api/challenge
// ==========================================

router.get('/', async (req, res) => {
    //1.Parse the 'length' query parameter. If empty or invalid, default to 3.
    let length = parseInt(req.query.length)
    if (isNaN(length)) {
        length = 3
    }

    //2. Validate that the length is between 3 and 8.
    if (length < 3 || length > 8) {
        return res.status(400).json({ error: 'Word length must be between 3 and 8.'});
        }

    try {
        // 3. Query ONE random word and its signature of this length
        const randomWordResult = await pool.query(
            'SELECT word, signature FROM dictionary WHERE length = $1 ORDER BY RANDOM() LIMIT 1',
            [length]
        )

        // If there are no words of this length in our dictionary
        if (randomWordResult.rows.length === 0) {
            return res.status(404).json({ error: 'No words found of that length.'})
        }

        const targetWord = randomWordResult.rows[0].word
        const signature = randomWordResult.rows[0].signature

        //4. Find all words sharing this signature (these are the anagram answer)
        const anagramsResult = await pool.query(
            'SELECT word FROM dictionary WHERE signature = $1',
            [signature]
        )

        //Maps rows into a simple array of strings: e.g. ["glow", "gowl"] 
        const answer = anagramsResult.rows.map(row => row.word)

        // 5. Scramble the letters of the random word. Using function we have created
        const scrambled = scrambleWord(targetWord)

        // 6. Respond with challenge details
        return res.json({
            letters: scrambled.split(''), // send scrambled letters as an array
            answer: answer, // send the valid answers array
            length: length
        })
    } catch (error) {
        console.error('Error gerating challenge:', error)
        return res.status(500).json({ error: 'Internal server error.'})
    }
})

export default router