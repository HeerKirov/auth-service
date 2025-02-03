import { fetchRequest, ListResult, OffsetAndLimitFilter } from "./fetch"
import { ArgumentDefinition } from "./admin-app-permission"
import { User } from "./user"


export const listUsers = (appId: string, filter?: OffsetAndLimitFilter) => fetchRequest<ListResult<UserInApp>>(`/admin/apps/${appId}/users`, {method: "GET", query: filter})

export const getUser = (appId: string, username: string) => fetchRequest<UserInAppDetail>(`/admin/apps/${appId}/users/${username}`, {method: "GET"})

export const putUserPermission = (appId: string, username: string, form: UserAppPermissionUpdateForm) => fetchRequest<UserInAppDetail>(`/admin/apps/${appId}/users/${username}/permissions`, {method: "PUT", body: JSON.stringify(form)})

export interface UserInApp extends User {
    userAppRelation: UserAppRelation
}

export interface UserInAppDetail extends UserInApp {
    userAppPermissions: UserAppPermission[]
}

export interface UserAppRelation {
    fields: Record<string, unknown>
    createTime: string
    lastRefreshTime: string | null
}

export interface UserAppPermission {
    name: string
    displayName: string
    argumentDefinitions: ArgumentDefinition[]
    args: Record<string, unknown>
}

export type UserAppPermissionUpdateForm = {name: string, args: Record<string, unknown>}[]