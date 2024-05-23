const express = require('express');
const fs = require('fs');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const bookRoutes = require('./routes/books');
const userRoutes = require('./routes/user');
const Book = require('./models/book');

const app = express();

// Lecture du contenu de data.json
const rawData = fs.readFileSync('../frontend/public/data/data.json');
const jsonData = JSON.parse(rawData);

// Connexion à MongoDB
mongoose.connect('mongodb+srv://toto:totomdp@cluster0.ihzxaoz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
// .then(() => {
//   Book.deleteMany({}, function(err) {
//     if (err) {
//       console.error(err);
//     } else {
//       console.log('Base de données vidée avec succès !');
//     }})
// })
// .then(async () => {
//   console.log('Connexion à MongoDB réussie !');
//   // Insérer les livres dans MongoDB
//   await Book.insertMany(jsonData);
//   console.log('Livres insérés avec succès dans MongoDB !');
// })
.catch((error) => console.error('Connexion à MongoDB échouée :', error));

// Configuration CORS localhost
const corsOptions = {
  origin: 'http://localhost:3000',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: 'Origin,X-Requested-With,Content-Type,Accept,Authorization'
};

app.use(cors(corsOptions));

// Middleware CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

// Body parser pour les requêtes JSON
app.use(express.json());

// Routes
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/api/books', bookRoutes);
app.use('/api/auth', userRoutes);

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error('Erreur serveur :', err);
  res.status(500).json({ error: err.message || 'Erreur serveur' });
});

module.exports = app;
