import { Context, Next } from "koa"
import jwt, { JsonWebTokenError, NotBeforeError, TokenExpiredError } from "jsonwebtoken"
import { App } from "@/schema/app"
import { User } from "@/schema/user"
import { userAppPermissionSchemaForToken } from "@/schema/user-app"
import { JsonWebTokenPayload, State } from "@/schema/authorize"
import { compareUser, getUser, getUserById } from "@/services/user"
import { deleteRefreshToken, flushRefreshToken, getRefreshToken } from "@/services/token"
import { getApp, getAppById } from "@/services/app"
import { selectUserAppPermissions } from "@/services/user-permission"
import { ErrorCode, ServerError } from "@/utils/error"
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
            ctx.state = verifyBasicAuth(authType.username, authType.password)
            return await next()
        }else if(authType.type === "Bearer") {
            ctx.state = await verifyRefreshToken(authType.token, true, ctx)
            return await next()
        }
        throw new ServerError(401, ErrorCode.Unauthorized, "Unauthorized")
    }

    // 仅允许Refresh Token认证。允许其他app访问
    if (path === "/token" || path === "/logout") {
        const authType = analyseAuthType(ctx, { refreshToken: true })
        if (authType.type === "Bearer") {
            ctx.state = await verifyRefreshToken(authType.token, false, ctx)
            return await next()
        }
        throw new ServerError(401, ErrorCode.Unauthorized, "Unauthorized")
    }

    // 一般JWT认证。其中/app/允许其他app访问
    if (path.startsWith("/app/") || path.startsWith("/my/") || path.startsWith("/admin/")) {
        const authType = analyseAuthType(ctx, { accessToken: true })
        if (authType.type === "Bearer") {
            ctx.state = await verifyAccessToken(authType.token, !path.startsWith("/app/"))
            return await next()
        }
        throw new ServerError(401, ErrorCode.Unauthorized, "Unauthorized")
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
    }else if(refreshToken) {
        const token = cookies.get("token")
        if(token) {
            return {type: "Bearer" as const, token}
        }
    }else if((accessToken || refreshToken) && headers.authorization?.startsWith("Bearer ")) {
        const refreshToken = headers.authorization.split(" ")[1]
        return {type: "Bearer" as const, token: refreshToken}
    }

    return {type: "Unauthorized" as const}
}

async function verifyBasicAuth(username: string, password: string): Promise<State> {
    const user = await compareUser(username, password)
    if(user === null) {
        throw new ServerError(401, ErrorCode.InvalidUsernameOrPassword, "Invalid username or password")
    }

    const app = (await getApp(config.app.appId))!

    return exportState(user, app)
}

async function verifyRefreshToken(token: string, strict: boolean, ctx: Context): Promise<State> {
    const record = await getRefreshToken(token)
    if(record === null) {
        throw new ServerError(401, ErrorCode.Unauthorized, "Token not found")
    }
    if(record.expireTime.getTime() < Date.now()) {
        await deleteRefreshToken(record)
        throw new ServerError(401, ErrorCode.Unauthorized, "Token expired")
    }

    const [user, app] = await Promise.all([getUserById(record.userId), getAppById(record.appId)])
    if(user === null || app === null) {
        throw new ServerError(401, ErrorCode.Unauthorized, "User or app not found")
    }
    if(strict && app.appId !== config.app.appId) {
        //在strict=true的情况下，不允许来自其他app的refresh token进行认证，于是此时将返回
        throw new ServerError(401, ErrorCode.Unauthorized, "Token is not used for this app")
    }

    const now = Date.now()
    if(record.lastRefreshTime.getTime() - now > 1000 * 60 * 60 * 24) {
        const token = await flushRefreshToken(record, now)
        ctx.cookies.set("token", token.token, { httpOnly: true, maxAge: 1000 * 60 * 60 * 24 * 7 })
    }

    return exportState(user, app)
}

function exportState(user: User, app: App): State {
    let permissions: {name: string, args: Record<string, unknown>}[] | null = null

    return {
        username: user.username,
        appId: app.appId,
        async getPermissions() {
            if(permissions === null) {
                permissions = (await selectUserAppPermissions(user.id, app.id)).map(p => userAppPermissionSchemaForToken.parse(p))
            }
            return permissions
        },
        getUser: async () => user,
        getApp: async () => app,
    }
}

async function verifyAccessToken(token: string, strict: boolean): Promise<State> {
    const decode = jwt.decode(token, { json: true })
    if(decode === null) {
        throw new ServerError(401, ErrorCode.Unauthorized, "Token cannot be decoded")
    }
    const { username, appId, permissions } = decode as JsonWebTokenPayload

    let user: User | null = null
    let app: App | null = null

    let secret: string
    if(appId !== config.app.appId && !strict) {
        //在strict=false的情况下，允许非auth service的、来自其他app的access token进行认证。于是此时需要查询对应app的secret
        app = await getApp(appId)
        if(app === null) throw new ServerError(401, ErrorCode.Unauthorized, "App not found")
        secret = app.appSecret
    }else{
        secret = config.app.jwtSecret
    }

    try {
        jwt.verify(token, secret)
    }catch(e) {
        if(e instanceof TokenExpiredError) {
            throw new ServerError(401, ErrorCode.Unauthorized, "Token expired")
        } else if(e instanceof JsonWebTokenError) {
            throw new ServerError(401, ErrorCode.Unauthorized, `Token decode error: ${e.message}`)
        } else if(e instanceof NotBeforeError) {
            throw new ServerError(401, ErrorCode.Unauthorized, "Token not before")
        } else {
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