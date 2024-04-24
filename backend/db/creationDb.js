const sqlite3 = require('sqlite3').verbose();
const db = require('./db');

function creationDb() {
    db.serialize(() => {
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT, 
            password TEXT
        )`);

        db.run(`
            CREATE TABLE IF NOT EXISTS produits (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                libelle TEXT NOT NULL,
                description TEXT,
                prix REAL NOT NULL,
                categorie TEXT
            )
        `);

        db.run(`
            CREATE TABLE IF NOT EXISTS images (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                chemin_image TEXT NOT NULL,
                produit_id INTEGER,
                FOREIGN KEY (produit_id) REFERENCES produits (id) ON DELETE CASCADE
            )
        `);
    });

    // La base de données est automatiquement fermée lorsque le processus se termine,
    // mais vous pouvez la fermer explicitement avec db.close() si nécessaire.
}

module.exports = { creationDb };
