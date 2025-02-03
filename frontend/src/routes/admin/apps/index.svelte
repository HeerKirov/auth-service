<script lang="ts">
import { ExternalLink, Plus } from "lucide-svelte"
import { Anchor, PageRouter } from "@/components"
import { admin, type App } from "@/lib/api"
import { toDateString } from "@/utils/date"
import empty from "@/assets/empty.jpg"

let limit = $state(10)
let page = $state(1)

let data: App[] = $state([])
let total: number = $state(0)

let totalPage = $derived(Math.ceil(total / limit))

const loadData = async () => {
    if(page) {
        const r = await admin.app.listApps({offset: (page - 1) * limit, limit})
        if(r.ok) {
            data = r.data.data
            total = r.data.total
        }
    }
}

$effect(() => { loadData() })

</script>

<div class="flex justify-end pb-1 mb-3">
    <Anchor mode="underline" href="/admin/apps/new"><Plus class="mr-1" size={20}/>新建App</Anchor>
</div>

<table class="w-full">
    <thead>
    <tr>
        <th class="w-12"></th>
        <th class="text-left pl-1">
            AppID
        </th>
        <th>
            名称
        </th>
        <th class="hidden sm:table-cell">
            描述
        </th>
        <th class="hidden md:table-cell w-26">
            创建时间
        </th>
    </tr>
    </thead>
    <tbody>
    {#each data as item (item.appId)}
        <tr>
            <td>
                <img class="w-10 h-10 m-1 object-cover object-center inline-block rounded-lg" src={item.avatar ?? empty} alt="app avatar"/>
            </td>
            <td class="text-nowrap pl-1">
                <Anchor color="secondary" href={`/admin/apps/${item.appId}/basic`}>{item.appId}</Anchor>
            </td>
            <td class="text-center text-nowrap">
                <Anchor href={`/admin/apps/${item.appId}/basic`}>{item.appName}</Anchor>
                {#if item.url}
                    <Anchor class="ml-1" color="primary" href={item.url} target="_blank"><ExternalLink size={20}/></Anchor>
                {/if}
            </td>
            <td class="hidden sm:table-cell text-center text-nowrap overflow-hidden text-ellipsis">
                {item.description}
            </td>
            <td class="hidden md:table-cell text-gray-400 text-center">
                {toDateString(item.createTime)}
            </td>
        </tr>
    {/each}
    </tbody>
</table>

<PageRouter class="mt-2" bind:page={page} {totalPage} {total}/>
