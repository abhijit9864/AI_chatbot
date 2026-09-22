import "dotenv/config";
import { defineConfig } from "prisma/config";

const host = process.env.DB_HOST;
const port = process.env.DB_PORT;
const database = process.env.DB_NAME;
const user = process.env.DB_USER;
const password = process.env.DB_PASSWORD;

if (!host || !port || !database || !user || !password) {
  throw new Error(
    "Database environment variables are not configured correctly."
  );
}

const encodedUser = encodeURIComponent(user);
const encodedPassword = encodeURIComponent(password);

const databaseUrl = `mysql://${encodedUser}:${encodedPassword}@${host}:${port}/${database}`;

export default defineConfig({
  schema: "prisma/schema.prisma",

  migrations: {
    path: "prisma/migrations",
  },

  datasource: {
    url: databaseUrl,
  },
});