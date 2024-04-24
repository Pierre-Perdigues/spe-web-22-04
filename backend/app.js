const express = require('express');
const {creationDb} = require('./db/creationDb');
const userRoutes = require('./routes/userRoutes');
const cors = require('cors');
const app = express();
const port = 5000;

// Initialise la base de données
creationDb()

// Configuration dynamique des CORS basée sur l'environnement
const allowedOrigins = ['http://127.0.0.1:3000', 'http://127.0.0.1:5000/'];

app.use(cors({
    origin: function (origin, callback) {
        // Autoriser les requêtes sans origin (comme les requêtes mobiles ou CURL)
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) === -1) {
            var msg = 'Le CORS policy pour cette origine ne permet pas l\'accès';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    }
}));


app.use(express.json());

// Routes
app.get('/', (req, res) => {
    res.send('Hello World!');
});

// Utiliser les routes pour les utilisateurs
app.use('/users', userRoutes);

app.get("/stats", (req, res) => {
    // const sql = "SELECT * FROM users";
    // db.all(sql, [], (err, rows) => {
    //     if (err) {
    //         res.status(400).json({"error":err.message});
    //         return;
    //     }
    //     res.json({
    //         "message":"coucou",
    //         // "data":rows
    //     })
    // });
});


app.listen(port, () => {
    console.log(`Server running at http://127.0.0.1:${port}`);
});
