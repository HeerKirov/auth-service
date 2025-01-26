import { Context } from "koa"
import { compare } from "bcrypt"
import { userSchema } from "@/schema/user"
import { loginSchema } from "@/schema/authorize"
import { getUser } from "@/services/user"
import { getApp } from "@/services/app"
import { createAccessToken, createRefreshToken } from "@/services/token"
import config from "@/config"

/**
 * 提供用户名和密码，进行登录，并获得refreshToken和accessToken。
 * 通过此API获得的token隶属于Auth Service自己。
 */
export async function login(ctx: Context) {
    const form = loginSchema.parse(ctx.request.body)

    const user = await getUser(form.username)
    if(user === null || !await compare(form.password, user.password)) {
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

}