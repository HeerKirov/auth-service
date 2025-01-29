import { Action } from "svelte/action"

export const autoFocus: Action<HTMLElement, boolean> = (node: HTMLElement, enabled: boolean) => {
    if(enabled) {
        node.focus()
    }
}