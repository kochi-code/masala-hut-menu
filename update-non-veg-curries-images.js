const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const serviceAccount = require('./serviceAccountKey.json');
const fs = require('fs');
const path = require('path');

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

const manualMapping = {
  "chilli chicken": "chilli-chicken-full.webp",
  "chicken peshawari (full)": "chicken-peshawari-full.webp"
};

async function run() {
  const snapshot = await db.collection('menuItems').where('category', '==', 'Non-Veg Curry (Continental-Chinese)').get();
  
  for (const doc of snapshot.docs) {
    const data = doc.data();
    const nameLower = data.name.toLowerCase().trim();
    
    // Check manual map first, otherwise auto-generate based on lowercase name (replacing special chars and spaces)
    let imageName = manualMapping[nameLower];
    if (!imageName) {
      imageName = nameLower.replace(/[^a-z0-9]+/g, '-') + '.webp';
      // remove trailing dash if any
      imageName = imageName.replace(/-+$/, '') + '.webp';
      imageName = imageName.replace('.webp.webp', '.webp');
    }
    
    const imagePath = `images/categories/non-veg-curries/${imageName}`;
    
    // Quick check if file exists locally
    if (fs.existsSync(path.join(__dirname, imagePath))) {
      await doc.ref.update({ image: imagePath });
      console.log(`Updated ${data.name} -> ${imagePath}`);
    } else {
      console.log(`Missing local image for ${data.name}: expected ${imagePath}`);
    }
  }
  console.log("Done updating Non-Veg Curries images!");
}

run().catch(console.error);
