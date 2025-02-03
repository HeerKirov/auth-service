import { fetchRequest, ListResult, OffsetAndLimitFilter } from "@/lib/api/fetch"
import { User, UserPartialUpdateForm } from "@/lib/api/user"


export const listUsers = (filter?: OffsetAndLimitFilter) => fetchRequest<ListResult<User>>("/admin/users", {method: "GET", query: filter})

export const getUser = (username: string) => fetchRequest<User>(`/admin/users/${username}`, {method: "GET"})

export const patchUser = (username: string, form: AdminUserPartialUpdateForm) => fetchRequest<User>(`/admin/users/${username}`, {method: "PATCH", body: JSON.stringify(form)})

export const patchUserPassword = (username: string, form: AdminUserPasswordUpdateForm) => fetchRequest<undefined>(`/admin/users/${username}/password`, {method: "PATCH", body: JSON.stringify(form)})

export const deleteUser = (username: string) => fetchRequest<undefined>(`/admin/users/${username}`, {method: "DELETE"})

export interface AdminUserPartialUpdateForm extends UserPartialUpdateForm {
    enabled?: boolean
}

export interface AdminUserPasswordUpdateForm {
    password: string
}