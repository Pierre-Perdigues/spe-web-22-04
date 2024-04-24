const express = require('express');
const router = express.Router();
const db = require('../db/db');
// const bcrypt = require('bcryptjs');

// Ajouter des routes spécifiques
router.get('/', (req, res) => {
    
});

// router.post('/', (req, res) => {
    
// });

// router.get('/:id', (req, res) => {
//     res.send(`Affichage du produits avec l'id ${req.params.id}`);
// });

// router.put('/:id', (req, res) => {
//     res.send(`Mise à jour du produits avec l'id ${req.params.id}`);
// });

// router.delete('/:id', (req, res) => {
//     res.send(`Suppression du produits avec l'id ${req.params.id}`);
// });

module.exports = router;
