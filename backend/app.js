const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const bookRoutes = require('./routes/books');
const userRoutes = require('./routes/user');
require('dotenv').config()

const app = express();

// Connexion à MongoDB
mongoose.connect(process.env.USER_MONGODB, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.catch((error) => console.error('Connexion à MongoDB échouée :', error));

app.use(express.json());
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

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