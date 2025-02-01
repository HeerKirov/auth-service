import { Context, Next } from "koa"
import { ZodError } from "zod"
import { ServerError } from "@/utils/error"

export async function errorHandler(ctx: Context, next: Next) {
    try {
        return await next()
    } catch(err) {
        if(err instanceof ZodError) {
            ctx.status = 400
            ctx.response.body = {message: err.message}
        } else if(err instanceof ServerError) {
            ctx.status = err.statusCode
            ctx.response.body = {message: err.message, error: err.error}
        } else {
            ctx.status = 500
            ctx.response.body = {message: String(err)}
            console.error(err)
        }
    }
}