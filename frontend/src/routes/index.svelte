<script lang="ts">
import { onMount } from "svelte"
import { slide } from "svelte/transition"
import { ChartNoAxesGantt, KeySquare, LayoutPanelLeft, LogOut, ShieldBan, UserCog } from "lucide-svelte"
import { Button, Input, PatchForm } from "@/components"
import { auth, user, type User } from "@/lib/api"
import { hasPermission } from "@/lib/store/user.svelte"
import { toDateString } from "@/utils/date"
import empty from "@/assets/empty.jpg"

let userInfo: User | null = $state(null)

let isAdmin = $derived(hasPermission("ADMIN") || hasPermission("APP_ADMIN"))

let isManageMenuOpen = $state(false)

onMount(async () => {
    const r = await user.getUserInfo()
    if(r.ok) {
        userInfo = r.data
    }else if(r.status === 401) {
        history.pushState({}, "", "/login")
    }
})

const setDisplayName = async (displayName: string) => {
    if(displayName !== userInfo?.displayName) {
        const r = await user.patchUserInfo({ displayName })
        if(r.ok) userInfo = r.data
        return r.ok
    }
    return true
}

const gotoApps = () => history.pushState({}, "", "/my/apps")

const gotoAdmin = () => history.pushState({}, "", "/admin")

const gotoChangePassword = () => history.pushState({}, "", "/my/password")

const logout = async () => {
    await auth.logout()
    history.pushState({}, "", "/login")
}

const toggleManageMenu = () => isManageMenuOpen = !isManageMenuOpen

</script>

{#if userInfo !== null}
    <div class="central-page">
        <div class="text-center"><img class="object-cover object-center inline-block rounded-full w-32 h-32" src={userInfo.avatar ?? empty} alt="avatar"/></div>
        <div class="underline mt-4"><span class="select-none">@</span>{userInfo.username}</div>
        <PatchForm class="mb-2" value={userInfo.displayName} setValue={setDisplayName}>
            {#snippet display(value)}
            <span class="text-2xl">{value}</span>
            {/snippet}
            {#snippet edit(value, setValue, save)}
            <Input {value} {setValue} onenter={save} autoFocus/>
            {/snippet}
        </PatchForm>
        {#if !userInfo.enabled}
            <div class="mb-2 text-red-400"><ShieldBan size={20} class="mr-1"/>用户已被禁用</div>
        {/if}
        <div class="text-sm"><b class="select-none text-gray-500">注册时间</b> <span class="text-gray-400">{toDateString(userInfo.createTime)}</span></div>
        <div class="text-sm"><b class="select-none text-gray-500">上次登录</b> <span class="text-gray-400">{userInfo.lastRefreshTime ? toDateString(userInfo.lastRefreshTime) : "XXXX-XX-XX"}</span></div>
        <div class="mt-4 text-sm flex flex-wrap items-baseline">
            <div class="basis-full md:basis-auto text-center">
                <Button mode="underline" color="info" onclick={gotoApps}><LayoutPanelLeft size={18} class="mr-1"/>我的App</Button>
            </div>
            <span class="hidden md:inline mx-1">|</span>
            {#if isAdmin}
                <div class="basis-full md:basis-auto text-center mt-2 md:mt-0">
                    <Button mode="underline" color="success" onclick={gotoAdmin}><ChartNoAxesGantt size={18} class="mr-1"/>管理后台</Button>
                </div>
                <span class="hidden md:inline mx-1">|</span>
            {/if}
            <div class="basis-full md:basis-auto text-center mt-2 md:mt-0">
                <Button mode="underline" color={isManageMenuOpen ? "primary" : "secondary"} onclick={toggleManageMenu}><UserCog size={18} class="mr-1"/>管理账户</Button>
            </div>
        </div>
        {#if isManageMenuOpen}
            <div transition:slide class="mt-2 text-sm flex flex-wrap border-t-1 border-b-1 border-gray-300">
                <div class="basis-full text-center mt-2">
                    <Button mode="underline" color="warning" onclick={gotoChangePassword}><KeySquare size={18} class="mr-1"/>修改密码</Button>
                </div>
                <div class="basis-full text-center my-2">
                    <Button mode="underline" color="secondary" onclick={logout}><LogOut size={18} class="mr-1"/>退出登录</Button>
                </div>
            </div>
        {/if}
    </div>
{/if}