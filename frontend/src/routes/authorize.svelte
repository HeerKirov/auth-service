<script lang="ts">
import { onMount } from "svelte"
import { IdCard, Loader } from "lucide-svelte"
import { params } from "@roxi/routify"
import { LoginPage, RegisterPage } from "@/layouts"
import { auth, preloadAuthorization } from "@/lib/api"

let mode: "loading" | "login" | "register" | "authorize" = $state("loading")
let responseType: string = $state($params["response_type"]?.toLowerCase() ?? "")
let appId: string = $state($params["client_id"])
let redirectURI: string = $state($params["redirect_uri"])
let st: string = $state($params["state"])
let error: string = $state("")

const onClickRegister = () => mode = "register"

const doAuthorize = async () => {
    mode = "authorize"
    const r = await auth.authorize({appId, redirectURI})
    if(r.ok) {
        const ai = encodeURIComponent(appId)
        const ac = encodeURIComponent(r.data.authorizationCode)
        const state = st ? encodeURIComponent(st) : ""
        window.location.replace(`${redirectURI}?client_id=${ai}&code=${ac}&state=${state}`)
    }else if(r.error === "NOT_FOUND") {
        error = "非法认证：未授权的应用程序。"
    }else if(r.error === "INVALID_REDIRECT_URI") {
        error = "非法认证：未授权的URI。"
    }else if(r.error === "DISABLED_USER") {
        error = "被阻止的认证：用户已被禁用。"
    }else if(r.error === "DISABLED_APP") {
        error = "被阻止的认证：App已被禁用。"
    }else{
        error = r.message
    }
}

onMount(async () => {
    if(!appId || !redirectURI) {
        error = "非法认证：未正确指定认证参数。"
        return
    }else if(responseType !== "code") {
        error = `不支持的授权类型: ${responseType}`
        return
    }
    const authorized = await preloadAuthorization({onlyRefreshToken: true})
    if(authorized.ok) {
        await doAuthorize()
    }else if(authorized.status === 401) {
        mode = "login"
    }else{
        console.error("Authorize check failed.", authorized.message)
    }
})

</script>

{#if mode === "login"}
    <LoginPage onLogin={doAuthorize} {onClickRegister}/>
{:else if mode === "register"}
    <RegisterPage onRegistered={doAuthorize}/>
{:else if mode === "authorize"}
    <div>
        <p><IdCard size={32}/></p>
        {#if error}<p class="mt-2 text-red-700 dark:text-red-400">{error}</p>{/if}
    </div>
{:else}
    <div>
        <p><Loader size={32}/></p>
        {#if error}<p class="mt-2 text-red-700 dark:text-red-400">{error}</p>{/if}
    </div>
{/if}