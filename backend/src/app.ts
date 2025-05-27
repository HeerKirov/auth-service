import Koa from "koa"
import koaBody from "koa-body"
import { bodyParser } from "@koa/bodyparser"
import { auth } from "@/middleware/auth"
import { logHandler } from "@/middleware/logger"
import { corsMiddleware } from "@/middleware/cors"
import { permission } from "@/middleware/permission"
import { errorHandler } from "@/middleware/error-handler"
import { setupApp } from "@/services/setup"
import router from "@/router"
import config from "@/config"

const app = new Koa()

app.use(logHandler)
app.use(corsMiddleware)
app.use(errorHandler)
app.use(koaBody({multipart: true, formidable: {maxFileSize: 1024 * 1024 * 10}}))
app.use(bodyParser())
app.use(auth)
app.use(permission)
app.use(router.routes())
app.use(router.allowedMethods())
app.listen(config.port, async () => {
    console.log(`Server running on http://0.0.0.0:${config.port}`)
    await setupApp()
})