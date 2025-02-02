import { fetchRequest, ListResult, OffsetAndLimitFilter } from "@/lib/api/fetch"
import { User } from "@/lib/api/user"


export const listUsers = (filter?: OffsetAndLimitFilter) => fetchRequest<ListResult<User>>("/admin/users", {method: "GET", query: filter})

export const getUser = (username: string) => fetchRequest<User>(`/admin/users/${username}`, {method: "GET"})