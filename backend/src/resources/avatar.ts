import { Context } from "koa"
import { getSignedUrl } from "@/utils/oss"

export async function getAvatar(ctx: Context) {
    const { type, filename } = ctx.params

    const url = await getSignedUrl(`avatar/${type}/${filename}`)

    ctx.redirect(url)
}
