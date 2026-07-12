import mongoose from 'mongoose';
import { MongoClient } from 'mongodb';
import { env } from './env';

// Mongoose connection helper
export async function connectDB(): Promise<void> {
  try {
    await mongoose.connect(env.MONGODB_URI);
    console.log('You successfully connected to MongoDB via Mongoose!');
  } catch (error) {
    console.error('Mongoose connection error:', error);
    throw error;
  }
}

// Native MongoClient connection (as per your snippet)
const client = new MongoClient(env.MONGODB_URI);

export async function connectToMongoDB() {
  try {
    await client.connect();
    console.log("You successfully connected to MongoDB!");
    return client;
  } catch (err) {
    console.dir(err);
    throw err;
  }
}

// Call this only when your application terminates
export async function disconnectFromMongoDB() {
  await client.close();
  console.log("MongoClient disconnected.");
}
