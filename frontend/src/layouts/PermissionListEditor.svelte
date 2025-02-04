<script lang="ts">
import { onMount } from "svelte"
import { CircleUserRound, Plus, UserCog, UserRoundCheck, X } from "lucide-svelte"
import { Button, Input, Select } from "@/components"
import { admin, type AppPermission, type UserAppPermission } from "@/lib/api"

let { permissions, appId, setValue }: {
    permissions: UserAppPermission[]
    appId: string
    setValue?: (p: UserAppPermission[]) => void
} = $props()

let selectList: {key: string, label: string, value: AppPermission}[] = $state([])

let selected: AppPermission | null = $state(null)

let args: Record<string, string> = $state({})

let error = $state("")

onMount(async () => {
    const r = await admin.app.permission.listPermissions(appId)
    if(r.ok) {
        selectList = r.data.data.map(value => ({value, key: value.name, label: value.displayName}))
        selected = r.data.data[0] ?? null
    }
})

const removeAt = (index: number) => {
    setValue?.([
        ...permissions.slice(0, index),
        ...permissions.slice(index + 1)
    ])
}

const submit = () => {
    if(selected === null) {
        error = "请先选择一项权限。"
        return
    }
    for(const argument of selected.arguments) {
        const value = args[argument.name]
        if(!value && !argument.optional) {
            error = `[${argument.comment ?? argument.name}]参数缺失。`
            return
        }
    }
    setValue?.([...permissions, {
        name: selected.name,
        displayName: selected.displayName,
        argumentDefinitions: selected.arguments,
        args: {...args}
    }])
    args = {}
    error = ""
}

//TODO 没有对参数类型做处理

</script>

{#each permissions as p, index}
    <div class="mb-1 w-full flex items-center justify-between">
        <div class="shrink-0">
            {#if p.name === "ADMIN"}<UserCog class="mr-1" size={20}/>{:else if p.name === "APP_ADMIN"}<UserRoundCheck class="mr-1" size={20}/>{:else}<CircleUserRound class="mr-1" size={20}/>{/if}
            {p.displayName}
            {#if p.argumentDefinitions.length > 0}
            <span class="text-sm text-slate-600 dark:text-neutral-400">
                (
                {#each p.argumentDefinitions as arg, i (arg.name)}
                    {i > 0 ? ", ": ""}
                    {arg.comment ?? arg.name}: <pre class="inline">{p.args[arg.name]}</pre>
                {/each}
                )
            </span>
            {/if}
        </div>
        <div class="shrink-full"></div>
        <Button color="danger" class="shrink-0" square onclick={() => removeAt(index)}><X/></Button>
    </div>
{/each}

<div class="mt-3">
    <b>新增</b>
    <Select items={selectList} bind:value={selected}/>
    <Button class="ml-1" mode="underline" color="success" onclick={submit}><Plus class="mr-1" size={20}/>添加</Button>
    {#if error}<span class="mb-2 text-red-700 dark:text-red-400">{error}</span>{/if}
</div>
{#if selected?.arguments?.length}
    <table>
        <tbody>
            {#each selected.arguments as arg}
                <tr>
                    <td>
                        <b>{arg.comment ?? arg.name}</b>
                        {#if !arg.optional}<span class="text-red-500">*</span>{/if}
                    </td>
                    <td>
                        <Input class="m-1" placeholder={arg.name} bind:value={args[arg.name]}/>
                    </td>
                </tr>
            {/each}
        </tbody>
    </table>
{/if}
