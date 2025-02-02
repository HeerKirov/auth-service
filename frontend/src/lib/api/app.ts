import { fetchRequest, ListResult } from "@/lib/api/fetch"

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

export interface UserAppRelation {
    fields: Record<string, unknown>
    createTime: string
    lastRefreshTime: string | null
}

export interface ArgumentDefinition {
    name: string
    type: "string" | "number" | "boolean"
    optional: boolean
    comment: string | null
}

export interface UserAppPermission {
    name: string
    displayName: string
    argumentDefinitions: ArgumentDefinition[]
    args: Record<string, unknown>
}

export interface MyApp extends App {
    userAppRelation: UserAppRelation
}

export interface MyAppDetail extends MyApp {
    userAppPermissions: UserAppPermission[]
}