<script lang="ts">
import { onMount } from "svelte"
import { Recycle, X } from "lucide-svelte"
import { admin } from "@/lib/api"
import { Button } from "@/components"

let { appId }: {
    appId: string
} = $props()

let data: string | null = $state(null)

let regenerateCheck = $state(false)

onMount(async () => {
    const r = await admin.app.getAppSecret(appId)
    if(r.ok) {
        data = r.data.appSecret
    }
})

const regenerate = async () => {
    const r = await admin.app.flushAppSecret(appId)
    if(r.ok) {
        data = r.data.appSecret
        regenerateCheck = false
    }
}

</script>

<div class="text-center">
    {#if !regenerateCheck}
        <p class="text-sm text-gray-400 mb-1">将App Secret与App ID一同配置在登录服务API的访问配置中。</p>
        <div class="overflow-x-auto max-w-[95vw]">
            <pre>{data}</pre>
        </div>
        <Button class="text-sm" mode="underline" color="warning" onclick={() => regenerateCheck = true}><Recycle class="mr-1" size={18}/>重新生成App Secret</Button>
    {:else}
        <p class="text-sm text-gray-400 mb-1">确定要生成新的App Secret吗？</p>
        <p class="text-sm text-gray-400 mb-1">原有的App Secret即将失效，且所有用户对此App的访问都将被重置。</p>
        <Button class="text-sm" mode="underline" color="danger" onclick={regenerate}><Recycle class="mr-1" size={18}/>确认</Button>
        <Button class="text-sm" mode="underline" color="info" onclick={() => regenerateCheck = false}><X class="mr-1" size={18}/>取消</Button>
    {/if}
</div>