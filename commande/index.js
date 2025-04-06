require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');

const app = express();
app.use(express.json());


mongoose.connect('mongodb://127.0.0.1:27017/commandesDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("MongoDB Connected - Commande Service"));


const CommandeSchema = new mongoose.Schema({
    produit_id: String,
    quantite: Number,
    total: Number,
    email: String
});

const Commande = mongoose.model('Commande', CommandeSchema);

const authMiddleware = require('./authMiddleware'); 

app.post('/commande/ajouter', authMiddleware, async (req, res) => {
    const { produit_id, quantite } = req.body;
    const email = req.user.email; 

    try {
        const response = await axios.get('http://localhost:4000/produit/liste', {
            headers: { Authorization: req.header("Authorization") } 
        });

        const produit = response.data.find(p => p._id.toString() === produit_id);

        if (!produit) {
            return res.status(404).json({ message: "CANT FIND THIS PRODUCT" });
        }

        const total = produit.prix * quantite;

       
        const commande = new Commande({ produit_id, quantite, total, email });
        await commande.save();

        res.json({ message: "COMMANDE CREATED", commande });

    } catch (error) {
        res.status(500).json({ message: "ERROR OF VALIDATION" });
    }
});


app.get('/commande/liste', authMiddleware, async (req, res) => {
    try {
        const commandes = await Commande.find();
        res.json(commandes);
    } catch (error) {
        res.status(500).json({ message: "CANT FIND ANY COMMANDE" });
    }
});
app.get('/commande/:id',authMiddleware, async (req, res) => {
    try {
      const commande = await Commande.findById(req.params.id);
      if (!commande) {
        return res.status(404).json({ error: 'Commande non trouvée' });
      }
      res.json(commande);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });


app.listen(5000, () => console.log("Commande Service running on port http://localhost:5000"));
