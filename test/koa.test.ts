import { test, assert } from "vitest"
import { getAllPkgs, getAllPkgsInstances, getPkgsTree } from "../src/utils"
import { genRootPkgRuntime, injectKoaRuntimeCtx } from "../src/runtime"
import Koa from "koa"
import http from 'http'
import { URL } from 'url'
import fse from 'fs-extra'


test("koa", async () => {
  const koaApp = new Koa
  await injectKoaRuntimeCtx(koaApp, 'services', 'test/examples/services')

  koaApp.use(ctx => {
    try {
      ctx.body = ctx.services.a.fetch()
    } catch (e) {
      ctx.status = 500
      ctx.body = e.message
    }
  })
  koaApp.listen(6109)
  
  const text = await new Promise((resolve, reject) => {
    const req = http.request({
      ...new URL('http://localhost:6109'),
      port: 6109,
    }, res => {
      if (res.statusCode !== 200) {
        reject(new Error('services injected fail'))
      }
      res.on('data', chunk => {
        resolve(chunk.toString())
      })

      res.on('error', chunk => {
        reject(new Error('services injected fail'))
      })
    })
    req.write('')
  })
  assert.isTrue(text === 'an item')
  assert.isTrue(!!koaApp.context.services)
  assert.isTrue(!!koaApp.context.services.a)
  assert.isTrue(!!koaApp.context.services.b)
  assert.isTrue(!!koaApp.context.services.a.c)
})


test('bad injections 1', async () => {
  // 重复inject同一个pkg到同一个injectKey
  const koaApp = new Koa
  try {
    fse.copySync('test/examples/services', 'test/examples/services-0')
    await injectKoaRuntimeCtx(koaApp, 'services', 'test/examples/services-0')
    await injectKoaRuntimeCtx(koaApp, 'services', 'test/examples/services-0')

    fse.removeSync('test/examples/services-0')
    assert.fail('should throw')
  } catch (e) {
    fse.removeSync('test/examples/services-0')
    // 因为nodejs正常的pkg缓存行为，koa-injection会抛出这个错误
    assert.isTrue(e.name === 'pkgName conflict')
  }
})


test('bad injections 2', async () => {
  // 重复inject不同pkg到同一个injectKey
  const koaApp = new Koa
  try {
    fse.copySync('test/examples/services', 'test/examples/services-1')
    await injectKoaRuntimeCtx(koaApp, 'services', 'test/examples/services-1')
    fse.copySync('test/examples/services', 'test/examples/services-2')
    await injectKoaRuntimeCtx(koaApp, 'services', 'test/examples/services-2')

    fse.removeSync('test/examples/services-1')
    fse.removeSync('test/examples/services-2')
    assert.fail('should throw')
  } catch (e) {
    fse.removeSync('test/examples/services-1')
    fse.removeSync('test/examples/services-2')
    assert.isTrue(e.name === 'injectKey conflict, reason: repeat inject')
  }
})


test('bad injections 3', async () => {
  // 不可注册一个存在于koa ctx中的key
  const koaApp = new Koa
  try {
    fse.copySync('test/examples/services', 'test/examples/services-3')
    await injectKoaRuntimeCtx(koaApp, 'cookies', 'test/examples/services-3')

    fse.removeSync('test/examples/services-3')
    assert.fail('should throw')
  } catch (e) {
    fse.removeSync('test/examples/services-3')
    assert.isTrue(e.name === 'injectKey conflict, koa ctx member')
  }
})
