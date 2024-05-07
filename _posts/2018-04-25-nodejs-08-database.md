---
layout: post
title:  NodeJs-08-database access js 如何直接访问数据库实战
date:  2018-05-02 20:35:38 +0800
categories: [NodeJs]
tags: [js, nodejs, nodejs-learn, js-learn]
published: true
---

# Q1-js 可以直接和数据库交互吗？

JavaScript 本身不能直接与数据库交互，但在 Web 应用程序中，可以使用 JavaScript 操作数据库。

通常情况下，JavaScript 通过 AJAX 请求从服务器获取数据，然后将数据呈现给用户。

在服务器端，可以使用 Node.js 运行 JavaScript 代码，并使用 Node.js 提供的模块来连接数据库。

例如，可以使用  `mysql`  模块来连接 MySQL 数据库，或使用  `mongodb`  模块来连接 MongoDB 数据库。

以下是一个使用 Node.js 和 MySQL 进行数据库操作的例子：

```js
const mysql = require('mysql');

// 创建数据库连接池
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'mydatabase'
});

// 查询数据
pool.query('SELECT * FROM mytable', (error, results, fields) => {
  if (error) {
    console.error(error);
    return;
  }
  console.log(results);
});

// 插入数据
const data = { name: 'Alice', age: 20 };
pool.query('INSERT INTO mytable SET ?', data, (error, results, fields) => {
  if (error) {
    console.error(error);
    return;
  }
  console.log(results);
});
```

在这个例子中，我们首先使用  `mysql`  模块创建了一个数据库连接池，然后使用  `pool.query`  方法进行数据库查询和插入操作。 

`pool.query`  方法接收 SQL 查询语句和回调函数作为参数，当查询完成时，回调函数将被调用，并传递查询结果和错误信息。

需要注意的是，直接在客户端使用 JavaScript 操作数据库存在一定的安全风险，因为客户端代码可以被用户轻易地修改和篡改。通常情况下，建议将数据库操作放在服务器端进行，以提高安全性和可靠性。


# 实际测试

## 查看建表语句

```sql
show create table TABLE_NAME
```

如下：

```
mysql> show create table person;
+--------+----------------------------------------------------------------------------------------------------------------------+
| Table  | Create Table                                                                                                         |
+--------+----------------------------------------------------------------------------------------------------------------------+
| person | CREATE TABLE "person" (
  "ID" int(11) NOT NULL,
  "NAME" varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 |
+--------+----------------------------------------------------------------------------------------------------------------------+
1 row in set (0.00 sec)
```

我们找一个简单的表，只有2个字段。

## 数据初始化

```sql
insert into person() values (1, '1');
insert into person() values (2, '2');
```

验证：

```
mysql> select * from person;
+----+------+
| ID | NAME |
+----+------+
|  1 | 1    |
|  2 | 2    |
+----+------+
2 rows in set (0.00 sec)
```

## 实际编写

- mysql-access.js

```js
const mysql = require('mysql');

// 创建数据库连接池
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'test'
});

// 查询数据
pool.query('SELECT * FROM person', (error, results, fields) => {
  if (error) {
    console.error(error);
    return;
  }
  console.log(results);
});

// 插入数据
const data = { name: 'Alice', id: 20 };
pool.query('INSERT INTO person SET ?', data, (error, results, fields) => {
  if (error) {
    console.error(error);
    return;
  }
  console.log(results);
});
```

## 运行测试

### 如何运行？

要在Node.js中运行一个JavaScript文件，您可以按照以下步骤进行操作：

1. 确保您已经安装了Node.js。如果尚未安装，请前往Node.js官方网站（https://nodejs.org/）下载并安装最新版本。

2. 创建一个新的文本文件，并将其保存为 `your_file_name.js` ，其中 `your_file_name` 是您想要的文件名。

3. 在该文件中编写您的JavaScript代码。

4. 打开终端或命令提示符，并导航到包含您的JavaScript文件的目录。

5. 在终端或命令提示符中运行以下命令：
node your_file_name.js
请将 `your_file_name.js` 替换为您实际的JavaScript文件名。

Node.js将执行您的JavaScript文件，并在终端或命令提示符中显示输出（如果有的话）。

希望这可以帮助到您！


### 实战

```
node mysql-access.js
```

报错：

```
λ node mysql-access.js
node:internal/modules/cjs/loader:936
  throw err;
  ^

Error: Cannot find module 'mysql'
Require stack:
- D:\code\nodejs\mysql-access.js
    at Function.Module._resolveFilename (node:internal/modules/cjs/loader:933:15)
    at Function.Module._load (node:internal/modules/cjs/loader:778:27)
    at Module.require (node:internal/modules/cjs/loader:1005:19)
    at require (node:internal/modules/cjs/helpers:102:18)
    at Object.<anonymous> (D:\code\nodejs\mysql-access.js:1:15)
    at Module._compile (node:internal/modules/cjs/loader:1105:14)
    at Object.Module._extensions..js (node:internal/modules/cjs/loader:1159:10)
    at Module.load (node:internal/modules/cjs/loader:981:32)
    at Function.Module._load (node:internal/modules/cjs/loader:822:12)
    at Function.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:77:12) {
  code: 'MODULE_NOT_FOUND',
  requireStack: [ 'D:\\code\\nodejs\\mysql-access.js' ]
}
```

