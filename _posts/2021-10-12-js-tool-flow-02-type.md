---
layout: post
title: JavaScript 代码的静态类型检查器 Flow 常见类型
date: 2021-10-12 21:01:55 +0800
categories: [FrontEnd]
tags: [front-end, tool, web, sh]
published: true
---

# 基本类型

Flow用起来是的确是简单，但里面的内容很多，主要原因是是要看实际不同的使用情况作搭配。

JavaScript里面的原始数据类型都有支持，而在函数、对象与一些新的ES6中的类，在搭配使用时就会比较复杂，详细的情况就请到官网文档查看，以下只能提供一些简单的介绍说明。

Flow所定义的基本类型与 js 的基本数据类型类似，包括:

boolean: 对应 js 的 Boolean 类型

number: 对应 js 的 Number 类型

string: 对应 js 的 String 类型

null: 对应 js 的 null

void: 对应 js 的 undefined

接下来，我们一个一个来看。

## Boolean 类型

```js
// @flow
function acceptsBoolean(value: boolean) {
  // ...
}

acceptsBoolean(true); // 成功！
acceptsBoolean(false); // 成功！
acceptsBoolean("foo"); // 报错！
acceptsBoolean(Boolean("foo")); // 报错！
acceptsBoolean(!!("foo")); // 报错！
```

从上面还可以看出，在Flow中，默认并不会转换类型。如果你需要转换类型请使用显示或隐式转换。

## Number 类型

```js
// @flow
function acceptsNumber(value: number) {
  // ...
}

acceptsNumber(42); // 成功！
acceptsNumber(3.14); // 成功！
acceptsNumber(NaN); // 成功！
acceptsNumber(Infinity); // 成功！
acceptsNumber("foo"); // 报错！
```

## String 类型

```js
// @flow
function acceptsString(value: string) {
  // ...
}

acceptsString("foo"); // 成功！
acceptsString("3.14"); // 成功！
acceptsString(3.14); // 报错！
acceptsString([]); // 报错！
```

## Null类型和Void类型

```js
// @flow
function acceptsNull(value: null) {
  /* ... */
}

function acceptsUndefined(value: void) {
  /* ... */
}

acceptsNull(null); // 成功！
acceptsNull(undefined); // 报错！
acceptsUndefined(null); // 报错！
acceptsUndefined(undefined); // 成功！
```

# 特殊类型

## Maybe(可能)类型

Maybe类型用一个 `?` 在类型前面表示，包含类型本身、null、undefined。

```js
// @flow

/* demo1 */
let hello: ?string; // 声明一个数据类型可以是 string, null, undefined 的变量

hello = null; // 赋值
hello = undefined; // 重新赋值
hello = 'hello'; // 重新赋值
hello = 1; //  报错！
hello = true; // 报错！

/* demo2 */
function acceptsMaybeString(value: ?string) {
  // ...
}

acceptsMaybeString("bar"); // 成功！
acceptsMaybeString(undefined); // 成功！
acceptsMaybeString(null); // 成功！
acceptsMaybeString(); // 成功！
```

## Optional(可选)类型

Optional一般用于对象属性或者函数参数，在名称后面加一个?，包含类型本身、undefined，注意，这里不包括null类型。

### 可选的对象属性

即对象类型可以具有可选属性，问号?位于属性名称后面。

```js
{ propertyName?: string }
```

除了它们的设定值类型之外，这些可选属性也可以被void完全省略。但是不能是null。

```js
// @flow
function acceptsObject(value: { foo?: string }) {
  // ...
}

acceptsObject({ foo: "bar" }); // 成功！
acceptsObject({ foo: undefined }); // 成功！
acceptsObject({ foo: null }); // 报错！
acceptsObject({ foo: true}); // 报错！
acceptsObject({}); // 成功！
```

### 可选的函数参数

即函数可以具有可选参数，其中问号?出现在参数名称后面。

同样，该参数不能为null。

