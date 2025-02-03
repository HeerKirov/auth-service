<script lang="ts">
import { getContext, onMount } from "svelte"
import { Check, PencilRuler, ShieldBan } from "lucide-svelte"
import { Button, PatchForm } from "@/components"
import { PermissionListDisplay, PermissionListEditor } from "@/layouts"
import { admin, type UserAppPermissionUpdateForm, type UserInAppDetail } from "@/lib/api"
import { toDateString } from "@/utils/date"
import empty from "@/assets/empty.jpg"

let appId = getContext<string>("appId")

let { username }: { username: string } = $props()

let userInfo: UserInAppDetail | null = $state(null)

onMount(async () => {
    const r = await admin.app.user.getUser(appId, username)
    if(r.ok) {
        userInfo = r.data
    }
})

const setPermissions = async (p: UserAppPermissionUpdateForm) => {
    if(userInfo !== null && p !== userInfo.userAppPermissions) {
        const r = await admin.app.user.putUserPermission(appId, username, p)
        if(r.ok) userInfo = r.data
        return r.ok
    }
    return true
}

</script>

{#if userInfo !== null}
    <div class="flex justify-center sm:justify-start">
        <img class="shrink-0 inline-block rounded-full w-24 h-24" src={userInfo.avatar ?? empty} alt="user avatar"/>
        <div class="pl-3">
            <div class="underline"><span class="select-none">@</span>{userInfo.username}</div>
            <div class="text-2xl">{userInfo.displayName}</div>
            <div class="text-sm"><b class="select-none text-gray-500">初次使用</b> <span class="text-gray-400">{toDateString(userInfo.userAppRelation.createTime)}</span></div>
            <div class="text-sm"><b class="select-none text-gray-500">上次登录</b> <span class="text-gray-400">{userInfo.userAppRelation.lastRefreshTime ? toDateString(userInfo.userAppRelation.lastRefreshTime) : "XXXX-XX-XX"}</span></div>
        </div>
    </div>
    {#if !userInfo.enabled}
        <div class="mt-2 text-red-400 text-center sm:text-left"><ShieldBan size={20} class="mr-1"/>用户已被禁用</div>
    {/if}

    <PatchForm class="mt-4" value={userInfo.userAppPermissions} setValue={setPermissions} showEditButton={false} showSaveButton={false}>
        {#snippet display(value, edit)}
            <p class="mb-4">
                <span class="font-bold">授予权限</span>
                <Button class="float-right" mode="underline" onclick={edit}><PencilRuler class="mr-1" size={20}/>编辑权限</Button>
            </p>
            <PermissionListDisplay permissions={value}/>
        {/snippet}
        {#snippet edit(value, setValue, save)}
            <p>
                <span class="font-bold">授予权限</span>
                <Button class="float-right" mode="underline" color="info" onclick={save}><Check class="mr-1" size={20}/>保存权限</Button>
            </p>
            <PermissionListEditor {appId} permissions={value} {setValue}/>
        {/snippet}
    </PatchForm>

{/if}