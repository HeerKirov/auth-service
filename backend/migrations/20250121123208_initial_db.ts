import type { Knex } from "knex"


export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable("user", (table) => {
        table.increments("id").primary()
        table.string("username").notNullable()
        table.string("password").notNullable()
        table.string("display_name").notNullable()
        table.string("avatar").defaultTo(null)
        table.boolean("deleted").notNullable().defaultTo(false)
        table.timestamp("created_at")
    })

    await knex.schema.createTable("refresh_token", (table) => {
        table.increments("id").primary()
        table.integer("user_id").notNullable()
        table.string("token").notNullable()
        table.timestamp("created_at")
        table.timestamp("expired_at")
    })

    await knex.schema.createTable("app", (table) => {
        table.increments("id").primary()
        table.string("app_id").notNullable()
        table.string("app_name").notNullable()
        table.string("app_secret").notNullable()
        table.string("avatar").defaultTo(null)
        table.json("domains").notNullable()
        table.timestamp("created_at")
    })

    await knex.schema.createTable("permission", (table) => {
        table.increments("id").primary()
        table.integer("app_id").notNullable()
        table.string("permission_name").notNullable()
        table.string("display_name").notNullable()
        table.timestamp("created_at")
    })

    await knex.schema.createTable("user_permission_relation", (table) => {
        table.increments("id").primary()
        table.integer("user_id").notNullable()
        table.integer("app_id").notNullable()
        table.integer("permission_id").notNullable()
        table.unique(["user_id", "app_id"], { indexName: "idx_user_permission_relation" })
    })
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable("user")
    await knex.schema.dropTable("refresh_token")
    await knex.schema.dropTable("app")
    await knex.schema.dropTable("permission")
    await knex.schema.dropTable("user_permission_relation")
}

