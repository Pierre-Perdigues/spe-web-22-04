const express = require('express');
const router = express.Router();
const db = require('../db/db');
// const bcrypt = require('bcryptjs');

// Ajouter des routes spécifiques
router.get('/', (req, res) => {
    const sql = 'SELECT * FROM produits';
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(400).json({"error":err.message});
            return;
        }
        
        res.json({ 
            'title': 'Liste des Produits',
            'data': rows 
        });
    });
});

router.post('/', (req, res) => {
    
});

router.get('/:id', (req, res) => {
    const id = req.params.id;
    db.get('SELECT * FROM produits WHERE id = ?', [id], (err, produit) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        
        res.json({ produit });
    });
});

router.put('/:id', (req, res) => {
    res.send(`Mise à jour du produits avec l'id ${req.params.id}`);
});

router.delete('/:id', (req, res) => {
    res.send(`Suppression du produits avec l'id ${req.params.id}`);
});

module.exports = router;
