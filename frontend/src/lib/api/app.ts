import { fetchRequest, ListResult } from "./fetch"
import { UserAppPermission, UserAppRelation } from "./admin-app-user"

export const listApps = () => fetchRequest<ListResult<MyApp>>("/my/apps", {method: "GET"})

export const getApp = (appId: string) => fetchRequest<MyAppDetail>(`/my/apps/${appId}`, {method: "GET"})

export interface App {
    appId: string
    appName: string
    description: string
    url: string
    avatar: string | null
    domains: string[]
    enabled: boolean
    createTime: string
}

export interface MyApp extends App {
    userAppRelation: UserAppRelation
}

export interface MyAppDetail extends MyApp {
    userAppPermissions: UserAppPermission[]
}