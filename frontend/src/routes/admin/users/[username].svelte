<script lang="ts">
import { onMount } from "svelte"
import { slide } from "svelte/transition"
import { KeySquare, ShieldBan, ShieldCheck, Trash } from "lucide-svelte"
import { Button, Input, PatchForm } from "@/components"
import { PasswordModifier } from "@/layouts"
import { admin, type User } from "@/lib/api"
import { toDateString } from "@/utils/date"
import empty from "@/assets/empty.jpg"

let { username }: {
    username: string
} = $props()

let userInfo: User | null = $state(null)

onMount(async () => {
    const r = await admin.user.getUser(username)
    if(r.ok) {
        userInfo = r.data
    }
})

const setDisplayName = async (displayName: string) => {
    if(userInfo !== null && displayName !== userInfo?.displayName) {
        const r = await admin.user.patchUser(userInfo.username, { displayName })
        if(r.ok) userInfo = r.data
        return r.ok
    }
    return true
}

const toggleEnabled = async () => {
    if(userInfo !== null) {
        const r = await admin.user.patchUser(userInfo.username, { enabled: !userInfo.enabled })
        if(r.ok) userInfo = r.data
        closeMenu()
    }
}

const deleteUser = async () => {
    if(userInfo !== null) {
        if(deleteCheckInput !== username) {
            deleteCheckError = true
            return
        }
        const r = await admin.user.deleteUser(username)
        if(r.ok) history.replaceState({}, "", "/admin/users")
        closeMenu()
        deleteCheckError = false
        deleteCheckInput = ""
    }
}

let menuMode: "password" | "ban" | "delete" | null = $state(null)

let deleteCheckInput = $state("")

let deleteCheckError = $state(false)

const gotoChangePassword = () => menuMode = menuMode === "password" ? null : "password"

const gotoBanUser = () => menuMode = menuMode === "ban" ? null : "ban"

const gotoDeleteUser = () => menuMode = menuMode === "delete" ? null : "delete"

const closeMenu = () => menuMode = null

</script>

{#if userInfo !== null}
    <div class="text-center">
        <img class="inline-block rounded-full w-24 h-24" src={userInfo.avatar ?? empty} alt="user avatar"/>
        <div class="underline mt-3"><span class="select-none">@</span>{userInfo.username}</div>
        <PatchForm class="mb-2" value={userInfo.displayName} setValue={setDisplayName}>
            {#snippet display(value)}
                <span class="text-2xl">{value}</span>
            {/snippet}
            {#snippet edit(value, setValue, save)}
                <Input {value} {setValue} onenter={save} autoFocus/>
            {/snippet}
        </PatchForm>
        {#if !userInfo.enabled}
            <div class="text-red-400"><ShieldBan size={20} class="mr-1"/>用户已被禁用</div>
        {/if}
        <div class="text-sm"><b class="select-none text-gray-500">注册时间</b> <span class="text-gray-400">{toDateString(userInfo.createTime)}</span></div>
        <div class="text-sm"><b class="select-none text-gray-500">上次登录</b> <span class="text-gray-400">{userInfo.lastRefreshTime ? toDateString(userInfo.lastRefreshTime) : "XXXX-XX-XX"}</span></div>
    </div>
    <div class="mt-4 text-sm flex flex-wrap items-baseline justify-center">
        <div class="basis-full sm:basis-auto text-center">
            <Button mode="underline" color="warning" onclick={gotoChangePassword}><KeySquare size={18} class="mr-1"/>修改密码</Button>
        </div>
        <span class="hidden md:inline mx-1">|</span>
        <div class="basis-full sm:basis-auto text-center mt-2 sm:mt-0">
            {#if userInfo.enabled}
                <Button mode="underline" color="danger" onclick={gotoBanUser}><ShieldBan size={18} class="mr-1"/>禁用用户</Button>
            {:else}
                <Button mode="underline" color="success" onclick={gotoBanUser}><ShieldCheck size={18} class="mr-1"/>解禁用户</Button>
            {/if}
        </div>
        <span class="hidden md:inline mx-1">|</span>
        <div class="basis-full sm:basis-auto text-center mt-2 sm:mt-0">
            <Button mode="underline" color="secondary" onclick={gotoDeleteUser}><Trash size={18} class="mr-1"/>删除用户</Button>
        </div>
    </div>
    {#if menuMode === "password"}
        <div transition:slide class="mt-2 py-2 flex justify-center border-t-1 border-b-1 border-gray-300">
            {#if userInfo.username === "admin"}
                <p class="text-sm text-gray-400">只能由根管理员用户自己修改其自己的密码。</p>
            {:else}
                <PasswordModifier mode="admin" {username} onsuccess={closeMenu} oncancel={closeMenu}/>
            {/if}
        </div>
    {:else if menuMode === "ban"}
        <div transition:slide class="mt-2 py-2 text-center border-t-1 border-b-1 border-gray-300">
            {#if userInfo.username === "admin"}
                <p class="text-sm text-gray-400">不能禁用根管理员用户。</p>
            {:else if userInfo.enabled}
                <p class="mb-2"><ShieldBan size={20} class="mr-1"/>确定要禁用此用户吗?</p>
                <p class="mb-1 text-sm text-gray-400">被禁用的用户无法使用登录服务访问其他App。</p>
                <Button mode="underline" color="danger" onclick={toggleEnabled}><ShieldBan size={18} class="mr-1"/>禁用</Button>
            {:else}
                <p class="mb-2"><ShieldBan size={20} class="mr-1"/>确定要解除对用户的禁用吗?</p>
                <p class="mb-1 text-sm text-gray-400">解禁之后，用户可以使用登录服务访问其他App。</p>
                <Button mode="underline" color="success" onclick={toggleEnabled}><ShieldBan size={18} class="mr-1"/>解禁</Button>
            {/if}
        </div>
    {:else if menuMode === "delete"}
        <div transition:slide class="mt-2 py-2 text-center border-t-1 border-b-1 border-gray-300">
            {#if userInfo.username === "admin"}
                <p class="text-sm text-gray-400">不能删除根管理员用户。</p>
            {:else}
                <p class="mb-2"><Trash size={20} class="mr-1"/>确定要删除此用户吗?</p>
                <p class="mb-2 text-sm text-gray-400">请输入用户ID以确认删除。</p>
                <Input bind:value={deleteCheckInput} placeholder="用户ID" color={deleteCheckError ? "danger" : undefined}/>
                <Button mode="underline" color="danger" onclick={deleteUser}><Trash size={18} class="mr-1"/>删除</Button>
            {/if}
        </div>
    {/if}
{/if}