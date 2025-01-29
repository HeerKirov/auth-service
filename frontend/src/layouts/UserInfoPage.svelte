<script lang="ts">
import { onMount } from "svelte"
import { Input, PatchForm } from "@/components"
import { type User, user } from "@/lib/api"
import { toDateString } from "@/utils/date"
import empty from "@/assets/empty.jpg"

let userInfo: User | null = $state(null)

onMount(async () => {
    const r = await user.getUserInfo()
    if(r.ok) {
        userInfo = r.data
    }
})

const setDisplayName = async (displayName: string) => {
    if(displayName !== userInfo?.displayName) {
        const r = await user.patchUserInfo({ displayName })
        if(r.ok) userInfo = r.data
        return r.ok
    }
    return true
}

</script>

{#if userInfo !== null}
    <div class="text-center"><img class="object-cover object-center inline-block rounded-full w-32 h-32" src={userInfo.avatar ?? empty} alt="avatar"/></div>
    <div class="underline mt-4"><span class="select-none">@</span>{userInfo.username}</div>
    <PatchForm class="mb-2" value={userInfo.displayName} setValue={setDisplayName}>
        {#snippet display(value)}
            <span class="text-2xl">{value}</span>
        {/snippet}
        {#snippet edit(value, setValue, save)}
            <Input {value} {setValue} onenter={save} autoFocus/>
        {/snippet}
    </PatchForm>
    <div class="text-sm"><b class="select-none text-gray-500">注册时间</b> <span class="text-gray-400">{toDateString(userInfo.createTime)}</span></div>
    <div class="text-sm"><b class="select-none text-gray-500">上次登录</b> <span class="text-gray-400">{toDateString(userInfo.lastRefreshTime)}</span></div>
{/if}