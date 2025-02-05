import type { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable("setting", (table) => {
        table.string("key").notNullable().primary()
        table.string("value").notNullable()
        table.timestamp("updateTime").notNullable()
    })
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable("setting")
}

