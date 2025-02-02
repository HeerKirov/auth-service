import { fetchRequest } from "@/lib/api/fetch"

export const getUserInfo = () => fetchRequest<User>("/my/user/info", {method: "GET"})

export const patchUserInfo = (data: UserPartialUpdateForm) => fetchRequest<User>("/my/user/info", {method: "PATCH", body: JSON.stringify(data)})

export const patchUserPassword = (data: UserPasswordUpdateForm) => fetchRequest<User>("/my/user/password", {method: "PATCH", body: JSON.stringify(data)})

export interface User {
    username: string
    displayName: string
    avatar: string | null
    enabled: boolean
    createTime: string
    lastRefreshTime: string | null
}

export interface UserPartialUpdateForm {
    displayName?: string
    avatar?: string | null
}

export interface UserPasswordUpdateForm {
    oldPassword: string
    password: string
}