---
layout: post
title: Typescript-03-basic syntax 基本语法
date:  2021-3-09 16:52:15 +0800
categories: [Web]
tags: [web, js, typescript, ts, ts-learn, js-learn, typescript-learn, sh]
published: true
---

# TypeScript 基础语法

TypeScript 程序由以下几个部分组成：

- 模块

- 函数

- 变量

- 语句和表达式

- 注释

# TSC 编译

可以一次编译多个 ts 文件：

```
tsc file1.ts file2.ts file3.ts
```

## 编译参数

| 参数 | 说明 |
|:---|:---|
| --help | 显示帮助信息 |
| --module | 载入扩展模块 |
| --target | 设置 ECMA 版本 |
| --declaration | 额外生成一个 .d.ts 扩展名的文件。 |
| tsc ts-hw.ts --declaration | 以上命令会生成 ts-hw.d.ts、ts-hw.js 两个文件。 |
| --removeComments | 删除文件的注释 |
| --out | 编译多个文件并合并到一个输出的文件 |
| --sourcemap | 生成一个 sourcemap (.map) 文件。sourcemap 是一个存储源代码与编译代码对应位置映射的信息文件。 |
| --module noImplicitAny | 在表达式和声明上有隐含的 any 类型时报错 |
| --watch | 在监视模式下运行编译器。会监视输出文件，在它们改变时重新编译。 |

# TypeScript 保留关键字

TypeScript 保留关键字如下表所示：

```
break 	    as 	        catch 	    switch
case 	    if 	        throw 	    else
var 	    number 	    string 	    get
module 	    type 	    instanceof 	typeof
public 	    private     enum 	    export
finally     for 	    while 	    void
null 	    super 	    this 	    new
in 	        return 	    true 	    false
any 	    extends 	static 	    let
package     implements 	interface 	function
new 	    try 	    yield 	    const
continue 	do 	  	 
```

#  空白和换行

TypeScript 会忽略程序中出现的空格、制表符和换行符。

空格、制表符通常用来缩进代码，使代码易于阅读和理解。

# TypeScript 区分大小写

TypeScript 区分大写和小写字符。

# 分号是可选的

每行指令都是一段语句，你可以使用分号或不使用， 分号在 TypeScript 中是可选的，建议使用。

以下代码都是合法的：

```
console.log("Hello")
console.log("Hello");
```

如果语句写在同一行则一定需要使用分号来分隔，否则会报错，如：

```
console.log("Hello");console.log("Hello");
```

# TypeScript 注释

注释是一个良好的习惯，虽然很多程序员讨厌注释，但还是建议你在每段代码写上文字说明。

注释可以提高程序的可读性。

注释可以包含有关程序一些信息，如代码的作者，有关函数的说明等。

编译器会忽略注释。

## 注释方式

TypeScript 支持两种类型的注释

```
单行注释 ( // ) − 在 // 后面的文字都是注释内容。

多行注释 (/* */) − 这种注释可以跨越多行。
```

实际例子：

```js
// 这是一个单行注释
 
/* 
 这是一个多行注释 
 这是一个多行注释 
 这是一个多行注释 
*/
```

# TypeScript 与面向对象

面向对象是一种对现实世界理解和抽象的方法。

TypeScript 是一种面向对象的编程语言。

## 概念

面向对象主要有两个概念：对象和类。

对象：对象是类的一个实例，有状态和行为。例如，一条狗是一个对象，它的状态有：颜色、名字、品种；行为有：摇尾巴、叫、吃等。

类：类是一个模板，它描述一类对象的行为和状态。

方法：方法是类的操作的实现步骤。

## 实际例子

TypeScript 面向对象编程实例：

```js
class Person {
    name(): void {
        console.log("hello ts!");
    }
};

var obj = new Person();
obj.name();
```

以上实例定义了一个类 Site，该类有一个方法 name()，该方法在终端上输出字符串 Runoob。

new 关键字创建类的对象，该对象调用方法 name()。

编译后生成的 JavaScript 代码如下：

```js
var Person = /** @class */ (function () {
    function Person() {
    }
    Person.prototype.name = function () {
        console.log("hello ts!");
    };
    return Person;
}());
;
var obj = new Person();
obj.name();
```

# 参考资料

https://www.runoob.com/typescript/ts-basic-syntax.html

* any list
{:toc}
