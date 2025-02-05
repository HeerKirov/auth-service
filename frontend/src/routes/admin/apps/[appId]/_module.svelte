<script lang="ts">
import { setContext } from "svelte"
import { Info, ScanFace, UserRoundCheck } from "lucide-svelte"
import { activeRoute } from "@roxi/routify"
import { Anchor } from "@/components"
import { urlMatch } from "@/utils/route"

let { appId }: { appId: string } = $props()

let choose = $derived(urlMatch($activeRoute.url, /^\/admin\/apps\/[^/]+\/(?<TYPE>[A-Za-z]+)/, "TYPE"))

setContext("appId", appId)

</script>

<div class="flex flex-wrap sm:flex-nowrap">
    <div class="shrink-0 basis-full justify-center sm:justify-start sm:basis-1/4 flex sm:flex-col gap-1 sm:gap-4 my-2">
        <div class="text-center">
            <Anchor mode="underline" color={choose === "basic" ? "primary" : "secondary"} href={`/admin/apps/${appId}/basic`}>
                <Info class="hidden sm:inline" size={20}/>
                基本信息
            </Anchor>
        </div>
        <div class="text-center">
            <Anchor mode="underline" color={choose === "permissions" ? "primary" : "secondary"} href={`/admin/apps/${appId}/permissions`}>
                <ScanFace class="hidden sm:inline" size={20}/>
                权限管理
            </Anchor>
        </div>
        <div class="text-center">
            <Anchor mode="underline" color={choose === "users" ? "primary" : "secondary"} href={`/admin/apps/${appId}/users`}>
                <UserRoundCheck class="hidden sm:inline" size={20}/>
                用户管理
            </Anchor>
        </div>
    </div>
    <div class="basis-full sm:basis-3/4 p-1 pt-4 sm:pt-1">
        <slot/>
    </div>
</div>
