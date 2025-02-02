<script lang="ts">
import type { HTMLAttributes } from "svelte/elements"
import { ArrowLeft, ArrowRight } from "lucide-svelte"
import { Button, NumberInput } from "@/components"

let { page = $bindable(), totalPage, total, class: clz, ...attrs }: {
    page: number
    totalPage: number
    total: number
} & HTMLAttributes<HTMLDivElement> = $props()

let canPrev = $derived(page > 1)

let canNext = $derived(page < totalPage)

const first = () => page = 1

const prev = () => page -= 1

const next = () => page += 1

const last = () => page = totalPage

</script>

<div {...attrs} class={[clz, "flex", "items-center"]}>
    <div class="shrink-0 px-2">共{total}项</div>
    <div class="basis-full"></div>
    {#if totalPage > 1}
        <Button class="shrink-0 size-[32.8px] text-sm flex items-center justify-center" color={canPrev ? "primary" : "secondary"} square disabled={!canPrev} onclick={first}>1</Button>
        <Button class="shrink-0 size-[32.8px]" color={canPrev ? "primary" : "secondary"} square disabled={!canPrev} onclick={prev}><ArrowLeft size={20}/></Button>
        <NumberInput class="shrink-0 w-18 text-center" color="primary" min={1} max={totalPage} bind:value={page}/>
        <Button class="shrink-0 size-[32.8px]" color={canNext ? "primary" : "secondary"} square disabled={!canNext} onclick={next}><ArrowRight size={20}/></Button>
        <Button class="shrink-0 size-[32.8px] text-sm flex items-center justify-center" color={canNext ? "primary" : "secondary"} square disabled={!canNext} onclick={last}>{totalPage}</Button>
    {/if}
</div>