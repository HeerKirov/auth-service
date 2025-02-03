<script lang="ts">
import { getContext } from "svelte"
import { CircleUserRound, Plus, UserCog, UserRoundCheck } from "lucide-svelte"
import { Anchor, PageRouter } from "@/components"
import { admin, type AppPermission } from "@/lib/api"
import { toDateString } from "@/utils/date"

let appId = getContext<string>("appId")

let limit = $state(10)
let page = $state(1)

let data: AppPermission[] = $state([])
let total: number = $state(0)
let totalPage = $derived(Math.ceil(total / limit))

const loadData = async () => {
    if(page) {
        const r = await admin.app.permission.listPermissions(appId, {offset: (page - 1) * limit, limit})
        if(r.ok) {
            data = r.data.data
            total = r.data.total
        }
    }
}

$effect(() => { loadData() })
</script>

<div class="flex justify-end pb-1 mb-3">
    <Anchor mode="underline" href={`/admin/apps/${appId}/permissions/new`}><Plus class="mr-1" size={20}/>新建权限</Anchor>
</div>

<table class="w-full">
    <thead>
    <tr>
        <th class="w-8"></th>
        <th class="text-left">
            权限名称
        </th>
        <th>
            显示名
        </th>
        <th class="hidden md:table-cell">
            参数
        </th>
        <th class="hidden md:table-cell w-26">
            创建时间
        </th>
    </tr>
    </thead>
    <tbody>
    {#each data as item (item.id)}
        <tr>
            <td>
                {#if item.name === "ADMIN"}
                    <UserCog class="my-2"/>
                {:else if item.name === "APP_ADMIN"}
                    <UserRoundCheck class="my-2"/>
                {:else }
                    <CircleUserRound class="my-2"/>
                {/if}
            </td>
            <td class="text-nowrap text-left">
                {item.name}
            </td>
            <td class="text-center text-nowrap">
                {item.displayName}
            </td>
            <td class="hidden md:table-cell text-gray-400 text-center">
                {item.arguments.length ? `${item.arguments.length}个` : null}
            </td>
            <td class="hidden md:table-cell text-gray-400 text-center">
                {toDateString(item.createTime)}
            </td>
        </tr>
    {/each}
    </tbody>
</table>

<PageRouter class="mt-2" bind:page={page} {totalPage} {total}/>
