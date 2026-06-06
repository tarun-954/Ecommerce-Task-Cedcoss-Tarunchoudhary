import { MongoClient } from "mongodb";

declare global {
  var __mongoClient: MongoClient | undefined;
}

function resolveDatabaseName() {
  if (process.env.MONGODB_DB_NAME) {
    return process.env.MONGODB_DB_NAME;
  }

  const mongoUrl = process.env.MONGODB_URI || "";
  const match = mongoUrl.match(/mongodb(?:\+srv)?:\/\/[^/]+\/([^/?]+)/);
  if (match?.[1]) {
    return match[1];
  }

  return "lovable";
}

async function isClientHealthy(client: MongoClient) {
  try {
    await client.db("admin").command({ ping: 1 });
    return true;
  } catch {
    return false;
  }
}

export async function getMongoClient(): Promise<MongoClient> {
  const cached = globalThis.__mongoClient;
  if (cached && (await isClientHealthy(cached))) {
    return cached;
  }

  if (cached) {
    try {
      await cached.close();
    } catch {
      // ignore close errors on stale clients
    }
    globalThis.__mongoClient = undefined;
  }

  const mongoUrl = process.env.MONGODB_URI || "mongodb://localhost:27017";
  const client = new MongoClient(mongoUrl);
  await client.connect();
  globalThis.__mongoClient = client;
  console.log("Connected to MongoDB");
  return client;
}

export async function getDatabase(dbName?: string) {
  const client = await getMongoClient();
  return client.db(dbName ?? resolveDatabaseName());
}

export async function closeMongoConnection() {
  const cached = globalThis.__mongoClient;
  if (cached) {
    await cached.close();
    globalThis.__mongoClient = undefined;
  }
}