```js
// @flow
function acceptsOptionalString(value?: string) {
  // ...
}

acceptsOptionalString("bar"); // 成功！
acceptsOptionalString(undefined); // 成功！
acceptsOptionalString(null); // 报错！
acceptsOptionalString(); // 成功！
```

## Literal(字面文字)类型

字面文字类型指的是以真实值作为数据类型，可用的值有三种，即数字、字符串或布尔值。

```js
// @flow

/* demo1 */
let hello: 'hello'; // 声明一个只能赋值 'hello' 的变量

hello = 'hello'; // 赋值成功！
hello = 'hi'; // 报错！
hello = 12; // 报错！
hello = undefined; // 报错！
hello = null; // 报错！

/* demo2 */
function method(param: 1 | 'hi' | boolean): void { /* ... */ }

method(); // 报错，缺少参数
method(1); // 成功！
method(1.2); // 报错，类型不对
method('hi'); // 成功！
method('hello'); // 报错，类型不对
method(true); // 成功！
method(false); // 成功！
```

## Mixed(混合)类型

Mixed类型是指任意数据类型。

```js
// @flow
let hello: mixed; // 声明一个 mixed 类型的变量

hello = 'hello'; // 赋值
hello = true; // 重新赋值
hello = 12; // 重新赋值
hello = undefined; // 重新赋值
hello = null; // 重新赋值
```

有时候我们并不能确定需要的值到底是哪种类型，这时候我们可以使用混合类型来表示，但在使用该值之前，我们需要判断该值到底是哪种类型，否则会引起错误。

```js
// @flow
function stringify(value: mixed) {
  return "" + value; 
}

stringify("foo");
```

如上面代码，运行之后就报错了，

```
Error ----------------------------------------------------------------------------------------------- src/index.js:12:10
Cannot add empty string and value because mixed [1] could either behave like a string or like a number.
　　src/index.js:12:10
　　12| return "" + value; // Error!
　　　　　　^^^^^^^^^^
References:
　　src/index.js:10:27
　　10| function stringify(value: mixed) {
　　　　　　　　　　　　　　^^^^^ [1]
Found 1 error
```

原因是虽然输入时可以用mixed，但Flow会认为函数中value的值不见得可以与string类型作相加，所以会请求你要在函数中的代码，要加入检查对传入类型在运行期间的类型检查代码，例如像下面修改过才能过关：

```js
// @flow
function stringify(value: mixed) {
  if (typeof value === 'string' || typeof value === 'number') {
    return "" + value; 
  } else {
    return value;
  }
}

stringify("foo");
```

从上面的例子可以看到Flow除了对类型会作检查外，它也会请求对某些类型需要有动态的检查。在官方的文件可以参考Type Refinements这个章节。

## Any(任意)类型

如果你想要一种方法来选择不使用类型检查器，或是还在开发中正在调试时，有一种作为渐进的改善代码的类型。

Any类型就可以做到这一点。但是切记，使用Any是不安全的，因为会失去类型检查，应尽可能避免使用。

例如，下面的代码不会报告任何提示：

```js
// @flow
function add(one: any, two: any): number {
  return one + two;
}

add(1, 2); // 成功！
add("1", "2"); // 成功！
add("1", 2); // 成功！
add({}, []); // 成功！
```

当然还不止上面的问题，使用Any类型还可能会出现即使是会导致运行时错误的代码也不会被Flow捕获。

```js
// @flow
function getObjProperty(obj: any) {
  return obj.a.b;
}

getObjProperty({});  // No Errors !
```

上面这段代码明显错误（Uncaught TypeError: Cannot read property 'b' of undefined），但是由于Any类型的存在，Flow并没有捕捉到错误，反而通过了检查。

## Type Alias(类型别名)

Type Alias提供了可以预先定义与集中代码中所需要的类型，一个简单的例子如下：

```js
// @flow
type T = Array<string>;
let x: T = [];
x["Hi"] = 2; // 报错！
```

