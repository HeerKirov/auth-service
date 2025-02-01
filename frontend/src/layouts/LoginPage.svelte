<script lang="ts">
import { Key, KeyRound, LogIn, User } from "lucide-svelte"
import { Button, Input } from "@/components"
import { auth } from "@/lib/api"
import { setAccessToken } from "@/lib/store/user.svelte"

let { onLogin, onClickRegister, showRegisterButton = true }: {
    showRegisterButton?: boolean
    onClickRegister?: () => void
    onLogin?: (username: string) => void
} = $props()

let username: string = $state("")
let password: string = $state("")
let error: string = $state("")

const focusPassword = (event: KeyboardEvent) => {
    if (event.key === "Enter") {
        event.preventDefault()
        document.querySelector<HTMLInputElement>("#password")?.focus()
    }
}

const login = async () => {
    if(!username || !password) {
        error = "用户ID和密码不能为空。"
        return
    }
    const r = await auth.login({username, password})
    if(r.ok) {
        setAccessToken(r.data.accessToken)
        onLogin?.(username)
    }else if(r.error === "INVALID_USERNAME_OR_PASSWORD" || r.status === 401) {
        error = "用户ID或密码错误。"
    }else{
        error = r.message
        console.error("Login failed.", r.message)
    }
}

</script>

<div class="central-page w-full">
    <p class="mb-2"><User class="mr-2"/><Input id="username" bind:value={username} onenter={focusPassword}/><User class="invisible"/></p>
    <p class="mb-2"><KeyRound class="mr-2"/><Input id="password" type="password" bind:value={password} onenter={login}/><KeyRound class="invisible"/></p>
    {#if error}<p class="mb-2 text-red-700">{error}</p>{/if}
    <p>
        <Button mode="filled" color="success" onclick={login}><LogIn class="mr-1"/>登录</Button>
        {#if showRegisterButton}<Button mode="outline" color="info" onclick={onClickRegister}><Key class="mr-1"/>注册</Button>{/if}
    </p>
</div>
