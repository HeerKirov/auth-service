import { Context } from "koa"
import { getAllSettings, updatePartialSettings } from "@/services/setting"
import { settingSchema, settingUpdateSchema } from "@/schema/setting"

export async function getSettings(ctx: Context): Promise<void> {
    ctx.response.body = settingSchema.parse(await getAllSettings())
}

export async function patchSettings(ctx: Context): Promise<void> {
    const form = settingUpdateSchema.parse(ctx.request.body)

    await updatePartialSettings(form)

    ctx.response.body = settingSchema.parse(await getAllSettings())
}