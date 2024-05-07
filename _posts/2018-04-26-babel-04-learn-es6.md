---
layout: post
title:  Babel-04-学习 ES2015
date:  2018-07-06 11:15:29 +0800
categories: [Web]
tags: [web, babel, js]
published: true
---

# 学习

在线尝试特性：https://www.babeljs.cn/repl

# 简介

ECMAScript 2015 是一个 ECMAScript 标准，于 2015 年 6 月批准。

ES2015 是对 JavaScript 的重要更新，也是自 2009 年 ES5 标准化以来对该语言的第一次重大更新。主流 JavaScript 引擎对这些新特性的实现 正在进行中。

参考 ES2015 标准 了解 ECMAScript 2015 的完整规范。

# 箭头函数与 Lexical This

箭头函数是使用 `=>` 语法的函数简写方式。

他们在语法上 与 C#、Java 8 和 CoffeeScript 中的相关功能类似。

他们都支持 表达式和both expression and statement bodies. Unlike functions, arrows share the same lexical this as their surrounding code. If an arrow is inside another function, it shares the "arguments" variable of its parent function.

```js
// Expression bodies
var odds = evens.map(v => v + 1);
var nums = evens.map((v, i) => v + i);

// Statement bodies
nums.forEach(v => {
  if (v % 5 === 0)
    fives.push(v);
});

// Lexical this
var bob = {
  _name: "Bob",
  _friends: [],
  printFriends() {
    this._friends.forEach(f =>
      console.log(this._name + " knows " + f));
  }
};

// Lexical arguments
function square() {
  let example = () => {
    let numbers = [];
    for (let number of arguments) {
      numbers.push(number * number);
    }

    return numbers;
  };

  return example();
}

square(2, 4, 7.5, 8, 11.5, 21); // returns: [4, 16, 56.25, 64, 132.25, 441]
```

# 类（Class）

ES2015 中的类（class）是在基于原型的面向对象模式上简单包装的语法糖。

拥有一个 单一且方便的声明形式将更易于使用，并且 鼓励混合使用。

类（class）支持基于原型的继承、super 调用、 实例和静态方法以及构造函数。

```js
class SkinnedMesh extends THREE.Mesh {
  constructor(geometry, materials) {
    super(geometry, materials);

    this.idMatrix = SkinnedMesh.defaultMatrix();
    this.bones = [];
    this.boneMatrices = [];
    //...
  }
  update(camera) {
    //...
    super.update();
  }
  static defaultMatrix() {
    return new THREE.Matrix4();
  }
}
```

# 增强的对象文字

对象文字被扩展以支持在构造时设置原型、foo 的简写：foo 赋值、定义方法和进行超级调用。 

在一起，这些也使对象文字和类声明更紧密地结合在一起，并使基于对象的设计受益于一些相同的便利。

```js
var obj = {
    // Sets the prototype. "__proto__" or '__proto__' would also work.
    __proto__: theProtoObj,
    // Computed property name does not set prototype or trigger early error for
    // duplicate __proto__ properties.
    ['__proto__']: somethingElse,
    // Shorthand for ‘handler: handler’
    handler,
    // Methods
    toString() {
     // Super calls
     return "d " + super.toString();
    },
    // Computed (dynamic) property names
    [ "prop_" + (() => 42)() ]: 42
};
```

`__proto__` 属性需要原生支持，并且在之前的 ECMAScript 版本中被弃用。 

大多数引擎现在支持该属性，但有些不支持。 

另请注意，仅需要 Web 浏览器来实现它，因为它在附件 B 中。它在 Node.js 中可用。

# 模板字符串

模板字符串为构造字符串提供了语法糖。这 类似于 Perl、Python 等语言中的字符串插值功能。

另外， 可以添加标签以允许自定义字符串构造，避免注入攻击或从字符串内容构造更高级别的数据结构。

```js
// 创建基本的字符串
`This is a pretty little template string.`

// 多行字符串
`In ES5 this is
 not legal.`

// 插入变量绑定的值
var name = "Bob", time = "today";
`Hello ${name}, how are you ${time}?`

// Unescaped template strings
String.raw`In ES5 "\n" is a line-feed.`

// Construct an HTTP request prefix is used to interpret the replacements and construction
GET`http://foo.org/bar?a=${a}&b=${b}
    Content-Type: application/json
    X-Credentials: ${credentials}
    { "foo": ${foo},
      "bar": ${bar}}`(myOnReadyStateChangeHandler);
```

