<script lang="ts">
import { UserInfoPage } from "@/layouts"

const onUnauthorized = () => {
    window.location.href = "/login"
}

</script>

<UserInfoPage {onUnauthorized}/>
