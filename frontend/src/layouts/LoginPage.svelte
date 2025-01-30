<script lang="ts">
import { Key, KeyRound, LogIn, User } from "lucide-svelte"
import { Button, Input } from "@/components"
import { auth } from "@/lib/api"

let { onLogin, onClickRegister, showRegisterButton = true }: {
    showRegisterButton?: boolean
    onClickRegister?: () => void
    onLogin?: (username: string) => void
} = $props()

let username: string = $state("")
let password: string = $state("")
let error: string = $state("")

const login = async () => {
    if(!username || !password) {
        error = "用户ID和密码不能为空。"
        return
    }
    const r = await auth.login({username, password})
    if(r.ok) {
        sessionStorage.setItem("access-token", r.data.accessToken)
        onLogin?.(username)
    }else if(r.status === 401) {
        error = "用户ID或密码错误。"
    }else{
        error = r.message
        console.error("Login failed.", r.message)
    }
}

</script>

<div>
    <p class="mb-2"><User class="inline mr-2"/><Input bind:value={username}/><User class="inline invisible"/></p>
    <p class="mb-2"><KeyRound class="inline mr-2"/><Input type="password" bind:value={password} onenter={login}/><KeyRound class="inline invisible"/></p>
    {#if error}<p class="mb-2 text-red-700">{error}</p>{/if}
    <p>
        <Button mode="filled" color="success" onclick={login}><LogIn class="inline mr-1"/>登录</Button>
        {#if showRegisterButton}<Button mode="outline" color="info" onclick={onClickRegister}><Key class="inline mr-1"/>注册</Button>{/if}
    </p>
</div>