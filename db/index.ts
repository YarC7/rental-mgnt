import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });
dotenv.config();

// Check for connection string
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL variable is missing in environment");
}

const connectionString = process.env.DATABASE_URL;

// Prevent multiple instances of postgres connection pool in development
const globalForDb = globalThis as unknown as {
  conn: postgres.Sql | undefined;
};

const conn = globalForDb.conn ?? postgres(connectionString, { prepare: false });

if (process.env.NODE_ENV !== "production") {
  globalForDb.conn = conn;
}

export const db = drizzle(conn, { schema });
export * from "./schema";

