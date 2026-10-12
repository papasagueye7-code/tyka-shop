const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Numéro de téléphone pour les règlements et commandes WhatsApp
const PHONE_NUMBER = "221772071365"; 
const DISPLAY_PHONE = "77 207 13 65";

const PAYMENT_INFO = {
  wave: DISPLAY_PHONE,
  orange_money: DISPLAY_PHONE,
  free_money: DISPLAY_PHONE
};

// Produits configurés vers public/images/
const products = [
  {id:1, name:"Ensemble Boubou Homme", category:"Hommes", price:20000, oldPrice:30000, image:"/images/boubou.jpg"},
  {id:2, name:"Robe Africaine Élégante", category:"Femmes", price:25500, oldPrice:30000, image:"/images/robe.jpg"},
  {id:3, name:"Baskets Homme", category:"Chaussures", price:17000, oldPrice:25000, image:"/images/basket.jpg"},
  {id:4, name:"Sac à main Femme", category:"Sacs", price:15000, oldPrice:null, image:"/images/sac.jpg"},
  {id:5, name:"Montre Luxe Homme", category:"Montres", price:25000, oldPrice:null, image:"/images/montre.jpg"},
  {id:6, name:"Lunettes de soleil", category:"Accessoires", price:9900, oldPrice:11000, image:"/images/lunette.jpg"},
  {id:7, name:"Ceinture en cuir", category:"Accessoires", price:5000, oldPrice:10000, image:"/images/ceinture.jpg"},
  {id:8, name:"Mini Boubou Enfant", category:"Enfants", price:15000, oldPrice:18000, image:"/images/boubou_enfant.jpg"},
  {id:9, name:"Robe Imprimée Fillette", category:"Enfants", price:12500, oldPrice:15000, image:"/images/robe_fillette.jpg"},
  {id:10, name:"Sac à dos Scolaire Enfant", category:"Enfants", price:9500, oldPrice:null, image:"/images/sac_enfant.jpg"},
  {id:11, name:"Casquette Stylée Enfant", category:"Enfants", price:5000, oldPrice:7000, image:"/images/casquette_enfant.jpg"}
];

app.get("/api/products", (req, res) => res.json(products));

app.get("/api/products/:id", (req, res) => {
  const p = products.find(x => x.id === Number(req.params.id));
  p ? res.json(p) : res.status(404).json({error: "Produit introuvable"});
});

// Traitement de la commande
app.post("/api/orders", (req, res) => {
  const {customer, items, total, paymentMethod} = req.body;
  if(!customer?.name || !customer?.phone || !items?.length) {
    return res.status(400).json({error: "Informations de commande incomplètes"});
  }

  const orderNumber = "SGF-" + Date.now().toString().slice(-8);
  
  const itemList = items.map(i => `- ${i.name} (x${i.quantity || 1}) : ${i.price} FCFA`).join("\n");
  const whatsappMessage = `Bonjour Sagueye Fashion,\n\nJe souhaite valider ma commande *${orderNumber}* :\n\n*Client :* ${customer.name}\n*Téléphone :* ${customer.phone}\n\n*Articles :*\n${itemList}\n\n*Total :* ${total} FCFA\n*Mode de paiement :* ${paymentMethod || "Non spécifié"}`;
  
  const whatsappUrl = `https://wa.me/${PHONE_NUMBER}?text=${encodeURIComponent(whatsappMessage)}`;

  let instructions = `Vous pouvez valider votre commande directement sur WhatsApp au ${DISPLAY_PHONE}.`;

  if (paymentMethod === "wave") {
    instructions = `Veuillez effectuer le transfert de ${total} FCFA via Wave au ${PAYMENT_INFO.wave} avec la référence : ${orderNumber}`;
  } else if (paymentMethod === "orange_money") {
    instructions = `Veuillez effectuer le dépôt de ${total} FCFA via Orange Money au ${PAYMENT_INFO.orange_money} pour la commande ${orderNumber}`;
  } else if (paymentMethod === "free_money") {
    instructions = `Veuillez effectuer le transfert de ${total} FCFA via Free Money au ${PAYMENT_INFO.free_money} pour la commande ${orderNumber}`;
  }

  res.status(201).json({
    success: true,
    orderNumber,
    status: "En attente de confirmation",
    paymentMethod,
    instructions,
    whatsappUrl,
    customer, 
    items, 
    total
  });
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => console.log(`TYKA Fashion lancé sur http://localhost:${PORT}`));