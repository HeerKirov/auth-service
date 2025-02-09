import { Context } from "koa"
import { User, userCreateSchema, userSchema } from "@/schema/user"
import { authorizeSchema, authorizeVerifySchema, loginSchema, State } from "@/schema/authorize"
import { compareUser, createUser, getUser } from "@/services/user"
import { getApp } from "@/services/app"
import { createAccessToken, createRefreshToken } from "@/services/token"
import { createAuthorizationCode, validateAuthorizationCode } from "@/services/authorization-code"
import { getSetting, SETTINGS } from "@/services/setting"
import { isValidRedirectURI } from "@/utils/url"
import { ErrorCode, ServerError } from "@/utils/error"
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
 * 提供appId、appSecret、授权码，请求获得该App的授权，从而获得隶属于该App的双token。
 * 该API是由托管App的后端调用的。
 */
export async function verify(ctx: Context) {
    const form = authorizeVerifySchema.parse(ctx.request.body)

    const targetApp = await getApp(form.appId)
    if(targetApp === null) {
        throw new ServerError(404, ErrorCode.NotFound, "App not found")
    }else if(targetApp.appSecret !== form.appSecret) {
        throw new ServerError(403, ErrorCode.InvalidAppSecret, "Invalid App Secret")
    }else if(!targetApp.enabled) {
        throw new ServerError(403, ErrorCode.DisabledApp, "App is disabled")
    }

    const username = validateAuthorizationCode(form.authorizationCode, targetApp.appId)
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
    const accessToken = await createAccessToken(user, targetApp)

    //该API是提供给其他后端调用的，因此refreshToken直接写入返回值，不需要写入cookie
    ctx.response.body = {
        refreshToken,
        accessToken,
        user: userSchema.parse(user)
    }
}

/**
 * 创建一个新的accessToken。
 * 该API要求且仅允许使用refreshToken认证。
 */
export async function token(ctx: Context) {
    const state: State = ctx.state

    const accessToken = await createAccessToken(await state.getUser(), await state.getApp())

    ctx.response.body = {accessToken}
    ctx.response.status = 201
}

/**
 * 登出。实际作用是移除cookie中的token。
 */
export async function logout(ctx: Context) {
    const header = ctx.request.headers["refresh-token-name"]
    const cookieName = header !== undefined ? (typeof header === "string" ? header : header[0]) : "token"
    ctx.cookies.set(cookieName)

    ctx.response.body = {success: true}
    ctx.response.status = 204
}

async function tokenForThisApp(ctx: Context, user: User) {
    const app = await getApp(config.app.appId)

    const refreshToken = (await createRefreshToken(user, app!)).token
    const accessToken = await createAccessToken(user, app!)

    //默认情况下，refreshToken直接写入cookie，不会在返回值中显现
    const header = ctx.request.headers["refresh-token-name"]
    const cookieName = header !== undefined ? (typeof header === "string" ? header : header[0]) : "token"
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