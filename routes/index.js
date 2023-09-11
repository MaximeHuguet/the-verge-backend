var express = require('express');
var router = express.Router();
NEWS_API_KEY = process.env.NEWS_API_KEY

// Création de la route qui récupère tous les articles de The Verge
router.get('/articles', (req, res) => {
    fetch(`https://newsapi.org/v2/everything?sources=the-verge&apiKey=${NEWS_API_KEY}`)
    .then((response) => response.json())
    .then(data => {
        if (data.status === "ok"){
            res.json({ articles: data.articles })
        }
        else {
            res.json({ articles : [] })
        }
    })

})

module.exports = router;
