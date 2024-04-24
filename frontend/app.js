const express = require('express');
const app = express();
const { expressCspHeader, INLINE, NONE, SELF } = require('express-csp-header');

// styleCsp = [SELF, INLINE, 'https://fonts.googleapis.com', ]
// styleCspA = [...styleCsp, 'https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css']
// console.log(styleCsp);
// console.log(styleCspA);

app.use(expressCspHeader({
    directives: {
        'default-src': [SELF],
        'img-src': [SELF, 'https://trusted.images.com'],
        'script-src': [SELF, INLINE, 'https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js'],
        'style-src': [SELF, INLINE, 'https://fonts.googleapis.com', 
            'https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css',],
        'font-src': ['https://fonts.gstatic.com'],
        'connect-src': [SELF, 'http://127.0.0.1:5000/'],
        'media-src': [NONE],
        'object-src': [NONE],
        'frame-src': [NONE]
    }
}));

// Définit le moteur de template à utiliser
app.set('view engine', 'ejs');
// Définit le dossier où se trouvent les templates
app.set('views', 'views');

app.use(express.static('public')); // Servir les fichiers statiques depuis le dossier 'public'

app.get('/', (req, res) => {
    res.render('home'); // Rend la vue inscription.ejs
});

app.get('/inscription', (req, res) => {
    res.render('inscription'); // Rend la vue inscription.ejs
});

app.get('/connexion', (req, res) => {
    res.render('connexion'); // Rend la vue connexion.ejs
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on : http://127.0.0.1:${PORT}`);
});
