import { UserAppPermission, UserAppRelation, userAppRelationFields } from "@/schema/user-app"
import { constructJoinNest, db, projectJoinNest } from "@/utils/db"
import { OffsetAndLimitFilter } from "@/schema/filters"
import { User, userFields } from "@/schema/user"
import { ListResult } from "@/schema/general"

export async function selectUserWithAppRelation(appId: number, filter: OffsetAndLimitFilter): Promise<ListResult<{user: User, userAppRelation: UserAppRelation}>> {
    const builder = db.from<User>("user")
        .innerJoin<UserAppRelation>("user_app_relation AS uar", "uar.userId", "user.id")
        .select(
            ...projectJoinNest("user", userFields),
            ...projectJoinNest("uar", userAppRelationFields, "userAppRelation"),
        )
        .where("uar.appId", appId)
        .where("user.deleted", false)
        .orderBy("uar.createTime", "ASC")
    if(filter.limit) builder.limit(filter.limit)
    if(filter.offset) builder.offset(filter.offset)
    const data = (await builder).map(constructJoinNest)

    const cBuilder = db.from<User>("user")
        .innerJoin<UserAppRelation>("user_app_relation AS uar", "uar.userId", "user.id")
        .where("uar.appId", appId)
        .where("user.deleted", false)
    const [{ count }] = await cBuilder.count()
    const total = parseInt(<string>count)

    return {total, data}
}

export async function getUserAppRelation(userId: number, appId: number): Promise<UserAppRelation | null> {
    return (await db.first().from<UserAppRelation>("user_app_relation").where({userId, appId})) ?? null
}

export async function createOrFlushUserAppRelation(userId: number, appId: number, now: Date): Promise<UserAppRelation> {
    const exists = await db.from<UserAppRelation>("user_app_relation").where({userId, appId}).first()
    if(exists === undefined) {
        const [{ id }] = await db.from<UserAppRelation>("user_app_relation").insert({
            userId, appId, createTime: now, lastRefreshTime: now, fields: JSON.stringify({}) as any
        }).returning(["id"])

        return {id, userId, appId, createTime: now, lastRefreshTime: now, fields: {}}
    }else{
        await db.from<UserAppRelation>("user_app_relation").where({id: exists.id}).update({lastRefreshTime: now})
        return {...exists, lastRefreshTime: now}
    }
}

export async function upsertUserAppFields(userId: number, appId: number, fields: Record<string, unknown>): Promise<UserAppRelation> {
    const exists = await db.from<UserAppRelation>("user_app_relation").where({userId, appId}).first()
    if(exists === undefined) {
        const now = new Date()
        const [{ id }] = await db.from<UserAppRelation>("user_app_relation").insert({
            userId, appId, createTime: now, lastRefreshTime: now, fields: JSON.stringify(fields) as any
        }).returning(["id"])

        return {id, userId, appId, createTime: now, lastRefreshTime: now, fields: {}}
    }else{
        await db.from<UserAppRelation>("user_app_relation").where({id: exists.id}).update({fields: JSON.stringify(fields) as any})
        return {...exists, fields}
    }
}

export async function dropUserAppRelation(userId: number, appId: number): Promise<number> {
    const r = await db.from<UserAppRelation>("user_app_relation").where({userId, appId}).delete()
    if(r > 0) {
        await db.from<UserAppPermission>("user_app_permission").where({userId, appId}).delete()
    }
    return r
}