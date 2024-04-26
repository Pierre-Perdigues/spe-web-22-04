const express = require('express');
const app = express();
const { expressCspHeader, INLINE, NONE, SELF } = require('express-csp-header');
const csrf = require('csrf');
const tokens = new csrf()
const secretCsrf = tokens.secretSync()
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
app.use(express.urlencoded({ extended: true }));
const multer = require('multer');
const storage = multer.memoryStorage(); 
const upload = multer({ storage: storage });
const FormData = require('form-data');
const fs = require('fs');

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
    done(null, user.userId);
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

app.use(expressCspHeader({
    directives: {
        'default-src': [SELF],
        'img-src': [SELF, 'http://127.0.0.1:5000/public/image/', 'http://127.0.0.1:5000/images/'],
        'script-src': [SELF, INLINE, 'https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js'],
        'style-src': [SELF, INLINE, 'https://fonts.googleapis.com',
            'https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css',
            'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.1/css/all.min.css'],
        'font-src': ['https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.1/webfonts/', 'https://fonts.gstatic.com/'],
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
    res.render('home'); // Rend la vue home.ejs
});

const authenticatedRoutes = [
    { path: '/dashboard', method: 'get', handler: (req, res) => res.render('dashboard') },
    { path: '/ajout-produit', method: 'get', handler: (req, res) => res.render('ajout-produit', { csrfToken: tokens.create(secretCsrf) }) }
];

const notAuthenticatedRoutes = [
    { path: '/inscription', method: 'get', handler: (req, res) => res.render('inscription', { csrfToken: tokens.create(secretCsrf) }) },
    { path: '/connexion', method: 'get', handler: (req, res) => res.render('connexion', { csrfToken: tokens.create(secretCsrf) }) }
];


app.post('/connexion', ensureGuest, (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) { return next(err); }
        if (!user) { return res.status(401).render('connexion', { csrfToken: tokens.create(secretCsrf), error: info.message }); }
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

app.post('/ajout-produit', upload.array('images', 12), ensureAuthenticated, (req, res, next) => {
    if (!tokens.verify(secretCsrf, req.body._csrf)) {
        throw new Error('invalid token!')
    } else { 
        console.log("c'est ok");
        return res.status(201).send()
    }
})

app.post('/inscription', ensureGuest, (req, res, next) => {
    if (!tokens.verify(secretCsrf, req.body._csrf)) {
        throw new Error('invalid token!')
    } else { 
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

app.post('/ajout-produit', upload.array('images', 12), ensureAuthenticated, (req, res, next) => {
    console.log(req.body);
    // if (!tokens.verify(secretCsrf, req.body._csrf)) {
    //     throw new Error('invalid token!')
    // } else {
    //     const formData = new FormData()
    //     // Object.keys(req.body).forEach(key => {
    //     //     formData.append(key, req.body[key]);
    //     // });
    //     formData.append("nom", req.body.nom)
    //     // console.log(formData);
    //     console.log(req.body.nom);
    //     // Ajouter les fichiers à formData
    //     req.files.forEach(file => {
    //         // 'file' est le fichier téléchargé
    //         formData.append('images', file);
    //         console.log(file);
            
    //     });
    //     console.log(formData);
    //     console.log(formData.getHeaders());
    //     fetch('http://127.0.0.1:5000/produits', {
    //         method: 'POST',
    //         body: formData,
    //         headers: formData.getHeaders() 
    //     }).then(() => {
    //         return res.redirect('/produits')
    //     })

    // }
    if (!tokens.verify(secretCsrf, req.body._csrf)) {
        throw new Error('invalid token!')
    } else { 
        console.log("c'est ok");
        return res.status(201)
        console.log("c'est ok");
        next()
    }
});

app.get('/produits', (req, res) => {
    res.render('produits'); // Rend la vue produits.ejs
});

app.get('/produits-detail/:id', (req, res) => {
    res.render('produitDetail'); // Rend la vue produitDetail.ejs
});

app.get('/logout', (req, res) => {
    req.logout(() => {
        res.redirect('/connexion');
    });
});

authenticatedRoutes.forEach(route => {
    app[route.method](route.path, ensureAuthenticated, route.handler);
});

notAuthenticatedRoutes.forEach(route => {
    app[route.method](route.path, ensureGuest, route.handler);
});


// Là ou tourne le serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on : http://127.0.0.1:${PORT}`);
});
