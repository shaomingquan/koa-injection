### features

> 测试覆盖率99+，但这里更多的是想提供一种思路，由于是刚抽离出来的，仍为unstable

- 自动import
    - 指定目录下的包自动import
    - 自动按目录分namespace
- 类型自动生成
    - 自动组装分层类型，无需手动维护
    - 能让js受益

### examples

- examples/koa-ts：ts演示
- examples/koa-js：js演示
- test/*.test.ts：测试文件（没跑ci，travis收费了）

### TODO

- 支持更灵活的模块定义方式，目前是每个目录为一个模块（见上面examples）
- 支持mjs