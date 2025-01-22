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

    await db("user").insert({
        "username": user.username,
        "password": hashPassword,
        "displayName": user.displayName,
        "avatar": user.avatar,
        "deleted": false,
        "createdAt": new Date()
    })
}

export async function getUser(username: string): Promise<User | null> {
    return (await db.first().from<User>("user").where({"username": username, "deleted": false})) ?? null
}

export async function setupDefaultUser() {
    const user = await getUser("admin")
    if(user === null) {
        await createUser({
            username: "admin",
            password: config.adminPassword,
            displayName: "Administrator",
            avatar: null
        })
        console.log("Admin user created.")
    }
}