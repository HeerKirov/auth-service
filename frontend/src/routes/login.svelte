<script lang="ts">
import { Button, Input } from "@/components"
import { auth } from "@/lib/api"

let username: string = $state("")
let password: string = $state("")

const login = async () => {
    const r = await auth.login({username, password})
    if(r.ok) {
        sessionStorage.setItem("access-token", r.data.accessToken)
        console.log("success")
        window.location.href = "/"
    }else{
        console.warn("failed", r.status)
    }
}

</script>

<div>
    <p>Login {username} {password}</p>
    <Input bind:value={username}/>
    <Input type="password" bind:value={password}/>
    <Button onclick={login}>Login</Button>
</div>