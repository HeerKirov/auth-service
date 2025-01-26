import { hash } from "bcrypt"
import { db } from "@/utils/db"
import { User, UserCreateSchema } from "@/schema/user"
import config from "@/config"


export async function createUser(user: UserCreateSchema) {
    const exists = await db("user").where({"username": user.username, "deleted": false}).first()
    if (exists) {
        throw new Error("User already exists")
    }

    const hashPassword = await hash(user.password, 10)

    await db.from<User>("user").insert({
        "username": user.username,
        "password": hashPassword,
        "displayName": user.displayName,
        "avatar": user.avatar ?? null,
        "enabled": true,
        "deleted": false,
        "createTime": new Date(),
        "lastRefreshTime": null
    })
}

export async function getUser(username: string): Promise<User | null> {
    return (await db.first().from<User>("user").where({"username": username, "deleted": false})) ?? null
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