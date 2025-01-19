import Koa from "koa"
import { bodyParser } from "@koa/bodyparser"
import router from "@/router"
import config from "@/config"

const app = new Koa()

app.use(bodyParser())
app.use(router.routes())
app.use(router.allowedMethods())
app.listen(config.port, () => {
    console.log(`Server running on http://localhost:${config.port}`)
})