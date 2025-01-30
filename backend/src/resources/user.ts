import { Context } from "koa"
import { State } from "@/schema/authorize"
import { userPatchSchema, userChangePasswordSchema, userSchema } from "@/schema/user"
import { compareUser, getUserById, setUser } from "@/services/user"

export async function getUserInfo(ctx: Context) {
    const state: State = ctx.state

    ctx.response.body = userSchema.parse(await state.getUser())
}

export async function patchUserInfo(ctx: Context) {
    const form = userPatchSchema.parse(ctx.request.body)

    const state: State = ctx.state
    const user = await state.getUser()

    await setUser(user.id, form)

    ctx.response.body = userSchema.parse(await getUserById(user.id))
}

export async function changeUserPassword(ctx: Context) {
    const form = userChangePasswordSchema.parse(ctx.request.body)

    const state: State = ctx.state
    const user = await compareUser(state.username, form.oldPassword)
    if(user === null) {
        ctx.response.status = 401
        ctx.response.body = {message: "Invalid Password"}
        return
    }

    await setUser(user.id, {password: form.password})

    ctx.response.body = {"success": true}
}