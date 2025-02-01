import cors from "@koa/cors"

export const corsMiddleware = cors({
    origin: ctx => {
        if (ctx.path.startsWith("/app/") || ctx.path === "/token") {
            return "*"
        }
        return ""
    },
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
});