import Router from "@koa/router"
import { db } from "utils/db"

const router = new Router()

router.get("/", ctx => {
    ctx.body = "Hello, auth service."
})

router.post("/login", ctx => {
    ctx.body = ctx.request.body

})

export default router