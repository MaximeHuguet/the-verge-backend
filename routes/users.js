var express = require("express");
var router = express.Router();

const User = require("../models/users");

const uid2 = require("uid2");
const bcrypt = require("bcrypt");

const { checkBody } = require("../modules/checkBody");

router.post("/signup", (req, res) => {
  if (!checkBody(req.body, ["username", "email", "password"])) {
    res.json({ result: false, message: "Merci de remplir tous les champs" });
    return;
  }

  User.findOne({
    // On vérifie si l'email ou le username est présent en BDD (avec l'opérateur $or)
    $or: [{ username: req.body.username }, { email: req.body.email }],
  }).then((user) => {
    if (user && user.username === req.body.username) {
      res.json({ result: false, message: "Le nom d'utilisateur existe déjà" });
      return;
    }
    if (user && user.email === req.body.email) {
      res.json({ result: false, message: "L'email renseigné existe déjà" });
      return;
    }
    // Création d'un nouvel utilisateur
    if (user === null) {
      const token = uid2(32);
      const hash = bcrypt.hashSync(req.body.password, 10);

      const newUser = new User({
        username: req.body.username,
        email: req.body.email,
        password: hash,
        token: token,
        canBookmark: true,
      });
      //Enregistrement de l'utilisateur en BDD et envoie de la réponse avec le token créé
      newUser.save().then((user) =>
        res.json({
          result: true,
          message: "L'utilisateur a bien été enregistré",
          token: user.token,
          username: user.username
        })
      );
    } else {
      res.json({
        result: false,
        message: "L'utilisateur n'a pas pu être enregistré",
      });
    }
  });
});

router.post("/signin", (req, res) => {
  if (!checkBody(req.body, ["email", "password"])) {
    res.json({ result: false, message: "Merci de remplir tous les champs" });
    return;
  }

  User.findOne({ email: req.body.email }).then(async (user) => {
    if (!user) {
      // On retourne une erreur (sans préciser le champ pour des raisons de sécurité)
      res.json({
        result: false,
        message: "Les identifiants renseignés sont introuvables",
      });
      return;
    }
    const passwordMatch = await bcrypt.compare(
      req.body.password,
      user.password
    );
    // Connexion autorisée - envoi de la réponse et du token utilisateur
    if (user && passwordMatch) {
      res.json({ result: true, token: user.token, username: user.username });
    } else {
      res.json({ result: false, message: "Les identifiants sont incorrects" });
    }
  });
});

router.get("/canBookmark/:token", (req, res) => {
  User.findOne({ token: req.params.token }).then((user)=> {
    if (user){
      res.json({ result : true , canBookmark : true})
    } else {
      res.json ({ result : false , canBookmark : false})
    }
  })
})

module.exports = router;
