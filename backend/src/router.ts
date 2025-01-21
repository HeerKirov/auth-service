import Router from "@koa/router"
import { db } from "@/utils/db"

const router = new Router()

router.get("/", ctx => {
    ctx.body = "Hello, auth service."
})

router.post("/login", async ctx => {
    ctx.body = await db.raw("SELECT 1")
})

export default router