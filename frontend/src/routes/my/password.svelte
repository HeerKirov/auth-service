<script lang="ts">
import { PasswordModifier } from "@/layouts"
import { routePush } from "@/utils/route"

const onsuccess = () => routePush("/login")

const oncancel = () => history.back()

</script>

<PasswordModifier class="central-page w-100" {onsuccess} {oncancel}/>