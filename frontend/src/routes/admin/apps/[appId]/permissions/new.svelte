<script lang="ts">
import { getContext } from "svelte"
import { CircleUserRound, Plus, UserCog, UserRoundCheck } from "lucide-svelte"
import { Button, Input } from "@/components"
import { PermissionArgumentListEditor } from "@/layouts"
import { admin, type AppPermissionCreateForm } from "@/lib/api"

let appId = getContext<string>("appId")

let form: AppPermissionCreateForm = $state({
    name: "",
    displayName: "",
    arguments: []
})

let error = $state("")

const submit = async () => {
    error = ""
    if(!form.name.trim() || !form.displayName.trim()) {
        error = "权限名称、显示名不能为空。"
        return
    }else if(form.name.length > 128 || form.displayName.length > 128) {
        error = "权限名称、显示名的长度不能超过128。"
        return
    }
    const args = form.arguments.filter(a => a.name.trim()).map(a => ({name: a.name.trim(), comment: a.comment?.trim() || null, type: a.type, optional: a.optional}))
    const r = await admin.app.permission.createPermission(appId, {
        name: form.name.trim(),
        displayName: form.displayName.trim(),
        arguments: args
    })
    if(r.ok) {
        history.replaceState({}, "", `/admin/apps/${appId}/permissions`)
    }else if(r.error === "ALREADY_EXISTS") {
        error = "该权限名称已存在。"
    }else{
        error = r.message
        console.error("Create app permission failed.", r.message)
    }
}


</script>

<div class="flex">
    <p class="basis-10">
        {#if form.name === "ADMIN"}
            <UserCog class="my-2"/>
        {:else if form.name === "APP_ADMIN"}
            <UserRoundCheck class="my-2"/>
        {:else }
            <CircleUserRound class="my-2"/>
        {/if}
    </p>
    <div class="basis-2/5">
        <b>权限名称</b>
        <div>
            <Input class="w-36" bind:value={form.name}/>
        </div>
    </div>
    <div class="basis-2/5">
        <b>显示名</b>
        <div>
            <Input class="w-36" bind:value={form.displayName}/>
        </div>
    </div>
</div>
<div class="mt-3">
    <p class="mb-2">
        <span class="font-bold">权限参数</span>
    </p>
    <PermissionArgumentListEditor bind:value={form.arguments}/>
</div>
{#if error}<div class="w-full mt-2 text-center text-red-700 dark:text-red-400">{error}</div>{/if}
<div class="flex justify-center mt-4">
    <Button mode="underline" color="success" onclick={submit}><Plus class="mr-1" size={20}/>创建权限</Button>
</div>