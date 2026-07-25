const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const serviceAccount = require('./serviceAccountKey.json');
const fs = require('fs');
const path = require('path');

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

const mapping = {
  "afgani beef with garlic rice": "afgani-beef-garlic-rice copy.png",
  "afgani chicken with garlic rice": "afgani-chicken-rice.png",
  "alfaham": "alpham.png",
  "arabic roll": "arabaic-roll.png",
  "burnt chicken fried rice": "burnt-chicken-fried-rice.png",
  "cheese veg sandwich": "chesse-veg-sandwich.png",
  "chicken burger": "chicken-burger.png",
  "chicken triple fusion": "chicken-triple-fusion.png",
  "chilli chicken with capsicum rice": "chilli-chicken-with-capciucum-rice.png",
  "club chicken sandwich": "club-chicken-sandwich.png",
  "club mixed sandwich": "club-mixed-sandwich.png",
  "double cheese burger": "double-cheese-burger.png",
  "double cheese chicken burger": "double-cheeze-burger.png",
  "dragon beef with hakka rice": "dragon-beef-with-hakka-rice.png",
  "dragon chicken with hakka rice": "dragon-chicken-wirh-hakka-rice.png",
  "egg burger": "egg-burger.png",
  "egg chilli cheese sandwich": "egg-chilli-chesse-sandwich.png",
  "egg chilli sandwich": "egg-chilli-sandwich.png",
  "normal fries": "fries.png",
  "honey chilli": "honey-chilli.png",
  "italian spicy roll": "italian-spicy-role.png",
  "kanthari alfaham": "kandhari-alpham.png",
  "kur kure fries": "kur-kukure-fries.png",
  "spicy lemon fries": "lemon-fries.png",
  "loaded fries": "loaded-fries.png",
  "paneer burnt fried rice": "paneer-burnt-rice.png",
  "pepper alfaham": "pepper-alpham.png",
  "peri peri fries": "peri-peri-fries.png",
  "peri peri": "peri-peri.png",
  "red chilli alfaham": "red-chilli-alpham.png",
  "shanghai beef with garlic rice": "shangai-beef.png",
  "singapore rice skewer": "singapore-rice-skewer.png",
  "spicy chicken with jeera rice": "spicy-chicken-with-jeera.png",
  "veg club sandwich": "veg-club-mixed.png",
  "veg jumbo xx": "veg-jumbo-xx.png",
  "zinger burger": "zinger-burger.png"
};

async function run() {
  const snapshot = await db.collection('menuItems').get();
  
  for (const doc of snapshot.docs) {
    const data = doc.data();
    const nameLower = data.name.toLowerCase().trim();
    
    let imageName = mapping[nameLower];
    
    if (imageName) {
      const imagePath = `images/categories/dish/${imageName}`;
      
      // Quick check if file exists locally
      if (fs.existsSync(path.join(__dirname, imagePath))) {
        await doc.ref.update({ image: imagePath });
        console.log(`Updated ${data.name} -> ${imagePath}`);
      } else {
        console.log(`Missing local image for ${data.name}: expected ${imagePath}`);
      }
    }
  }
  console.log("Done updating Bulk Dish images!");
}

run().catch(console.error);
