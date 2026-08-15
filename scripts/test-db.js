const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', 'backend', '.env') });
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });
const { MongoClient } = require('mongodb');

const uri = (process.env.MONGODB_URI || process.env.MONGO_URI || '').trim() || 'mongodb://localhost:27017';
const dbName = (process.env.MONGODB_DB || '').trim() || 'servehub';

console.log('\n======================================================');
console.log('  SERVEHUB MONGODB CONNECTION TEST');
console.log('======================================================');
console.log(`📡 URI:  ${uri.replace(/:([^@]+)@/, ':****@')}`);
console.log(`📦 Database: ${dbName}\n`);

async function testConnection() {
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
  try {
    console.log('⏳ Connecting to MongoDB...');
    await client.connect();
    console.log('✅ Connected successfully!');
    
    const db = client.db(dbName);
    const ping = await db.command({ ping: 1 });
    console.log('⚡ Ping response:', ping);
    
    const collections = await db.listCollections().toArray();
    console.log(`📚 Collections in database (${collections.length}):`, collections.map(c => c.name).join(', ') || 'None (empty DB)');
    
    console.log('\n🎉 RESULT: MongoDB connection is 100% OPERATIONAL!');
  } catch (err) {
    console.error('\n❌ RESULT: MongoDB Connection Failed!');
    console.error('   Error Message:', err.message);
    
    if (err.message.includes('SSL alert number 80') || err.message.includes('tlsv1 alert')) {
      console.log('\n💡 IP WHITELIST REQUIRED:');
      console.log('   Your current IP address is not whitelisted in MongoDB Atlas.');
      console.log('   1. Go to https://cloud.mongodb.com');
      console.log('   2. Click "Network Access" under Security.');
      console.log('   3. Click "Add IP Address" and select "ALLOW ACCESS FROM ANYWHERE" (0.0.0.0/0).');
    }
  } finally {
    await client.close().catch(() => {});
    console.log('======================================================\n');
  }
}

testConnection();
