import { Context, Next } from "koa"
import { ZodError } from "zod"

export async function errorHandler(ctx: Context, next: Next) {
    try {
        return await next()
    } catch(err) {
        if(err instanceof ZodError) {
            ctx.status = 400
            ctx.response.body = {message: err.message}
        } else {
            ctx.status = 500
            ctx.response.body = {message: String(err)}
        }
    }
}