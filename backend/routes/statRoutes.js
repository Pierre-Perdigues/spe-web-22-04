const express = require('express');
const router = express.Router();
const db = require('../db/db');
const cors = require('cors');

router.get('/',cors(), (req, res) => {
    const sql = "SELECT categorie AS nom, COUNT(*) AS compte FROM produits GROUP BY categorie";
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({
            message: 'Nombre de produits par catégorie',
            data: rows
        });
    });
});


module.exports = router;
