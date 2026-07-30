const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const serviceAccount = require('./serviceAccountKey.json');

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

// Map: DB item name -> generated image path
const mapping = {
  // Alfahm
  'Alfaham': 'images/categories/generated/alfaham.png',
  'Pepper Alfaham': 'images/categories/generated/pepper-alfaham.png',
  'Red Chilli Alfaham': 'images/categories/generated/red-chilli-alfaham.png',
  'Peri Peri': 'images/categories/generated/peri-peri.png',
  'Honey Chilli': 'images/categories/generated/honey-chilli.png',
  'Kanthari Alfaham': 'images/categories/generated/kanthari-alfaham.png',
  // Fries
  'Normal Fries': 'images/categories/generated/normal-fries.png',
  'Loaded Fries': 'images/categories/generated/loaded-fries.png',
  'Peri Peri Fries': 'images/categories/generated/peri-peri-fries.png',
  'Kur Kure Fries': 'images/categories/generated/kur-kure-fries.png',
  'Spicy Lemon Fries': 'images/categories/generated/spicy-lemon-fries.png',
  // Burgers
  'Chicken Burger': 'images/categories/generated/chicken-burger.png',
  'Zinger Burger': 'images/categories/generated/zinger-burger.png',
  // Reuse chicken burger for similar items
  'Veg Jumbo Xx': 'images/categories/generated/chicken-burger.png',
  'Chicken Jumbo Xx': 'images/categories/generated/chicken-burger.png',
  'Double Cheese Burger': 'images/categories/generated/zinger-burger.png',
  'Double Cheese Chicken Burger': 'images/categories/generated/zinger-burger.png',
  'Egg Burger': 'images/categories/generated/chicken-burger.png',
};

async function run() {
  const snapshot = await db.collection('menuItems').get();
  let updated = 0;

  for (const doc of snapshot.docs) {
    const data = doc.data();
    if (mapping[data.name]) {
      await doc.ref.update({ image: mapping[data.name] });
      console.log(`Updated ${data.name} -> ${mapping[data.name]}`);
      updated++;
    }
  }
  console.log(`\nTotal updated: ${updated}`);
}

run().catch(console.error);
