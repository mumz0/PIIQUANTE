const jwt = require('jsonwebtoken');
const User = require("../models/user");
const bcrypt = require('bcrypt')

/**
 * @param req {express.Request}
 * @param res {express.Response}
 * @param next {express.NextFunction}
 */
exports.signup = (req, res, next) => {
    // Vérifier si l'adresse mail est valide
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,63}$/;
    if (!emailRegex.test(req.body.email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }
  
    bcrypt.hash(req.body.password, 10)
      .then(hash => {
        const user = new User({
          email: req.body.email,
          password: hash
        });
        user.save()
          .then(() => res.status(201).json({ message: 'User created !' }))
          .catch(error => res.status(400).json({ error }));
      })
      .catch(error => res.status(500).json({ error }));
  };


/**
 * @param req {express.Request}
 * @param res {express.Response}
 * @param next {express.NextFunction}
 */
exports.login = (req, res, next) => {
User.findOne({ email: req.body.email })
    .then(user => {
        if (!user) {
            return res.status(401).json({ error: 'User not found !' });
        }
        bcrypt.compare(req.body.password, user.password)
            .then(valid => {
                if (!valid) {
                    return res.status(401).json({ error: 'Incorrect password !' });
                }
                res.status(200).json({
                    userId: user._id,
                    token: jwt.sign(
                        { userId: user._id },
                        process.env.SECRET,
                        { expiresIn: '24h' }
                    )
                });
            })
            .catch(error => res.status(500).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
};