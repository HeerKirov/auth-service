<script lang="ts">
import { PageRouter } from "@/components"
import { admin, type User } from "@/lib/api"
import { toDateString } from "@/utils/date"
import empty from "@/assets/empty.jpg"

let limit = $state(10)
let page = $state(1)

let data: User[] = $state([])
let total: number = $state(0)

let totalPage = $derived(Math.ceil(total / limit))

const loadData = async () => {
    if(page) {
        const r = await admin.user.listUsers({offset: (page - 1) * limit, limit})
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
                注册时间
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
                    <img class="w-12 h-12 m-1 object-cover object-center inline-block rounded-full" src={item.avatar ?? empty} alt="user avatar"/>
                </td>
                <td class="text-center">
                    @{item.username}
                </td>
                <td class="text-center">
                    {item.displayName}
                </td>
                <td class="hidden md:table-cell text-gray-400 text-center">
                    {toDateString(item.createTime)}
                </td>
                <td class="hidden sm:table-cell text-gray-400 text-center">
                    {item.lastRefreshTime ? toDateString(item.lastRefreshTime) : null}
                </td>
            </tr>
        {/each}
    </tbody>
</table>

<PageRouter class="mt-2" bind:page={page} {totalPage} {total}/>
