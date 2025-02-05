import { jwtDecode } from "jwt-decode"
import { getAccessToken, setAccessToken } from "@/lib/store/user.svelte"

export async function fetchRequest<T, E extends string | undefined = undefined>(url: string, init?: RequestConfig): Promise<IResponse<T, E | undefined>> {
    const { authorization = true, query, ...config } = init ?? {}
    const headers: Record<string, string> = {"content-type": "application/json"}
    let input = `${import.meta.env.VITE_API_PREFIX}${url}`

    if(authorization) {
        const r = await preloadAuthorization()
        if(!r.ok) return {ok: false, status: r.status, message: r.message, error: r.error as E}
        headers["Authorization"] = `Bearer ${r.data}`
    }

    if(query) {
        const s = Object.entries(query).map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`).join("&")
        if(s) input += `?${s}`
    }

    const response = await fetch(input, {
        headers: config.headers ? {...headers, ...config.headers} : headers,
        ...config
    })
    if(response.ok) {
        const data = response.status === 204 ? {} : await response.json()
        return {ok: true, data}
    }else{
        const json = await response.json()
        return {ok: false, status: response.status, message: json["message"], error: json["error"]}
    }
}

export async function preloadAuthorization(options?: {onlyRefreshToken: boolean}): Promise<IResponse<string, undefined>> {
    if(!options?.onlyRefreshToken) {
        const accessToken: string | null = getAccessToken()
        if (accessToken) {
            const decode = jwtDecode(accessToken)
            if(decode.exp! * 1000 >= Date.now()) {
                return {ok: true, data: accessToken}
            }
        }
    }

    const r = await fetchRequest<{accessToken: string}>("/token", {method: "POST", authorization: false})
    if(r.ok) {
        setAccessToken(r.data.accessToken)
        return {ok: true, data: r.data.accessToken}
    }else{
        return {ok: false, status: r.status, message: r.message, error: r.error}
    }
}

type RequestConfig = RequestInit & {
    authorization?: boolean
    query?: Record<string, any>
}

export type IResponse<T, E> = ResponseOk<T> | ResponseError<E>

export interface ResponseOk<T> {
    ok: true
    data: T
}

export interface ResponseError<E> {
    ok: false
    status: number
    error: E
    message: string
}

export interface ListResult<T> {
    total: number
    data: T[]
}

export interface OffsetAndLimitFilter {
    offset?: number
    limit?: number
}

export interface SearchAndEnabledFilter extends OffsetAndLimitFilter {
    search?: string
    enabled?: boolean
}