# 解构（Destructuring）

解构（Destructuring）允许基于模式匹配的方式进行赋值，这种模式匹配能够支持 数组（arrays）和对象（objects）。

解构采取的是弱化故障的处理策略，类似于标准的对象 查找 foo["bar"]，在未找到时返回值为 undefined 。

```js
// list matching
var [a, ,b] = [1,2,3];
a === 1;
b === 3;

// object matching
var { op: a, lhs: { op: b }, rhs: c }
       = getASTNode()

// object matching shorthand
// binds `op`, `lhs` and `rhs` in scope
var {op, lhs, rhs} = getASTNode()

// Can be used in parameter position
function g({name: x}) {
  console.log(x);
}
g({name: 5})

// Fail-soft destructuring
var [a] = [];
a === undefined;

// Fail-soft destructuring with defaults
var [a = 1] = [];
a === 1;

// Destructuring + defaults arguments
function r({x, y, w = 10, h = 10}) {
  return x + y + w + h;
}
r({x:1, y:2}) === 23
```

# 默认 + 休息 + 点差

被调用方评估的默认参数值。 

在函数调用中将数组转换为连续的参数。 

将尾随参数绑定到数组。 

Rest 取代了对参数的需求，并更直接地解决了常见情况。

```js
function f(x, y=12) {
  // y is 12 if not passed (or passed as undefined)
  return x + y;
}
f(3) == 15
```

```js
function f(x, ...y) {
  // y is an Array
  return x * y.length;
}
f(3, "hello", true) == 6
```

```js
function f(x, y, z) {
  return x + y + z;
}
// Pass each elem of array as argument
f(...[1,2,3]) == 6
```

# Let + Const

限定在块级作用域的变量定义方式。

let 是新的 var。

const 定义的变量只能被 赋值一次。

静态限制可以防止在赋值前使用。

```js
function f() {
  {
    let x;
    {
      // 因为此变量是块级作用域，因此是 ok 的
      const x = "sneaky";
      // 错误，定义的变量只能被赋值一次
      x = "foo";
    }
    // 由于此变量是 `let` 定义的，因此是 ok 的
    x = "bar";
    // 错误，在同一块级作用域中已经被声明过了
    let x = "inner";
  }
}
```

# Iterators + For..Of

Iterator 对象支持自定义迭代，就像 CLR 的 IEnumerable 或 Java 的 Iterable。利用 for..of 将 for..in 归纳为基于自定义迭代器的迭代。 

不需要实现为一个数组，并且支持像 LINQ 一样的懒设计模式（lazy design patterns）。

```js
let fibonacci = {
  [Symbol.iterator]() {
    let pre = 0, cur = 1;
    return {
      next() {
        [pre, cur] = [cur, pre + cur];
        return { done: false, value: cur }
      }
    }
  }
}

for (var n of fibonacci) {
  // truncate the sequence at 1000
  if (n > 1000)
    break;
  console.log(n);
}
```

迭代（Iteration）就是基于这些假想类型的接口（使用 TypeScript 类型的语法仅用于阐述）实现的：

```js
interface IteratorResult {
  done: boolean;
  value: any;
}
interface Iterator {
  next(): IteratorResult;
}
interface Iterable {
  [Symbol.iterator](): Iterator
}
```

# 生成器

生成器使用 function* 和 yield 简化迭代器创作。 

声明为 function* 的函数返回一个 Generator 实例。 

生成器是迭代器的子类型，包括额外的 next 和 throw。 这些使值能够流回生成器，因此 yield 是一种返回值（或抛出）的表达式形式。

注意：也可用于启用类似‘await’的异步编程，另见 ES7 await 提案。

```js
var fibonacci = {
  [Symbol.iterator]: function*() {
    var pre = 0, cur = 1;
    for (;;) {
      var temp = pre;
      pre = cur;
      cur += temp;
      yield cur;
    }
  }
}

for (var n of fibonacci) {
  // truncate the sequence at 1000
  if (n > 1000)
    break;
  console.log(n);
}
```

生成器接口是（仅使用 TypeScript 类型语法进行说明）：

```js
interface Generator extends Iterator {
    next(value?: any): IteratorResult;
    throw(exception: any);
}
```

# Unicode

