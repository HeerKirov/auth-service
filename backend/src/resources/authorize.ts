import { Context } from "koa"
import { User, userCreateSchema, userSchema } from "@/schema/user"
import { authorizeSchema, authorizeVerifySchema, loginSchema, State } from "@/schema/authorize"
import { compareUser, createUser, getUser } from "@/services/user"
import { getApp } from "@/services/app"
import { createAccessToken, createRefreshToken } from "@/services/token"
import { createAuthorizationCode, validateAuthorizationCode } from "@/services/authorization-code"
import { isValidRedirectURI } from "@/utils/url"
import config from "@/config"

/**
 * 提供用户名和密码，进行登录，并获得refreshToken和accessToken。
 * 通过此API获得的token隶属于Auth Service自己。
 */
export async function login(ctx: Context) {
    const form = loginSchema.parse(ctx.request.body)

    const user = await compareUser(form.username, form.password)
    if(user === null) {
        ctx.status = 401
        ctx.response.body = {message: "Invalid username or password"}
        return
    }

    await tokenForThisApp(ctx, user)
}

/**
 * 注册一个新用户。
 */
export async function register(ctx: Context) {
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

    const targetApp = await getApp(form.appId)
    if(targetApp === null) {
        ctx.status = 404
        ctx.response.body = {message: "App Not Found"}
        return
    }

    if(!isValidRedirectURI(form.redirectURI, targetApp.domains)) {
        ctx.status = 403
        ctx.response.body = {message: "Invalid Redirect URI"}
        return
    }

    const state: State = ctx.state

    ctx.response.body = {
        authorizationCode: createAuthorizationCode(state.username, targetApp.appId)
    }
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
        ctx.status = 404
        ctx.response.body = {message: "App Not Found"}
        return
    }

    if(targetApp.appSecret !== form.appSecret) {
        ctx.status = 403
        ctx.response.body = {message: "Invalid App Secret"}
        return
    }

    const username = validateAuthorizationCode(form.authorizationCode, targetApp.appId)
    if(username === null) {
        ctx.status = 403
        ctx.response.body = {message: "Authorization code is not valid or expired"}
        return
    }

    const user = await getUser(username)
    if(user === null) {
        ctx.status = 403
        ctx.response.body = {message: "User is not valid"}
        return
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

async function tokenForThisApp(ctx: Context, user: User) {
    const app = await getApp(config.default.appId)

    const refreshToken = (await createRefreshToken(user, app!)).token
    const accessToken = await createAccessToken(user, app!)

    //默认情况下，refreshToken直接写入cookie，不会在返回值中显现
    ctx.cookies.set("token", refreshToken, { httpOnly: true, maxAge: 1000 * 60 * 60 * 24 * 7 })
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