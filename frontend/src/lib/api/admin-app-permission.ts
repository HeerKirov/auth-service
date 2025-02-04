import { fetchRequest, ListResult, OffsetAndLimitFilter } from "./fetch"


export const listPermissions = (appId: string, filter?: OffsetAndLimitFilter) => fetchRequest<ListResult<AppPermission>>(`/admin/apps/${appId}/permissions`, {method: "GET", query: filter})

export const createPermission = (appId: string, form: AppPermissionCreateForm) => fetchRequest<AppPermission, "ALREADY_EXISTS">(`/admin/apps/${appId}/permissions`, {method: "POST", body: JSON.stringify(form)})

export const getPermission = (appId: string, permissionId: number) => fetchRequest<AppPermission>(`/admin/apps/${appId}/permissions/${permissionId}`, {method: "GET"})

export const patchPermission = (appId: string, permissionId: number, form: Partial<AppPermissionCreateForm>) => fetchRequest<AppPermission>(`/admin/apps/${appId}/permissions/${permissionId}`, {method: "PATCH", body: JSON.stringify(form)})

export const deletePermission = (appId: string, permissionId: number) => fetchRequest<undefined>(`/admin/apps/${appId}/permissions/${permissionId}`, {method: "DELETE"})

export interface AppPermission {
    id: number
    name: string
    displayName: string
    arguments: ArgumentDefinition[]
    createTime: string
}

export interface ArgumentDefinition {
    name: string
    type: "string" | "number" | "boolean"
    optional: boolean
    comment: string | null
}

export interface AppPermissionCreateForm {
    name: string
    displayName: string
    arguments: ArgumentDefinition[]
}