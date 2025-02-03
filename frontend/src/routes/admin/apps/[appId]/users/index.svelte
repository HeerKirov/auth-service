<script lang="ts">
import { getContext } from "svelte"
import { Anchor, PageRouter } from "@/components"
import { admin, type UserInApp } from "@/lib/api"
import { toDateString } from "@/utils/date"
import empty from "@/assets/empty.jpg"

let appId = getContext<string>("appId")

let limit = $state(10)
let page = $state(1)

let data: UserInApp[] = $state([])
let total: number = $state(0)
let totalPage = $derived(Math.ceil(total / limit))

const loadData = async () => {
    if(page) {
        const r = await admin.app.user.listUsers(appId, {offset: (page - 1) * limit, limit})
        if(r.ok) {
            data = r.data.data
            total = r.data.total
        }
    }
}

$effect(() => { loadData() })
</script>

<table class="w-full">
    <thead>
        <tr>
            <th class="w-12"></th>
            <th>
                用户ID
            </th>
            <th>
                名称
            </th>
            <th class="hidden md:table-cell w-26">
                初次使用
            </th>
            <th class="hidden sm:table-cell w-26">
                上次登录
            </th>
        </tr>
    </thead>
    <tbody>
    {#each data as item (item.username)}
        <tr>
            <td>
                <img class="w-10 h-10 m-1 object-cover object-center inline-block rounded-full" src={item.avatar ?? empty} alt="user avatar"/>
            </td>
            <td class="text-center">
                @<Anchor href={`/admin/apps/${appId}/users/${item.username}`}>{item.username}</Anchor>
            </td>
            <td class="text-center">
                <Anchor href={`/admin/apps/${appId}/users/${item.username}`}>{item.displayName}</Anchor>
            </td>
            <td class="hidden md:table-cell text-gray-400 text-center">
                {toDateString(item.userAppRelation.createTime)}
            </td>
            <td class="hidden sm:table-cell text-gray-400 text-center">
                {item.userAppRelation.lastRefreshTime ? toDateString(item.userAppRelation.lastRefreshTime) : null}
            </td>
        </tr>
    {/each}
    </tbody>
</table>

<PageRouter class="mt-2" bind:page={page} {totalPage} {total}/>
