const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
   try {
       const authorizationHeader = req.headers.authorization;
       if (!authorizationHeader) {
           throw 'Authorization header manquant !';
       }
       const token = authorizationHeader.split(' ')[1];
       if (!token) {
           throw 'Token manquant';
       }
       const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET');
       const userId = decodedToken.userId;
       console.log('Token:', token);
       req.auth = {
           userId: userId
       };
       next();
   } catch (error) {
       console.error('Authentication error:', error);
       res.status(401).json({ error: new Error('Requête invalide') });
   }
};
