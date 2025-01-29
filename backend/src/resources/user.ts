import { Context } from "koa"
import { State } from "@/schema/authorize"
import { userPartialUpdateSchema, userPasswordUpdateSchema, userSchema } from "@/schema/user"
import { getUserById, setUser, setUserPassword } from "@/services/user"

export async function getUserInfo(ctx: Context) {
    const state: State = ctx.state

    ctx.response.body = userSchema.parse(await state.getUser())
}

export async function patchUserInfo(ctx: Context) {
    const form = userPartialUpdateSchema.parse(ctx.request.body)

    const state: State = ctx.state
    const user = await state.getUser()

    await setUser(user.id, form)

    ctx.response.body = userSchema.parse(await getUserById(user.id))
}

export async function patchUserPassword(ctx: Context) {
    const form = userPasswordUpdateSchema.parse(ctx.request.body)

    const state: State = ctx.state
    const user = await state.getUser()

    await setUserPassword(user.id, form)

    ctx.response.body = {"success": true}
}