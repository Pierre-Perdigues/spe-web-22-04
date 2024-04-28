const express = require('express');
const app = express();
const { expressCspHeader, INLINE, NONE, SELF, STRICT_DYNAMIC, NONCE } = require('express-csp-header');
const csrf = require('csrf');
const tokens = new csrf()
const secretCsrf = tokens.secretSync()
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
app.use(express.urlencoded({ extended: true }));
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const crypto = require('crypto');
const { Blob } = require('buffer');
const fs = require('fs');
const path = require('path');
const xss = require('xss');

const session = require('express-session');

app.use(session({
    secret: 'ma_super_session_de_fou', // Utilisez un secret fort en production
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

// Configurer la stratégie locale de Passport
passport.use(new LocalStrategy(
    function (username, password, done) {
        // Votre logique de vérification d'utilisateur, remplacez cette partie par votre logique de base de données
        fetch('http://127.0.0.1:5000/users/log', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password })
        })
            .then(res => res.json())
            .then(user => {
                console.log(user);
                if (user && user.username === username) {
                    return done(null, user);
                } else {
                    return done(null, false, { message: 'Incorrect username or password.' });
                }
            })
            .catch(err => done(err));
    }
));

// Sérialisation et désérialisation de l'utilisateur (pour les sessions)
passport.serializeUser((user, done) => {
    done(null, { userId: user.userId, username: user.username },);
});

passport.deserializeUser((id, done) => {
    // Simulez la récupération de l'utilisateur à partir de l'ID
    fetch(`http://127.0.0.1:5000/users/inf`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id })
    })
        .then(res => res.json())
        .then(user => done(null, user))
        .catch(err => done(err, null));
});

function nonceMiddleware(req, res, next) {
    res.locals.nonce = crypto.randomBytes(16).toString('base64');
    next();
}

app.use(nonceMiddleware);

app.use(expressCspHeader({
    directives: {
        'default-src': [SELF],
        'img-src': [SELF, 'http://127.0.0.1:5000/public/image/', 'http://127.0.0.1:5000/images/'],
        'script-src': [
            SELF,
            'https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js', ,
            NONCE

        ],
        'style-src': [
            SELF,
            INLINE,
            'https://fonts.googleapis.com',
            'https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css',
            'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.1/css/all.min.css',
            'https://code.jquery.com/jquery-3.5.1.slim.min.js'
        ],
        'font-src': [
            'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.1/webfonts/',
            'https://fonts.gstatic.com/'
        ],
        'connect-src': [SELF, 'http://127.0.0.1:5000/'],
        'media-src': [NONE],
        'object-src': [NONE],
        'frame-src': [NONE],
        'base-uri': [SELF],
        'report-uri': ['/csp-violation-report-app']
    }
}));




app.use((req, res, next) => {
    res.locals.nonce = req.nonce; // Stocker le nonce dans res.locals pour y accéder dans les vues
    next();
});
// Définit le moteur de template à utiliser
app.set('view engine', 'ejs');
// Définit le dossier où se trouvent les templates
app.set('views', 'views');

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { // Vérifie si l'utilisateur est authentifié
        return next();
    }
    res.redirect('/connexion'); // Redirige vers la page de connexion si non connecté
}

function ensureGuest(req, res, next) {
    if (!req.isAuthenticated()) { // Vérifie si l'utilisateur n'est pas authentifié
        return next();
    }
    res.redirect('/dashboard'); // Redirige vers le dashboard si déjà connecté
}

app.use((req, res, next) => {
    res.locals.isAuthenticated = req.isAuthenticated();;
    next();
});

app.get('/', (req, res) => {
    console.log(req.nonce);
    res.render('home', { nonce: req.nonce }); // Rend la vue home.ejs
});

const authenticatedRoutes = [
    { path: '/dashboard', method: 'get', handler: (req, res) => res.render('dashboard', { user: req.session.passport.user.username }) },
    { path: '/ajout-produit', method: 'get', handler: (req, res) => res.render('ajout-produit', { csrfToken: tokens.create(secretCsrf), nonce: req.nonce }) }
];

const notAuthenticatedRoutes = [
    { path: '/inscription', method: 'get', handler: (req, res) => res.render('inscription', { csrfToken: tokens.create(secretCsrf), nonce: req.nonce }) },
    { path: '/connexion', method: 'get', handler: (req, res) => res.render('connexion', { csrfToken: tokens.create(secretCsrf), nonce: req.nonce }) }
];


app.post('/connexion', ensureGuest, (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) { return next(err); }
        if (!user) { return res.status(401).render('connexion', { csrfToken: tokens.create(secretCsrf), error: info.message, nonce: req.nonce }); }
        req.logIn(user, function (err) {
            if (err) { return next(err); }
            if (!tokens.verify(secretCsrf, req.body._csrf)) {
                throw new Error('invalid token!')
            } else {
                console.log("tout est bon");
                return res.redirect('/dashboard');
            }
        });
    })(req, res, next);
});

