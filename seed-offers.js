const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const serviceAccount = require('./serviceAccountKey.json');

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

const TODAYS_OFFERS = [
  { name: "Paneer Tikka Special", desc: "Our signature cottage cheese starter at a steal.", originalPrice: 280, offerPrice: 199, badge: "Today Only", image: "images/dishes/paneer-tikka.jpg" },
  { name: "Fish Curry Special", desc: "Fresh catch cooked in authentic Kerala spices.", originalPrice: 350, offerPrice: 249, badge: "Chef's Pick", image: "images/offers/fish-curry.jpg" }
];

const COMBO_OFFERS = [
  { name: "Grand Feast Combo", desc: "1 Butter Chicken + 2 Butter Naan + 1 Jeera Rice", originalPrice: 899, offerPrice: 699, badge: "Today Only", image: "images/offers/grand-feast-combo.jpg" },
  { name: "Tandoori Duo Combo", desc: "Chicken Tikka + Seekh Kebab + Mint Chutney", originalPrice: 649, offerPrice: 499, badge: "Limited Time", image: "images/offers/tandoori-duo-combo.jpg" },
  { name: "Family Biryani Combo", desc: "2 Chicken Biryani + 1 Raita + 1 Gulab Jamun (2pc)", originalPrice: 999, offerPrice: 799, badge: "Chef's Pick", image: "images/offers/family-biryani-combo.jpg" },
];

async function seedData() {
  try {
    for (let i = 0; i < TODAYS_OFFERS.length; i++) {
      const docRef = db.collection('todaysOffers').doc();
      await docRef.set(TODAYS_OFFERS[i]);
      console.log(`Added todaysOffer: ${TODAYS_OFFERS[i].name}`);
    }
    
    for (let i = 0; i < COMBO_OFFERS.length; i++) {
      const docRef = db.collection('comboOffers').doc();
      await docRef.set(COMBO_OFFERS[i]);
      console.log(`Added comboOffer: ${COMBO_OFFERS[i].name}`);
    }
    
    console.log("Seeding complete!");
    process.exit(0);
  } catch (err) {
    console.error("Error seeding:", err);
    process.exit(1);
  }
}

seedData();
