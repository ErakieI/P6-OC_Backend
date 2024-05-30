const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = (req, res, next) => {
  try {
    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader) {
      throw "Authorization header manquant !";
    }
    const token = authorizationHeader.split(" ")[1];
    if (!token) {
      throw "Token manquant";
    }
    const decodedToken = jwt.verify(token, process.env.TOKEN_ENV);
    const userId = decodedToken.userId;
    req.auth = {
      userId: userId,
    };
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(401).json({ error: new Error("Requête invalide") });
  }
};
