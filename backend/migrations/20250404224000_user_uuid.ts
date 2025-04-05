import type { Knex } from "knex"
import { randomUUID } from "crypto"
import { User } from "@/schema/user"

export async function up(knex: Knex): Promise<void> {
    await knex.schema.alterTable("user", (table) => {
        table.string("uuid", 128).notNullable().defaultTo("")
    })
    const allUsers: User[] = await knex.from<User>("user")
    for(const user of allUsers) {
        await knex.from("user").where("id", "=", user.id).update({uuid: randomUUID()})
    }
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.alterTable("user", (table) => {
        table.dropColumns("uuid")
    })
}

