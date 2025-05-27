import { Knex } from "knex"
import { configDotenv } from "dotenv"
import * as process from "node:process"

configDotenv({path: [".env.development.local", ".env"]})

export default {
    port: process.env.PORT || 3000,
    debug: process.env.DEBUG?.toLowerCase() === "true",
    app: {
        iss: process.env.APP_ISS || (process.env.APP_DOMAINS || "").split(",")[0].trim(),
        jwtSecret: process.env.APP_JWT_SECRET || "your_secret_key",
        domains: (process.env.APP_DOMAINS || "").split(",").map(n => n.trim()),
        appId: process.env.APP_ID || "auth-service",
        appName: process.env.APP_NAME || "Authorize Service",
        admin: {
            username: process.env.ADMIN_USERNAME || "admin",
            displayName: process.env.ADMIN_DISPLAY_NAME || "Administrator",
            password: process.env.ADMIN_PASSWORD || "admin",
        }
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
    },
    oss: {
        accessKeyId: process.env.OSS_ACCESS_KEY_ID,
        accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
        bucket: process.env.OSS_BUCKET,
        region: process.env.OSS_REGION || 'oss-cn-shanghai',
        internal: process.env.OSS_INTERNAL?.toLowerCase() === 'true',
        secure: process.env.OSS_SECURE?.toLowerCase() === 'true',
        endpoint: process.env.OSS_ENDPOINT,
        basePath: process.env.OSS_BASE_PATH || ''
    }
}