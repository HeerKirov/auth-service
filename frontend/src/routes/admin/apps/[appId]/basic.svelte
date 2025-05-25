<script lang="ts">
import { getContext, onMount } from "svelte"
import { slide } from "svelte/transition"
import { KeySquare, ShieldBan, ShieldCheck, Trash } from "lucide-svelte"
import { Anchor, Button, ClipboardButton, Input, ListInputEditor, PatchForm } from "@/components"
import { SecretViewer } from "@/layouts"
import { admin, type AdminAppPartialUpdateForm, type App } from "@/lib/api"
import { toDateString } from "@/utils/date"
import { routeReplace } from "@/utils/route"
import empty from "@/assets/empty.jpg"

let appId = getContext<string>("appId")

let data: App | null = $state(null)

onMount(async () => {
    const r = await admin.app.getApp(appId)
    if(r.ok) {
        data = r.data
    }
})

async function setValue<T extends (keyof AdminAppPartialUpdateForm)>(field: T, value: AdminAppPartialUpdateForm[T]) {
    if(data !== null && value !== data[field]) {
        const r = await admin.app.patchApp(appId, { [field]: value })
        if(r.ok) data = r.data
        return r.ok
    }
    return true
}

let menuMode: "secret" | "ban" | "delete" | null = $state(null)

const gotoSecret = () => menuMode = menuMode === "secret" ? null : "secret"

const gotoBan = () => menuMode = menuMode === "ban" ? null : "ban"

const gotoDelete = () => menuMode = menuMode === "delete" ? null : "delete"

const closeMenu = () => menuMode = null

const toggleEnabled = async () => {
    if(data !== null) {
        const r = await admin.app.patchApp(data.appId, { enabled: !data.enabled })
        if(r.ok) data = r.data
        closeMenu()
    }
}

const deleteApp = async () => {
    if(data !== null) {
        const r = await admin.app.deleteApp(data.appId)
        if(r.ok) routeReplace("/admin/apps")
        closeMenu()
    }
}

</script>

