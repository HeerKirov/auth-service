import { randomBytes } from "crypto"

const authorizationCodes = new Map<string, {username: string, appId: string, expireTime: number}>()

/**
 * 创建一个授权码。授权码有确定依赖的user和app。
 */
export function createAuthorizationCode(username: string, appId: string): string {
    const ac = randomBytes(16).toString("hex")

    const now = Date.now()

    authorizationCodes.set(ac, {username, appId, expireTime: now + 1000 * 60 * 10})

    const expiredKeys = [...authorizationCodes.entries().filter(([_, v]) => v.expireTime < now).map(([k, _]) => k)]
    if(expiredKeys.length > 0) {
        for(const expiredKey of expiredKeys) {
            authorizationCodes.delete(expiredKey)
        }
    }

    return ac
}

/**
 * 检验指定的授权码是否还在有效时间内，且隶属于指定app。如果是，则提取出其依赖的username，同时移除此授权码。
 */
export function validateAuthorizationCode(authorizationCode: string, appId: string): string | null {
    const entry = authorizationCodes.get(authorizationCode)
    if (entry === undefined) return null

    authorizationCodes.delete(authorizationCode)

    if(entry.appId !== appId || entry.expireTime < Date.now()) return null
    return entry.username
}