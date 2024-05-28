const bcrypt = require('bcrypt');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const passwordValidator = require('../models/passwordValidator');
const emailValidator = require('email-validator');

exports.signup = (req, res, next) => {
  console.log('Tentative de création d\'utilisateur:', req.body.email);
  if (!emailValidator.validate(req.body.email)) {
    return res.status(400).json({ error: 'Email invalide' });
  }
  const validationErrors = passwordValidator.validate(req.body.password, { list: true });
  if (validationErrors.length > 0) {
    console.error('Erreur de validation du mot de passe:', validationErrors);
    return res.status(400).json({ error: `Le mot de passe n'est pas valide: ${validationErrors.join(', ')}` });
  }
  bcrypt
    .hash(req.body.password, 10)
    .then((hash) => {
      const user = new User({
        email: req.body.email,
        password: hash,
      });
      return user.save();
    })
    .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
    .catch((error) => {
      console.error('Erreur lors de la création de l\'utilisateur:', error);
      res.status(400).json({ error });
    })
};


exports.login = (req, res, next) => {
    console.log('Tentative de connexion pour l\'utilisateur:', req.body.email);
    User.findOne({ email: req.body.email })
      .then(user => {
        if (!user) {
          console.warn('Utilisateur non trouvé:', req.body.email);
          return res.status(401).json({ error: 'Utilisateur non trouvé !' });
        }
        return bcrypt.compare(req.body.password, user.password)
          .then(valid => {
            if (!valid) {
              console.warn('Mot de passe incorrect pour l_utilisateur:', req.body.email);
              return res.status(401).json({ error: 'Mot de passe incorrect !' });
            }
            res.status(200).json({
              userId: user._id,
              token: jwt.sign(
                { userId: user._id },
                'RANDOM_TOKEN_SECRET',
                { expiresIn: '24h' }
              )
            });
          });
      })
      .catch(error => {
        console.error('Erreur lors de la tentative de connexion:', error);
        res.status(500).json({ error });
      });
  };
  