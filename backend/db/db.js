const sqlite3 = require('sqlite3').verbose();

// Chemin vers le fichier de la base de données SQLite
const DB_PATH = './db/database.sqlite';

const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error(err.message);
        throw err;
    } else {
        console.log('Connected to the SQLite database.');
    }
});

db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name text, 
    password text
)`);


module.exports = db;
