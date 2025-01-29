import { fetchRequest } from "@/lib/api/fetch"

export const getUserInfo = () => fetchRequest<User>("/user/info", {method: "GET"})

export const patchUserInfo = (data: UserPartialUpdateForm) => fetchRequest<User>("/user/info", {method: "PATCH", body: JSON.stringify(data)})

export const patchUserPassword = (data: UserPasswordUpdateForm) => fetchRequest<User>("/user/password", {method: "PATCH", body: JSON.stringify(data)})

export interface User {
    username: string
    displayName: string
    avatar: string | null
    enabled: boolean
    createTime: string
    lastRefreshTime: string
}

export interface UserPartialUpdateForm {
    displayName?: string
    avatar?: string | null
}

export interface UserPasswordUpdateForm {
    password: string
}