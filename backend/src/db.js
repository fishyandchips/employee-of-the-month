import pg from "pg";

const { Client } = pg;

export const client = new Client({
  connectionString: process.env.DATABASE_URL
});

await client.connect();
