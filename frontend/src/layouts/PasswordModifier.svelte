<script lang="ts">
import type { HTMLAttributes } from "svelte/elements"
import { Button, Input } from "@/components"
import { Check, Key, KeyRound, KeySquare } from "lucide-svelte"
import { admin, user } from "@/lib/api"

let { mode = "my", username, onsuccess, oncancel, ...attrs }: {
    mode?: "my" | "admin"
    username?: string
    onsuccess?: () => void
    oncancel?: () => void
} & HTMLAttributes<HTMLDivElement> = $props()

let oldPassword = $state("")
let password = $state("")
let checkPassword = $state("")

let error = $state("")

const submit = async () => {
    if(!password) {
        error = "密码不能为空。"
        return
    }else if(password !== checkPassword) {
        error = "再次输入的密码不一致。"
        return
    }else if(password === oldPassword) {
        error = "新密码不能与原密码相同。"
        return
    }else if(mode === "admin" && !username) {
        throw new Error("username is required")
    }
    const r = mode === "my" ? await user.patchUserPassword({password, oldPassword}) : await admin.user.patchUserPassword(username!, {password})
    if(r.ok) {
        onsuccess?.()
    }else if(r.status === 401) {
        error = "原密码错误。"
    }else{
        error = r.message
    }
}

</script>

<div {...attrs}>
    {#if mode === "my"}
        <p class="mb-2"><Key class="mr-2"/><Input type="password" placeholder="原密码" bind:value={oldPassword}/><KeyRound class="invisible"/></p>
    {/if}
    <p class="mb-2"><KeyRound class="mr-2"/><Input type="password" placeholder="新密码" bind:value={password}/><KeyRound class="invisible"/></p>
    <p class="mb-2"><KeySquare class="mr-2"/><Input type="password" placeholder="确认密码" bind:value={checkPassword}/><KeyRound class="invisible"/></p>
    {#if error}<p class="mb-2 text-center text-red-700 dark:text-red-400">{error}</p>{/if}
    <div class="text-center">
        <Button mode="underline" color="success" onclick={submit}><Check class="mr-1"/>修改密码</Button>
    </div>
    <div class="text-center mt-1">
        <Button mode="underline" color="info" onclick={oncancel}>取消</Button>
    </div>
</div>