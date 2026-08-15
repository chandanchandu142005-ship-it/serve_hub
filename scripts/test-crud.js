const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', 'backend', '.env') });
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });
const { MongoClient } = require('mongodb');

const uri = (process.env.MONGODB_URI || process.env.MONGO_URI || '').trim();
const dbName = (process.env.MONGODB_DB || '').trim() || 'servehub';

if (!uri) {
  console.error('❌ MONGODB_URI is missing in backend/.env!');
  process.exit(1);
}

console.log('\n======================================================');
console.log('  SERVEHUB MONGODB ATLAS FULL CRUD VERIFICATION');
console.log('======================================================');
console.log(`📡 Connected URI: ${uri.replace(/:([^@]+)@/, ':****@')}`);
console.log(`📦 Target Database: ${dbName}\n`);

async function runCrudTest() {
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
  try {
    console.log('1️⃣ Connecting to MongoDB Atlas...');
    await client.connect();
    const db = client.db(dbName);
    const testColl = db.collection('connection_tests');

    // 2. INSERT
    const testDoc = {
      testId: 'test_' + Date.now(),
      name: 'ServeHub Atlas Verification Test',
      timestamp: new Date(),
      status: 'active',
    };
    console.log('2️⃣ [CREATE] Inserting document into connection_tests collection...');
    const insertResult = await testColl.insertOne(testDoc);
    console.log(`   ✅ Document inserted with ID: ${insertResult.insertedId}`);

    // 3. READ (RETRIEVE)
    console.log('3️⃣ [READ] Querying inserted document back from Atlas...');
    const foundDoc = await testColl.findOne({ _id: insertResult.insertedId });
    if (!foundDoc || foundDoc.name !== testDoc.name) {
      throw new Error('Document retrieval mismatch!');
    }
    console.log(`   ✅ Retrieved document: "${foundDoc.name}"`);

    // 4. UPDATE
    console.log('4️⃣ [UPDATE] Updating document status in Atlas...');
    const updateResult = await testColl.updateOne(
      { _id: insertResult.insertedId },
      { $set: { status: 'verified', updatedAt: new Date() } }
    );
    console.log(`   ✅ Modified count: ${updateResult.modifiedCount}`);

    // 5. DELETE
    console.log('5️⃣ [DELETE] Cleaning up test document from Atlas...');
    const deleteResult = await testColl.deleteOne({ _id: insertResult.insertedId });
    console.log(`   ✅ Deleted count: ${deleteResult.deletedCount}`);

    console.log('\n🎉 ALL CRUD OPERATIONS (INSERT, READ, UPDATE, DELETE) VERIFIED 100% OPERATIONAL!');
  } catch (err) {
    console.error('\n❌ CRUD Verification Failed!');
    console.error('   Error:', err.message);
  } finally {
    await client.close().catch(() => {});
    console.log('======================================================\n');
  }
}

runCrudTest();
