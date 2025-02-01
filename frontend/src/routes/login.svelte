<script lang="ts">
import { LoginPage, RegisterPage } from "@/layouts"

let mode: "login" | "register" = $state("login")

const onLogin = () => history.pushState({}, "", "/")

const onClickRegister = () => mode = "register"

</script>

{#if mode === "login"}
    <LoginPage {onLogin} {onClickRegister}/>
{:else if mode === "register"}
    <RegisterPage onRegistered={onLogin}/>
{/if}