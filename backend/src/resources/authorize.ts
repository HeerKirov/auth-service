import { Context } from "koa"
import { analyseAuthType, verifyRefreshToken } from "@/middleware/auth"
import { User, userCreateSchema, userSchema } from "@/schema/user"
import { authorizeSchema, authorizeVerifySchema, loginSchema, refreshTokenSchema, State } from "@/schema/authorize"
import { compareUser, createUser, getUser } from "@/services/user"
import { getApp } from "@/services/app"
import { createAccessToken, createRefreshToken, deleteRefreshToken, getRefreshToken } from "@/services/token"
import { createAuthorizationCode, validateAuthorizationCode } from "@/services/authorization-code"
import { getSetting, SETTINGS } from "@/services/setting"
import { isValidRedirectURI } from "@/utils/url"
import { ErrorCode, ServerError } from "@/utils/error"
import { transformCamelCase, transformUnderlineCase } from "@/utils/req"
import config from "@/config"

/**
 * 提供用户名和密码，进行登录，并获得refreshToken和accessToken。
 * 通过此API获得的token隶属于Auth Service自己。
 */
export async function login(ctx: Context) {
    const form = loginSchema.parse(ctx.request.body)

    const user = await compareUser(form.username, form.password)
    if(user === null) {
        throw new ServerError(401, ErrorCode.InvalidUsernameOrPassword, "Invalid username or password")
    }

    await tokenForThisApp(ctx, user)
}

/**
 * 注册一个新用户。
 */
export async function register(ctx: Context) {
    if(!await getSetting(SETTINGS.REGISTRATION_SWITCH)) {
        ctx.response.body = {message: "Registration is closed."}
        ctx.response.status = 422
        return
    }
    const form = userCreateSchema.parse(ctx.request.body)

    const user = await createUser(form)

    await tokenForThisApp(ctx, user)

    ctx.response.status = 201
}

/**
 * 提供appId和redirectURI，请求获得授权码。
 * 该API要求使用refreshToken或basic auth认证。
 */
export async function authorize(ctx: Context) {
    const form = authorizeSchema.parse(ctx.request.body)

    const state: State = ctx.state
    const user = await state.getUser()
    if(!user.enabled) {
        throw new ServerError(403, ErrorCode.DisabledUser, "User is disabled")
    }

    const targetApp = await getApp(form.appId)
    if(targetApp === null) {
        throw new ServerError(404, ErrorCode.NotFound, "App not found")
    }else if(!targetApp.enabled) {
        throw new ServerError(403, ErrorCode.DisabledApp, "App is disabled")
    }

    if(!isValidRedirectURI(form.redirectURI, targetApp.domains)) {
        throw new ServerError(403, ErrorCode.InvalidRedirectURI, "Invalid redirect URI")
    }

    const authorizationCode = await createAuthorizationCode(state.username, targetApp.appId)

    ctx.response.body = {authorizationCode}
    ctx.response.status = 201
}

/**
 * OAuth2 token API。用于：授权码生成token、刷新token、注销token。
 */
export async function token(ctx: Context) {
    const [ grantType, codeStyle ] = getOAuthType(ctx)
    switch (grantType) {
        case "authorizationCode": {
            ctx.response.body = codeStyle(await verifyAuthorizationCode(ctx))
            break
        }
        case "refreshToken": {
            ctx.response.body = codeStyle(await refreshToken(ctx))
            break
        }
        case "logout": {
            ctx.response.body = codeStyle(await logout(ctx))
            break
        }
    }
}

function getOAuthType(ctx: Context): ["authorizationCode" | "refreshToken" | "logout", (d: Record<string, any>) => Record<string, any>] {
    const type = ctx.request.query["grant_type"] ?? ctx.request.body["grant_type"]
    if(type) {
        switch (type) {
            case "authorization_code": return ["authorizationCode", transformUnderlineCase]
            case "refresh_token": return ["refreshToken", transformUnderlineCase]
            case "logout": return ["logout", transformUnderlineCase]
            default: throw new ServerError(400, ErrorCode.InvalidParameter, "Invalid grant type")
        }
    }
    const type2 = ctx.request.query["grantType"] ?? ctx.request.body["grantType"]
    if(type2) {
        switch (type2) {
            case "authorizationCode": return ["authorizationCode", d => d]
            case "refreshToken": return ["refreshToken", d => d]
            case "logout": return ["logout", d => d]
            default: throw new ServerError(400, ErrorCode.InvalidParameter, "Invalid grant type")
        }
    }
    throw new ServerError(400, ErrorCode.InvalidParameter, "grantType/grant_type is required")
}

