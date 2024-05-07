---
layout: post
title: Typescript-01-overview 概览入门
date:  2021-3-09 16:52:15 +0800
categories: [Web]
tags: [web, js, typescript, ts, ts-learn, js-learn, typescript-learn, sh]
published: true
---

# Typescript

[Typescript](https://www.tslang.cn/)  是 JavaScript 的一个超集，支持 ECMAScript 6 标准（ES6 教程）。

TypeScript 由微软开发的自由和开源的编程语言。

TypeScript 设计目标是开发大型应用，它可以编译成纯 JavaScript，编译出来的 JavaScript 可以运行在任何浏览器上。

# 特性

## 始于JavaScript，归于JavaScript

TypeScript从今天数以百万计的JavaScript开发者所熟悉的语法和语义开始。使用现有的JavaScript代码，包括流行的JavaScript库，并从JavaScript代码中调用TypeScript代码。

TypeScript可以编译出纯净、 简洁的JavaScript代码，并且可以运行在任何浏览器上、Node.js环境中和任何支持ECMAScript 3（或更高版本）的JavaScript引擎中。

## 强大的工具构建 大型应用程序

类型允许JavaScript开发者在开发JavaScript应用程序时使用高效的开发工具和常用操作比如静态检查和代码重构。

类型是可选的，类型推断让一些类型的注释使你的代码的静态验证有很大的不同。类型让你定义软件组件之间的接口和洞察现有JavaScript库的行为。

## 先进的 JavaScript

TypeScript提供最新的和不断发展的JavaScript特性，包括那些来自2015年的ECMAScript和未来的提案中的特性，比如异步功能和Decorators，以帮助建立健壮的组件。

这些特性为高可信应用程序开发时是可用的，但是会被编译成简洁的ECMAScript3（或更新版本）的JavaScript。

# Q1-ts 可以用来做什么

TypeScript (TS) 是一种开源的编程语言，它是 JavaScript 的超集，意味着所有的 JavaScript 代码都可以在 TypeScript 中运行。

TypeScript 添加了静态类型检查和一些新的特性，以提高代码的可读性、可维护性和可扩展性。

以下是 TypeScript 的一些主要用途：

1. 静态类型检查：TypeScript 允许在编译时进行静态类型检查，帮助捕获潜在的类型错误，并提供更好的代码提示和自动补全功能。

2. ES6+ 特性支持：TypeScript 支持 ECMAScript 6 及以上版本的语法和特性，如箭头函数、模块化、类、解构赋值等。

3. 类型注解和接口：TypeScript 提供了类型注解和接口的功能，可以明确地定义变量、函数和对象的类型，使代码更具可读性和可维护性。

4. 代码重构和智能感知：TypeScript 提供了强大的重构工具和智能感知功能，可以帮助开发人员快速重构代码、查找错误和提供更好的开发体验。

5. 与 JavaScript 生态系统的兼容性：由于 TypeScript 是 JavaScript 的超集，所以现有的 JavaScript 代码可以逐步迁移到 TypeScript，而不需要修改现有的代码。

6. 大型应用程序开发：TypeScript 的静态类型检查和模块化系统使其非常适合开发大型应用程序，可以提供更好的可维护性和可扩展性。

总而言之，TypeScript 是一个强大的编程语言，可以提供更好的开发工具和语言特性，以提高 JavaScript 代码的质量和开发效率。

# Q2-给一个 ts 的入门例子

当然！以下是一个简单的 TypeScript 入门例子，展示了如何定义变量、函数和类，并进行类型注解：

```ts
// 定义一个变量
let message: string = "Hello, TypeScript!";

// 定义一个函数
function greet(name: string): void {
  console.log(`Hello, ${name}!`);
}

// 调用函数
greet("Alice");

// 定义一个类
class Person {
  private name: string;

  constructor(name: string) {
    this.name = name;
  }

  greet(): void {
    console.log(`Hello, my name is ${this.name}.`);
  }
}

// 创建一个对象并调用方法
const person = new Person("Bob");
person.greet();
```

在这个例子中，我们首先定义了一个变量  `message` ，并指定它的类型为  `string` 。

然后，我们定义了一个函数  `greet` ，它接收一个  `name`  参数，并在控制台输出问候语。接着，我们调用了这个函数并传入一个字符串参数。

最后，我们定义了一个类  `Person` ，它有一个私有属性  `name`  和一个公共方法  `greet` ，用于输出个人信息。

我们创建了一个  `Person`  对象，并调用了它的  `greet`  方法。

这只是一个简单的 TypeScript 入门示例，帮助你了解如何使用类型注解和定义变量、函数和类。

你可以通过编译器来编译和运行这段代码，或者将其嵌入到你的项目中进行实际应用。

# 参考资料

[vscode插件开发教程](https://www.jianshu.com/p/e642856f6044)

https://www.runoob.com/typescript/ts-install.html

* any list
{:toc}