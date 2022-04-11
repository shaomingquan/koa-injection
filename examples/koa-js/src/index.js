const Koa = require('koa')
const { inject } = require('koa-injection')

const app = new Koa

const injects = async () => {
    await inject(app, 'jsServices', 'src/services', {
        // 开发环境生成types，否则不生成
        genTypes: process.env.NODE_ENV === 'development',
        typesDir: '.koa-injection',
    })
}

app.use((ctx) => {
    // 运行时自动注入，类型提示都有啦
    // 在原生js环境下尤其有用
    ctx.body = ctx.jsServices.foo.bar.get()
})

const bootstrap = async () => {
    // 要在注入成功之后启动服务
    await injects()
    app.listen(9494, () => {
        process.send && process.send('ready');
    })
}

bootstrap()