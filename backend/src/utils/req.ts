import { Context } from "koa"

/**
 * 根据User-Agent判断当前请求是否是浏览器环境。
 */
export function isBrowserAgent(ctx: Context) {
    const userAgent = ctx.get("User-Agent")

    return /Mozilla|Chrome|Safari|Firefox|Edge/i.test(userAgent)
}

/**
 * 对表单进行预处理。所有下划线格式的key都会被转换为驼峰式。
 * @param form
 */
export function transformCamelCase(form: Record<string, any>): Record<string, any> {
    const returns: Record<string, any> = {}
    for(const [key, value] of Object.entries(form)) {
        const camelKey = toCamelCase(key)
        returns[camelKey] = value
    }
    return returns
}

/**
 * 对表单进行预处理。所有驼峰格式的key都会被转换为下划线式。
 * @param form
 */
export function transformUnderlineCase(form: Record<string, any>): Record<string, any> {
    const returns: Record<string, any> = {}
    for(const [key, value] of Object.entries(form)) {
        const camelKey = toUnderlineCase(key)
        returns[camelKey] = value
    }
    return returns
}

/**
 * 将字符串字段名转换为驼峰式。
 * @param str
 */
export function toCamelCase(str: string): string {
    return str.replace(/_([a-z])/g, (_, char) => char.toUpperCase())
}

/**
 * 将字符串字段名转换为下划线式。
 * @param str
 */
export function toUnderlineCase(str: string): string {
    return str.replace(/([A-Z])/g, (_, char) => `_${char.toLowerCase()}`)
}