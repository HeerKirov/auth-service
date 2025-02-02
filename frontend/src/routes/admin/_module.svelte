<script lang="ts">
import { Anchor } from "@/components"
import { hasPermission } from "@/lib/store/user.svelte"
import { activeRoute } from "@roxi/routify"

let isAdmin = $derived(hasPermission("ADMIN"))
let isAppAdmin = $derived(isAdmin || hasPermission("APP_ADMIN"))

let choose = $derived($activeRoute.url.startsWith("/admin/") ? $activeRoute.url.substring("/admin/".length).split("/", 2)[0] : null)

</script>

<div class="container-page px-2">
    <div class="text-center md:text-left pt-3 md:pt-4 mb-6">
        {#if isAdmin}
            <Anchor color={choose === "system" ? "primary" : "secondary"} href="/admin/system">系统设置</Anchor>
            <Anchor color={choose === "users" ? "primary" : "secondary"} href="/admin/users">用户管理</Anchor>
        {/if}
        {#if isAppAdmin}
            <Anchor color={choose === "apps" ? "primary" : "secondary"} href="/admin/apps">App管理</Anchor>
        {/if}
    </div>
    <slot/>
</div>