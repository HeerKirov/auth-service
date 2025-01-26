import Router from "@koa/router"
import { login, authorize, verify, token } from "@/resources/authorize"
import { getUserInfo } from "@/resources/user"

const router = new Router()

router.get("/", ctx => ctx.body = "Hello, auth service.")
router.post("/login", login)
router.post("/authorize", authorize)
router.post("/verify", verify)
router.post("/token", token)
router.get("/user/info", getUserInfo)

export default router