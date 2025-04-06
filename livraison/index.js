const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const Livraison = require('./models/Livraison');
const app = express();
const verifyToken = require('./middleware/auth');
app.use(express.json());


app.post('/livraison/ajouter', verifyToken, async (req, res) => {
  try {
    const response = await axios.get(
      `http://localhost:5000/commande/${req.body.commande_id}`,
      {
        headers: {
          'Authorization': req.headers.authorization
        }
      }
    );
    if (!response.data) {
      return res.status(404).send({ error: 'Commande non trouvée' });
    }

    const livraison = new Livraison(req.body);
    await livraison.save();
    res.status(201).send(livraison);
  } catch (error) {
    if (error.response && error.response.status === 401) {
      return res.status(401).send({ error: 'Non autorisé à accéder à cette commande' });
    }
    res.status(400).send(error);
  }
});

app.put('/livraison/:id', verifyToken, async (req, res) => {
    try {
      const livraison = await Livraison.findByIdAndUpdate(
        req.params.id,
        { statut: req.body.statut },
        { new: true }
      );
      if (!livraison) return res.status(404).send();
      res.send(livraison);
    } catch (error) {
      res.status(400).send(error);
    }
  });

mongoose.connect('mongodb://localhost:27017/livraison-service')
  .then(() => {
    app.listen(6000, () => console.log('Microservice Livraison démarré sur le port 6000'));
  })
  .catch(err => console.error(err));