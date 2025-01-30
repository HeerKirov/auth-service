import Router from "@koa/router"
import { login, register, authorize, verify, token } from "@/resources/authorize"
import { getUserInfo, patchUserInfo, changeUserPassword } from "@/resources/user"
import { deleteUser, listUsers, patchUser, patchUserPassword, postUser, retrieveUser } from "@/resources/admin-user"
import { deleteApp, listApps, patchApp, postApp, retrieveApp, retrieveAppSecret, patchAppSecret } from "@/resources/admin-app"
import { deleteAppPermission, listAppPermissions, patchAppPermission, postAppPermission } from "@/resources/admin-app-permission"

const router = new Router()

router.post("/login", login)
router.post("/register", register)
router.post("/authorize", authorize)
router.post("/verify", verify)
router.post("/token", token)

router.get("/user/info", getUserInfo)
router.patch("/user/info", patchUserInfo)
router.patch("/user/password", changeUserPassword)

router.get("/admin/users", listUsers)
router.post("/admin/users", postUser)
router.get("/admin/users/:username", retrieveUser)
router.patch("/admin/users/:username", patchUser)
router.delete("/admin/users/:username", deleteUser)
router.patch("/admin/users/:username/password", patchUserPassword)

router.get("/admin/apps", listApps)
router.post("/admin/apps", postApp)
router.get("/admin/apps/:appId", retrieveApp)
router.patch("/admin/apps/:appId", patchApp)
router.delete("/admin/apps/:appId", deleteApp)
router.get("/admin/apps/:appId/secret", retrieveAppSecret)
router.patch("/admin/apps/:appId/secret", patchAppSecret)

router.get("/admin/apps/:appId/permissions", listAppPermissions)
router.post("/admin/apps/:appId/permissions", postAppPermission)
router.patch("/admin/apps/:appId/permissions/:id", patchAppPermission)
router.delete("/admin/apps/:appId/permissions/:id", deleteAppPermission)

export default router