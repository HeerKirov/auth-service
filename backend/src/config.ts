import { Knex } from "knex"
import { configDotenv } from "dotenv"
import * as process from "node:process"

configDotenv({path: [".env.development.local", ".env"]})

export default {
    port: process.env.PORT || 3000,
    jwtSecret: process.env.JWT_SECRET || "your_secret_key",
    db: <Knex.Config>{
        client: "postgresql",
        connection: {
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
        },
        useNullAsDefault: true
    }
}