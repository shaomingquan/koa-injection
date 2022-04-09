import { test, assert } from "vitest"
import { getAllPkgs, getAllPkgsInstances, getPkgsTree } from "../src/utils"
import { genRootPkgRuntime } from "../src/runtime"

test("dir utils", async () => {
  // 这里有3个pkg
  const pkgs = await getAllPkgs('test/examples/services')
  assert.equal(pkgs.length, 3)

  // 这里有两个pkg，并且用 ./ 的形式也没问题
  const pkgs2 = await getAllPkgs('./test/examples/services/a')
  assert.equal(pkgs2.length, 2)
})

test("datastruct utils", async () => {
  const injectDir = 'test/examples/services'
  const pkgs = await getAllPkgs(injectDir)
  const pkgsInstances = await getAllPkgsInstances(injectDir, pkgs)

  // deep应该是递增的
  pkgsInstances.reduce((prev, cur) => {
    assert.isTrue(cur.deep >= prev.deep)
    return cur
  })

  // 最深的一个pkg是a/c
  const deepestPkg = pkgsInstances[pkgsInstances.length - 1]
  assert.isTrue(deepestPkg.pkgPath[0] === 'a')
  assert.isTrue(deepestPkg.pkgPath[1] === 'c')
  
  // 生成一个树
  const pkgTreeRoot = await getPkgsTree(injectDir)
  assert.isTrue(pkgTreeRoot.subPkgs['a'].isPkg)
  assert.isTrue(pkgTreeRoot.subPkgs['b'].isPkg)
  const pkgA = pkgTreeRoot.subPkgs['a']
  assert.isTrue(pkgA.subPkgs['c'].isPkg)
})

test("runtime", async () => {
  const injectDir = 'test/examples/services'
  const pkgTreeRoot = await getPkgsTree(injectDir)
  const service = await genRootPkgRuntime(pkgTreeRoot)
  assert.isTrue(service.a.fetch() === 'an item')
  assert.isTrue(service.b.fetch() === 'an item')
  assert.isTrue(service.a.c.fetch() === 'an item')
  
  try {
    const injectDir = 'test/examples/bad-services'
    const pkgTreeRoot = await getPkgsTree(injectDir)
    await genRootPkgRuntime(pkgTreeRoot)
  } catch (e) {
    assert.isTrue(e.name === 'pkgName conflict')
  }
})