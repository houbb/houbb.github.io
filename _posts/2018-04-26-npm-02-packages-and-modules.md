---
layout: post
title:  NPM-02-npm public & registry
date:  2018-04-24 22:22:23 +0800
categories: [NPM]
tags: [frontend, npm, npm]
published: true
---

# 关于公共 npm 注册表（registry）

公共 npm 注册表是 JavaScript 包的数据库，每个包都由软件和元数据组成。 

开源开发人员和公司的开发人员使用 npm 注册表向整个社区或其组织成员贡献包，并下载包以在自己的项目中使用。

要开始使用注册表，请注册一个 npm 帐户并查看“入门”和 CLI 文档。

# 关于包和模块

npm 注册表包含包，其中许多也是 Node 模块，或者包含 Node 模块。 

继续阅读以了解它们的不同之处以及它们如何相互作用。

# 关于包

包是由 package.json 文件描述的文件或目录。 

包必须包含 package.json 文件才能发布到 npm 注册表。 

有关创建 package.json 文件的更多信息，请参阅“创建 package.json 文件”。

包可以是无范围的，也可以是针对用户或组织的，范围包可以是私有的或公共的。 

有关更多信息，请参阅

“关于范围”

“关于私人包裹”

“包范围、访问级别和可见性”

## 关于包格式

包是以下任何一种：

a) 包含 package.json 文件描述的程序的文件夹。

b) 包含 (a) 的 gzip 压缩包。

c) 解析为 (b) 的 URL。

d) 使用 (c) 在注册表上发布的 `<name>@<version>`。

e) 指向 (d) 的 `<name>@<tag>`。

f) 具有满足 (e) 的最新标签的 `<name>`。

g) 一个 git url，当克隆时，结果为 (a)。

## npm 包 git URL 格式

用于 npm 包的 Git URL 可以通过以下方式格式化：

```
git://github.com/user/project.git#commit-ish
git+ssh://user@hostname:project.git#commit-ish
git+http://user@hostname/project/blah.git#commit-ish
git+https://user@hostname/project/blah.git#commit-ish
```

commit-ish 可以是任何可以作为参数提供给 git checkout 的标签、sha 或分支。 

默认的 commit-ish 是 master。

# 关于模块

模块是 node_modules 目录中可以由 Node.js require() 函数加载的任何文件或目录。

要由 Node.js require() 函数加载，模块必须是以下之一：

- 包含包含“main”字段的 package.json 文件的文件夹。

- 一个 JavaScript 文件。

注意：由于模块不需要具有 `package.json` 文件，并非所有模块都是包。 

只有具有 `package.json` 的文件才是包。

在 Node 程序的上下文中，模块也是从文件加载的东西。 

例如，在以下程序中：

```js
var req = require('request')
```

我们可能会说“变量 req 指的是请求模块”。

# About scopes

注意：您必须使用 npm 版本 2 或更高版本才能使用作用域。 

要升级到最新版本的 npm，请在命令行上运行

```
npm install npm@latest -g
```

当您注册 npm 用户帐户或创建组织时，您将被授予与您的用户或组织名称匹配的范围。 

您可以将此范围用作相关包的命名空间。

范围允许您创建与其他用户或组织创建的包同名的包，而不会发生冲突。

当在 package.json 文件中列为依赖项时，作用域包前面是它们的作用域名称。 

范围名称是 `@` 和 `/` 之间的所有内容：

- "npm" scope:

```
@npm/package-name
```

- "npmcorp" scope:

```
@npmcorp/package-name
```

要创建和发布公共范围的包，请参阅“创建和发布范围的公共包”。

要创建和发布私有范围的包，请参阅“创建和发布私有包”。

## 范围和包可见性

无作用域的包总是公开的。

私有包总是有范围的。

默认情况下，范围包是私有的； 您必须在发布时传递命令行标志以将其公开。

有关包范围和可见性的更多信息，请参阅“包范围、访问级别和可见性”。

# 关于公共包

作为 npm 用户或组织成员，您可以创建和发布任何人都可以在自己的项目中下载和使用的公共包。

无作用域的公共包存在于全局公共注册表命名空间中，可以在 package.json 文件中单独使用包名称进行引用：package-name。

作用域公共包属于用户或组织，当作为依赖项包含在 package.json 文件中时，必须以用户或组织名称开头：

```
@username/package-name
@org-name/package-name
```

# About private packages

要使用私有包，您必须

使用 npm 2.7.0 或更高版本。 

要升级，请在命令行上运行

```
npm install npm@latest -g
```

拥有付费用户或组织帐户。

使用 npm 私有包，您可以使用 npm 注册表来托管仅对您和选定的合作者可见的代码，从而允许您在项目中管理和使用私有代码以及公共代码。

私有包总是有一个作用域，默认情况下有作用域的包是私有的。

用户范围的私有包只能由您和您授予读或读/写访问权限的协作者访问。 

有关更多信息，请参阅“将协作者添加到用户帐户拥有的私有包”。

组织范围的私有包只能由已被授予读或读/写访问权限的团队访问。 

有关更多信息，请参阅“管理团队对组织包的访问”。

# 自定义到 NPM

类似于 Maven

NPM 可以把自己的包上传到仓库，这个后续学习。

# 参考资料

[about-npm](https://docs.npmjs.com/about-npm)

* any list
{:toc}







