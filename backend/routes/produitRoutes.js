const express = require('express');
const router = express.Router();
const multer = require('multer');
const db = require('../db/db');
const path = require('path');
// const bcrypt = require('bcryptjs');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        console.log("dzdzdz");
        cb(null, 'images/');  // Assurez-vous que ce dossier existe
    },
    filename: function (req, file, cb) {
        console.log("storage 1");
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        console.log("storage 2");
        cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop());
    }
});

const upload = multer({ storage: storage });

// Ajouter des routes spécifiques
router.get('/', (req, res) => {
    db.all('SELECT * FROM produits', [], (err, rows) => {
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

router.post('/', upload.array('images'), (req, res) => {
    console.log("hellodzdzd");
    const { nom, description, prix, categorie } = req.body;
    console.log(req.body);
    console.log(req.files);

    // Insertion du produit dans la table produits
    db.run(`INSERT INTO produits (libelle, description, prix, categorie) VALUES (?, ?, ?, ?)`, [nom, description, prix, categorie], function(err) {
        if (err) {
            return console.error(err.message);
        }
        console.log(`A row has been inserted with rowid ${this.lastID}`);

        // Insertion des images associées au produit
        req.files.forEach(file => {
            const filePath = path.join('images', file.filename); // Assurez-vous que le chemin est correct
            db.run(`INSERT INTO images (chemin_image, produit_id) VALUES (?, ?)`, [filePath, this.lastID], function(err) {
                if (err) {
                    return console.error(err.message);
                }
                console.log(`Image saved with rowid ${this.lastID}`);
            });
        });

        res.status(201).json({ message: 'Produit ajouté avec succès', data: req.body });
    });
});

router.get('/:id', (req, res) => {
    const id = req.params.id;
    db.get('SELECT * FROM produits WHERE id = ?', [id], (err, produit) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!produit) {
            return res.status(404).json({ error: 'Produit non trouvé' });
        }

        // Si le produit est trouvé, cherchez les images
        db.all('SELECT chemin_image FROM images WHERE produit_id = ?', [id], (err, images) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            // Ajouter les chemins des images au produit si disponibles
            produit.chemin_images = images.map(img => img.chemin_image);

            // Envoi de la réponse complète ici
            res.json({ produit });
        });
    });
});


router.put('/:id', (req, res) => {

});

router.delete('/:id', (req, res) => {
});

module.exports = router;
