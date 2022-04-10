export interface IKoaInjectConf {
    genTypes: boolean;                   // 是否生成types声明
    typesDir: string;                    // 生成types的路径
    extensions?: string[];
}

export const defaultConf: IKoaInjectConf = {
    genTypes: false,
    typesDir: '.koa-injection',
    extensions: ['ts', 'js', 'mjs'] // 暂时没用
}

export const genConfig = (userConfig: IKoaInjectConf) => {
    return { ...userConfig, ...defaultConf }
}
