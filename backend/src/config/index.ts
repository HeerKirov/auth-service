
export default {
    port: process.env.PORT || 3000,
    jwtSecret: process.env.JWT_SECRET || "your_secret_key",
    db: {
        client: 'postgresql',
        connection: {
            filename: './data/auth.db'
        },
        useNullAsDefault: true
    }
}