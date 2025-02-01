import { jwtDecode } from "jwt-decode"
import { JsonWebTokenPayload } from "@/lib/api"

let accessToken = $state<string | null>(sessionStorage.getItem("access-token"))

let payload = $state<JsonWebTokenPayload | null>(accessToken !== null ? jwtDecode(accessToken) : null)

export function getUserState() {
    return payload
}

export function getAccessToken() {
    return accessToken
}

export function setAccessToken(newToken: string | null) {
    accessToken = newToken
    if(newToken) {
        payload = jwtDecode<JsonWebTokenPayload>(newToken)
        sessionStorage.setItem("access-token", newToken)
    }else{
        payload = null
        sessionStorage.removeItem("access-token")
    }
}

export function hasPermission(permissionName: string, matchArguments?: Record<string, any>): boolean {
    return payload !== null && payload.permissions.some(permission =>
        permission.name === permissionName
        && (!matchArguments || Object.entries(matchArguments).every(([key, value]) => permission.args[key] === value))
    )
}