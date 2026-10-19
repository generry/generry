import { MongoClient } from "mongodb";

// One shared client for the whole app. In development, Next reloads modules often,
// so the client is kept on `globalThis` to avoid opening a new connection each time.
const options = {};

function getClientPromise() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not set. Add it to .env.local (see .env.example).");
  }
  if (!globalThis._mongoClientPromise) {
    globalThis._mongoClientPromise = new MongoClient(uri, options).connect();
  }
  return globalThis._mongoClientPromise;
}

// Use this anywhere on the server: const db = await getDb(); db.collection("matches")...
export async function getDb() {
  const client = await getClientPromise();
  return client.db(process.env.MONGODB_DB || "tic-tac-arena");
}
