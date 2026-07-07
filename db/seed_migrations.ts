import { db } from "./index";
import { sql } from "drizzle-orm";
import * as fs from "fs";
import * as crypto from "crypto";

async function main() {
  const migrations = [
    { tag: "0000_quick_frog_thor", filename: "drizzle/0000_quick_frog_thor.sql", when: 1780446020085 },
    { tag: "0001_unique_lockheed", filename: "drizzle/0001_unique_lockheed.sql", when: 1780451807926 },
    { tag: "0002_grey_mister_fear", filename: "drizzle/0002_grey_mister_fear.sql", when: 1780459393099 },
  ];

  try {
    // Check if __drizzle_migrations table exists, if not, create it
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "public"."__drizzle_migrations" (
        "id" SERIAL PRIMARY KEY,
        "hash" text NOT NULL,
        "created_at" bigint
      );
    `);

    for (const m of migrations) {
      const content = fs.readFileSync(m.filename, "utf8");
      // Drizzle-kit hashes the content. Sometimes it normalizes line endings to LF (\n) to be platform-independent.
      // Let's normalize CRLF to LF just in case, but let's check both or use the normalized one.
      const normalizedContent = content.replace(/\r\n/g, "\n");
      const hash = crypto.createHash("sha256").update(normalizedContent).digest("hex");

      console.log(`Inserting migration: ${m.tag} with hash: ${hash}`);
      
      // Check if it already exists
      const existing = await db.execute(sql`
        SELECT * FROM "__drizzle_migrations" WHERE hash = ${hash}
      `);

      if (existing.length === 0) {
        await db.execute(sql`
          INSERT INTO "__drizzle_migrations" (hash, created_at)
          VALUES (${hash}, ${m.when})
        `);
        console.log(`Successfully inserted ${m.tag}`);
      } else {
        console.log(`${m.tag} already exists in DB`);
      }
    }
  } catch (err) {
    console.error("Failed to seed migrations table:", err);
  }
  process.exit(0);
}

main();
