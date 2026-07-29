const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const serviceAccount = require('./serviceAccountKey.json');
const fs = require('fs');
const path = require('path');

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

// Manual mapping: filename (without .webp) -> menu item name(s)
const fileToNames = {
  'arabian-role-shawarma': ['Arabian Role'],
  'arabian-shawama': ['Arabian Shawarma'],
  'beef-chilli': ['Beef Chilli'],
  'beef-curry': ['Beef Curry'],
  'beef-dry-fry': ['Beef Dry Fry'],
  'beef-fry': ['Beef Coconut Fry'],
  'beef-masala': ['Beef Masala'],
  'beef-roast': ['Beef Roast'],
  'butter-chicken': ['Butter Chicken'],
  'chicken-65': ['Chicken 65'],
  'chicken-fry': ['Chicken Fry'],
  'chicken-mappas': ['Chicken Mappas'],
  'chicken-perattu': ['Chicken Perattu'],
  'chicken-roast': ['Chicken Roast'],
  'chicken-tikka': ['Chicken Tikka'],
  'chilli-chicken': ['Chilli Chicken'],
  'chilli-gobi': ['Chilli Gobi'],
  'dry-gobi-manchurian': ['Dry Gobi Manchurian'],
  'garlic-chicken': ['Garlic Chicken'],
  'ginger-chicken': ['Ginger Chicken'],
  'gobi-65': ['Gobi 65'],
  'gobi-manchurian': ['Gobi Manchurian'],
  'haryali-tikka': ['Haryali Tikka', 'Hariyali Chicken Kabab'],
  'kadhai-chicken': ['Kadhai Chicken'],
  'kerala-chicken-masala': ['Kerala Chicken Masala'],
  'malai-tikka': ['Malai Tikka', 'Chicken Malai Tikka 4pcs'],
  'mexican-chicken-fry': ['Mexican Chicken Fry'],
  'mexican-role-shawarma': ['Mexican Role'],
  'mexican-shawarma': ['Mexican Shawarma'],
  'mixed-tikka': ['Mixed Tikka'],
  'mughllai-chicken': ['Mughllai Chicken'],
  'mushroom-butter-masala': ['Mushroom Butter Masala'],
  'mushroom-kadai': ['Mushroom Kadai'],
  'mushroom-masala': ['Mushroom Masala'],
  'mutton-chap': ['Mutton Chap'],
  'mutton-curry': ['Mutton Curry'],
  'mutton-perattu': ['Mutton Perattu'],
  'mutton-roast': ['Mutton Roast'],
  'paneer-67': ['Paneer 65'],  // might be 65 in db
  'paneer-butter-masala': ['Paneer Butter Masala'],
  'paneer-kadai': ['Paneer Kadai'],
  'pepper-chicken': ['Pepper Chicken'],
  'resmi-tikka': ['Resmi Tikka'],
  'romali-plate-shawarma': ['Romali Plate'],
  'romali-role-shawarma': ['Romali Role'],
  'shawarma': ['Shawarma'],
  'tomato-fry': ['Tomato Fry']
};

async function run() {
  const snapshot = await db.collection('menuItems').get();
  const allDocs = {};
  snapshot.forEach(doc => {
    const d = doc.data();
    const key = d.name.toLowerCase().trim();
    allDocs[key] = { ref: doc.ref, data: d };
  });

  let updated = 0;

  for (const [filename, names] of Object.entries(fileToNames)) {
    const imagePath = `images/categories/dish/${filename}.webp`;
    if (!fs.existsSync(path.join(__dirname, imagePath))) {
      console.log(`File missing: ${imagePath}`);
      continue;
    }

    for (const name of names) {
      const key = name.toLowerCase().trim();
      if (allDocs[key]) {
        await allDocs[key].ref.update({ image: imagePath });
        console.log(`Updated ${name} -> ${imagePath}`);
        updated++;
      } else {
        // Try partial match
        const matches = Object.keys(allDocs).filter(k => k.includes(key) || key.includes(k));
        if (matches.length > 0) {
          for (const m of matches) {
            await allDocs[m].ref.update({ image: imagePath });
            console.log(`Updated (partial) ${allDocs[m].data.name} -> ${imagePath}`);
            updated++;
          }
        } else {
          console.log(`No DB match for: ${name}`);
        }
      }
    }
  }

  console.log(`\nTotal updated: ${updated}`);
}

run().catch(console.error);
