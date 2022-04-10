import { injectKoaRuntimeCtx } from './runtime'
import Koa from 'koa';
import { defaultConf, IKoaInjectConf } from './config';
import { getInjectTypeFilePath, injectionFileContentGen } from './type-gen';
import fse from 'fs-extra'

export const inject = async (
    koaApp: Koa ,
    injectKey: string, 
    injectDir: string,
    conf?: IKoaInjectConf,
) => {
    const finalConf = Object.assign({}, defaultConf, conf)
    if (finalConf.genTypes) {
        const content = await injectionFileContentGen(injectKey, injectDir, finalConf)
        
        const filename = await getInjectTypeFilePath(injectKey, finalConf)
        const tmp = filename.split('/')
        tmp.pop()
        const fileDir = tmp.join('/')
        fse.mkdirpSync(fileDir)
        fse.writeFileSync(filename, content)
    }
    return await injectKoaRuntimeCtx(koaApp, injectKey, injectDir, finalConf)
}