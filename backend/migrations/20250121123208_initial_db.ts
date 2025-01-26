import type { Knex } from "knex"


export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable("user", (table) => {
        table.increments("id").primary()
        table.string("username").notNullable()
        table.string("password").notNullable()
        table.string("displayName").notNullable()
        table.string("avatar").defaultTo(null)
        table.boolean("enabled").notNullable().defaultTo(true)
        table.boolean("deleted").notNullable().defaultTo(false)
        table.timestamp("createTime").notNullable()
        table.timestamp("lastRefreshTime")
    })

    await knex.schema.createTable("refresh_token", (table) => {
        table.increments("id").primary()
        table.integer("userId").notNullable()
        table.integer("appId").notNullable()
        table.string("token").notNullable()
        table.timestamp("createTime").notNullable()
        table.timestamp("expireTime").notNullable()
        table.timestamp("lastRefreshTime").notNullable()
    })

    await knex.schema.createTable("app", (table) => {
        table.increments("id").primary()
        table.string("appId").notNullable()
        table.string("appName").notNullable()
        table.string("appSecret").notNullable()
        table.string("avatar").defaultTo(null)
        table.json("domains").notNullable()
        table.boolean("enabled").notNullable().defaultTo(true)
        table.timestamp("createTime").notNullable()
    })

    await knex.schema.createTable("permission", (table) => {
        table.increments("id").primary()
        table.integer("appId").notNullable()
        table.string("name").notNullable()
        table.string("displayName").notNullable()
        table.timestamp("createTime").notNullable()
    })

    await knex.schema.createTable("user_app_permission_relation", (table) => {
        table.increments("id").primary()
        table.integer("userId").notNullable()
        table.integer("appId").notNullable()
        table.integer("permissionId").notNullable()
        table.unique(["userId", "appId"], { indexName: "idx_user_app_permission_relation" })
    })
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable("user")
    await knex.schema.dropTable("refresh_token")
    await knex.schema.dropTable("app")
    await knex.schema.dropTable("permission")
    await knex.schema.dropTable("user_app_permission_relation")
}

