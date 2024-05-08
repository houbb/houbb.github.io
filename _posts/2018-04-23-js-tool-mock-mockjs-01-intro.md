---
layout: post
title:  mockjs 生成随机数据，拦截 Ajax 请求
date:  2018-04-23 09:19:44 +0800
categories: [JS]
tags: [js, mockjs, mock, learn]
published: true
---

# Mock.js

## 模拟请求与模拟数据

[![Build Status](https://travis-ci.org/nuysoft/Mock.svg?branch=refactoring)](https://travis-ci.org/nuysoft/Mock)

Mock.js 是一个模拟数据生成器，帮助前端开发与后端开发分离进行，减少编写自动化测试时的单调性。

官方网站：[http://mockjs.com](http://mockjs.com)

## 特性

* 根据数据模板生成模拟数据
* 为 ajax 请求提供请求/响应模拟
* ~~根据基于 HTML 的模板生成模拟数据~~

这个库受到了 Elijah Manor 的文章 [Mocking Introduction](http://www.elijahmanor.com/2013/04/angry-birds-of-javascript-green-bird.html)，[mennovanslooten/mockJSON](https://github.com/mennovanslooten/mockJSON)，[appendto/jquery-mockjax](https://github.com/appendto/jquery-mockjax) 和 [victorquinn/chancejs](https://github.com/victorquinn/chancejs/) 的启发。

## 疑问？
如果您有任何问题，请随时通过 [New Issue](https://github.com/nuysoft/Mock/issues/new) 提问。

## 报告问题
确保您要解决的问题是可复现的。使用 <http://jsbin.com/> 或 <http://jsfiddle.net/> 提供一个测试页面。指明问题可以在哪些浏览器中复现。Mock.js 的哪个版本可以复现这个问题。更新到最新版本后是否还可以复现？

## 许可证
Mock.js 根据 [MIT License](./LICENSE) 条款可用。

#  mockjs

前后端分离
让前端攻城师独立于后端进行开发。

增加单元测试的真实性
通过随机数据，模拟各种场景。

开发无侵入
不需要修改既有代码，就可以拦截 Ajax 请求，返回模拟的响应数据。

用法简单
符合直觉的接口。

数据类型丰富
支持生成随机的文本、数字、布尔值、日期、邮箱、链接、图片、颜色等。

方便扩展
支持支持扩展更多数据类型，支持自定义函数和正则。

# 例子

http://mockjs.com/examples.html


# chat

## 介绍一下 mockjs

Mock.js 是一个基于 JavaScript 的模拟数据生成工具，它可以帮助前端开发者在没有后端接口的情况下进行开发和原型制作。

使用 Mock.js，开发者可以生成大量的虚拟数据，用于模拟 API 响应、创建测试数据等，从而提高开发效率并减少对后端实现的依赖。

以下是 Mock.js 的一些核心特性：

1. **数据模板定义**：Mock.js 允许你通过 JSON 格式定义数据模板，然后基于这些模板生成模拟数据。

2. **丰富的数据占位符**：提供了一系列的占位符函数，可以生成各种类型的模拟数据，如随机字符串、数字、日期等。

3. **自定义函数**：支持编写自定义的占位符函数，以满足特定的数据生成需求。

4. **扩展性**：可以通过扩展现有的占位符函数或添加新的函数来扩展 Mock.js 的功能。

5. **Ajax 响应模拟**：可以模拟 AJAX 请求的响应，方便前端在没有后端支持的情况下进行开发。

6. **命令行工具**：提供了命令行工具，可以快速生成模拟数据。

7. **简洁的 API**：Mock.js 的 API 设计简洁，易于学习和使用。

8. **跨框架使用**：虽然 Mock.js 常用于与 React 和 Vue 等前端框架结合使用，但它本身不依赖于任何框架，可以独立使用。

9. **社区支持**：作为一个流行的工具，Mock.js 拥有活跃的社区支持，你可以找到大量的教程和资源。

使用 Mock.js 的基本步骤通常包括：

1. **安装**：可以通过 npm 或 yarn 安装 Mock.js。

   ```bash
   npm install mockjs --save-dev
   ```

2. **定义模板**：创建一个 JSON 格式的模板文件，定义所需的模拟数据结构。

3. **生成数据**：使用 Mock.js 的 `mock` 函数和模板来生成模拟数据。

   ```javascript
   const { mock } = require('mockjs');
   const data = mock({
     'list|1-10': [
       {
         'id|+1': 1
       }
     ]
   });
   ```

4. **使用数据**：在前端应用中使用生成的模拟数据，例如渲染到页面或作为 AJAX 响应。

5. **模拟 AJAX 响应**：使用 Mock.js 拦截 AJAX 请求，并返回模拟数据。

   ```javascript
   const { XMLHttpRequest } = require('mockjs');
   const url = '/api/list';
   const template = {
     'list|1-10': [{
       'id|+1': 1
     }]
   };
   mock(url, template);
   ```

6. **测试和调试**：在开发和测试过程中使用 Mock.js 生成的数据进行调试。

Mock.js 是前端开发中非常实用的工具，它通过提供模拟数据，使得前端开发可以独立于后端进行，加快了开发进度并提高了开发体验。


## 给出一个 mock.js 入门使用的例子

当然可以。以下是一个使用 Mock.js 生成模拟数据的简单入门示例：

1. **安装 Mock.js**：首先，确保你已经安装了 Node.js 和 npm。然后，使用 npm 安装 Mock.js。

   ```bash
   npm install mockjs --save-dev
   ```

2. **编写示例代码**：在你的项目中创建一个名为 `example.js` 的文件，并添加以下内容。

   ```javascript
   const Mock = require('mockjs');

   // 定义一个对象模板，模拟生成一个具有特定结构的数据对象
   const dataTemplate = {
     'user|1-10': [{
       'name': '@cname()',    // 生成一个常见的中文姓名
       'age|18-28': 1,       // 生成一个 18 到 28 之间的数字
       'email': '@email()',   // 生成一个邮箱地址
     }]
   };

   // 使用 Mock.mock() 方法根据模板生成数据
   const data = Mock.mock(dataTemplate);

   // 输出生成的数据查看结果
   console.log(data);
   ```

3. **运行示例**：在命令行中，运行你的 `example.js` 文件。

   ```bash
   node example.js
   ```

执行上述命令后，你将在控制台看到 Mock.js 生成的模拟数据。每次运行脚本时，都会基于你定义的模板生成新的随机数据。

这个简单的例子演示了如何使用 Mock.js 的基本功能来生成模拟数据。

在实际开发中，你可以根据需要定义更复杂的模板，生成更多样化的数据，用于前端开发和测试。


测试结果如下：

```json
{
  user: [
    { name: '叶娟', age: 26, email: 's.rllpul@vovs.ro' },
    { name: '朱艳', age: 24, email: 'p.vyxlvi@cffrnb.lv' },
    { name: '韩明', age: 19, email: 'q.nozxvnotx@qfpfia.gt' },
    { name: '江军', age: 21, email: 'j.lvlriqcf@oeecmsqeg.zw' },
    { name: '吴娜', age: 27, email: 'm.dfgvgt@zlofqknx.bm' },
    { name: '邓敏', age: 26, email: 'g.ttbcahp@tntonkgfo.th' },
    { name: '毛娜', age: 19, email: 'y.hrvoe@cuckocddec.be' },
    { name: '邹强', age: 22, email: 'w.kgda@iypk.pro' }
  ]
}
```

# 教程

[Overview of ECMAScript 6 features](https://github.com/lukehoban/es6features)

[JavaScript 教程](https://wangdoc.com/javascript)

js 系列

es6 系列 

nodejs 系列

ts 系列

# chat

## 类似于 mockjs 的库有哪些？

类似于Mock.js的库主要提供模拟数据生成、Ajax请求模拟等功能，帮助开发者在没有后端支持的情况下进行前端开发和测试。

以下是一些类似于Mock.js的库：

1. **TestableMock**：由Alibaba开源的Mock工具，它允许开发者在单元测试中轻松Mock外部依赖、私有方法、静态方法等，使用`@MockMethod`注解来定义Mock方法。

2. **json-server**：可以快速启动一个模拟REST API服务器，用于前端开发和测试，支持增删改查操作的真实模拟。

3. **Faker.js**：一个用于生成伪造数据的库，可以生成多种类型的“真实”数据，如姓名、地址、电话号码等，适用于测试和填充数据库。

4. **EasyMock**：基于Mock.js语法规则的Mock工具，能够满足大部分使用需求，但不支持定制复杂接口。

5. **RAP**：一个由Alibaba开发的接口管理平台，也提供了Mock功能，支持接口的模拟。

6. **Fig-mock**（别名飞哥）：一款新的Mock工具，集成了多种Mock功能，支持REST API风格。

7. **Mocky**：一个在线工具，允许用户快速创建模拟API，可以自定义响应数据和延迟。

8. **Mirage JS**：一个用于API模拟和前端自动化测试的库，支持在开发环境中模拟API请求。

9. **Swagger**：虽然主要用于API文档生成，但也提供了Mock服务器的功能，可以根据定义的API规范生成模拟数据。

10. **Hapi.js**：一个用于构建Node.js应用的框架，它包含了一个简单的Mock服务器功能。

这些库各有特点，开发者可以根据项目需求和个人偏好选择合适的工具。

# 参考资料

https://github.com/nuysoft/Mock/wiki/Getting-Started

* any list
{:toc}