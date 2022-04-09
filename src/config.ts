export interface IKoaInjectConf {
    genTypes: boolean;                   // 是否生成types声明
    typesDir: string;                    // 生成types的路径
}

export const defaultConf: IKoaInjectConf = {
    genTypes: false,
    typesDir: '.types',
}

export const genConfig = (userConfig: IKoaInjectConf) => {
    return { ...userConfig, ...defaultConf }
}