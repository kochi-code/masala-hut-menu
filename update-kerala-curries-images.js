const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const serviceAccount = require('./serviceAccountKey.json');

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

const mapping = {
  "beef chaps": "beef-chapss.webp",
  "beef chilli": "beef-chiliii.webp",
  "beef coconut fry": "beef-coconutt-curry.webp",
  "beef curry": "beef-currry.webp",
  "beef roast": "beef-roast.webp",
  "chicken curry": "chicken-curry.webp",
  "egg roast (2pcs)": "egg-roast-2pcs.webp",
  "fish curry": "fish-curry.webp",
  "green peas curry": "green-peas-curry.webp",
  "kadala curry": "kadala-curry.webp",
  "kakka roast": "kakka-roast.webp",
  "poth variyellu curry": "poth-variyellu-curry.webp",
  "veg kuruma": "veg-kuruma.webp"
};

async function run() {
  const snapshot = await db.collection('menuItems').where('category', '==', 'Kerala Curries').get();
  
  for (const doc of snapshot.docs) {
    const data = doc.data();
    const nameLower = data.name.toLowerCase().trim();
    
    let imageName = mapping[nameLower];
    
    if (imageName) {
      const newImagePath = `images/categories/kerala-curries/${imageName}`;
      await doc.ref.update({ image: newImagePath });
      console.log(`Updated ${data.name} -> ${newImagePath}`);
    } else {
      console.log(`No image mapping found for ${data.name}`);
    }
  }
  console.log("Done updating Kerala Curries images!");
}

run().catch(console.error);