持续完善对 Unicode 的全面支持，包括让字符串支持新的 unicode 文本（literal） 以及正则表达式（RegExp）新增的 u 模式能够支持 unicode 码位（code point），还有新的 API 用以处理 21bit 码位（code point）级别的字符串。

这些新增的功能 让 JavaScript 可以构建全球化的应用程序。

```js
// same as ES5.1
"𠮷".length == 2

// new RegExp behaviour, opt-in ‘u’
"𠮷".match(/./u)[0].length == 2

// new form
"\u{20BB7}" == "𠮷"
"𠮷" == "\uD842\uDFB7"

// new String ops
"𠮷".codePointAt(0) == 0x20BB7

// for-of iterates code points
for(var c of "𠮷") {
  console.log(c);
}
```

# 模块

组件定义模块的语言级支持。 

编码来自流行 JavaScript 模块加载器（AMD、CommonJS）的模式。 

由主机定义的默认加载器定义的运行时行为。 

隐式异步模型——在请求的模块可用并得到处理之前，不会执行任何代码。

```js
// lib/math.js
export function sum(x, y) {
  return x + y;
}
export var pi = 3.141593;
```

```js
// app.js
import * as math from "lib/math";
console.log("2π = " + math.sum(math.pi, math.pi));
```

```js
// otherApp.js
import {sum, pi} from "lib/math";
console.log("2π = " + sum(pi, pi));
```

```js
// lib/mathplusplus.js
export * from "lib/math";
export var e = 2.71828182846;
export default function(x) {
    return Math.exp(x);
}
```

```js
// app.js
import exp, {pi, e} from "lib/mathplusplus";
console.log("e^π = " + exp(pi));
```

# 模块加载器

不是 ES2015 的一部分

这在 ECMAScript 2015 规范中保留为实现定义。 最终标准将在 WHATWG 的 Loader 规范中，但目前正在制定中。 

以下内容来自之前的 ES2015 草案。

模块加载器支持：

- 动态加载

- 状态隔离

- 全局命名空间隔离

- 编译钩子

- 嵌套虚拟化


可以配置默认的模块加载器，并且可以构建新的加载器来评估和加载孤立或受限上下文中的代码。

```js
// Dynamic loading – ‘System’ is default loader
System.import("lib/math").then(function(m) {
  alert("2π = " + m.sum(m.pi, m.pi));
});

// Create execution sandboxes – new Loaders
var loader = new Loader({
  global: fixup(window) // replace ‘console.log’
});
loader.eval("console.log(\"hello world!\");");

// Directly manipulate module cache
System.get("jquery");
System.set("jquery", Module({$: $})); // WARNING: not yet finalized
```

# Map + Set + WeakMap + WeakSet

通用算法的高效数据结构。 WeakMaps 提供了无泄漏的对象键的边表。

```js
// Sets
var s = new Set();
s.add("hello").add("goodbye").add("hello");
s.size === 2;
s.has("hello") === true;

// Maps
var m = new Map();
m.set("hello", 42);
m.set(s, 34);
m.get(s) == 34;

// Weak Maps
var wm = new WeakMap();
wm.set(s, { extra: 42 });
wm.size === undefined

// Weak Sets
var ws = new WeakSet();
ws.add({ data: 42 });
// Because the added object has no other references, it will not be held in the set
```

# Proxy（代理）

Proxy 能够创建具有宿主对象全部可用功能的对象。 

可用于拦截、对象虚拟化 日志/分析等。

```js
// 为普通对象创建 Proxy
var target = {};
var handler = {
  get: function (receiver, name) {
    return `Hello, ${name}!`;
  }
};

var p = new Proxy(target, handler);
p.world === "Hello, world!";
```

```js
// 为函数对象创建 Proxy
var target = function () { return "I am the target"; };
var handler = {
  apply: function (receiver, ...args) {
    return "I am the proxy";
  }
};

var p = new Proxy(target, handler);
p() === "I am the proxy";
```

所有运行时级别的元数据操作都提供了 trap（陷阱）功能：