app.post('/inscription', ensureGuest, (req, res, next) => {
    if (!tokens.verify(secretCsrf, req.body._csrf)) {
        throw new Error('invalid token!')
    } else {
        function validatePassword(password) {
            const hasMinLength = password.length >= 8;
            const hasUpperCase = /[A-Z]/.test(password);
            const hasLowerCase = /[a-z]/.test(password);
            const hasNumber = /[0-9]/.test(password);
            const hasSpecialChar = /[\@\#\$\%\^\&\*\(\)\_\+\!\?\/]/.test(password)

            return hasMinLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;
        }

        if (!validatePassword(req.body.password)) {
            return res.status(500).send({ message: 'Le mot de passe ne respecte pas les critères requis.' });
        }

        console.log(req.body.username);
        fetch('http://127.0.0.1:5000/users/new', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username: req.body.username, password: req.body.password })
        })
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error('Inscription échouée');
                }
            })
            .then(() => {
                res.redirect('/connexion')
            })
    }
})

app.get('/produits', (req, res) => {
    res.render('produits', { nonce: req.nonce }); // Rend la vue produits.ejs
});

app.get('/panier', (req, res) => {
    res.render('panier', { nonce: req.nonce }); // Rend la vue panier.ejs
});

app.get('/statistiques', (req, res) => {
    res.render('stats', { nonce: req.nonce }); // Rend la vue stats.ejs
});

app.get('/produits-detail/:id', (req, res) => {
    res.render('produitDetail', { id: req.params.id, csrfTokenM: tokens.create(secretCsrf), csrfTokenD: tokens.create(secretCsrf), nonce: req.nonce }); // Rend la vue produitDetail.ejs
});

app.post('/produits-detail/:id', ensureAuthenticated, (req, res) => {
    console.log('const');
    const { libelle, prix, categorie, description } = req.body
    if (!tokens.verify(secretCsrf, req.body._csrf)) {
        throw new Error('invalid token!')
    } else {
        console.log('test del');
        if (!req.body.del) {
            fetch('http://127.0.0.1:5000/produits/', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ libelle, prix, categorie, description, id: req.params.id })
            })
                .then(response => {
                    if (response.ok) {
                        res.redirect('/produits')
                    } else {
                        throw new Error('Inscription échouée');
                    }
                })
        } else {
            console.log('oui del');
            fetch('http://127.0.0.1:5000/produits/', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: req.params.id })
            })
                .then(response => {
                    if (response.ok) {
                        res.redirect('/produits')
                    } else {
                        throw new Error('Inscription échouée');
                    }
                })
        }
    }
});

app.get('/logout', (req, res) => {
    req.logout(() => {
        res.redirect('/connexion');
    });
});


app.post('/ajout-produit', upload.array('images', 12), ensureAuthenticated, (req, res, next) => {
    if (!tokens.verify(secretCsrf, req.body._csrf)) {
        throw new Error('invalid token!')
    } else {
        const cleanNom = xss(req.body.nom);
        const cleanDescription = xss(req.body.description);
        const cleanPrix = xss(req.body.prix);
        const cleanCategorie = xss(req.body.categorie);

        // Vérification que le prix est un nombre valide
        if (isNaN(cleanPrix)) {
            return res.status(400).send({ error: 'Le prix doit être un chiffre valide.' });
        }

        const myForm = new FormData();
        myForm.append("nom", cleanNom);
        myForm.append("description", cleanDescription);
        myForm.append("prix", cleanPrix);
        myForm.append("categorie", cleanCategorie);

        // Ajout des fichiers
        req.files.forEach(file => {
            const fileBlob = new Blob([file.buffer], { type: file.mimetype });
            myForm.append('images', fileBlob, file.originalname);
        });

        fetch('http://127.0.0.1:5000/produits', {
            method: 'POST',
            body: myForm // Envoie FormData directement, ce qui inclut les fichiers et les autres champs
        })
            .then(response => {
                if (response.ok) {
                    console.log('Produit ajouté avec succès');
                    res.redirect('/produits'); // Effectue la redirection si la requête est réussie
                }
            });
    }
});

authenticatedRoutes.forEach(route => {
    app[route.method](route.path, ensureAuthenticated, route.handler);
});

notAuthenticatedRoutes.forEach(route => {
    app[route.method](route.path, ensureGuest, route.handler);
});

app.use(express.json({ type: 'application/csp-report' }));
app.post('/csp-violation-report-app', (req, res) => {
    const reportData = JSON.stringify(req.body, null, 2); // Convertir l'objet en JSON formaté pour une meilleure lisibilité
    const filePath = path.join(__dirname, 'csp-reports.log'); // Définir le chemin du fichier de rapport

    // Écrire les données dans le fichier de manière asynchrone
    fs.appendFile(filePath, reportData + "\n", (err) => {
        if (err) {
            console.error('Failed to write CSP report to file', err);
            res.status(500).send('Failed to record CSP report');
            return;
        }

        console.log('CSP Violation reported and logged.');
        res.status(204).end(); // Envoyer une réponse de statut 'no content' au navigateur
    });
});

app.get('/csp-reports', ensureAuthenticated, (req, res) => {
    const logFilePath = path.join(__dirname, 'csp-reports.log');

    fs.readFile(logFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading the log file:', err);
            return res.status(500).send("Unable to read log file.");
        }

        res.setHeader('Content-Type', 'text/plain');
        res.send(data);
    });
});

module.exports = app;
