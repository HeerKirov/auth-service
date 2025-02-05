import jwt from "jsonwebtoken"
import { User } from "@/schema/user"
import { db } from "@/utils/db"
import { App } from "@/schema/app"
import { userAppPermissionSchemaForToken } from "@/schema/user-app"
import { RefreshToken } from "@/schema/token"
import { JsonWebTokenPayload } from "@/schema/authorize"
import { flushUserRefreshTime } from "@/services/user"
import { selectUserAppPermissions } from "@/services/user-permission"
import { createOrFlushUserAppRelation } from "@/services/user-app"
import { SETTINGS, getSetting } from "@/services/setting"
import config from "@/config"

export async function createRefreshToken(user: User, app: App): Promise<RefreshToken> {
    const jwtSecret = app.appId === config.app.appId ? config.app.jwtSecret : app.appSecret
    const payload = {refreshToken: true}
    const token = jwt.sign(payload, jwtSecret)
    const now = new Date()
    const expire = new Date(now.getTime() + await getSetting(SETTINGS.REFRESH_TOKEN_DELAY))

    const [{ id }] = await db.from<RefreshToken>("refresh_token").insert({
        userId: user.id,
        appId: app.id,
        token: token,
        createTime: now,
        expireTime: expire,
        lastRefreshTime: now
    }).returning("id")

    await flushUserRefreshTime(user.id, now)
    await createOrFlushUserAppRelation(user.id, app.id, now)

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

export async function flushRefreshToken(record: RefreshToken, now: number): Promise<RefreshToken> {
    const expireTime = new Date(now + await getSetting(SETTINGS.REFRESH_TOKEN_DELAY))
    const lastRefreshTime = new Date(now)

    await db.from<RefreshToken>("refresh_token").where({id: record.id}).update({expireTime, lastRefreshTime})
    await flushUserRefreshTime(record.userId, lastRefreshTime)
    await createOrFlushUserAppRelation(record.userId, record.appId, lastRefreshTime)

    return {...record, expireTime, lastRefreshTime}
}

export async function deleteRefreshToken(record: RefreshToken): Promise<void> {
    await db.from<RefreshToken>("refresh_token").where({id: record.id}).del()
}

export async function deleteRefreshTokenByApp(appId: number): Promise<void> {
    await db.from<RefreshToken>("refresh_token").where({appId}).del()
}

export async function deleteRefreshTokenByUser(userId: number): Promise<void> {
    await db.from<RefreshToken>("refresh_token").where({userId}).del()
}

export async function createAccessToken(user: User, app: App): Promise<string> {
    const permissions = (await selectUserAppPermissions(user.id, app.id)).map(p => userAppPermissionSchemaForToken.parse(p))
    const jwtSecret = app.appId === config.app.appId ? config.app.jwtSecret : app.appSecret
    const createTime = Date.now()
    const payload: JsonWebTokenPayload = {
        username: user.username,
        appId: app.appId,
        permissions,
        tokenCreateTime: createTime,
        tokenExpireTime: createTime + await getSetting(SETTINGS.ACCESS_TOKEN_DELAY)
    }
    return jwt.sign(payload, jwtSecret, { expiresIn: "1h" })
}