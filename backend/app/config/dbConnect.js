import { MongoClient } from 'mongodb';
import mongoose from 'mongoose';

export let client;

export async function dbConnect() {
  if (client && mongoose.connection.readyState === 1) return;

  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error("MONGO_URI is not defined");
  }

  // Raw MongoDB client for Better Auth
  if (!client) {
    client = new MongoClient(uri, {
      serverApi: {
        version: "1",
        strict: true,
        deprecationErrors: true,
      }
    });
    await client.connect();
    console.log('Connected to MongoDB (Native Client)');
  }

  // Mongoose connection for models
  if (mongoose.connection.readyState !== 1) {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB (Mongoose)');
  }
}