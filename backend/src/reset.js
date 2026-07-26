import "dotenv/config";
import { client } from "./db.js";

const reset = async () => {
  await client.query(
    "TRUNCATE users, employees, certifications, completed_certifications, sessions"
  );
};

reset()
  .catch(console.error)
  .finally(() => client.end());
