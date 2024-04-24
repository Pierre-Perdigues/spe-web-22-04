const express = require('express');
const app = express();

// Définit le moteur de template à utiliser
app.set('view engine', 'ejs');
// Définit le dossier où se trouvent les templates
app.set('views', 'views');

app.use(express.static('public')); // Servir les fichiers statiques depuis le dossier 'public'

app.get('/', (req, res) => {
    res.render('inscription'); // Rend la vue inscription.ejs
});

app.get('/connexion', (req, res) => {
    res.render('connexion'); // Rend la vue connexion.ejs
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on : http://127.0.0.1:${PORT}`);
});
