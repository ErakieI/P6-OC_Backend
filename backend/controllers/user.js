const bcrypt = require("bcrypt");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const passwordValidator = require("../models/passwordValidator");
const emailValidator = require("email-validator");

exports.signup = (req, res, next) => {
  if (!emailValidator.validate(req.body.email)) {
    return res.status(400).json({ error: "Email invalide" });
  }
  const validationErrors = passwordValidator.validate(req.body.password, {
    list: true,
  });
  if (validationErrors.length > 0) {
    return res
      .status(400)
      .json({
        error: `Le mot de passe n'est pas valide: ${validationErrors.join(
          ", "
        )}`,
      });
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
    .then(() => res.status(201).json({ message: "Utilisateur créé !" }))
    .catch((error) => {
      console.error("Erreur lors de la création de l'utilisateur:", error);
      res.status(400).json({ error });
    });
};

exports.login = (req, res, next) => {
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (!user) {
        return res
          .status(401)
          .json({ error: "Paire Utilisateur/mdp incorrect" });
      }
      return bcrypt.compare(req.body.password, user.password).then((valid) => {
        if (!valid) {
          return res
            .status(401)
            .json({ error: "Paire Utilisateur/mdp incorrect" });
        }
        res.status(200).json({
          userId: user._id,
          token: jwt.sign({ userId: user._id }, "RANDOM_TOKEN_SECRET", {
            expiresIn: "24h",
          }),
        });
      });
    })
    .catch((error) => {
      console.error("Erreur lors de la tentative de connexion:", error);
      res.status(500).json({ error });
    });
};
