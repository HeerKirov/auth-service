import { Context } from "koa"
import { StateUser } from "@/schema/authorize"
import { userSchema } from "@/schema/user"
import { getUser } from "@/services/user"

export async function getUserInfo(ctx: Context) {
    const state: StateUser = ctx.state.user
    const user = (await getUser(state.username))!

    ctx.response.body = userSchema.parse(user)
}