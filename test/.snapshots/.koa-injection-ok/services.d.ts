import { BaseContext } from 'koa';
import autoImportedA = require('../../examples/services/a/index');
type TA = typeof autoImportedA;
import autoImportedC = require('../../examples/services/a/c/index');
type TC = typeof autoImportedC;
import autoImportedB = require('../../examples/services/b/index.mjs');
type TB = typeof autoImportedB;
import autoImportedD = require('../../examples/services/d/index');
type TD = typeof autoImportedD;
interface IServices {
    a: IA;
    b: IB;
    d: ID;
}
interface IA extends TA {
    c: IC;
}
interface IC extends TC {
}
interface IB extends TB {
}
interface ID extends TD {
}
declare module 'koa' {
    interface BaseContext {
        services: IServices
    }
}
