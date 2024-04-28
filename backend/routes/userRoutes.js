const express = require('express');
const router = express.Router();
const db = require('../db/db');
const bcrypt = require('bcryptjs');

// Connexion
router.post('/log', (req, res) => {
    // console.log("b user", req.body);
    const { username, password } = req.body;
    db.get("SELECT * FROM users WHERE name = ?", [username], (err, user) => {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ message: 'Error lors de la requete', error: err.message });
        }
        if (!user) {
            return res.status(404).json({ message: 'Rien trouver' });
        }

        // Comparer le mot de passe fourni avec le hash stocké
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) {
                console.error(err.message);
                return res.status(500).json({ message: 'PB mdp', error: err.message });
            }
            if (isMatch) {
                console.log(isMatch);
                res.status(200).json({ message: 'Logged in successfully', username: user.name, userId: user.id });
            } else {
                res.status(401).json({ message: 'Invalid password or username' });
            }
        });
    });
    
});

// Inscription
router.post('/new', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).send({ message: 'Nom et mdp requis' });
    }

    const hashedPassword = bcrypt.hashSync(password, 8); // Hashage du mot de passe

    const query = `INSERT INTO users (name, password) VALUES (?, ?)`;
    db.run(query, [username, hashedPassword], function(err) {
        if (err) {
            console.error(err.message);
            return res.status(500).send({ message: 'Erreur inscription', error: err.message });
        }
        res.status(200).json({ 
            message: 'Utilisateur créer', 
            userId: this.lastID });
    });
});

router.post('/inf', (req, res) => {
    // console.log("pass");
    db.get("SELECT name, id FROM users WHERE id = ?", [req.body.id], (err, user) => {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ message: 'Error lors de la requete', error: err.message });
        }
        if (user) {
            // console.log("trouver");
            res.status(200).json(user);
        } else {
            return res.status(404).json({ message: 'Rien trouver' });
        }
    });
});

router.put('/:id', (req, res) => {
});

router.delete('/:id', (req, res) => {
});

module.exports = router;
