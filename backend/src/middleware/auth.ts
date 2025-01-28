import { Context, Next } from "koa"
import jwt from "jsonwebtoken"
import { App } from "@/schema/app"
import { User } from "@/schema/user"
import { RefreshToken } from "@/schema/token"
import { JsonWebTokenPayload, State } from "@/schema/authorize"
import { compareUser, getUser, getUserById, updateUserRefreshTime } from "@/services/user"
import { getApp, getAppById } from "@/services/app"
import config from "@/config"
import { db } from "@/utils/db"

export async function auth(ctx: Context, next: Next) {
    const { path } = ctx

    // 不需要认证
    if (path === "/login" || path === "/register" || path === "/verify") {
        return await next()
    }

    // 允许 Basic Auth 或 Refresh Token 认证，且仅认证服务自己的 Refresh Token 有效
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

    // 仅允许 Refresh Token 认证
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

    // 一般 JWT 认证
    if (path.startsWith("/user/") || path.startsWith("/admin/")) {
        const authType = analyseAuthType(ctx, { accessToken: true })
        if (authType.type === "Bearer") {
            const state = await verifyAccessToken(authType.token)
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
    const record = await db.from<RefreshToken>("refresh_token").where({"token": token}).first()
    if(record === undefined) {
        return null
    }
    const now = Date.now()
    if(record.expireTime.getTime() < now) {
        await db.from<RefreshToken>("refresh_token").where({id: record.id}).del()
        return null
    }

    const user = await getUserById(record.userId)
    const app = await getAppById(record.appId)
    if(user === null || app === null) {
        return null
    }
    if(strict && app.appId !== config.default.appId) {
        return null
    }

    if(record.lastRefreshTime.getTime() - now > 1000 * 60 * 60 * 24) {
        await db.from<RefreshToken>("refresh_token").where({id: record.id}).update({
            expireTime: new Date(now + 1000 * 60 * 60 * 24 * 7),
            lastRefreshTime: new Date(now)
        })
        await updateUserRefreshTime(user.id, new Date(now))
    }

    return {
        username: user.username,
        appId: app.appId,
        getPermissions: async () => [], //TODO
        getUser: async () => user,
        getApp: async () => app,
    }
}

async function verifyAccessToken(token: string): Promise<State | null> {
    const decode = jwt.decode(token, { json: true })
    if(!decode || decode.exp! * 1000 < Date.now()) {
        return null
    }
    const { username, appId, permissions } = decode as JsonWebTokenPayload

    let user: User | null = null
    let app: App | null = null

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