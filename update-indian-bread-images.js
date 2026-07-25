const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const serviceAccount = require('./serviceAccountKey.json');
const fs = require('fs');
const path = require('path');

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

async function run() {
  const snapshot = await db.collection('menuItems').where('category', '==', 'Indian Bread').get();
  
  for (const doc of snapshot.docs) {
    const data = doc.data();
    // e.g. "Butter Naan" -> "butter-naan.webp"
    const imageName = data.name.toLowerCase().trim().replace(/\s+/g, '-') + '.webp';
    const imagePath = `images/categories/indian-bread/${imageName}`;
    
    // Quick check if file exists locally before mapping (optional, but good for safety)
    if (fs.existsSync(path.join(__dirname, imagePath))) {
      await doc.ref.update({ image: imagePath });
      console.log(`Updated ${data.name} -> ${imagePath}`);
    } else {
      console.log(`Missing local image for ${data.name}: expected ${imagePath}`);
    }
  }
  console.log("Done updating Indian Bread images!");
}

run().catch(console.error);
