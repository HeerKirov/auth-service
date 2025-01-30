<script lang="ts">
import { onMount } from "svelte"
import { IdCard, Loader } from "lucide-svelte"
import { params } from "@roxi/routify"
import { LoginPage, RegisterPage } from "@/layouts"
import { auth, preloadAuthorization } from "@/lib/api"

let mode: "loading" | "login" | "register" | "authorize" = $state("loading")
let appId: string = $state($params.appId)
let redirectURI: string = $state($params.redirectURI)
let st: string = $state($params.state)
let error: string = $state("")

const onClickRegister = () => mode = "register"

const doAuthorize = async () => {
    mode = "authorize"
    const r = await auth.authorize({appId, redirectURI})
    if(r.ok) {
        const ac = encodeURIComponent(r.data.authorizationCode)
        const state = st ? encodeURIComponent(st) : ""
        window.location.replace(`${redirectURI}?&authorizationCode=${ac}&state=${state}`)
    }else if(r.status === 404) {
        error = "非法认证：未授权的应用程序。"
        return
    }else if(r.status === 403) {
        error = "非法认证：未授权的URI。"
        return
    }else{
        error = r.message
        return
    }
}

onMount(async () => {
    if(!appId || !redirectURI) {
        error = "非法认证：未正确指定认证参数。"
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
        <p><IdCard size={32} class="inline"/></p>
        {#if error}<p class="mt-2 text-red-700">{error}</p>{/if}
    </div>
{:else}
    <div>
        <p><Loader size={32} class="inline"/></p>
        {#if error}<p class="mt-2 text-red-700">{error}</p>{/if}
    </div>
{/if}