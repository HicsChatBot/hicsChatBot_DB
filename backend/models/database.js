// Loading and initializing the library:
const pgp = require('pg-promise')({
    // Initialization Options
});

const dotenv = require('dotenv');
dotenv.config(); // load in from .env file

// Preparing the connection details:
const cn = process.env.DB_URL;

// Creating a new database instance from the connection details:
const db = pgp(cn);

module.exports = {
    db,
};
