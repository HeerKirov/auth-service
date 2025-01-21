import { Knex } from "knex"
import * as process from "node:process"
import { configDotenv } from "dotenv"

configDotenv({path: [".env.development.local", ".env"]})

const config: Knex.Config = {
  client: "pg",
  connection: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT !== undefined ? parseInt(process.env.DB_PORT) : undefined,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  },
  migrations: {
    tableName: "knex_migrations"
  }
}

module.exports = config