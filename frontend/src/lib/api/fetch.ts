import { jwtDecode } from "jwt-decode"

export async function fetchRequest<T, E = undefined>(url: string, init?: RequestConfig): Promise<IResponse<T, E>> {
    const { authorization = true, ...config } = init ?? {}
    const headers: Record<string, string> = {"content-type": "application/json"}

    if(authorization) {
        const r = await preloadAuthorization<E>()
        if(!r.ok) return r
        headers["Authorization"] = `Bearer ${r.data}`
    }

    const response = await fetch(`/api${url}`, {
        headers: config.headers ? {...headers, ...config.headers} : headers,
        ...config
    })
    if(response.ok) {
        return {ok: true, data: await response.json()}
    }else{
        const json = await response.json()
        return {ok: false, status: response.status, message: json["message"], error: json["error"]}
    }
}

async function preloadAuthorization<E>(): Promise<IResponse<string, E>> {
    const accessToken: string | null = sessionStorage.getItem("access-token")
    if (accessToken) {
        const decode = jwtDecode(accessToken)
        if(decode.exp! * 1000 >= Date.now()) {
            return {ok: true, data: accessToken}
        }
    }

    const r = await fetchRequest<{accessToken: string}>("/token", {method: "POST", authorization: false})
    if(r.ok) {
        sessionStorage.setItem("access-token", r.data.accessToken)
        return {ok: true, data: r.data.accessToken}
    }else{
        return {ok: false, status: r.status, message: r.message, error: r.error as E}
    }
}

type RequestConfig = RequestInit & {authorization?: boolean}

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
