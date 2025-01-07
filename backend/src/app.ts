import Koa from "koa"
import config from "@/config"

const app = new Koa()

app.use(async (ctx, next) => {
    ctx.body = "Hello World!"
})

app.listen(config.port, () => {
    console.log(`Server running on http://localhost:${config.port}`)
})