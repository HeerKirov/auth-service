export function routePush(path: string) {
    history.pushState({}, "", url(path))
}

export function routeReplace(path: string) {
    history.replaceState({}, "", url(path))
}

export function url(path: string) {
    return `${import.meta.env.VITE_URL_PREFIX}${path}`
}

export function urlMatch(url: string, path: RegExp): boolean
export function urlMatch(url: string, path: RegExp, param: string): string | null
export function urlMatch(url: string, path: RegExp, param?: string): string | null | boolean {
    const match = url.match(path)
    if(param !== undefined) {
        if(match?.groups) {
            return match.groups[param]
        }
        return null
    }else{
        return match !== null
    }
}

export function classifyHref(href: string): "full_url" | "absolute_path" | "relative_path" {
    try {
        const url = new URL(href)
        return url.origin !== "null" ? "full_url" : "absolute_path"
    } catch {
        return href.startsWith("/") ? "absolute_path" : "relative_path"
    }
}