Type Alias也可以用于复杂的应用情况，详见Flow官网提供的Type Aliases这一章节。

## Union(联合)类型

所有的类型都可以使用垂直线符号|作为联合使用(也就是 OR 的意思)，例如string | number指的是两种类型其中一种都可使用，这是一种联合的类型，称为Union类型。

```js
// @flow
type U = number | string;
let x: U = 1; // 成功！
x = "two"; // 成功！
x = true; // 报错！
```

# 复合类型

## Array(数组)类型

要创建一个数组类型，可以使用 `Array<Type>` 类型，其中 Type 是数组中元素的类型。

例如，为你使用的数字数组创建一个类型 `Array<number>`，这样子就会限定数组中的值只能使用数字的数据类型。

当然你也可以加入埀直线(`|`)来定义允许多种类型，例如 `Array<number|string>`。

```js
// @flow
let arr1: Array<number> = [1, 2, 3]; // 成功！
let arr2: Array<number> = [1, '2', true]; // 报错！'2' 和 true 并非是number类型。
let arr3: Array<number | string | boolean> = [1,'2',true];  // 成功！
let arr4: Array<mixed> = [1,'2',true]; // 声明一个元素是任意类型的数组
arr4 = [true, 1]; // 重新赋值 
arr4 = ['']; // 重新赋值
```

暂时就介绍这么多，还有一些类型文章中没有提到，更多更详细的内容请在Flow官网的Array Types章节中查看。

## Object(对象)类型

对象类型会尝试尽可能多地匹配JavaScript中对象的语法，也是使用大括号{}和key:value这样的键值对来表示，用,隔开各个键值对。

```js
// @flow
var obj1: { foo: boolean } = { foo: true };
var obj2: {
  foo: number,
  bar: boolean,
  baz: string,
} = {
  foo: 1,
  bar: true,
  baz: 'three',
};
```

### 可选的对象属性

即对象类型可以具有可选属性。

在JavaScript中，访问不存在的属性，返回的结果为undefined。这是JavaScript程序中常见的错误，因此Flow将这些错误转换为类型错误。

```js
// @flow
var obj = { foo: "bar" };

obj.bar;
```

运行一下FLow，显示的结果如下，

```
Error ------------------------------------------------------------------------------------------------- src/index.js:4:1
Cannot get obj.bar because property bar is missing in object literal [1].
　　src/index.js:4:1
　　4| obj.bar;
　　　^^^^^^^
References:
　　src/index.js:2:11
　　2| var obj = { foo: "bar" };
　　　　　　　　^^^^^^^^^^ [1]
Found 1 error
```

如果对象有时没有属性，可以通过添加问号?使其成为可选属性，问号?位于属性名称后面，{属性名称?: 类型}。

```js
// @flow
var obj: { foo?: boolean } = {};

obj.foo = true;    // 成功！

obj.foo = 'hello'; // 报错！
```

值得注意的是，可选属性值可以是void或省略（什么都不写），但是不能是null。

```js
// @flow
function acceptsObject(value: { foo?: string }) {
  // ...
}

acceptsObject({ foo: "bar" });     // 成功！
acceptsObject({ foo: undefined });    // 成功！
acceptsObject({});    // 成功！
acceptsObject({ foo: null });    // 报错！
```

## 对象类型推导

Flow有两种不同的方式推导出对象字面量的类型。

### Sealed objects(密封的对象)

在Flow中创建一个密封的对象类型的方法是创建一个带有属性的对象。密封的对象知道你声明的所有属性及其值的类型。

```js
// @flow
var obj = {
  foo: 1,
  bar: true,
  baz: 'three'
};

var foo: number  = obj.foo;   // 成功！
var bar: boolean = obj.bar;   // 成功！

var baz: null    = obj.baz;   // 报错！
var bat: string  = obj.bat;   // 报错！
```

Flow不允许你为密封对象添加新的属性。

```js
// @flow
var obj = {
  foo: 1
};

obj.bar = true;    // 报错！
obj.baz = 'three';   // 报错！
```

