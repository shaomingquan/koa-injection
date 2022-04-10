import { BaseContext } from 'koa';
import autoImportedFoo = require('../src/services/foo/index');
type TFoo = typeof autoImportedFoo;
import autoImportedBar = require('../src/services/foo/bar/index');
type TBar = typeof autoImportedBar;
interface IJsServices {
    foo: IFoo;
}
interface IFoo extends TFoo {
    bar: IBar;
}
interface IBar extends TBar {
}
declare module 'koa' {
    interface BaseContext {
        jsServices: IJsServices
    }
}
