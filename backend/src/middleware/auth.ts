import { Context, Next } from "koa"
import jwt from "koa-jwt"
import { RefreshToken } from "@/schema/token"
import { StateUser } from "@/schema/authorize"
import { compareUser, getUserById, updateUserRefreshTime } from "@/services/user"
import { getApp, getAppById } from "@/services/app"
import config from "@/config"
import { db } from "@/utils/db"

export async function auth(ctx: Context, next: Next) {
    const { path, headers } = ctx

    // 不需要认证
    if (path === "/login" || path === "/register" || path === "/verify") {
        return await next()
    }

    // 允许 Basic Auth 或 Refresh Token 认证，且仅认证服务自己的 Refresh Token 有效
    if (path === "/authorize") {
        const authHeader = headers.authorization

        if (authHeader?.startsWith("Basic ")) {
            const state = verifyBasicAuth(authHeader)
            if (state) {
                ctx.state.user = state
                return await next()
            }
        } else if (authHeader?.startsWith("Bearer ")) {
            const refreshToken = authHeader.split(" ")[1]
            const state = await verifyRefreshToken(refreshToken, true)
            if (state) {
                ctx.state.user = state
                return await next()
            }
        }

        ctx.status = 401
        ctx.body = { error: "Unauthorized" }
        return;
    }

    // 仅允许 Refresh Token 认证
    if (path === "/token") {
        const authHeader = headers.authorization
        if (authHeader?.startsWith("Bearer ")) {
            const refreshToken = authHeader.split(" ")[1]
            const state = await verifyRefreshToken(refreshToken, false)
            if (state) {
                ctx.state.user = state
                return await next()
            }
        }

        ctx.status = 401
        ctx.body = { error: "Unauthorized" }
        return
    }

    // 一般 JWT 认证
    if (path.startsWith("/user/") || path.startsWith("/admin/")) {
        return jwtMiddleware(ctx, next)
    }

    // 其他路径跳过认证
    return await next()
}

async function verifyBasicAuth(authHeader: string): Promise<StateUser | null> {
    const base64Credentials = authHeader.split(" ")[1]
    const credentials = Buffer.from(base64Credentials, "base64").toString("utf-8")
    const [username, password] = credentials.split(":")

    // 这里你需要实现用户名密码校验逻辑
    const user = await compareUser(username, password)
    if(user === null) return null

    const app = (await getApp(config.default.appId))!

    return {
        username: user.username,
        displayName: user.displayName,
        appId: app.appId
    }
}

async function verifyRefreshToken(token: string, strict: boolean): Promise<StateUser | null> {
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
        displayName: user.displayName,
        appId: app.appId
    }
}

const jwtMiddleware = jwt({ secret: config.app.jwtSecret })