import { IPkg, getPkgsTree } from "./utils";
import Koa from 'koa';

export const genRootPkgRuntime = async (root: IPkg, parentRuntime?: any): Promise<{ [ pkgName: string ]: any }> => {
    const subPkgs = root.subPkgs
    const ret = parentRuntime || {}
    const subPkgsKeys = Object.keys(subPkgs)
    for (let i = 0 ; i < subPkgsKeys.length ; i ++) {
        const subPkg = subPkgs[subPkgsKeys[i]]
        if (!subPkg.pkgOriginalStr) {
            throw new Error('no subPkg.pkgOriginalStr')
        }

        if (!!parentRuntime && !!parentRuntime[subPkg.pkgName]) {
            const err = new Error(`sub module pkgName is conflict with module member [${subPkg.pkgName}]`)
            err.name = 'pkgName conflict'
            throw err
        }

        const pkgRuntime = await import(subPkg.pkgOriginalStr)
        ret[subPkg.pkgName] = pkgRuntime
        await genRootPkgRuntime(subPkg, pkgRuntime)
    }
    return ret 
}

export const injectKoaRuntimeCtx = async (koaApp: Koa ,injectKey: string, injectDir: string) => {
    const pkgRoot = await getPkgsTree(injectDir)
    const runtimeToInject = await genRootPkgRuntime(pkgRoot)


    if (!!koaApp.context[injectKey]) {
        const err = new Error(`injectKey conflict, repeat inject [${injectKey}]`)
        err.name = `injectKey conflict, reason: repeat inject`
        throw err
    }

    Object.defineProperty(koaApp.context, injectKey, {
        value: runtimeToInject,
        enumerable: false,
        configurable: false,
        writable: false,
    })
}