import { Context } from "koa"
import { userSchema } from "@/schema/user"
import { loginSchema, StateUser } from "@/schema/authorize"
import { compareUser, getUser } from "@/services/user"
import { getApp } from "@/services/app"
import { createAccessToken, createRefreshToken } from "@/services/token"
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

    const app = await getApp(config.default.appId)

    const refreshToken = (await createRefreshToken(user, app!)).token
    const accessToken = await createAccessToken(user, app!)

    ctx.response.body = {
        refreshToken,
        accessToken,
        user: userSchema.parse(user)
    }
    ctx.response.status = 201
}

export async function authorize(ctx: Context) {

}

export async function verify(ctx: Context) {
    const user = ctx.state.user
}

/**
 * 创建一个新的accessToken。
 * 该API要求且仅允许使用refreshToken认证。
 */
export async function token(ctx: Context) {
    const state: StateUser = ctx.state.user

    const user = await getUser(state.username)
    const app = await getApp(state.appId)

    const accessToken = await createAccessToken(user!, app!)

    ctx.response.body = {accessToken}
    ctx.response.status = 201
}