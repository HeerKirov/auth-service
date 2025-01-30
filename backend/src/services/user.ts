import { compare, hash } from "bcrypt"
import { User, UserCreateSchema, UserUpdateSchema } from "@/schema/user"
import { UserFilter } from "@/schema/filters"
import { db } from "@/utils/db"

export async function selectUsers(filter: UserFilter): Promise<User[]> {
    const builder = db.from<User>("user").orderBy("createTime", "desc")
    if(filter.search) builder.where("username", "ilike", `%${filter.search}%`).orWhere("displayName", "ilike", `%${filter.search}%`)
    if(filter.enabled) builder.where("enabled", filter.enabled)
    if(filter.limit) builder.limit(filter.limit)
    if(filter.offset) builder.offset(filter.offset)
    return builder
}

export async function countUsers(filter: UserFilter): Promise<number> {
    const builder = db.from<User>("user")
    if(filter.search) builder.where("username", "ilike", `%${filter.search}%`).orWhere("displayName", "ilike", `%${filter.search}%`)
    if(filter.enabled) builder.where("enabled", filter.enabled)
    const [{ count }] = await builder.count()
    return parseInt(<string>count)
}

export async function createUser(user: UserCreateSchema): Promise<User> {
    const exists = await db("user").where({"username": user.username, "deleted": false}).first()
    if (exists) {
        throw new Error("User already exists")
    }

    const hashedPassword = await hash(user.password, 10)
    const now = new Date()

    const [{ id }] = await db.from<User>("user").insert({
        "username": user.username,
        "password": hashedPassword,
        "displayName": user.displayName,
        "avatar": user.avatar ?? null,
        "enabled": true,
        "deleted": false,
        "createTime": now,
        "lastRefreshTime": null
    }).returning("id")

    return {
        id,
        username: user.username,
        password: hashedPassword,
        displayName: user.displayName,
        avatar: user.avatar ?? null,
        enabled: true,
        deleted: false,
        createTime: now,
        lastRefreshTime: null,
    }
}

export async function compareUser(username: string, password: string): Promise<User | null> {
    const user = await getUser(username)
    return user !== null && await compare(password, user.password) ? user : null
}

export async function getUser(username: string): Promise<User | null> {
    return (await db.first().from<User>("user").where({"username": username, "deleted": false})) ?? null
}

export async function getUserById(id: number): Promise<User | null> {
    return (await db.first().from<User>("user").where({"id": id, "deleted": false})) ?? null
}

export async function setUser(id: number, user: UserUpdateSchema): Promise<void> {
    const hashedPassword = user.password !== undefined ? await hash(user.password, 10) : undefined
    await db.from<User>("user").where({id}).update({...user, password: hashedPassword})
}

export async function setUserDeleted(id: number, deleted: boolean): Promise<void> {
    await db.from<User>("user").where({id}).update({deleted})
}

export async function flushUserRefreshTime(id: number, lastRefreshTime: Date): Promise<void> {
    await db.from<User>("user").where({id}).update({lastRefreshTime})
}
