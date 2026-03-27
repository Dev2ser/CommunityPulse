
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

let client;
let db;

export const connectToDb = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    

    //console.log(`Attempting native MongoDB connection: ${uri}`);

    client = new MongoClient(uri);
    await client.connect();

    db = client.db("CommunityPulse");

    // Get list of collections
    const collectionsList = await db.listCollections().toArray();
    const collections = collectionsList.map(c => c.name);

    //console.log(`Collections: ${collections.join(', ') || 'None'}`);

    return {
      collections
    };
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    throw error;
  }
};

export const getDb = () => db;

export const closeDbConnection = async () => {
  if (!client) return;

  try {
    await client.close();
    console.log('Database connection closed');
  } catch (err) {
    console.error('Error closing DB connection:', err.message);
  }
};
