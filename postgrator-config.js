require('dotenv').config();

module.exports = {
    "migrationDirectory": "migrations",
    "driver": "pg",
    "connectionString": (process.env.DB_URL === 'test') ? process.env.TEST_DATABASE_URL : process.env.DATABASE_URL,
}