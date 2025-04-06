require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

mongoose.connect('mongodb://127.0.0.1:27017/produitsDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("MongoDB Connected - Produit Service"));

const ProduitSchema = new mongoose.Schema({
    nom: String,
    description: String,
    prix: Number
});

const Produit = mongoose.model('Produit', ProduitSchema);

const authMiddleware = require('./authMiddleware');


app.get('/produit/liste', authMiddleware, async (req, res) => {
    try {
        const produits = await Produit.find();
        res.json(produits);
    } catch (error) {
        res.status(500).json({ message: "CANT SHOW PRODUCTS" });
    }
});


app.post('/produit/ajouter', authMiddleware, async (req, res) => {
    const { nom, prix } = req.body;

    const produit = new Produit({ nom, prix });
    await produit.save();

    res.json({ message: "Produit ajouté", produit });
});


app.listen(4000, () => console.log("Produit Service running on port http://localhost:4000"));
