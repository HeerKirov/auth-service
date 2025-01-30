import jwt from "jsonwebtoken"
import { User } from "@/schema/user"
import { db } from "@/utils/db"
import { App } from "@/schema/app"
import { RefreshToken } from "@/schema/token"
import { JsonWebTokenPayload } from "@/schema/authorize"
import { flushUserRefreshTime } from "@/services/user"
import { selectUserAppPermissions } from "@/services/user-permission"
import config from "@/config"

export async function createRefreshToken(user: User, app: App): Promise<RefreshToken> {
    const jwtSecret = app.appId === config.app.appId ? config.app.jwtSecret : app.appSecret
    const payload = {refreshToken: true}
    const token = jwt.sign(payload, jwtSecret)
    const now = new Date()
    const expire = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 7)

    const [{ id }] = await db.from<RefreshToken>("refresh_token").insert({
        userId: user.id,
        appId: app.id,
        token: token,
        createTime: now,
        expireTime: expire,
        lastRefreshTime: now
    }).returning("id")

    await flushUserRefreshTime(user.id, now)

    return {
        id,
        userId: user.id,
        appId: app.id,
        token: token,
        createTime: now,
        expireTime: expire,
        lastRefreshTime: now
    }
}

export async function getRefreshToken(token: string): Promise<RefreshToken | null> {
    return (await db.from<RefreshToken>("refresh_token").where({"token": token}).first()) ?? null
}

export async function flushRefreshTokenIfNecessary(record: RefreshToken): Promise<RefreshToken> {
    const now = Date.now()
    if(record.lastRefreshTime.getTime() - now > 1000 * 60 * 60 * 24) {
        const expireTime = new Date(now + 1000 * 60 * 60 * 24 * 7)
        const lastRefreshTime = new Date(now)

        await db.from<RefreshToken>("refresh_token").where({id: record.id}).update({expireTime, lastRefreshTime})
        await flushUserRefreshTime(record.userId, new Date(now))

        return {...record, expireTime, lastRefreshTime}
    }
    return record
}

export async function deleteRefreshToken(record: RefreshToken): Promise<void> {
    await db.from<RefreshToken>("refresh_token").where({id: record.id}).del()
}

export async function createAccessToken(user: User, app: App): Promise<string> {
    const permissions: {permission: string, arguments: Record<string, unknown>}[] = await selectUserAppPermissions(user.id, app.id)
    const jwtSecret = app.appId === config.app.appId ? config.app.jwtSecret : app.appSecret
    const createTime = Date.now()
    const payload: JsonWebTokenPayload = {
        username: user.username,
        appId: app.appId,
        permissions,
        tokenCreateTime: createTime,
        tokenExpireTime: createTime + 1000 * 60 * 60
    }
    return jwt.sign(payload, jwtSecret, { expiresIn: "1h" })
}