async function verifyAuthorizationCode(ctx: Context): Promise<object> {
    const form = authorizeVerifySchema.parse(transformCamelCase(ctx.request.body))

    const targetApp = await getApp(form.clientId)
    if(targetApp === null) {
        throw new ServerError(404, ErrorCode.NotFound, "App not found")
    }else if(targetApp.appSecret !== form.clientSecret) {
        throw new ServerError(403, ErrorCode.InvalidAppSecret, "Invalid App Secret")
    }else if(!targetApp.enabled) {
        throw new ServerError(403, ErrorCode.DisabledApp, "App is disabled")
    }

    const username = validateAuthorizationCode(form.code, targetApp.appId)
    if(username === null) {
        throw new ServerError(403, ErrorCode.InvalidAuthorizationCode, "Authorization code is not valid or expired")
    }

    const user = await getUser(username)
    if(user === null) {
        throw new ServerError(404, ErrorCode.NotFound, "User not found")
    }else if(!user.enabled) {
        throw new ServerError(403, ErrorCode.DisabledUser, "User is disabled")
    }

    const refreshToken = (await createRefreshToken(user, targetApp)).token
    const { token: accessToken, expire } = (await createAccessToken(user, targetApp))

    //该API是提供给其他后端调用的，因此refreshToken直接写入返回值，不需要写入cookie
    return {
        tokenType: "bearer",
        scope: "read write",
        expireIn: expire / 3600,
        refreshToken,
        accessToken,
        user: userSchema.parse(user)
    }
}

async function refreshToken(ctx: Context): Promise<object> {
    const refreshToken = tokenFromAnalyseOrForm(ctx)
    const state = await verifyRefreshToken(refreshToken, false, ctx)

    const { token: accessToken, expire } = await createAccessToken(await state.getUser(), await state.getApp())

    return {
        tokenType: "bearer",
        scope: "read write",
        expiresIn: expire / 3600,
        accessToken
    }
}

async function logout(ctx: Context): Promise<object> {
    const refreshToken = tokenFromAnalyseOrForm(ctx)
    await verifyRefreshToken(refreshToken, false, ctx)

    const header = ctx.request.headers["refresh-token-name"]
    const cookieName = header !== undefined ? (typeof header === "string" ? header : header[0]) : "refresh-token"
    ctx.cookies.set(cookieName)

    const tokenRecord = await getRefreshToken(refreshToken)
    if(tokenRecord !== null) await deleteRefreshToken(tokenRecord)

    ctx.response.status = 204
    return {success: true}
}

function tokenFromAnalyseOrForm(ctx: Context): string {
    const authType = analyseAuthType(ctx, { refreshToken: true })
    if(authType.type === "Bearer") {
        return authType.token
    }
    const form = refreshTokenSchema.safeParse(ctx.request.body)
    if(form.success) {
        return form.data.refreshToken
    }
    throw new ServerError(401, ErrorCode.Unauthorized, "Unauthorized")
}

async function tokenForThisApp(ctx: Context, user: User) {
    const app = await getApp(config.app.appId)

    const refreshToken = (await createRefreshToken(user, app!)).token
    const accessToken = (await createAccessToken(user, app!)).token

    //默认情况下，refreshToken直接写入cookie，不会在返回值中显现
    const header = ctx.request.headers["refresh-token-name"]
    const cookieName = header !== undefined ? (typeof header === "string" ? header : header[0]) : "refresh-token"
    ctx.cookies.set(cookieName, refreshToken, { httpOnly: true, maxAge: await getSetting(SETTINGS.REFRESH_TOKEN_DELAY) })
    if(config.debug) {
        //而在debug开启的模式下，会改变返回值，在其中加入refreshToken，方便调试
        ctx.response.body = {
            refreshToken,
            accessToken,
            user: userSchema.parse(user)
        }
    }else{
        ctx.response.body = {
            accessToken,
            user: userSchema.parse(user)
        }
    }
}