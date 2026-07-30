const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');
const path = require('path');

initializeApp({
  credential: cert(require('./serviceAccountKey.json'))
});

const db = getFirestore();

async function audit() {
  const snapshot = await db.collection('menuItems').get();
  const byCategory = {};
  let totalMissing = 0;
  let totalOk = 0;

  snapshot.forEach(doc => {
    const d = doc.data();
    const cat = d.category || 'Unknown';
    if (!byCategory[cat]) byCategory[cat] = { ok: [], missing: [] };

    const imgPath = d.image || '';
    if (imgPath && fs.existsSync(path.join(__dirname, imgPath))) {
      byCategory[cat].ok.push(d.name);
      totalOk++;
    } else {
      byCategory[cat].missing.push({ name: d.name, image: imgPath });
      totalMissing++;
    }
  });

  console.log('=== FULL IMAGE AUDIT ===\n');
  for (const [cat, data] of Object.entries(byCategory).sort()) {
    const total = data.ok.length + data.missing.length;
    console.log(`📁 ${cat}: ${data.ok.length}/${total} have images`);
    if (data.missing.length > 0) {
      data.missing.forEach(m => {
        console.log(`   ❌ ${m.name} -> ${m.image || '(no image set)'}`);
      });
    }
    console.log('');
  }

  console.log(`\n=== SUMMARY: ${totalOk} OK, ${totalMissing} MISSING ===`);
}

audit().catch(console.error);
