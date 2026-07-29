const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const serviceAccount = require('./serviceAccountKey.json');
const fs = require('fs');
const path = require('path');

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

// Blue ocean wasn't in grep results for "mojito", so let me add a manual map if it exists, or just process it generically
async function run() {
  const snapshot = await db.collection('menuItems').where('category', '==', 'Mojitto').get();
  
  for (const doc of snapshot.docs) {
    const data = doc.data();
    const nameLower = data.name.toLowerCase().trim();
    
    // generate kebab case name
    let imageName = nameLower.replace(/[^a-z0-9]+/g, '-') + '.webp';
    imageName = imageName.replace(/-+$/, '');
    
    const imagePath = `images/categories/mojito/${imageName}`;
    
    // Quick check if file exists locally
    if (fs.existsSync(path.join(__dirname, imagePath))) {
      await doc.ref.update({ image: imagePath });
      console.log(`Updated ${data.name} -> ${imagePath}`);
    } else {
      console.log(`Missing local image for ${data.name}: expected ${imagePath}`);
    }
  }
  
  // Specifically for "Blue Ocean" if it's there
  const blueOceanSnap = await db.collection('menuItems').where('name', '==', 'Blue Ocean').get();
  if (!blueOceanSnap.empty) {
      for(const doc of blueOceanSnap.docs) {
          const imagePath = `images/categories/mojito/blue-ocean.webp`;
          if (fs.existsSync(path.join(__dirname, imagePath))) {
              await doc.ref.update({ image: imagePath });
              console.log(`Updated Blue Ocean -> ${imagePath}`);
          }
      }
  }
  
  console.log("Done updating Mojito images!");
}

run().catch(console.error);
