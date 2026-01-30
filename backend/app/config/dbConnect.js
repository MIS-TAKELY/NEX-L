import { MongoClient } from 'mongodb';

export let client;

export async function dbConnect() {
  if (client) return;

  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error("MONGO_URI is not defined");
  }

  client = new MongoClient(uri, {
    serverApi: {
      version: "1",
      strict: true,
      deprecationErrors: true,
    }
  });

  await client.connect();
  console.log('Connected to MongoDB');
}