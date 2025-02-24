import Router from "@koa/router"
import { login, register, authorize, token } from "@/resources/authorize"
import { listMyApps, retrieveMyApp } from "@/resources/app"
import { getUserInfo, patchUserInfo, changeUserPassword, getUserInfoInApp, patchUserInfoInApp } from "@/resources/user"
import { deleteUser, listUsers, patchUser, patchUserPassword, postUser, retrieveUser } from "@/resources/admin-user"
import { deleteApp, listApps, patchApp, postApp, retrieveApp, retrieveAppSecret, patchAppSecret } from "@/resources/admin-app"
import { deleteAppPermission, listAppPermissions, patchAppPermission, postAppPermission, retrieveAppPermission } from "@/resources/admin-app-permission"
import { listAppUsers, putAppUserPermissions, retrieveAppUser } from "@/resources/admin-app-user"
import { getSettings, patchSettings } from "@/resources/setting"

const router = new Router()

router.post("/login", login)
router.post("/register", register)
router.post("/authorize", authorize)
router.post("/token", token)

router.get("/my/user/info", getUserInfo)
router.patch("/my/user/info", patchUserInfo)
router.patch("/my/user/password", changeUserPassword)
router.get("/my/apps", listMyApps)
router.get("/my/apps/:appId", retrieveMyApp)

router.get("/app/user/info", getUserInfoInApp)
router.patch("/app/user/info", patchUserInfoInApp)

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
router.get("/admin/apps/:appId/permissions/:id", retrieveAppPermission)
router.patch("/admin/apps/:appId/permissions/:id", patchAppPermission)
router.delete("/admin/apps/:appId/permissions/:id", deleteAppPermission)

router.get("/admin/apps/:appId/users", listAppUsers)
router.get("/admin/apps/:appId/users/:username", retrieveAppUser)
router.put("/admin/apps/:appId/users/:username/permissions", putAppUserPermissions)

router.get("/admin/settings", getSettings)
router.patch("/admin/settings", patchSettings)

export default router