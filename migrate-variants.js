const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const serviceAccount = require('./serviceAccountKey.json');

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

const groupsToMerge = [
  { cat: "Starter Food Items", base: "Chicken Manchurian", opts: [ {l:"Qtr", p:"180.00"}, {l:"Half", p:"360.00"}, {l:"Full", p:"720.00"} ] },
  { cat: "Starter Food Items", base: "Thandoori Chicken", opts: [ {l:"Qtr", p:"160.00"}, {l:"Half", p:"320.00"}, {l:"Full", p:"630.00"} ] },
  { cat: "Starter Food Items", base: "Fried Chicken", opts: [ {l:"Qtr", p:"150.00"}, {l:"Half", p:"290.00"}, {l:"Full", p:"550.00"} ] },
  { cat: "Shawai - Grill", base: "Shawai", opts: [ {l:"Qtr", p:"130.00"}, {l:"Half", p:"240.00"}, {l:"Full", p:"460.00"} ] },
  { cat: "Shawai - Grill", base: "Masala Shawai", opts: [ {l:"Qtr", p:"140.00"}, {l:"Half", p:"260.00"}, {l:"Full", p:"490.00"} ] },
  { cat: "Kerala Curries", base: "Chicken Curry", opts: [ {l:"Qtr", p:"80.00"}, {l:"Half", p:"160.00"}, {l:"Full", p:"280.00"} ] },
  { cat: "Non-Veg Curry (Continental-Chinese)", base: "Chilli Chicken", opts: [ {l:"Half", p:"160.00"}, {l:"Full", p:"320.00"} ] },
  { cat: "Alfahm", base: "Alfaham", opts: [ {l:"Qtr", p:"130.00"}, {l:"Half", p:"250.00"}, {l:"Full", p:"490.00"} ] },
  { cat: "Alfahm", base: "Peri Peri", opts: [ {l:"Qtr", p:"150.00"}, {l:"Half", p:"280.00"}, {l:"Full", p:"520.00"} ] },
  { cat: "Alfahm", base: "Honey Chilli", opts: [ {l:"Qtr", p:"160.00"}, {l:"Half", p:"310.00"}, {l:"Full", p:"580.00"} ] },
  { cat: "Alfahm", base: "Kanthari Alfaham", opts: [ {l:"Qtr", p:"170.00"}, {l:"Half", p:"330.00"}, {l:"Full", p:"610.00"} ] },
  { cat: "Alfahm", base: "Pepper Alfaham", opts: [ {l:"Qtr", p:"160.00"}, {l:"Half", p:"320.00"}, {l:"Full", p:"599.00"} ] },
  { cat: "Alfahm", base: "Red Chilli Alfaham", opts: [ {l:"Qtr", p:"170.00"}, {l:"Half", p:"270.00"}, {l:"Full", p:"510.00"} ] },
  { cat: "Mandhi", base: "Chicken Kuzhimandi", opts: [ {l:"Qtr", p:"220.00"}, {l:"Half", p:"390.00"}, {l:"Full", p:"690.00"} ] },
  { cat: "Mandhi", base: "Alfaham Mandi", opts: [ {l:"Qtr", p:"220.00"}, {l:"Half", p:"440.00"}, {l:"Full", p:"810.00"} ] },
  { cat: "Mandhi", base: "Peri Peri Alfaham Mandi", opts: [ {l:"Qtr", p:"220.00"}, {l:"Half", p:"420.00"}, {l:"Full", p:"840.00"} ] },
  { cat: "Mandhi", base: "Honey Chilli Alfaham Mandi", opts: [ {l:"Qtr", p:"230.00"}, {l:"Half", p:"440.00"}, {l:"Full", p:"860.00"} ] },
  { cat: "Mandhi", base: "Pepper Alfaham Mandi", opts: [ {l:"Qtr", p:"240.00"}, {l:"Half", p:"450.00"}, {l:"Full", p:"870.00"} ] },
  { cat: "Mandhi", base: "Kanthari Alfaham Mandi", opts: [ {l:"Qtr", p:"250.00"}, {l:"Half", p:"460.00"}, {l:"Full", p:"880.00"} ] },
  { cat: "Mandhi", base: "Red Chilli Alfaham Mandi", opts: [ {l:"Qtr", p:"220.00"}, {l:"Half", p:"430.00"}, {l:"Full", p:"810.00"} ] },
  { cat: "Mandhi", base: "Shawai Mandi", opts: [ {l:"Qtr", p:"200.00"}, {l:"Half", p:"390.00"}, {l:"Full", p:"690.00"} ] },
  { cat: "Mandhi", base: "Masala Shawai Mandi", opts: [ {l:"Qtr", p:"220.00"}, {l:"Half", p:"420.00"}, {l:"Full", p:"720.00"} ] },
  { cat: "Mandhi", base: "Mutton Mandi", opts: [ {l:"Half", p:"790.00"}, {l:"Full", p:"1490.00"} ] },
  { cat: "Mandhi", base: "Mandi Rice", opts: [ {l:"Qtr", p:"110.00"}, {l:"Half", p:"190.00"}, {l:"Full", p:"350.00"} ] },
];

async function run() {
  const snapshot = await db.collection('menuItems').get();
  const allDocs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

  for (const group of groupsToMerge) {
    // Find matching old docs
    // they might be named "Chicken Manchurian Qtr" or similar
    const variants = allDocs.filter(d => d.category === group.cat && d.name.includes(group.base));
    if (variants.length === 0) {
      console.log(`No variants found for ${group.base}`);
      continue;
    }

    // take properties from the first one
    const template = variants[0];
    const newDoc = {
      category: template.category,
      name: group.base,
      veg: template.veg,
      available: true,
      image: template.image,
      badge: template.badge || "",
      priceOptions: group.opts.map(o => ({ label: o.l, price: parseFloat(o.p) }))
    };

    const newRef = db.collection('menuItems').doc();
    await newRef.set(newDoc);
    console.log(`Created merged doc: ${group.base}`);

    for (const v of variants) {
      // Only delete if it's one of the variants (prevent deleting if script is run twice)
      // Check if it has a size in the name
      if (v.name.includes('Qtr') || v.name.includes('Half') || v.name.includes('Full') || v.name.toLowerCase().includes('quarter')) {
        await db.collection('menuItems').doc(v.id).delete();
        console.log(`Deleted variant: ${v.name}`);
      }
    }
  }

  console.log("Migration complete.");
}

run();
