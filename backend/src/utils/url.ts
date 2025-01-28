
/**
 * 检验redirectURI是否可以匹配domains。
 */
export function isValidRedirectURI(redirectURI: string, allowedDomains: string[]): boolean {
    let parsedRedirect: URL

    try {
        parsedRedirect = new URL(redirectURI)
    }catch{
        return false
    }

    return allowedDomains.some(domain => {
        try {
            const parsedDomain = new URL(domain)
            // 完整匹配（协议 + 域名 + 端口 + 路径）
            if (parsedDomain.href === parsedRedirect.href) return true

            // 协议 + 域名 + 端口匹配，路径前缀匹配
            if (
                parsedDomain.protocol === parsedRedirect.protocol &&
                parsedDomain.hostname === parsedRedirect.hostname &&
                (parsedDomain.port === parsedRedirect.port || (parsedDomain.port === "" && (parsedRedirect.port === "80" || parsedRedirect.port === "443"))) &&
                parsedRedirect.pathname.startsWith(parsedDomain.pathname)
            ) return true
        } catch {
            // allowedDomains 里可能只有域名（无协议），仅匹配 hostname
            if (parsedRedirect.hostname === domain) return true
        }

        return false
    })
}