import fs from "fs"
import { Context } from "koa"
import { State } from "@/schema/authorize"
import { userInAppSchema } from "@/schema/user-app"
import { userPatchSchema, userChangePasswordSchema, userSchema, userInAppPatchSchema } from "@/schema/user"
import { compareUser, getUserById, setUser } from "@/services/user"
import { getUserAppRelation, upsertUserAppFields } from "@/services/user-app"
import { deleteRefreshTokenByUser } from "@/services/token"
import { deleteFile, existFile, uploadFile } from "@/utils/oss"
import { ErrorCode, ServerError } from "@/utils/error"

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

    const userForm = {displayName: form.displayName}
    if(userForm.displayName !== undefined) {
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

export async function uploadUserAvatar(ctx: Context) {
    const state: State = ctx.state
    const user = await state.getUser()

    const file = ctx.request.files?.["file"]
    if(!file) {
        throw new ServerError(400, ErrorCode.InvalidParameter, "FormData 'file' is required.")
    }
    const f = file instanceof Array ? file[0] : file
    try {
        if(!f.mimetype || !f.mimetype.startsWith("image/")) {
            throw new ServerError(400, ErrorCode.InvalidParameter, "Only image file is supported.")
        }
        const ext = f.mimetype.substring("image/".length)

        const objectName = `${user.id}-${Date.now()}.${ext}`
        await uploadFile(`avatar/user/${objectName}`, f.filepath, {})
        await setUser(user.id, {avatar: objectName})

        if(user.avatar !== null && await existFile(`avatar/user/${objectName}`)) {
            await deleteFile(`avatar/user/${user.avatar}`)
        }

        ctx.response.body = {avatar: `avatar/user/${objectName}`}
    }finally {
        await fs.promises.rm(f.filepath)
    }
}
