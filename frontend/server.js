const app = require('./app');

// Là ou tourne le serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on : http://127.0.0.1:${PORT}`);
});