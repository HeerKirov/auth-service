import jwt from "jsonwebtoken"
import { User } from "@/schema/user"
import { db } from "@/utils/db"
import { RefreshToken } from "@/schema/token"
import { JsonWebTokenPayload } from "@/schema/authorize"
import { App } from "@/schema/app"
import { updateUserRefreshTime } from "@/services/user"
import config from "@/config"

export async function createRefreshToken(user: User, app: App): Promise<RefreshToken> {
    const jwtSecret = app.appId === config.default.appId ? config.app.jwtSecret : app.appSecret
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

    await updateUserRefreshTime(user.id, now)

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

export async function createAccessToken(user: User, app: App): Promise<string> {
    const jwtSecret = app.appId === config.default.appId ? config.app.jwtSecret : app.appSecret
    const createTime = Date.now()
    const payload: JsonWebTokenPayload = {
        username: user.username,
        displayName: user.displayName,
        appId: app.appId,
        tokenCreateTime: createTime,
        tokenExpireTime: createTime + 1000 * 60 * 60
    }
    return jwt.sign(payload, jwtSecret, { expiresIn: "1h" })
}