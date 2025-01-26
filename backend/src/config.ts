import { Knex } from "knex"
import { configDotenv } from "dotenv"
import * as process from "node:process"

configDotenv({path: [".env.development.local", ".env"]})

export default {
    port: process.env.PORT || 3000,
    app: {
        jwtSecret: process.env.APP_JWT_SECRET || "your_secret_key",
        domains: (process.env.APP_DOMAINS || "").split(",").map(n => n.trim()),
    },
    default: {
        appId: process.env.DEFAULT_APP_ID || "auth-service",
        appName: process.env.DEFAULT_APP_NAME || "Authorize Service",
        adminUsername: process.env.DEFAULT_ADMIN_USERNAME || "admin",
        adminDisplayName: process.env.DEFAULT_ADMIN_DISPLAY_NAME || "Administrator",
        adminPassword: process.env.DEFAULT_ADMIN_PASSWORD || "admin",
    },
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