import Router from "@koa/router"
import { login, register, authorize, verify, token } from "@/resources/authorize"
import { getUserInfo, patchUserInfo, patchUserPassword } from "@/resources/user"

const router = new Router()

router.post("/login", login)
router.post("/register", register)
router.post("/authorize", authorize)
router.post("/verify", verify)
router.post("/token", token)
router.get("/user/info", getUserInfo)
router.patch("/user/info", patchUserInfo)
router.patch("/user/password", patchUserPassword)

export default router