import { test, assert } from "vitest"
import { inject } from "../src"
import Koa from 'koa'
import fse from 'fs-extra'
import path from 'path'

test('gen content', async () => {
    const koaApp = new Koa
    await inject(koaApp, 'services', 'test/examples/services', {
        typesDir: 'test/.snapshots/.koa-injection-tocheck',
        genTypes: true,
    })

    // 保留一个成功的生成，如果有新的迭代，需要更新一个成功的生成
    // 测试就是把本次生成与成功的生成做比较

    const toCheck = await fse.readFile(path.join(__dirname, '.snapshots/.koa-injection-tocheck/services.d.ts'))
    const alreadyOk = await fse.readFile(path.join(__dirname, '.snapshots/.koa-injection-ok/services.d.ts'))
    assert.isTrue(toCheck.toString() === alreadyOk.toString())
})