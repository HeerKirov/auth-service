import { Knex } from "knex"
import { configDotenv } from "dotenv"
import * as process from "node:process"

configDotenv({path: [".env.development.local", ".env"]})

export default {
    port: process.env.PORT || 3000,
    jwtSecret: process.env.JWT_SECRET || "your_secret_key",
    saltSecret: process.env.SALT_SECRET || "your_secret_key",
    adminPassword: process.env.ADMIN_PASSWORD || "admin",
    db: <Knex.Config>{
        client: "pg",
        connection: {
            host: process.env.DB_HOST,
            port: process.env.DB_PORT && parseInt(process.env.DB_PORT),
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
        },
        useNullAsDefault: true
    }
}