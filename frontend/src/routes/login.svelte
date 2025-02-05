<script lang="ts">
import { LoginPage, RegisterPage } from "@/layouts"
import { routePush } from "@/utils/route"

let mode: "login" | "register" = $state("login")

const onLogin = () => routePush("/")

const onClickRegister = () => mode = "register"

</script>

{#if mode === "login"}
    <LoginPage {onLogin} {onClickRegister}/>
{:else if mode === "register"}
    <RegisterPage onRegistered={onLogin}/>
{/if}