{#if data !== null}
    <div class="flex">
        <img class="shrink-0 rounded-lg w-24 h-24" src={data.avatar ?? empty} alt="app avatar"/>
        <div class="pl-3 pt-1">
            <p class="text-gray-400">{data.appId}<ClipboardButton data={data.appId}/></p>
            <PatchForm class="mb-2" value={data.appName} setValue={v => setValue("appName", v)}>
                {#snippet display(value)}
                    <span class="text-2xl">{value}</span>
                {/snippet}
                {#snippet edit(value, setValue, save)}
                    <Input placeholder="名称" {value} {setValue} onenter={save} autoFocus/>
                {/snippet}
            </PatchForm>
            <p class="text-gray-500 text-sm"><b class="select-none mr-1">创建时间</b>{toDateString(data.createTime)}</p>
        </div>
    </div>
    {#if !data.enabled}
        <div class="mt-2 text-red-400"><ShieldBan size={20} class="mr-1"/>App已被禁用</div>
    {/if}
    <div class="mt-4">
        <p class="font-bold">描述</p>
        <PatchForm class="mb-2" value={data.description} setValue={v => setValue("description", v)}>
            {#snippet display(value)}
            {#if value}
                <span class="leading-8">{value}</span>
            {:else}
                <span class="leading-8 text-gray-400">(空)</span>
            {/if}
            {/snippet}
            {#snippet edit(value, setValue, save)}
                <Input placeholder="描述" {value} {setValue} onenter={save} autoFocus/>
            {/snippet}
        </PatchForm>
    </div>
    <div class="mt-4">
        <p class="font-bold">主页</p>
        <PatchForm class="mb-2" value={data.url} setValue={v => setValue("url", v)}>
            {#snippet display(value)}
            {#if value}
                <Anchor class="leading-8" color="primary" href={value} target="_blank">{value}</Anchor>
            {:else}
                <span class="leading-8 text-gray-400">(空)</span>
            {/if}
            {/snippet}
            {#snippet edit(value, setValue, save)}
                <Input placeholder="URL" {value} {setValue} onenter={save} autoFocus/>
            {/snippet}
        </PatchForm>
    </div>
    {#if data.appId !== "auth-service"}
        <div class="mt-4">
            <p class="font-bold">授权的URI</p>
            <PatchForm class="mt-1" value={data.domains} setValue={v => setValue("domains", v)}>
                {#snippet display(value)}
                {#each value as domain}
                    <pre class="text-sm">{domain}</pre>
                {/each}
                {/snippet}
                {#snippet edit(value, setValue, save)}
                    <ListInputEditor class="mb-1" {value} {setValue} placeholder="域名，主机或地址"/>
                {/snippet}
            </PatchForm>
        </div>
    {/if}
    <div class="mt-10 text-sm flex flex-wrap items-baseline sm:justify-start justify-center">
        <div class="basis-full sm:basis-auto text-center">
            <Button mode="underline" color="success" onclick={gotoSecret}><KeySquare size={18} class="mr-1"/>App Secret</Button>
        </div>
        <span class="hidden md:inline mx-1">|</span>
        <div class="basis-full sm:basis-auto text-center mt-2 sm:mt-0">
            {#if data.enabled}
                <Button mode="underline" color="danger" onclick={gotoBan}><ShieldBan size={18} class="mr-1"/>禁用App</Button>
            {:else}
                <Button mode="underline" color="success" onclick={gotoBan}><ShieldCheck size={18} class="mr-1"/>解禁App</Button>
            {/if}
        </div>
        <span class="hidden md:inline mx-1">|</span>
        <div class="basis-full sm:basis-auto text-center mt-2 sm:mt-0">
            <Button mode="underline" color="secondary" onclick={gotoDelete}><Trash size={18} class="mr-1"/>删除App</Button>
        </div>
    </div>
    {#if menuMode === "secret"}
        <div transition:slide class="mt-2 py-2 flex justify-center border-t-1 border-b-1 border-gray-300">
            {#if data.appId === "auth-service"}
                <p class="text-sm text-gray-400">不能也不需要查看根App的Secret。</p>
            {:else}
                <SecretViewer {appId}/>
            {/if}
        </div>
    {:else if menuMode === "ban"}
        <div transition:slide class="mt-2 py-2 text-center border-t-1 border-b-1 border-gray-300">
            {#if data.appId === "auth-service"}
                <p class="text-sm text-gray-400">不能禁用根App。</p>
            {:else if data.enabled}
                <p class="mb-2"><ShieldBan size={20} class="mr-1"/>确定要禁用此App吗?</p>
                <p class="mb-1 text-sm text-gray-400">被禁用的App无法获得来自登录服务的授权。</p>
                <Button mode="underline" color="danger" onclick={toggleEnabled}><ShieldBan size={18} class="mr-1"/>禁用</Button>
            {:else}
                <p class="mb-2"><ShieldBan size={20} class="mr-1"/>确定要解除对用户的禁用吗?</p>
                <p class="mb-1 text-sm text-gray-400">解禁之后，App可以获得来自登录服务的授权。</p>
                <Button mode="underline" color="success" onclick={toggleEnabled}><ShieldBan size={18} class="mr-1"/>解禁</Button>
            {/if}
        </div>
    {:else if menuMode === "delete"}
        <div transition:slide class="mt-2 py-2 text-center border-t-1 border-b-1 border-gray-300">
            {#if data.appId === "auth-service"}
                <p class="text-sm text-gray-400">不能删除根App。</p>
            {:else}
                <p class="mb-2"><Trash size={20} class="mr-1"/>确定要删除此App吗?</p>
                <p class="mb-2 text-sm text-gray-400">删除操作不可撤销。</p>
                <Button mode="underline" color="danger" onclick={deleteApp}><Trash size={18} class="mr-1"/>删除</Button>
            {/if}
        </div>
    {/if}
{/if}