<script lang="ts">
import { PasswordModifier } from "@/layouts"

const onsuccess = () => history.pushState({}, "", "/login")

const oncancel = () => history.back()

</script>

<PasswordModifier class="central-page w-100" {onsuccess} {oncancel}/>