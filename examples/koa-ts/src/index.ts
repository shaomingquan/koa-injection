import Koa from 'koa'
import { inject } from 'koa-injection'

const app = new Koa

const injects = async () => {
    // 对于build出来的产物，更换注入的位置
    const servicesDir = 
        process.env.NODE_ENV === 'development' ? 
            'src/services' : 'dist/services'
    await inject(app, 'tsServices', servicesDir, {
        // 开发环境生成types，否则不生成
        genTypes: process.env.NODE_ENV === 'development',
        typesDir: '.koa-injection',
    })
}

app.use((ctx) => {
    // 运行时自动注入，类型提示都有啦
    ctx.body = ctx.tsServices.foo.bar.get()
})

const bootstrap = async () => {
    // 要在注入成功之后启动服务
    await injects()
    app.listen(9494, () => {
        process.send && process.send('ready');
    })
}

bootstrap()