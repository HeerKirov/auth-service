<script lang="ts">
import { Plus } from "lucide-svelte"
import { Button, Input, ListInputEditor } from "@/components"
import { admin, type AdminAppCreateForm } from "@/lib/api"
import { routeReplace } from "@/utils/route"

let form: AdminAppCreateForm = $state({
    appId: "",
    appName: "",
    domains: []
})

let error = $state("")

const submit = async () => {
    error = ""
    if(!form.appId.trim() || !form.appName.trim()) {
        error = "App ID、名称不能为空。"
        return
    }else if(form.appId.length > 128 || form.appName.length > 128) {
        error = "App ID、名称的长度不能超过128。"
        return
    }
    const r = await admin.app.createApp({
        appId: form.appId.trim(),
        appName: form.appName.trim(),
        url: form.url ?? undefined,
        description: form.description ?? undefined,
        domains: form.domains.filter(i => !!i.trim())
    })
    if(r.ok) {
        routeReplace("/admin/apps")
    }else if(r.error === "ALREADY_EXISTS") {
        error = "该App ID已存在。"
    }else{
        error = r.message
        console.error("Create app failed.", r.message)
    }
}

</script>

<div class="flex flex-wrap justify-center">
    <div class="w-2/3 md:w-1/3 mt-2">
        <p class="font-bold">App ID</p>
        <Input class="w-full" placeholder="App ID" bind:value={form.appId}/>
    </div>
    <div class="w-2/3 md:w-1/3 mt-2">
        <p class="font-bold">名称</p>
        <Input class="w-full" placeholder="名称" bind:value={form.appName}/>
    </div>
    <div class="w-2/3 mt-2">
        <p class="font-bold">描述</p>
        <Input class="w-full" placeholder="描述" bind:value={form.description}/>
    </div>
    <div class="w-2/3 mt-2">
        <p class="font-bold">主页</p>
        <Input class="w-full" placeholder="URL" bind:value={form.url}/>
    </div>
    <div class="w-2/3 mt-2">
        <p class="font-bold">授权的URI</p>
        <ListInputEditor inputClass="w-full" bind:value={form.domains} placeholder="域名，主机或地址"/>
    </div>
    {#if error}<div class="w-full mt-2 text-center text-red-700 dark:text-red-400">{error}</div>{/if}
    <div class="w-full text-center mt-2">
        <Button mode="underline" color="success" onclick={submit}><Plus size={20} class="mr-1"/>创建App</Button>
    </div>
</div>