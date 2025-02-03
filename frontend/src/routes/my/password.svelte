<script lang="ts">
import { PasswordModifier } from "@/layouts"

const onsuccess = () => history.pushState({}, "", "/")

const oncancel = () => history.back()

</script>

<PasswordModifier class="central-page w-100" {onsuccess} {oncancel}/>