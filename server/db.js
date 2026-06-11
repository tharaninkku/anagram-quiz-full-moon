import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const { Pool } = pg

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production'
    ? {rejectUnauthorized: false}
    : false
})

pool.connect((err, client, release) => {
    if (err) {
        console.error('Database connection failed:', err.message)
    } else {
        console.log('Database connected successfully!')
        release()   
    }
})

process.on('uncaughtException', (err) => {
  console.error('Uncaught error:', err.message)
})

export default pool