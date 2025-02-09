import type { Knex } from "knex"


export async function up(knex: Knex): Promise<void> {
    await knex.schema.alterTable("app", (table) => {
        table.string("description", 512).notNullable().defaultTo("")
        table.string("url", 512).notNullable().defaultTo("")
    })
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.alterTable("app", (table) => {
        table.dropColumns("description", "url")
    })
}

