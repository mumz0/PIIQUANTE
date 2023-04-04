require('dotenv').config()
const express = require('express');
const mongoose = require('mongoose');
const userRoutes = require('./routers/user');
const sauceRoutes = require('./routers/sauce');
const path = require("path");
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();

/**
 * Connect to online database
 */
mongoose.connect(process.env.DB_PATH,
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion to MongoDB succeed !'))
  .catch(() => console.log('Connexion to MongoDB failed !'));


const corsOptions = {
  origin: [process.env.DOMAIN],
  optionsSuccessStatus: 200
}
app.use(cors(corsOptions));

const limiter = rateLimit({
  windowMs: process.env.TIME_LIMIT, // limite à 15 minutes
  max: process.env.REQUESTS_LIMIT // limite à 100 requêtes par IP
});

app.use(limiter);

app.use(express.json());

app.use("/images", express.static(path.join(__dirname, "images")));
app.use('/api/auth', userRoutes);
app.use("/api/sauces", sauceRoutes);


module.exports = app;
