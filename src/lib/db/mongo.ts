import { MongoClient } from "mongodb";

let mongoClient: MongoClient | null = null;

export async function getMongoClient(): Promise<MongoClient> {
  if (mongoClient) {
    return mongoClient;
  }

  const mongoUrl = process.env.MONGODB_URI || "mongodb://localhost:27017";
  mongoClient = new MongoClient(mongoUrl);

  try {
    await mongoClient.connect();
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    throw error;
  }

  return mongoClient;
}

export async function getDatabase(dbName = "lovable") {
  const client = await getMongoClient();
  return client.db(dbName);
}

export async function closeMongoConnection() {
  if (mongoClient) {
    await mongoClient.close();
    mongoClient = null;
  }
}
