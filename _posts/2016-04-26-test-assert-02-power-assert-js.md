---
layout: post
title: test assert-02-power-assert-js 断言
date:  2016-4-26 12:53:12 +0800
categories: [JS]
tags: [js, assert, sh]
published: true
---

# 拓展阅读

[junit5-05-assert](https://houbb.github.io/2018/06/24/junit5-05-assert)

[junit5 系列](https://houbb.github.io/2018/06/24/junit5-01-hello)

[基于 junit5 实现 junitperf 源码分析](https://houbb.github.io/2021/07/23/junit-performance-junit5)

[Auto generate mock data for java test.(便于 Java 测试自动生成对象信息)](https://github.com/houbb/data-factory)

[Junit performance rely on junit5 and jdk8+.(java 性能测试框架。性能测试。压测。测试报告生成。)](https://github.com/houbb/junitperf)

# power-assert-js

[Power Assert in JavaScript](https://github.com/power-assert-js). 

Provides descriptive assertion messages through standard assert interface. 

No API is the best API.

# 设计理念

[NO API IS THE BEST API — THE ELEGANT POWER OF POWER ASSERT](https://intoli.com/blog/power-assert/)

## 什么是 power-assert？

power-assert 是 JavaScript 中 "Power Assert" 概念的一种实现。
通过标准的 assert 接口提供描述性断言消息。
没有比它更好的 API。使用 power-assert，你不需要学习很多断言库的 API（在大多数情况下，你只需要记住 assert(any_expression) 函数）。
停止记忆大量的断言 API。只需创建返回真值或非真值的表达式，power-assert 将其显示在屏幕上，作为你的失败消息的一部分，而无需输入任何消息。
power-assert 的核心价值在于绝对的简单性和稳定性。特别是，power-assert 坚持测试的最简单形式，即 assert(any_expression)。
查看幻灯片："power-assert，机制和哲学" —— 在 NodeFest 2014 的演讲。
【新】现在你不再需要 require('power-assert')。继续使用 require('assert')，power-assert 会在幕后进行增强。查看幻灯片："从库到工具 - power-assert 作为通用断言增强工具"
为了获得 power-assert 输出，你需要转换你的测试代码以生成 power-assert 输出。
power-assert - power = assert。在没有代码转换的情况下，power-assert 就像普通的 assert 一样工作。
与 assert 完全兼容。因此，你可以轻松地停止使用 power-assert，回到 assert。
有在线演示站点。
同时在服务器端和浏览器端工作。
通过 npm 和 bower 可用。
支持源映射，因此你可以像平常一样进行调试。
提供 Babel 插件和 Babel 预设。
提供 Browserify 转换。
提供 webpack 加载器。
提供 grunt 任务和 gulp 插件。
提供命令行工具。
提供自定义模块加载器及其方便的配置模块。
提供 Karma 适配器和 Karma 预处理器。
通过 Babel 插件支持 ES6+。
支持 CoffeeScript。
支持 TypeScript。
有 TypeScript 类型定义。
有用于将现有代码从 chai、should.js 和 expect.js 转换到 assert 的代码迁移工具。
AVA，这个具有未来感的测试运行器，现在内置了 power-assert。
有 Lab 转换器，以在 Lab 上启用 power-assert。
有模块加载器，使 ts-node 与 power-assert 协同工作。
Wallaby.js 通过 Babel 编译器/预处理器支持 power-assert。
欢迎提交拉取请求、问题报告和补丁。
power-assert 为你的测试提供描述性的断言消息，就像这样。

```
  1) Array #indexOf() should return index when the value is present:
     AssertionError: # path/to/test/mocha_node.js:10

  assert(ary.indexOf(zero) === two)
         |   |       |     |   |
         |   |       |     |   2
         |   -1      0     false
         [1,2,3]

  [number] two
  => 2
  [number] ary.indexOf(zero)
  => -1
```

## API

power-assert通过 espower 增强了这些 assert 函数，在断言失败时生成描述性消息。

```javascript
assert(value, [message])
assert.ok(value, [message])
assert.equal(actual, expected, [message])
assert.notEqual(actual, expected, [message])
assert.strictEqual(actual, expected, [message])
assert.notStrictEqual(actual, expected, [message])
assert.deepEqual(actual, expected, [message])
assert.notDeepEqual(actual, expected, [message])
assert.deepStrictEqual(actual, expected, [message])
assert.notDeepStrictEqual(actual, expected, [message])
```

power-assert 与 assert 完全兼容。因此，虽然它们没有被增强（不生成描述性消息），但以下函数也是可用的。

```javascript
assert.fail(actual, expected, message, operator)
assert.throws(block, [error], [message])
assert.doesNotThrow(block, [message])
assert.ifError(value)
```

从版本1.5.0开始，power-assert还支持 "strict mode"。

power-assert提供了一个用于定制的API。

```javascript
assert.customize(options)
```

## 没有 API 就是最好的 API

尽管 power-assert 与标准的 assert 接口完全兼容，在大多数情况下，你只需要记住的是 assert(any_expression) 函数。

power-assert 的核心价值在于绝对的简单性和稳定性。特别是，power-assert 坚持测试的最简单形式，即 assert(any_expression)。

```
    assert(types[index].name === bob.name)
           |    ||      |    |   |   |
           |    ||      |    |   |   "bob"
           |    ||      |    |   Person{name:"bob",age:5}
           |    ||      |    false
           |    |11     "alice"
           |    Person{name:"alice",age:3}
           ["string",98.6,true,false,null,undefined,#Array#,#Object#,NaN,Infinity,/^not/,#Person#]
  
    --- [string] bob.name
    +++ [string] types[index].name
    @@ -1,3 +1,5 @@
    -bob
    +alice
```

# 感想

个人以后设计 api 就可以参考这个。

使用的时候，让用户尽可能的不需要查阅文档，直接使用。

# 参考资料

https://github.com/power-assert-js/power-assert

* any list
{:toc}
