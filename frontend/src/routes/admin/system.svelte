<script lang="ts">
import { onMount } from "svelte"
import { Cog } from "lucide-svelte"
import { Button, CheckBox, NumberInput } from "@/components"
import { admin, type Settings } from "@/lib/api"

let data: Settings | null = $state(null)
let changed = $state(false)

onMount(async () => {
    const r = await admin.setting.getSettings()
    if(r.ok) data = r.data
})

function set<T extends keyof Settings>(key: T, value: Settings[T] | undefined) {
    if(data !== null && value !== undefined && data[key] !== value) {
        data[key] = value
        changed = true
    }
}

async function submit() {
    if(data !== null && changed) {
        const r = await admin.setting.patchSettings(data)
        if(r.ok) data = r.data
        changed = false
    }
}

const MS_IN_MINUTE = 60 * 1000
const MS_IN_HOUR = 60 * 60 * 1000
const MS_IN_DAY = 24 * 60 * 60 * 1000

</script>

<div class="flex flex-wrap justify-center">
    {#if data !== null}
        <div>
            <p class="text-sm font-bold mt-2 mb-1">注册功能开关</p>
            <CheckBox checked={data.REGISTRATION_SWITCH} setChecked={v => set("REGISTRATION_SWITCH", v)}>开放注册</CheckBox>
            <p class="text-sm font-bold mt-2 mb-1">RefreshToken有效时长</p>
            <NumberInput value={data.REFRESH_TOKEN_DELAY / MS_IN_DAY} setValue={v => set("REFRESH_TOKEN_DELAY", v ? v * MS_IN_DAY : undefined)}/>天
            <p class="text-sm font-bold mt-2 mb-1">RefreshToken刷新间隔</p>
            <NumberInput value={data.REFRESH_TOKEN_AUTO_FLUSH / MS_IN_HOUR} setValue={v => set("REFRESH_TOKEN_AUTO_FLUSH", v ? v * MS_IN_HOUR : undefined)}/>小时
            <p class="text-sm font-bold mt-2 mb-1">AccessToken有效时长</p>
            <NumberInput value={data.ACCESS_TOKEN_DELAY / MS_IN_HOUR} setValue={v => set("ACCESS_TOKEN_DELAY", v ? v * MS_IN_HOUR : undefined)}/>小时
            <p class="text-sm font-bold mt-2 mb-1">RefreshToken刷新间隔</p>
            <NumberInput value={data.AUTHORIZATION_CODE_DELAY / MS_IN_MINUTE} setValue={v => set("AUTHORIZATION_CODE_DELAY", v ? v * MS_IN_MINUTE : undefined)}/>分钟
            {#if changed}
                <p class="mt-2"><Button mode="underline" onclick={submit}><Cog size={20} class="mr-1"/>保存更改</Button></p>
            {/if}
        </div>
    {/if}
</div>