#### Q1-报错 Error: Cannot find module 'mysql' Require stack:，怎么处理？

报错信息 "Error: Cannot find module 'mysql'" 表示在您的代码中尝试导入 'mysql' 模块时出现了问题。这通常是由于缺少相关的依赖项或未正确安装 'mysql' 模块引起的。

要解决这个问题，您可以尝试以下几个步骤：

1. 确保您已经在您的项目中正确安装了 'mysql' 模块。您可以使用以下命令来安装：

```
npm install mysql
```

2. 如果您已经安装了 'mysql' 模块，但仍然出现该错误，请确保您的项目文件夹中包含一个名为 'node_modules' 的文件夹，并且 'mysql' 模块位于其中。如果该文件夹不存在或缺少 'mysql' 模块，请运行上述  `npm install mysql`  命令来安装它。

3. 如果您的项目位于一个子文件夹中，而 'mysql' 模块位于父文件夹或其他位置，那么您需要确保在导入 'mysql' 模块时使用正确的相对路径或绝对路径。

4. 如果您的项目使用了 package.json 文件来管理依赖项，您可以检查该文件中是否包含 'mysql' 模块的正确版本。

如果您仍然遇到问题，请检查您的环境和安装，并确保遵循正确的安装和导入步骤。

#### Q2-刚才给的 nodejs 访问 mysql 的例子，对应的 package.json 文件应该如何编写？

在package.json文件中，您需要指定项目所需的依赖项，包括"mysql"模块。

以下是一个示例 package.json 文件的基本结构：

```json
{
  "name": "your_project_name",
  "version": "1.0.0",
  "description": "Your project description",
  "main": "your_main_file.js",
  "dependencies": {
    "mysql": "latest_version"
  }
}
```

请将以下内容替换为实际信息：
- "your_project_name"：您的项目名称。
- "your_main_file.js"：您的主要JavaScript文件的文件名。
- "Your project description"：您的项目描述。
- "latest_version"：您希望使用的mysql模块的最新版本号。

在dependencies部分，您可以指定所需的其他依赖项及其版本号。

在这个例子中，我们只关注mysql模块。

完成后，将此内容保存为名为package.json的文件，确保与您的主要JavaScript文件（your_main_file.js）位于同一目录中。

然后，您可以使用以下命令安装所有依赖项：

```
npm install
```

这将根据package.json文件中的定义自动安装mysql模块及其依赖项。

#### Q3-mysql 的稳定版本

对于MySQL模块的稳定版本号，您可以使用具体的版本号或者使用符号来指定版本范围。以下是一些示例：

- 如果您想要使用特定的版本号，可以将"latest_version"替换为实际的版本号，例如："2.18.1"。

- 如果您想要使用最新的稳定版本，可以使用波浪号（~）来指定一个范围，例如："~2.18.1"。这将允许安装2.18.x系列的最新版本，但不包括2.19.x或更高版本。

- 如果您想要使用特定的主版本，可以使用插入号（^）来指定一个范围，例如："^2.18.1"。这将允许安装2.x.x系列的最新版本，但不包括3.x.x或更高版本。

请注意，具体要使用哪个版本号取决于您的项目需求和兼容性要求。

您可以在npm官方网站（https://www.npmjs.com/）上查找特定模块的可用版本并选择适合您的项目的稳定版本。

#### 实际调整

我们在 mysql-access.js 的同级目录下，创建文件 

- package.json

```json
{
    "name": "mysql-access",
    "version": "1.0.0",
    "description": "mysql access-test",
    "main": "mysql-access.js",
    "dependencies": {
      "mysql": "2.18.1"
    }
}
```

执行安装命令：

```
npm install
```

日志：

```
npm WARN config global `--global`, `--local` are deprecated. Use `--location=global` instead.

added 11 packages, and audited 12 packages in 3s

found 0 vulnerabilities
```

重新运行：

```
node mysql-access.js
```

运行的结果为：

```
D:\code\nodejs (mysql-access@1.0.0)            
λ node mysql-access.js                         
[                                              
  RowDataPacket { ID: 1, NAME: '1' },          
  RowDataPacket { ID: 2, NAME: '2' },          
  RowDataPacket { ID: 20, NAME: 'Alice' }      
]                                              
OkPacket {                                     
  fieldCount: 0,                               
  affectedRows: 1,                             
  insertId: 0,                                 
  serverStatus: 2,                             
  warningCount: 0,                             
  message: '',                                 
  protocol41: true,                            
  changedRows: 0                               
}                                              
```

此时，重新查看数据库的数据：