这里的解决方法是将对象转换为未密封的对象。

### Unsealed objects(未密封的对象)

在Flow中创建一个未密封的对象类型的方法是创建一个带没有属性的对象。

未密封的对象不知道你声明的所有属性及其值的类型，并且允许你为其添加新的属性。

```js
// @flow
var obj = {};

obj.foo = 1;    // 成功！
obj.bar = true;    // 成功！
obj.baz = 'three';    // 成功！
var foo: number  = obj.foo;    // 成功！
```

为未密封对象属性重新赋值

与var和let变量相似，你可以改变未密封的对象的属性值。

Flow会为你设置可能的类型。

```js
// @flow
var obj = {};

if (Math.random()) obj.prop = true;
else obj.prop = "hello";

var val1: boolean = obj.prop;     // 报错！
var val2: string  = obj.prop;     // 报错！
var val3: boolean | string = obj.prop;   // 成功！
var val4: boolean | string | number = obj.prop;  // 成功！
var val5: mixed = obj.prop;  // 成功！
```

上一章节说过，Flow会对代码进行动态检查，由于obj.prop的类型可能为boolean或者string，所以接收改属性的变量类型也应该是（至少）能够接收这两种类型的变量，给单一类型的变量的赋值是会失败的。

当然，当Flow可以确定重新分配后的属性类型时，Flow会为其分配确定的类型。

```js
// @flow
var obj = {};

obj.prop = true;
obj.prop = "hello";

var val1: boolean = obj.prop;    // 报错！
var val2: string  = obj.prop;   // 成功！
```

未密封对象上的未知属性查找是不安全的

未密封的对象允许随时写入新的属性。Flow确保读取与写入兼容，但不能确保写入发生在读取之前（按执行顺序）。

这意味着Flow对于从未密封对象中读取未知属性查，并且进行其它写入的这种行为是不做检查的。

```js
var obj = {};

obj.foo = 1;
obj.bar = true;

var foo: number  = obj.foo;  // 成功！
var bar: boolean = obj.bar;  // 成功！
var baz: string  = obj.baz;  // 成功！？这里确实是成功了。
```

Flow的这种不安全行为，未来可能被改进。

## 确切的对象类型

在Flow中，在预期正常对象类型的情况下传递具有额外属性的对象是安全的。

```js
// @flow
function method(obj: { foo: string }) {
  // ...
}

method({
  foo: "test",
  bar: 42
});
```

上面的这种写法是允许的，也是安全的。

这是一种通常被称为“宽度子类型”的子类型，因为“更宽”（即具有更多属性）的类型是更窄类型的子类型。

不过，有时候你的代码就只需要传入你想要的类型数据，并不想传入一些不必要的数据，那么这时候阻止这种行为并且只允许一组特定的属性是必要的。为此，Flow有了以下的做法，

```js
{| foo: string, bar: number |}
```

与常规对象类型不同，将具有“额外”属性的对象传递给确切的对象类型是无效的。

```js
// @flow
var foo: {| foo: string |} = { foo: "Hello", bar: "World!" };    // 报错！
```

```
Error ------------------------------------------------------------------------------------------------ src/index.js:2:30
Cannot assign object literal to foo because property bar is missing in object type [1] but exists in object
literal [2].
　　src/index.js:2:30
　　2| var foo: {| foo: string |} = { foo: "Hello", bar: "World!" };
　　　　　　　　　　　　　　　^^^^^^^^^^^^^^^^^^^^^^^^^ [2]
References:
　　src/index.js:2:10
　　2| var foo: {| foo: string |} = { foo: "Hello", bar: "World!" };
　　　　　　　^^^^^^^^^^^^^ [1]
Found 1 error
```

关于`Object`类型，更多更详细的内容请在Flow官网的[Object Types](https://flow.org/en/docs/types/objects/)章节中查看。


# 参考资料

https://www.kancloud.cn/sllyli/flow/1141892

* any list
{:toc}