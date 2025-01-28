import { compare, hash } from "bcrypt"
import { db } from "@/utils/db"
import { User, UserCreateSchema } from "@/schema/user"
import config from "@/config"


export async function createUser(user: UserCreateSchema): Promise<User> {
    const exists = await db("user").where({"username": user.username, "deleted": false}).first()
    if (exists) {
        throw new Error("User already exists")
    }

    const hashPassword = await hash(user.password, 10)
    const now = new Date()

    const [{ id }] = await db.from<User>("user").insert({
        "username": user.username,
        "password": hashPassword,
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
        password: hashPassword,
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

export async function updateUserRefreshTime(id: number, lastRefreshTime: Date): Promise<void> {
    await db.from<User>("user").where({id}).update({lastRefreshTime})
}

export async function setupDefaultUser() {
    const user = await getUser("admin")
    if(user === null) {
        await createUser({
            username: config.default.adminUsername,
            password: config.default.adminPassword,
            displayName: config.default.adminDisplayName,
            avatar: null
        })
        console.log("Admin user created.")
    }
}