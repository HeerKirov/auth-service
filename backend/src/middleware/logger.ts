import { Context, Next } from "koa"
import { logger } from "@/utils/logger"

export async function logHandler(ctx: Context, next: Next) {
    const r = await next()
    logger.info(`${ctx.method} ${ctx.url} ${ctx.status}`)
    return r
}