```
mysql> select * from person;
+----+-------+
| ID | NAME  |
+----+-------+
|  1 | 1     |
|  2 | 2     |
| 20 | Alice |
+----+-------+
3 rows in set (0.00 sec)
```


# 其他的闲聊

## Q: nodejs 作为服务端有哪些优缺点？

Node.js作为服务端的优缺点如下：

优点：
1. 高性能：Node.js使用事件驱动和非阻塞I/O模型，能够处理大量并发请求，具有出色的性能表现。
2. 可扩展性：Node.js支持水平扩展，可以通过添加更多的服务器实例来处理更多的请求。
3. 快速开发：Node.js使用JavaScript作为开发语言，使得前端开发人员可以在后端开发中使用相同的语言和工具，从而加快开发速度。
4. 单线程：Node.js使用单线程事件循环模型，避免了传统多线程模型中的线程切换开销，提高了效率。
5. 大型开源社区：Node.js拥有庞大的开源社区，提供了丰富的模块和工具，可以快速构建复杂的应用程序。

缺点：
1. 单线程：尽管单线程模型可以提高性能，但也意味着在处理计算密集型任务时，Node.js的性能可能会受到限制。
2. 不适合CPU密集型任务：由于Node.js使用单线程，不适合处理需要大量CPU计算的任务，因为它可能会阻塞整个应用程序。
3. 回调地狱：在处理复杂的异步操作时，可能会出现回调地狱的情况，代码可读性和维护性可能会受到影响。
4. 适用场景有限：Node.js适用于构建实时应用程序、聊天应用、推送服务等，但对于传统的Web应用程序，可能需要额外的工作来处理一些常见的任务，如文件操作和数据库连接池等。

综上所述，Node.js作为服务端具有高性能、可扩展性和快速开发等优点，但在处理CPU密集型任务和复杂异步操作时可能存在一些限制。

选择Node.js作为服务端需要根据具体的应用需求和场景来评估其优劣势。

## Q: 是不是只需要学习 js。然后 nodejs 加前端技术就够用了？还需要学习其他后端语言吗？为什么？

学习JavaScript和Node.js以及前端技术可以让您构建完整的Web应用程序，包括前端和后端。

但是否需要学习其他后端语言还取决于您的具体需求和项目要求。

以下是一些需要考虑的因素：

1. 生态系统和工具：JavaScript和Node.js拥有庞大的生态系统和丰富的工具，可以满足大多数Web开发需求。许多流行的后端框架和库都是基于JavaScript和Node.js构建的，例如Express.js、Koa.js等。因此，通过深入学习JavaScript和Node.js，您可以在后端开发中获得广泛的支持和资源。

2. 团队技能：如果您的团队已经熟悉JavaScript和Node.js，并且能够满足项目的需求，那么学习其他后端语言可能并不是必需的。这有助于提高团队的效率和协作。

3. 特定需求和限制：某些项目可能需要特定的后端语言来满足特定的需求或限制。例如，某些企业环境可能更倾向于使用Java或C#等传统的后端语言。在这种情况下，了解其他后端语言可能是有益的。

4. 技术全面性：学习多种后端语言可以让您具备更广泛的技术能力和灵活性。这可能有助于您在不同的项目和职业机会中获得竞争优势。

综上所述，学习JavaScript和Node.js以及前端技术可以让您构建完整的Web应用程序。

但是否需要学习其他后端语言取决于您的具体需求、团队技能和项目要求。

在做出决策之前，建议评估项目需求，并考虑团队的技能和资源。

## Q: node 支持 ts 吗？和直接使用 js 区别是什么

Node.js是支持TypeScript（TS）的。

TypeScript是JavaScript的超集，它添加了静态类型和其他一些特性，以提供更强大的开发工具和更好的代码可维护性。

与直接使用JavaScript相比，使用TypeScript在以下几个方面有所区别：

1. 类型系统：TypeScript引入了静态类型检查，允许开发者在代码编写阶段捕获潜在的类型错误。这有助于提高代码的可靠性和可维护性，并提供更好的自动补全和代码导航功能。

2. 语言特性：TypeScript扩展了JavaScript，并引入了一些新的语言特性，如接口、枚举、泛型等。这些特性使得代码更具表达力和可读性，并提供更好的抽象能力。

3. 编译过程：TypeScript代码需要通过编译器将其转换为JavaScript代码，以便在Node.js中执行。这个额外的编译步骤可以帮助发现潜在的错误，并提供更好的代码优化和转译功能。

4. 生态系统和工具支持：TypeScript拥有自己的生态系统和工具链，包括编译器、调试器、编辑器插件等。这些工具提供了更好的开发体验和更强大的工具支持。

总的来说，使用TypeScript可以提供更强大的类型检查和语言特性，以及更好的工具支持。

但同时，学习和使用TypeScript也需要额外的学习成本和编译步骤。

因此，选择使用JavaScript还是TypeScript取决于项目需求、团队技能和个人偏好。

# 参考资料

chat

* any list
{:toc}