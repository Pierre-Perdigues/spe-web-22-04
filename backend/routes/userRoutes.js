const express = require('express');
const router = express.Router();
const db = require('../db/db');
const bcrypt = require('bcryptjs');

// Ajouter des routes spécifiques
router.get('/', (req, res) => {
    const sql = "SELECT * FROM users";
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(400).json({"error":err.message});
            return;
        }
        res.json({
            "message":"success",
            "data":rows
        })
    });
});

router.post('/', (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !password) {
        return res.status(400).send({ message: 'Username and password are required' });
    }

    const hashedPassword = bcrypt.hashSync(password, 8); // Hashage du mot de passe

    const query = `INSERT INTO users (name, password) VALUES (?, ?)`;
    db.run(query, [username, hashedPassword], function(err) {
        if (err) {
            console.error(err.message);
            return res.status(500).send({ message: 'Error registering new user', error: err.message });
        }
        res.status(201).send({ message: 'User created successfully', id: this.lastID });
    });
});

router.get('/:id', (req, res) => {
    res.send(`Affichage de l'utilisateur avec l'id ${req.params.id}`);
});

router.put('/:id', (req, res) => {
    res.send(`Mise à jour de l'utilisateur avec l'id ${req.params.id}`);
});

router.delete('/:id', (req, res) => {
    res.send(`Suppression de l'utilisateur avec l'id ${req.params.id}`);
});

module.exports = router;