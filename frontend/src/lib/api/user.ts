import { fetchRequest } from "@/lib/api/fetch"

export const getUserInfo = () => fetchRequest<User>("/user/info", {method: "GET"})

export interface User {
    username: string
    displayName: string
    avatar: string | null
    enabled: boolean
    createTime: string
    updateTime: string
}