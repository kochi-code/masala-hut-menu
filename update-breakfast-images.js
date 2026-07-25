const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const serviceAccount = require('./serviceAccountKey.json');

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

const mapping = {
  "puttu + pothu roast combo": "Puttu +Pothu Roast Combo.webp",
  "masala dosa": "Masala Dosa.webp",
  "uzhunu vada": "Uzhunu Vada.webp",
  "pazhankanji": "Pazhamkanji.webp",
  "appam + nadan kozhi curry": "Appam + Nadan Kozhi Curry.webp",
  "puttu + mutton + kattan combo": "Puttu + Mutton + Kattan Combo.webp",
  "idly": "Idly.webp",
  "porotta + poth variyellu curry": "Porota + Poth Variyellu Curry.webp"
};

async function run() {
  const snapshot = await db.collection('menuItems').where('category', '==', 'BreakFast').get();
  
  for (const doc of snapshot.docs) {
    const data = doc.data();
    const nameLower = data.name.toLowerCase().trim();
    
    let imageName = mapping[nameLower];
    
    if (imageName) {
      const newImagePath = `images/categories/Breakfast/${imageName}`;
      await doc.ref.update({ image: newImagePath });
      console.log(`Updated ${data.name} -> ${newImagePath}`);
    }
  }
  console.log("Done updating remaining breakfast images!");
}

run().catch(console.error);
