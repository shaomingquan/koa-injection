const Koa = require('koa')
const { inject } = require('koa-injection')

const app = new Koa

const injects = async () => {
    await inject(app, 'jsServices', 'src/services', {
        genTypes: process.env.NODE_ENV === 'development',
        typesDir: '.koa-injection',
    })
}

app.use((ctx) => {
    ctx.body = ctx.jsServices.foo.bar.get()
})

const bootstrap = async () => {
    await injects()
    app.listen(9494, () => {
        process.send && process.send('ready');
    })
}

bootstrap()