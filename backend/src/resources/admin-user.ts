import { Context } from "koa"
import { userFilter } from "@/schema/filters"
import { userAdminChangePasswordSchema, userCreateSchema, userPatchSchema, userSchema } from "@/schema/user"
import { countUsers, createUser, getUser, getUserById, selectUsers, setUser, setUserDeleted } from "@/services/user"

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
        ctx.response.body = {message: "User Not Found"}
        ctx.response.status = 404
        return
    }

    ctx.response.body = userSchema.parse(user)
}

export async function patchUser(ctx: Context) {
    const user = await getUser(ctx.params.username)
    if(user === null) {
        ctx.response.body = {message: "User Not Found"}
        ctx.response.status = 404
        return
    }

    const form = userPatchSchema.parse(ctx.request.body)

    await setUser(user.id, form)

    ctx.response.body = userSchema.parse(await getUserById(user.id))
}

export async function deleteUser(ctx: Context) {
    const user = await getUser(ctx.params.username)
    if(user === null) {
        ctx.response.body = {message: "User Not Found"}
        ctx.response.status = 404
        return
    }

    await setUserDeleted(user.id, true)

    ctx.response.body = {success: true}
    ctx.response.status = 204
}

export async function patchUserPassword(ctx: Context) {
    const user = await getUser(ctx.params.username)
    if(user === null) {
        ctx.response.body = {message: "User Not Found"}
        ctx.response.status = 404
        return
    }

    const form = userAdminChangePasswordSchema.parse(ctx.request.body)

    await setUser(user.id, form)

    ctx.response.body = {success: true}
    ctx.response.status = 204
}