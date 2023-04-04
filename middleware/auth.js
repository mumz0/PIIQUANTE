const jwt = require('jsonwebtoken');
 
/**
 * @param req {express.Request}
 * @param res {express.Response}
 * @param next {express.NextFunction}
 */
module.exports = (req, res, next) => {
   try {
       const token = req.headers.authorization.split(' ')[1];
       const decodedToken = jwt.verify(token, process.env.SECRET);
       const userId = decodedToken.userId;
       req.auth = {
           userId: userId
       };
	next();
   } catch(error) {
       res.status(401).json({ error });
   }
};