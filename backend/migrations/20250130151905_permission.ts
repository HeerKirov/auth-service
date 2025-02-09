import type { Knex } from "knex"


export async function up(knex: Knex): Promise<void> {
    await knex.schema.renameTable("permission", "app_permission")

    await knex.schema.alterTable("app_permission", (table) => {
        table.json("arguments").notNullable().defaultTo({})
    })

    await knex.schema.renameTable("user_app_permission_relation", "user_app_permission")

    await knex.schema.alterTable("user_app_permission", (table) => {
        table.json("arguments").notNullable()
        table.timestamp("createTime").notNullable()

        table.dropUnique(["userId", "appId"], "idx_user_app_permission_relation")
        table.index(["appId", "userId"], "idx__user_app_permission__app_user")
    })

    await knex.schema.createTable("user_app_relation", (table) => {
        table.increments("id").primary()
        table.integer("appId").notNullable()
        table.integer("userId").notNullable()
        table.json("fields").notNullable()
        table.timestamp("createTime").notNullable()
        table.timestamp("lastRefreshTime")

        table.index(["appId", "userId"], "idx__user_app_relation__app_user")
        table.index(["userId"], "idx__user_app_relation__user")
    })
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable("user_app_relation")

    await knex.schema.alterTable("user_app_permission", (table) => {
        table.dropIndex(["appId", "userId"], "idx__user_app_permission__app_user")
        table.index(["userId", "appId"], "idx_user_app_permission_relation")

        table.dropColumn("createTime")
        table.dropColumn("arguments")
    })

    await knex.schema.renameTable("user_app_permission", "user_app_permission_relation")

    await knex.schema.alterTable("app_permission", (table) => {
        table.dropColumn("arguments")
    })

    await knex.schema.renameTable("app_permission", "permission")
}

