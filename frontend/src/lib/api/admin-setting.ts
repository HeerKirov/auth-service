import { fetchRequest } from "./fetch"


export const getSettings = () => fetchRequest<Settings>("/admin/settings", {method: "GET"})

export const patchSettings = (form: Partial<Settings>) => fetchRequest<Settings>("/admin/settings", {method: "PATCH", body: JSON.stringify(form)})

export interface Settings {
    REGISTRATION_SWITCH: boolean,
    ACCESS_TOKEN_DELAY: number
    REFRESH_TOKEN_DELAY: number
    REFRESH_TOKEN_AUTO_FLUSH: number
    AUTHORIZATION_CODE_DELAY: number
}