
export interface RefreshToken {
    id: number
    userId: number
    appId: number
    token: string
    createTime: Date
    expireTime: Date
    lastRefreshTime: Date
}