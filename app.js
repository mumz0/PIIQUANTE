require('dotenv').config()
const express = require('express');
const mongoose = require('mongoose');
const userRoutes = require('./routers/user');
const sauceRoutes = require('./routers/sauce');
const path = require("path");

const app = express();

mongoose.connect(process.env.DB_PATH,
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));


app.use((req, res, next) => {
res.setHeader("Access-Control-Allow-Origin", "*");
res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
);
res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
);
next();
});

app.use(express.json());

app.use("/images", express.static(path.join(__dirname, "images")));
app.use('/api/auth', userRoutes);
app.use("/api/sauces", sauceRoutes);

app.use((req, res, next) => {
  console.log('Requête reçue !');
  next();
});

app.use((req, res, next) => {
  res.status(201);
  next();
});

app.use((req, res, next) => {
  res.json({ message: 'Votre requête a bien été reçue !' });
  next();
});

app.use((req, res, next) => {
  console.log('Réponse envoyée avec succès !');
});

module.exports = app;
