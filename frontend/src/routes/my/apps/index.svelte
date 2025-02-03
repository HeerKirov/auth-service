<script lang="ts">
import { onMount } from "svelte"
import { ShieldBan } from "lucide-svelte"
import { Anchor } from "@/components"
import { app, type MyApp } from "@/lib/api"
import { toDateString } from "@/utils/date"
import empty from "@/assets/empty.jpg"

let data: MyApp[] = $state([])

onMount(async () => {
    const r = await app.listApps()
    if(r.ok) {
        data = r.data.data
    }
})

const click = (item: MyApp) => {
    history.pushState({}, "", `/my/apps/${item.appId}`)
}

const clickURL = (e: MouseEvent) => {
    e.stopPropagation()
}

const keydown = (item: MyApp, e: KeyboardEvent) => {
    if(e.key === "Enter") {
        click(item)
    }
}

</script>

<div class="container-page px-2 py-4 md:py-8 flex flex-wrap gap-1">
    {#each data as item (item.appId)}
        <div role="button" tabindex={0} class="basis-full bg-slate-50 dark:bg-zinc-800 rounded-lg shadow-lg hover:shadow-xl transition-shadow cursor-pointer mb-2 p-3 flex justify-between flex-wrap items-stretch text-left md:flex-nowrap" onclick={() => click(item)} onkeydown={e => keydown(item, e)}>
            <div class="basis-full md:basis-auto">
                <div class="flex">
                    <img class="shrink-0 rounded-md w-16 h-16" src={item.avatar ?? empty} alt="app icon"/>
                    <div class="pl-2 pt-1">
                        <p class="text-2xl">{item.appName}</p>
                        {#if item.url}<p><Anchor color="primary" href={item.url} target="_blank" onclick={clickURL}>{item.url}</Anchor></p>{/if}
                    </div>
                </div>
                {#if item.description}<div class="mt-1">{item.description}</div>{/if}
            </div>
            <div class="basis-full md:basis-auto shrink-0 md:text-right flex md:flex-col justify-between">
                {#if !item.enabled}
                    <div class="text-red-400"><ShieldBan size={20} class="mr-1"/>App已被禁用</div>
                {/if}
                <div></div>
                <div class="text-sm"><b class="select-none text-gray-500">上次登录</b> <pre class="inline text-gray-400">{item.userAppRelation.lastRefreshTime ? toDateString(item.userAppRelation.lastRefreshTime) : "未登录过"}</pre></div>
            </div>
        </div>
    {/each}
</div>