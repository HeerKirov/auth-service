import { Context } from "koa"
import { userFilter } from "@/schema/filters"
import { userAdminChangePasswordSchema, userAdminPatchSchema, userCreateSchema, userSchema } from "@/schema/user"
import { countUsers, createUser, getUser, getUserById, selectUsers, setUser, setUserDeleted } from "@/services/user"
import { ErrorCode, ServerError } from "@/utils/error"
import config from "@/config"

export async function listUsers(ctx: Context) {
    const filter = userFilter.parse(ctx.request.query)
    const result = await selectUsers(filter)
    const total = await countUsers(filter)

    ctx.response.body = {
        total,
        data: result.map(u => userSchema.parse(u))
    }
}

export async function postUser(ctx: Context) {
    const form = userCreateSchema.parse(ctx.request.body)

    const user = await createUser(form)

    ctx.response.body = userSchema.parse(user)
    ctx.response.status = 201
}

export async function retrieveUser(ctx: Context) {
    const user = await getUser(ctx.params.username)
    if(user === null) {
        throw new ServerError(404, ErrorCode.NotFound, "User not found")
    }

    ctx.response.body = userSchema.parse(user)
}

export async function patchUser(ctx: Context) {
    const user = await getUser(ctx.params.username)
    if(user === null) {
        throw new ServerError(404, ErrorCode.NotFound, "User not found")
    }

    const form = userAdminPatchSchema.parse(ctx.request.body)

    if(form.enabled === false && user.username === config.app.admin.username) {
        throw new ServerError(403, ErrorCode.RootProtected, "Cannot alter ADMIN user's enabled to FALSE.")
    }

    await setUser(user.id, form)

    ctx.response.body = userSchema.parse(await getUserById(user.id))
}

export async function deleteUser(ctx: Context) {
    const user = await getUser(ctx.params.username)
    if(user === null) {
        throw new ServerError(404, ErrorCode.NotFound, "User not found")
    }else if(user.username === config.app.admin.username) {
        throw new ServerError(403, ErrorCode.RootProtected, "Cannot delete ADMIN user.")
    }

    await setUserDeleted(user.id, true)

    ctx.response.body = {success: true}
    ctx.response.status = 204
}

export async function patchUserPassword(ctx: Context) {
    const user = await getUser(ctx.params.username)
    if(user === null) {
        throw new ServerError(404, ErrorCode.NotFound, "User not found")
    }

    const form = userAdminChangePasswordSchema.parse(ctx.request.body)

    await setUser(user.id, form)

    ctx.response.body = {success: true}
    ctx.response.status = 204
}