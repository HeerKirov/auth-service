<script lang="ts">
import { CircleUser, CircleUserRound, ShieldBan, UserCircle } from "lucide-svelte"
import { app, type MyAppDetail } from "@/lib/api"
import { toDateString } from "@/utils/date"
import empty from "@/assets/empty.jpg"

let { appId }: {
    appId: string
} = $props()

let data: MyAppDetail | null = $state(null)

$effect(() => {
    app.getApp(appId).then(r => {
        if(r.ok) {
            data = r.data
        }
    })
})

</script>

<div class="container-page px-2 py-4 md:py-8 flex flex-wrap gap-1">
    <div class="basis-full bg-slate-50 dark:bg-neutral-700 rounded-lg shadow-lg hover:shadow-xl transition-shadow mb-2 p-3 flex justify-between flex-wrap md:flex-nowrap">
        <div class="basis-full md:basis-auto">
            <div class="flex">
                <img class="shrink-0 rounded-md w-16 h-16" src={data?.avatar ?? empty} alt="app icon"/>
                <div class="pl-2 pt-1">
                    <p class="text-2xl">{data?.appName}</p>
                    {#if data?.url}<p><a href={data.url} target="_blank">{data.url}</a></p>{/if}
                </div>
            </div>
            {#if data?.description}
                <div class="mt-1">{data.description}</div>
            {:else}
                <div class="mt-1 text-gray-400">...</div>
            {/if}
            <p class="text-sm font-bold mt-2">在此App中的权限</p>
            {#each data?.userAppPermissions ?? [] as p}
                <div class="mt-1">
                    {#if p.name === "ADMIN"}<CircleUser class="mr-1" size={20}/>{:else}<CircleUserRound class="mr-1" size={20}/>{/if}
                    {p.displayName}
                    {#if p.argumentDefinitions.length > 0}
                        <span class="text-sm text-slate-600 dark:text-neutral-400">
                            (
                            {#each p.argumentDefinitions as arg, i (arg.name)}
                                {i > 0 ? ", ": ""}
                                {arg.comment ?? arg.name}: <pre class="inline">{p.args[arg.name]}</pre>
                            {/each}
                            )
                        </span>
                    {/if}
                </div>
            {:else}
                <div class="mt-1">
                    <UserCircle class="mr-1" size={20}/>
                    一般用户
                </div>
            {/each}
        </div>
        <div class="basis-full md:basis-auto shrink-0 md:text-right flex md:flex-col justify-between">
            {#if data && !data.enabled}
                <div class="text-red-400"><ShieldBan size={20} class="mr-1"/>App已被禁用</div>
            {/if}
            <div class="basis-full"></div>
            <div class="text-sm"><b class="select-none text-gray-500">初次使用</b> <pre class="inline text-gray-400">{data ? toDateString(data.userAppRelation.createTime) : "XXXX-XX-XX"}</pre></div>
            <div class="text-sm"><b class="select-none text-gray-500">上次登录</b> <pre class="inline text-gray-400">{data ? data.userAppRelation.lastRefreshTime ? toDateString(data.userAppRelation.lastRefreshTime) : "未登录过" : "XXXX-XX-XX"}</pre></div>
        </div>
    </div>
</div>
