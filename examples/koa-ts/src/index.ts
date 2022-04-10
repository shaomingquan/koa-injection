import Koa from 'koa'
import { inject } from 'koa-injection'

const app = new Koa

const injects = async () => {
    const servicesDir = 
        process.env.NODE_ENV === 'development' ? 
            'src/services' : 'dist/services'
    await inject(app, 'tsServices', servicesDir, {
        genTypes: process.env.NODE_ENV === 'development',
        typesDir: '.koa-injection',
    })
}

app.use((ctx) => {
    ctx.body = ctx.tsServices.foo.bar.get()
})

const bootstrap = async () => {
    await injects()
    app.listen(9494, () => {
        process.send && process.send('ready');
    })
}

bootstrap()