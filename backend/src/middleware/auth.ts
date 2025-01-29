import { Context, Next } from "koa"
import jwt, { JsonWebTokenError, NotBeforeError, TokenExpiredError } from "jsonwebtoken"
import { App } from "@/schema/app"
import { User } from "@/schema/user"
import { JsonWebTokenPayload, State } from "@/schema/authorize"
import { compareUser, getUser, getUserById } from "@/services/user"
import { deleteRefreshToken, flushRefreshTokenIfNecessary, getRefreshToken } from "@/services/token"
import { getApp, getAppById } from "@/services/app"
import config from "@/config"

export async function auth(ctx: Context, next: Next) {
    const { path } = ctx

    // 不需要认证
    if (path === "/login" || path === "/register" || path === "/verify") {
        return await next()
    }

    // 允许Basic Auth或Refresh Token认证，且仅认证服务自己的 Refresh Token 有效。不允许其他app访问
    if (path === "/authorize") {
        const authType = analyseAuthType(ctx, { basic: true, refreshToken: true })
        if(authType.type === "Basic") {
            const state = verifyBasicAuth(authType.username, authType.password)
            if (state) {
                ctx.state = state
                return await next()
            }
        }else if(authType.type === "Bearer") {
            const state = await verifyRefreshToken(authType.token, true)
            if (state) {
                ctx.state = state
                return await next()
            }
        }
        ctx.status = 401
        ctx.body = { message: "Unauthorized" }
        return
    }

    // 仅允许Refresh Token认证。允许其他app访问
    if (path === "/token") {
        const authType = analyseAuthType(ctx, { refreshToken: true })
        if (authType.type === "Bearer") {
            const state = await verifyRefreshToken(authType.token, false)
            if (state) {
                ctx.state = state
                return await next()
            }
        }

        ctx.status = 401
        ctx.body = { message: "Unauthorized" }
        return
    }

    // 一般JWT认证。除了/admin之外的path允许其他app访问
    if (path.startsWith("/user/") || path.startsWith("/admin/")) {
        const authType = analyseAuthType(ctx, { accessToken: true })
        if (authType.type === "Bearer") {
            const state = await verifyAccessToken(authType.token, path.startsWith("/admin/"))
            if (state) {
                ctx.state = state
                return await next()
            }
        }

        ctx.status = 401
        ctx.body = { message: "Unauthorized" }
        return
    }

    // 其他路径跳过认证
    return await next()
}

function analyseAuthType(ctx: Context, { basic, accessToken, refreshToken }: {basic?: boolean, accessToken?: boolean, refreshToken?: boolean} = {}) {
    const { headers, cookies } = ctx
    if(basic && headers.authorization?.startsWith("Basic ")) {
        const base64Credentials = headers.authorization.split(" ")[1]
        const credentials = Buffer.from(base64Credentials, "base64").toString("utf-8")
        const [username, password] = credentials.split(":")
        return {type: "Basic" as const, username, password}
    }else if((accessToken || refreshToken) && headers.authorization?.startsWith("Bearer ")) {
        const refreshToken = headers.authorization.split(" ")[1]
        return {type: "Bearer" as const, token: refreshToken}
    }else if(refreshToken) {
        const token = cookies.get("token")
        if(token) {
            return {type: "Bearer" as const, token}
        }
    }

    return {type: "Unauthorized" as const}
}

async function verifyBasicAuth(username: string, password: string): Promise<State | null> {
    const user = await compareUser(username, password)
    if(user === null) return null

    const app = (await getApp(config.default.appId))!

    return {
        username: user.username,
        appId: app.appId,
        getPermissions: async () => [],
        getUser: async () => user,
        getApp: async () => app,
    }
}

async function verifyRefreshToken(token: string, strict: boolean): Promise<State | null> {
    const record = await getRefreshToken(token)
    if(record === null) {
        return null
    }
    if(record.expireTime.getTime() < Date.now()) {
        await deleteRefreshToken(record)
        return null
    }

    const [user, app] = await Promise.all([getUserById(record.userId), getAppById(record.appId)])
    if(user === null || app === null) {
        return null
    }
    if(strict && app.appId !== config.default.appId) {
        //在strict=true的情况下，不允许来自其他app的refresh token进行认证，于是此时将返回
        return null
    }

    await flushRefreshTokenIfNecessary(record)

    return {
        username: user.username,
        appId: app.appId,
        getPermissions: async () => [], //TODO
        getUser: async () => user,
        getApp: async () => app,
    }
}

async function verifyAccessToken(token: string, strict: boolean): Promise<State | null> {
    const decode = jwt.decode(token, { json: true })
    const { username, appId, permissions } = decode as JsonWebTokenPayload

    let user: User | null = null
    let app: App | null = null

    let secret: string
    if(appId !== config.default.appId && !strict) {
        //在strict=false的情况下，允许非auth service的、来自其他app的access token进行认证。于是此时需要查询对应app的secret
        app = await getApp(appId)
        if(app === null) {
            return null
        }
        secret = app.appSecret
    }else{
        secret = config.app.jwtSecret
    }

    try {
        jwt.verify(token, secret)
    }catch(e) {
        if(e instanceof TokenExpiredError || e instanceof JsonWebTokenError || e instanceof NotBeforeError) {
            return null
        }else{
            throw e
        }
    }

    return {
        username,
        appId,
        getPermissions: async () => permissions,
        async getUser() {
            if(user === null) user = await getUser(username)
            return user!
        },
        async getApp() {
            if(app === null) app = await getApp(appId)
            return app!
        }
    }
}