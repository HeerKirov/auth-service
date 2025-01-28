import { Context } from "koa"

/**
 * 根据User-Agent判断当前请求是否是浏览器环境。
 */
export function isBrowserAgent(ctx: Context) {
    const userAgent = ctx.get("User-Agent")

    return /Mozilla|Chrome|Safari|Firefox|Edge/i.test(userAgent)
}