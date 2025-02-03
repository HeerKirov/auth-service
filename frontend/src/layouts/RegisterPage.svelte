<script lang="ts">
import { Check, KeyRound, KeySquare, User, UserPen } from "lucide-svelte"
import { Button, Input } from "@/components"
import { auth } from "@/lib/api"
import { setAccessToken } from "@/lib/store/user.svelte"

let { onRegistered }: {
    onRegistered?: (username: string) => void
} = $props()

let username: string = $state("")
let displayName: string = $state("")
let password: string = $state("")
let checkPassword: string = $state("")
let error: string = $state("")

const register = async () => {
    if(!username.trim()) {
        error = "用户ID不能为空。"
        return
    }else if(!password) {
        error = "密码不能为空。"
        return
    }else if(password !== checkPassword) {
        error = "再次输入的密码不一致。"
        return
    }else if(!displayName.trim()) {
        error = "名称不能为空。"
        return
    }
    const r = await auth.register({username: username.trim(), password, displayName: displayName.trim(), avatar: null})
    if(r.ok) {
        setAccessToken(r.data.accessToken)
        onRegistered?.(username)
    }else if(r.error === "ALREADY_EXISTS") {
        error = "该用户ID已存在。"
    }else{
        error = r.message
        console.error("Register failed.", r.message)
    }
}

</script>

<div class="central-page w-full">
    <p class="mb-2"><User class="mr-2"/><Input placeholder="用户ID" bind:value={username}/><User class="invisible"/></p>
    <p class="mb-2"><UserPen class="mr-2"/><Input placeholder="名称" bind:value={displayName}/><User class="invisible"/></p>
    <p class="mb-2"><KeyRound class="mr-2"/><Input type="password" placeholder="密码" bind:value={password} onenter={register}/><KeyRound class="invisible"/></p>
    <p class="mb-2"><KeySquare class="mr-2"/><Input type="password" placeholder="确认密码" bind:value={checkPassword} onenter={register}/><KeyRound class="invisible"/></p>
    {#if error}<p class="mb-2 text-red-700 dark:text-red-400">{error}</p>{/if}
    <p>
        <Button mode="outline" color="info" onclick={register}><Check class="mr-1"/>注册</Button>
    </p>
</div>
