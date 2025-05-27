<script lang="ts">
import { onMount } from "svelte"
import { Anchor } from "@/components"
import { user, type User } from "@/lib/api"
import { hasPermission } from "@/lib/store/user.svelte"
import { activeRoute } from "@roxi/routify"
import { urlMatch } from "@/utils/route"
import empty from "@/assets/empty.jpg"

let isAdmin = $derived(hasPermission("ADMIN"))
let isAppAdmin = $derived(hasPermission("APP_ADMIN"))

let choose = $derived(urlMatch($activeRoute.url, /^\/admin\/(?<TYPE>[A-Za-z]+)/, "TYPE"))

let userInfo: User | null = $state(null)

onMount(async () => {
    const r = await user.getUserInfo()
    if(r.ok) {
        userInfo = r.data
    }
})

</script>

<div class="container-page px-2">
    <div class="flex items-center pt-3 sm:pt-4 mb-6">
        <div class="basis-8 shrink-0 sm:hidden"></div>
        <div class="basis-1/2 sm:hidden"></div>
        {#if isAdmin}
            <Anchor class="shrink-0" mode="underline" color={choose === "system" ? "primary" : "secondary"} href="/admin/system">系统设置</Anchor>
            <Anchor class="shrink-0" mode="underline" color={choose === "users" ? "primary" : "secondary"} href="/admin/users">用户管理</Anchor>
        {/if}
        {#if isAppAdmin || isAdmin}
            <Anchor class="shrink-0" mode="underline" color={choose === "apps" ? "primary" : "secondary"} href="/admin/apps">{isAppAdmin && !isAdmin ? "我管理的App" : "App管理"}</Anchor>
        {/if}
        <div class="basis-1/2 sm:basis-full"></div>
        {#if userInfo !== null}
            <Anchor class="shrink-0 flex items-center" mode="underline" color="secondary" href="/">
                <img class="shrink-0 object-cover object-center inline-block rounded-full w-8 h-8" src={userInfo.avatar ?? empty} alt="user avatar"/>
                <span class="hidden sm:inline pl-1">{userInfo.displayName}</span>
            </Anchor>
        {/if}
    </div>
    <slot/>
</div>