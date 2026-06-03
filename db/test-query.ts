import { db } from "./index";
import { rooms } from "./schema";

async function main() {
  try {
    console.log("Attempting to query rooms from database...");
    const result = await db.select().from(rooms);
    console.log("Query successful! Rooms count:", result.length);
    console.log("Sample room:", result[0]);
  } catch (err: any) {
    console.error("Database query failed:");
    console.error(err);
  }
  process.exit(0);
}

main();
