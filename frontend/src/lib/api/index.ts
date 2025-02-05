import * as auth from "./auth"
import type { LoginForm, AuthorizeForm, AccessTokenResponse, TokenResponse, JsonWebTokenPayload } from "./auth"
import * as user from "./user"
import type { User, UserPasswordUpdateForm, UserPartialUpdateForm } from "./user"
import * as app from "./app"
import type { App, MyApp, MyAppDetail } from "./app"
import * as adminUser from "./admin-user"
import type { AdminUserPasswordUpdateForm, AdminUserPartialUpdateForm } from "./admin-user"
import * as adminApp from "./admin-app"
import { AppSecret, AdminAppCreateForm, AdminAppPartialUpdateForm } from "./admin-app"
import * as adminAppPermission from "./admin-app-permission"
import { AppPermission, AppPermissionCreateForm, ArgumentDefinition } from "./admin-app-permission"
import * as adminAppUser from "./admin-app-user"
import { UserInApp, UserInAppDetail, UserAppRelation, UserAppPermission, UserAppPermissionUpdateForm} from "./admin-app-user"
import * as adminSetting from "./admin-setting"
import { Settings } from "./admin-setting"

export { preloadAuthorization } from "./fetch"

export {auth, user, app}

export const admin = {
    user: adminUser,
    app: {
        ...adminApp,
        permission: adminAppPermission,
        user: adminAppUser,
    },
    setting: adminSetting
}

export type {
    LoginForm, AuthorizeForm, AccessTokenResponse, TokenResponse, JsonWebTokenPayload,
    User, UserPartialUpdateForm, UserPasswordUpdateForm,
    App, MyApp, MyAppDetail,
    AdminUserPartialUpdateForm, AdminUserPasswordUpdateForm,
    AdminAppCreateForm, AdminAppPartialUpdateForm, AppSecret,
    AppPermission, AppPermissionCreateForm, ArgumentDefinition,
    UserAppPermission, UserAppRelation, UserInApp, UserInAppDetail, UserAppPermissionUpdateForm,
    Settings
}