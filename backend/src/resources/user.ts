import { Context } from "koa"
import { State } from "@/schema/authorize"
import { userSchema } from "@/schema/user"

export async function getUserInfo(ctx: Context) {
    const state: State = ctx.state

    ctx.response.body = userSchema.parse(await state.getUser())
}