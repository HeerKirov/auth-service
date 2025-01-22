import Koa from "koa"
import { bodyParser } from "@koa/bodyparser"
import router from "@/router"
import config from "@/config"
import { setupDefaultUser } from "@/services/user"

setupDefaultUser().finally()

const app = new Koa()

app.use(bodyParser())
app.use(router.routes())
app.use(router.allowedMethods())
app.listen(config.port, () => {
    console.log(`Server running on http://localhost:${config.port}`)
})