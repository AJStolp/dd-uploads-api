require('dotenv').config();

module.exports = {
    "migrationDirectory": "migrations",
    "driver": "pg",
    "connectionString": (process.env.DB_URL === 'test') ? process.env.TEST_DB_URL : process.env.DB_URL,
}