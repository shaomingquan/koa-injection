const Koa = require('koa')

const app = new Koa

const { inject }  = require('../../../src')
inject(app, 'service', 'test/examples/services')

app.use(ctx => {
    ctx.services.a.c.mutate()
    ctx.services.b.mutate()
    ctx.body = 'x'
})

app.listen(4453)