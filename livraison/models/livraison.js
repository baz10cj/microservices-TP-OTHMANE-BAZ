const mongoose = require("mongoose");


const livraisonSchema = new mongoose.Schema({
  commande_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Commande',
    required: true
  },
  transporteur_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transporteur',
    required: true
  },
  statut: {
    type: String,
    enum: ['en_attente', 'en_cours', 'livré'],
    required: true
  },
  adresse_livraison : {
    type: String,
    required: true
  },
  created_at: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model("Livraison", livraisonSchema); 