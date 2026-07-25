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
  "fried chicken": "fried-chicken-full.webp"
};

async function run() {
  const snapshot = await db.collection('menuItems').where('category', '==', 'Starter Food Items').get();
  
  for (const doc of snapshot.docs) {
    const data = doc.data();
    const nameLower = data.name.toLowerCase().trim();
    
    // Check manual map first, otherwise auto-generate
    let imageName = manualMapping[nameLower];
    if (!imageName) {
      imageName = nameLower.replace(/\s+/g, '-') + '.webp';
    }
    
    const imagePath = `images/categories/starters/${imageName}`;
    
    // Quick check if file exists locally
    if (fs.existsSync(path.join(__dirname, imagePath))) {
      await doc.ref.update({ image: imagePath });
      console.log(`Updated ${data.name} -> ${imagePath}`);
    } else {
      // console.log(`Missing local image for ${data.name}: expected ${imagePath}`);
    }
  }
  console.log("Done updating Starters images!");
}

run().catch(console.error);
