import { Pool } from "pg";
import "server-only"; // Ensures this code only runs on the server.

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set. Ensure it exists in the root .env");
}

const pool = new Pool({
  connectionString: databaseUrl,
});

export { pool };
