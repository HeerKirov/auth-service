
export interface UserAppRelation {
    id: number
    appId: number
    userId: number
    fields: Record<string, any>
    createTime: Date
    lastRefreshTime: Date | null
}

export interface UserAppPermission {
    id: number
    appId: number
    permissionId: number
    userId: number
    arguments: Record<string, any>
    createTime: Date
}
