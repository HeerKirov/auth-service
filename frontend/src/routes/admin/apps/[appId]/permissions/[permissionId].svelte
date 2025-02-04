<script lang="ts">
import { getContext, onMount } from "svelte"
import { slide } from "svelte/transition"
import { Check, CircleUserRound, PencilRuler, Trash, UserCog, UserRoundCheck } from "lucide-svelte"
import { Button, Input, PatchForm } from "@/components"
import { PermissionArgumentListDisplay, PermissionArgumentListEditor, } from "@/layouts"
import { admin, type AppPermission, type ArgumentDefinition } from "@/lib/api"

let appId = getContext<string>("appId")
let { permissionId }: { permissionId: string } = $props()

let data: AppPermission | null = $state(null)

onMount(async () => {
    const r = await admin.app.permission.getPermission(appId, parseInt(permissionId))
    if(r.ok) data = r.data
})

const setName = async (name: string) => {
    if(data !== null && name !== data.name) {
        const r = await admin.app.permission.patchPermission(appId, parseInt(permissionId), { name })
        if(r.ok) data = r.data
        return r.ok
    }
    return true
}

const setDisplayName = async (displayName: string) => {
    if(data !== null && displayName !== data.displayName) {
        const r = await admin.app.permission.patchPermission(appId, parseInt(permissionId), { displayName })
        if(r.ok) data = r.data
        return r.ok
    }
    return true
}

const setArguments = async (args: ArgumentDefinition[]) => {
    const final = args.filter(a => a.name.trim()).map(a => ({name: a.name.trim(), comment: a.comment?.trim() || null, type: a.type, optional: a.optional}))
    if(data !== null && final !== data.arguments) {
        const r = await admin.app.permission.patchPermission(appId, parseInt(permissionId), { arguments: final })
        if(r.ok) data = r.data
        return r.ok
    }
    return true
}

let menuMode: "delete" | null = $state(null)

const gotoDelete = () => menuMode = menuMode === "delete" ? null : "delete"

const closeMenu = () => menuMode = null

const deletePermission = async () => {
    if(data !== null) {
        const r = await admin.app.permission.deletePermission(appId, data.id)
        if(r.ok) history.replaceState({}, "", `/admin/apps/${appId}/permissions`)
        closeMenu()
    }
}

</script>

{#if data !== null}
    <div class="flex">
        <p class="basis-10">
            {#if data.name === "ADMIN"}
                <UserCog class="my-2"/>
            {:else if data.name === "APP_ADMIN"}
                <UserRoundCheck class="my-2"/>
            {:else }
                <CircleUserRound class="my-2"/>
            {/if}
        </p>
        <div class="basis-2/5">
            <b>权限名称</b>
            <PatchForm value={data.name} setValue={setName}>
                {#snippet display(value)}
                    <span class="leading-8">{value}</span>
                {/snippet}
                {#snippet edit(value, setValue, save)}
                    <Input class="w-32" {value} {setValue} onenter={save} autoFocus/>
                {/snippet}
            </PatchForm>
        </div>
        <div class="basis-2/5">
            <b>显示名</b>
            <PatchForm value={data.displayName} setValue={setDisplayName}>
                {#snippet display(value)}
                    <span class="leading-8">{value}</span>
                {/snippet}
                {#snippet edit(value, setValue, save)}
                    <Input {value} {setValue} onenter={save} autoFocus/>
                {/snippet}
            </PatchForm>
        </div>
    </div>
    <PatchForm class="mt-3" value={data.arguments} setValue={setArguments} showEditButton={false} showSaveButton={false}>
        {#snippet display(value, edit)}
            <p class="mb-4">
                <span class="font-bold">权限参数</span>
                <Button class="float-right" mode="underline" onclick={edit}><PencilRuler class="mr-1" size={20}/>编辑参数</Button>
            </p>
            <PermissionArgumentListDisplay {value}/>
        {/snippet}
        {#snippet edit(value, setValue, save)}
            <p class="mb-4">
                <span class="font-bold">权限参数</span>
                <Button class="float-right" mode="underline" color="info" onclick={save}><Check class="mr-1" size={20}/>保存参数</Button>
            </p>
            <PermissionArgumentListEditor {value} {setValue}/>
        {/snippet}
    </PatchForm>
    <div class="mt-10 text-sm flex flex-wrap items-baseline justify-center">
        <div class="basis-full sm:basis-auto text-center mt-2 sm:mt-0">
            <Button mode="underline" color="secondary" onclick={gotoDelete}><Trash size={18} class="mr-1"/>删除权限</Button>
        </div>
    </div>
    {#if menuMode === "delete"}
        <div transition:slide class="mt-2 py-2 text-center border-t-1 border-b-1 border-gray-300">
            {#if appId === "auth-service" && (data.name === "ADMIN" || data.name === "APP_ADMIN")}
                <p class="text-sm text-gray-400">不能删除根App的系统管理员权限。</p>
            {:else}
                <p class="mb-2"><Trash size={20} class="mr-1"/>确定要删除此权限吗?</p>
                <Button mode="underline" color="danger" onclick={deletePermission}><Trash size={18} class="mr-1"/>删除</Button>
            {/if}
        </div>
    {/if}
{/if}

