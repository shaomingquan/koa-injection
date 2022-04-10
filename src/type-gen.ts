import pkgUp from "pkg-up"
import { IKoaInjectConf } from "./config"
import { getFlattenPkgs, getPkgsTree, IPkg, upperFirst } from "./utils"
import path from 'path'

export const getInjectTypeFilePath = async (injectKey: string, conf: IKoaInjectConf) => {
    const tmp = await pkgUp()
    if (!tmp) {
        throw new Error('pkgUp Error')
    }
    const projectRoot = path.resolve(tmp, '../')
    return path.resolve(projectRoot, conf.typesDir, injectKey + '.d.ts')
}

export const importGen = async (injectKey: string, pkg: IPkg, conf: IKoaInjectConf) => {
    
    const {
        pkgOriginalStr,
        pkgImportName,
        pkgName,
    } = pkg

    if (!pkgOriginalStr) {
        throw new Error('internal pkg error')
    }

    const injectTypeFile = await getInjectTypeFilePath(injectKey, conf)
    const tmp = path.relative(path.resolve(injectTypeFile, '../'), pkgOriginalStr).split('.')
    const ext = tmp.pop()
    if (ext === 'mjs') {
        tmp.push(ext)
    }
    const relativePkgOriginalStr = tmp.join('.')
    return `import ${pkgImportName} = require('${relativePkgOriginalStr}');\ntype T${upperFirst(pkgName)} = typeof ${pkgImportName};`
}

const importsGen = async (injectKey: string, pkg: IPkg, conf: IKoaInjectConf) => {
    const pkgs = getFlattenPkgs(pkg)
    pkgs.shift()
    const strs = await Promise.all(pkgs.map(pkg => importGen(injectKey, pkg, conf)))
    return strs.join('\n')
}

const injectionPkgsTypeGen = async (injectKey: string, pkg: IPkg, conf: IKoaInjectConf) => {
    const pkgs = getFlattenPkgs(pkg)
    return pkgs.map(pkg => {
        if (pkg.isRoot) {
            return `interface I${upperFirst(injectKey)} {${Object.keys(pkg.subPkgs).map(k => {
                const subPkg = pkg.subPkgs[k]
                return `\n    ${subPkg.pkgName}: I${upperFirst(subPkg.pkgName)};`
            }).join('')}\n}`
        } else {
            return `interface I${upperFirst(pkg.pkgName)} extends T${upperFirst(pkg.pkgName)} {${Object.keys(pkg.subPkgs).map(k => {
                const subPkg = pkg.subPkgs[k]
                return `\n    ${subPkg.pkgName}: I${upperFirst(subPkg.pkgName)};`
            }).join('')}\n}`
        }
    }).join('\n')
}

const injectionToKoaGen = async (injectKey: string) => {
    return `declare module 'koa' {
    interface BaseContext {
        ${injectKey}: I${upperFirst(injectKey)}
    }
}
`
}

export const injectionFileContentGen = async (injectKey: string, injectDir: string, conf: IKoaInjectConf) => {
    const pkgRoot = await getPkgsTree(injectDir)
    const deps = `import { BaseContext } from 'koa';\n`
    const imports = await importsGen(injectKey, pkgRoot, conf) + '\n'
    const types = await injectionPkgsTypeGen(injectKey, pkgRoot, conf) + '\n'
    const injectionToKoa = await injectionToKoaGen(injectKey)
    return `${deps}${imports}${types}${injectionToKoa}`
}

/**

import { BaseContext } from 'koa';

declare module 'koa' {
    interface BaseContext {
        dataLoader(): string;
    }
}

*/