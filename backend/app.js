const express = require('express');
const {creationDb} = require('./db/creationDb');
const userRoutes = require('./routes/userRoutes');
const path = require('path');
const produitRoutes = require('./routes/produitRoutes');
const cors = require('cors');
const app = express();

app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
const port = 5000;

// Initialise la base de données
creationDb()
app.use(express.json());
// Configure le dossier public comme un dossier de contenu statique
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));

// Configuration des CORS
const allowedOrigins = ['http://127.0.0.1:3000', 'http://127.0.0.1:5000/'];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            return callback(new Error('Le CORS policy pour cette origine ne permet pas l\'accès'), false);
        }
        return callback(null, true);
    },
    credentials: true,  // Important si utilisation des sessions ou des cookies
    allowedHeaders: ['Content-Type']  // Autoriser 'csrf-token' dans les en-têtes
}));

// Routes
app.get('/', (req, res) => {
    res.send('Hello World!');
});

// Utiliser les routes pour les utilisateurs
app.use('/users', userRoutes);

// Utiliser les routes pour les produits
app.use('/produits', produitRoutes);

// Utiliser les routes pour les stats
app.get("/stats", (req, res) => {
});

// Là ou tourne le serveur
app.listen(port, () => {
    console.log(`Server running at http://127.0.0.1:${port}`);
});
