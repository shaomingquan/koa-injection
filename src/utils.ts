import { globby } from 'globby';
import path from 'path'
import { pkgUp } from 'pkg-up';

/**
 * 
 * @param injectDir 
 * @returns 相对于所在项目的root
 */
export const getAbsInjectDir = async (injectDir: string) => {
  const pkg = await pkgUp()
  if (!pkg) {
    throw new Error('pkgUp error')
  }
  
  const pkgRoot = path.resolve(pkg, '../')
  return path.resolve(pkgRoot, injectDir)
}

/**
 * 
 * @param injectDir 这不是一个pkg，但是它下面有很多pkg
 * @returns 所有pkg
 */
export const getAllPkgs = async  (injectDir: string) => {
  const injectAbsDir = await getAbsInjectDir(injectDir)
  const pattern = path.resolve(injectAbsDir, './**/index.ts')

  const pkgs = await await globby(pattern);
  return [...pkgs]
}

export interface IPkg {
  pkgOriginalStr?: string;
  pkgName: string;
  subPkgs: {[pkgName: string]: IPkg};
  pkgPath: string[];
  deep: number;
  parentPkgName: string;
  isPkg: true,
}

export const genPkg = (
  pkgName: string, 
  pkgOriginalStr?: string, 
  pkgPath?: string[],
): IPkg => {
  pkgPath = pkgPath || []
  return {
    pkgOriginalStr,
    pkgName,
    subPkgs: {},
    pkgPath,
    deep: pkgPath.length,
    parentPkgName: pkgName === '__root' ? 
      '' : 
      (pkgPath[pkgPath.length - 2] || '__root'),
    isPkg: true,
  }
}

/**
 * 
 * @param injectDir 
 * @param pkgs getAllPkgs的返回值
 * @returns 生成pkg实例
 */
export const getAllPkgsInstances = async (injectDir: string, pkgs: string[]) => {
  const injectAbsDir = await getAbsInjectDir(injectDir)
  const pkgInstances = pkgs.map(pkgOriginalStr => {
    const relativePkgPath = path.relative(injectAbsDir, pkgOriginalStr)
    const pkgPath = relativePkgPath.split('/')
    pkgPath.pop()
    
    return genPkg(pkgPath[pkgPath.length - 1], pkgOriginalStr, pkgPath)
  })
  
  pkgInstances.sort((a, b) => a.deep - b.deep)
  pkgInstances.unshift(genPkg('__root'))
  return pkgInstances
}

/**
 * 
 * @param injectDir 
 * @returns 一个pkg和目录组成的tree
 */
export const getPkgsTree = async (injectDir: string) => {
  const pkgOriginalStrs = await getAllPkgs(injectDir)
  const pkgInstances = await getAllPkgsInstances(injectDir, pkgOriginalStrs)
  const pkgInstancesMap = pkgInstances.reduce<{[pkgName: string]: IPkg}>((mp, pkg) => {
    mp[pkg.pkgName] = pkg
    return mp
  }, {})

  const assignToParentPkg = (pkg: IPkg) => {
    const subPkgs = pkgInstancesMap[pkg.parentPkgName]?.subPkgs
    if (subPkgs[pkg.pkgName]) {
      throw new Error('repeat pkg')
    }
    subPkgs[pkg.pkgName] = pkg
  }
  
  for (let i = 1 ; i < pkgInstances.length ; i ++) {
    assignToParentPkg(pkgInstances[i])
  }
  
  return pkgInstances[0] // root
}