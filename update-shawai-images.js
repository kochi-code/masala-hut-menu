const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const serviceAccount = require('./serviceAccountKey.json');

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

const mapping = {
  "shawai": "shawai.webp",
  "masala shawai": "masala-shawai.webp"
};

async function run() {
  const snapshot = await db.collection('menuItems').where('category', '==', 'Shawai - Grill').get();
  
  for (const doc of snapshot.docs) {
    const data = doc.data();
    const nameLower = data.name.toLowerCase().trim();
    
    let imageName = mapping[nameLower];
    
    if (imageName) {
      const newImagePath = `images/categories/shawai-grill/${imageName}`;
      await doc.ref.update({ image: newImagePath });
      console.log(`Updated ${data.name} -> ${newImagePath}`);
    } else {
      console.log(`No image mapping found for ${data.name}`);
    }
  }
  console.log("Done updating Shawai images!");
}

run().catch(console.error);