```js
var handler =
{
  // target.prop
  get: ...,
  // target.prop = value
  set: ...,
  // 'prop' in target
  has: ...,
  // delete target.prop
  deleteProperty: ...,
  // target(...args)
  apply: ...,
  // new target(...args)
  construct: ...,
  // Object.getOwnPropertyDescriptor(target, 'prop')
  getOwnPropertyDescriptor: ...,
  // Object.defineProperty(target, 'prop', descriptor)
  defineProperty: ...,
  // Object.getPrototypeOf(target), Reflect.getPrototypeOf(target),
  // target.__proto__, object.isPrototypeOf(target), object instanceof target
  getPrototypeOf: ...,
  // Object.setPrototypeOf(target), Reflect.setPrototypeOf(target)
  setPrototypeOf: ...,
  // for (let i in target) {}
  enumerate: ...,
  // Object.keys(target)
  ownKeys: ...,
  // Object.preventExtensions(target)
  preventExtensions: ...,
  // Object.isExtensible(target)
  isExtensible :...
}
```

# 符号

符号启用对对象状态的访问控制。 

Symbols 允许属性由字符串（如 ES5）或符号键控。 

符号是一种新的原始类型。 

调试中使用的可选名称参数 - 但不是身份的一部分。

符号是唯一的（如 gensym），但不是私有的，因为它们是通过反射功能（如 Object.getOwnPropertySymbols）公开的。

```js
(function() {

  // module scoped symbol
  var key = Symbol("key");

  function MyClass(privateData) {
    this[key] = privateData;
  }

  MyClass.prototype = {
    doStuff: function() {
      ... this[key] ...
    }
  };

  // Limited support from Babel, full support requires native implementation.
  typeof key === "symbol"
})();

var c = new MyClass("hello")
c["key"] === undefined
```

# 可子类话的内置对象

在 ES2015 中，内置对象 Array、Date 以及 DOM Element 可以子类化。

```js
// User code of Array subclass
class MyArray extends Array {
    constructor(...args) { super(...args); }
}

var arr = new MyArray();
arr[1] = 12;
arr.length == 2
```

# Math + Number + String + Object APIs

许多新的库添加，包括核心数学库、数组转换助手和用于复制的 Object.assign。

```js
Number.EPSILON
Number.isInteger(Infinity) // false
Number.isNaN("NaN") // false

Math.acosh(3) // 1.762747174039086
Math.hypot(3, 4) // 5
Math.imul(Math.pow(2, 32) - 1, Math.pow(2, 32) - 2) // 2

"abcde".includes("cd") // true
"abc".repeat(3) // "abcabcabc"

Array.from(document.querySelectorAll("*")) // Returns a real Array
Array.of(1, 2, 3) // Similar to new Array(...), but without special one-arg behavior
[0, 0, 0].fill(7, 1) // [0,7,7]
[1,2,3].findIndex(x => x == 2) // 1
["a", "b", "c"].entries() // iterator [0, "a"], [1,"b"], [2,"c"]
["a", "b", "c"].keys() // iterator 0, 1, 2
["a", "b", "c"].values() // iterator "a", "b", "c"

Object.assign(Point, { origin: new Point(0,0) })
```

# 二进制和八进制字面量

增加了对二进制 (b) 和八进制 (o) 字面量的支持。

```js
0b111110111 === 503 // true
0o767 === 503 // true
```

# 承诺

Promises 是一个异步编程用的工具库。Promises 是第一种类对（将来可以使用的值的类）的表现形式。

```js
function timeout(duration = 0) {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, duration);
    })
}

var p = timeout(1000).then(() => {
    return timeout(2000);
}).then(() => {
    throw new Error("hmm");
}).catch(err => {
    return Promise.all([timeout(100), timeout(200)]);
})
```

# 反射API

全反射 API 公开对象上的运行时级元操作。

 这实际上是代理 API 的反面，并允许进行与代理陷阱相同的元操作对应的调用。 
 
 对于实现代理特别有用。

```js
var O = {a: 1};
Object.defineProperty(O, 'b', {value: 2});
O[Symbol('c')] = 3;

Reflect.ownKeys(O); // ['a', 'b', Symbol(c)]

function C(a, b){
  this.c = a + b;
}
var instance = Reflect.construct(C, [20, 22]);
instance.c; // 42
```

# 尾部调用（Tail Calls）

尾部调用不会让栈（stack）无限制地增长。这让 递归算法在面对不做限制的输入时能够安全执行

```js
function factorial(n, acc = 1) {
    "use strict";
    if (n <= 1) return acc;
    return factorial(n - 1, n * acc);
}

// 在如今的大部分实现中都将引起栈溢出（Stack overflow），
// 但是在 ES2015 中处理任意数量的输入都是安全的
factorial(100000)
```

# 参考资料

https://www.babeljs.cn/docs/learn

* any list
{:toc}