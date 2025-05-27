import { fetchRequest, ListResult, SearchAndEnabledFilter } from "./fetch"
import { App } from "./app"


export const listApps = (filter?: SearchAndEnabledFilter) => fetchRequest<ListResult<App>>("/admin/apps", {method: "GET", query: filter})

export const createApp = (form: AdminAppCreateForm) => fetchRequest<App, "ALREADY_EXISTS">("/admin/apps", {method: "POST", body: JSON.stringify(form)})

export const getApp = (appId: string) => fetchRequest<App>(`/admin/apps/${appId}`, {method: "GET"})

export const patchApp = (appId: string, form: AdminAppPartialUpdateForm) => fetchRequest<App>(`/admin/apps/${appId}`, {method: "PATCH", body: JSON.stringify(form)})

export const deleteApp = (appId: string) => fetchRequest<undefined>(`/admin/apps/${appId}`, {method: "DELETE"})

export const getAppSecret = (appId: string) => fetchRequest<AppSecret>(`/admin/apps/${appId}/secret`, {method: "GET"})

export const flushAppSecret = (appId: string) => fetchRequest<AppSecret>(`/admin/apps/${appId}/secret`, {method: "PATCH"})

export const uploadAvatar = (appId: string, file: Blob) => {
    const form = new FormData()
    form.append("file", file)
    return fetchRequest<Pick<App, "avatar">>(`/admin/apps/${appId}/avatar`, {method: "POST", body: form})
}

export interface AdminAppCreateForm {
    appId: string
    appName: string
    description?: string
    url?: string
    avatar?: string
    enabled?: boolean
    domains: string[]
}

export interface AdminAppPartialUpdateForm {
    appName?: string
    description?: string
    url?: string
    avatar?: string
    enabled?: boolean
    domains?: string[]
}

export interface AppSecret {
    appSecret: string
}