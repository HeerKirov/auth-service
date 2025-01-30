import Koa from "koa"
import { bodyParser } from "@koa/bodyparser"
import { auth } from "@/middleware/auth"
import { permission } from "@/middleware/permission"
import { errorHandler } from "@/middleware/error-handler"
import { setupApp } from "@/services/setup"
import router from "@/router"
import config from "@/config"

const app = new Koa()

app.use(errorHandler)
app.use(bodyParser())
app.use(auth)
app.use(permission)
app.use(router.routes())
app.use(router.allowedMethods())
app.listen(config.port, async () => {
    console.log(`Server running on http://localhost:${config.port}`)
    await setupApp()
})