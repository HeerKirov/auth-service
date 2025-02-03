import { Context } from "koa"
import { State } from "@/schema/authorize"
import { userPatchSchema, userChangePasswordSchema, userSchema, userInAppSchema, userInAppPatchSchema } from "@/schema/user"
import { compareUser, getUserById, setUser } from "@/services/user"
import { getUserAppRelation, upsertUserAppFields } from "@/services/user-app"
import { deleteRefreshTokenByUser } from "@/services/token"

export async function getUserInfo(ctx: Context) {
    const state: State = ctx.state

    ctx.response.body = userSchema.parse(await state.getUser())
}

export async function getUserInfoInApp(ctx: Context) {
    const state: State = ctx.state
    const user = await state.getUser()
    const app = await state.getApp()

    const userAppRelation = await getUserAppRelation(user.id, app.id)

    ctx.response.body = userInAppSchema.parse({user, userAppRelation})
}

export async function patchUserInfo(ctx: Context) {
    const form = userPatchSchema.parse(ctx.request.body)

    const state: State = ctx.state
    const user = await state.getUser()

    await setUser(user.id, form)

    ctx.response.body = userSchema.parse(await getUserById(user.id))
}

export async function patchUserInfoInApp(ctx: Context) {
    const form = userInAppPatchSchema.parse(ctx.request.body)

    const state: State = ctx.state
    const user = await state.getUser()
    const app = await state.getApp()

    const userForm = {displayName: form.displayName, avatar: form.avatar}
    if(userForm.displayName !== undefined || userForm.avatar !== undefined) {
        await setUser(user.id, userForm)
    }

    if(form.fields !== undefined) {
        await upsertUserAppFields(user.id, app.id, form.fields)
    }

    ctx.response.body = userInAppSchema.parse({user: await getUserById(user.id), userAppRelation: await getUserAppRelation(user.id, app.id)})
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

    await deleteRefreshTokenByUser(user.id)

    ctx.response.body = {"success": true}
}