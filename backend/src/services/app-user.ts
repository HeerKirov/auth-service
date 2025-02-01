import { OffsetAndLimitFilter } from "@/schema/filters"
import { ListResult } from "@/schema/general"
import { UserAppRelation, userAppRelationFields } from "@/schema/user-app"
import { db, constructJoinNest, projectJoinNest } from "@/utils/db"
import { App, appFields } from "@/schema/app"

export async function selectAppWithUserRelation(userId: number, filter: OffsetAndLimitFilter): Promise<ListResult<{app: App, userAppRelation: UserAppRelation}>> {
    const builder = db.from<App>("app")
        .innerJoin<UserAppRelation>("user_app_relation AS uar", "uar.appId", "app.id")
        .select(
            ...projectJoinNest("app", appFields),
            ...projectJoinNest("uar", userAppRelationFields, "userAppRelation"),
        )
        .where("uar.userId", userId)
        .orderBy("uar.createTime", "ASC")
    if(filter.limit) builder.limit(filter.limit)
    if(filter.offset) builder.offset(filter.offset)
    const data = (await builder).map(constructJoinNest)

    const cBuilder = db.from<App>("app")
        .innerJoin<UserAppRelation>("user_app_relation AS uar", "uar.appId", "app.id")
        .where("uar.userId", userId)
    const [{ count }] = await cBuilder.count()
    const total = parseInt(<string>count)

    return {total, data}
}