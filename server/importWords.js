import { response } from 'express'
import pool from './db.js'

// Helper function to sort letters of a word alphabetically
// Example: "apple" -> "AELPP"
function calculateSignature(word) {
    return word.toUpperCase().split('').sort().join('')
}

async function importWords() {
    const WORLD_LIST_URL = 'https://gist.githubusercontent.com/scrabblewords/6b7d99f608cd428efe2a21228c62a788/raw/CSW21.txt'

    console.log('🔄 Fetching word list from GitHub...')

    try {
        const response = await fetch(WORLD_LIST_URL)
        if (!response.ok) throw new Error('Failed to fetch word list:${response.statusText}')

        const text = await response.text()
        const allWords = await text.split('\n')
        console.log(`Found ${allWords.length} words in the raw list.`)   

        // Filter words: 
        // - Trim spacing and make uppercase
        // - Keep words between 3 and 8 letters
        // - Make sure they only contain characters A-Z
        const filteredWords = allWords
            .map(w => w.trim().toUpperCase())
            .filter(w => w.length >= 3 && w.length <= 8 && /^[A-Z]+$/.test(w))

        console.log(`Filtered to ${filteredWords.length} words (length 3 to 8).`)

        // Prepare data rows for database insertion
        const preparedWords = filteredWords.map(word => {
            const signature = calculateSignature(word)
            return [word, signature, word.length]
        })

        console.log('🧹 Clearing old dictionary entries from database...')
        await pool.query('TRUNCATE TABLE dictionary CASCADE;')

        console.log('🚀 Importing words in batches to database (this might take 10-15 seconds)...')

        const batchSize = 1000
        for (let i = 0; i < preparedWords.length; i += batchSize) {
            const batch = preparedWords.slice(i, i + batchSize)

            // Build a bulk INSERT query:
            // INSERT INTO dictionary (word, signature, length) VALUES ($1, $2, $3), ($4, $5, $6)...
            const valuesPlaceholders = []
            const queryValues = []

            batch.forEach((row, rowIndex) => {
                const offset = rowIndex * 3
                valuesPlaceholders.push(`($${offset + 1}, $${offset + 2}, $${offset + 3})`)
                queryValues.push(row[0], row[1], row[2])
            })

            const queryText = `
                INSERT INTO dictionary (word, signature, length) 
                VALUES ${valuesPlaceholders.join(', ')}
                ON CONFLICT (word) DO NOTHING;
            `

            await pool.query(queryText, queryValues)
        }

        console.log('✅ Import completed successfully!')

    } catch(error) {
        console.error('❌ Error importing words:', error)
    } finally {
        // Close the connection pool so the script ends cleanly
        await pool.end()
    }
}

importWords()