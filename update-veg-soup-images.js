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
  const snapshot = await db.collection('menuItems').where('category', '==', 'Veg Soup').get();
  
  for (const doc of snapshot.docs) {
    const data = doc.data();
    const nameLower = data.name.toLowerCase().trim();
    
    // generate kebab case name
    let imageName = nameLower.replace(/[^a-z0-9]+/g, '-') + '.webp';
    imageName = imageName.replace(/-+$/, '');
    
    const imagePath = `images/categories/veg-soup/${imageName}`;
    
    // Quick check if file exists locally
    if (fs.existsSync(path.join(__dirname, imagePath))) {
      await doc.ref.update({ image: imagePath });
      console.log(`Updated ${data.name} -> ${imagePath}`);
    } else {
      console.log(`Missing local image for ${data.name}: expected ${imagePath}`);
    }
  }
  console.log("Done updating Veg Soup images!");
}

run().catch(console.error);
