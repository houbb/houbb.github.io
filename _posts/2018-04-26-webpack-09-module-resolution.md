---
layout: post
title:  WebPack-09-模块解析（Module Resolution）
date:  2018-04-23 21:59:43 +0800
categories: [WebPack]
tags: [js, webpack]
published: true
---

# 模块解析（Module Resolution）

resolver 是一个帮助寻找模块绝对路径的库。 

一个模块可以作为另一个模块的依赖模块，然后被后者引用，如下：

```js
import foo from 'path/to/module';
// 或者
require('path/to/module');
```

所依赖的模块可以是来自应用程序的代码或第三方库。 

resolver 帮助 webpack 从每个 require/import 语句中，找到需要引入到 bundle 中的模块代码。 

当打包模块时，webpack 使用 enhanced-resolve 来解析文件路径。

# webpack 中的解析规则

使用 enhanced-resolve，webpack 能解析三种文件路径：

## 绝对路径

```js
import '/home/me/file';

import 'C:\\Users\\me\\file';
```

由于已经获得文件的绝对路径，因此不需要再做进一步解析。

## 相对路径

```js
import '../src/file1';
import './file2';
```

在这种情况下，使用 import 或 require 的资源文件所处的目录，被认为是上下文目录。

在 import/require 中给定的相对路径，会拼接此上下文路径，来生成模块的绝对路径。

## 模块路径

```js
import 'module';
import 'module/lib/file';
```

在 resolve.modules 中指定的所有目录检索模块。 你可以通过配置别名的方式来替换初始模块路径，具体请参照 resolve.alias 配置选项。

如果 package 中包含 package.json 文件，那么在 resolve.exportsFields 配置选项中指定的字段会被依次查找，package.json 中的第一个字段会根据 package 导出指南确定 package 中可用的 export。
一旦根据上述规则解析路径后，resolver 将会检查路径是指向文件还是文件夹。

如果路径指向文件：

1. 如果文件具有扩展名，则直接将文件打包。

2. 否则，将使用 resolve.extensions 选项作为文件扩展名来解析，此选项会告诉解析器在解析中能够接受那些扩展名（例如 .js，.jsx）。

如果路径指向一个文件夹，则进行如下步骤寻找具有正确扩展名的文件：

1. 如果文件夹中包含 package.json 文件，则会根据 resolve.mainFields 配置中的字段顺序查找，并根据 package.json 中的符合配置要求的第一个字段来确定文件路径。

2. 如果不存在 package.json 文件或 resolve.mainFields 没有返回有效路径，则会根据 resolve.mainFiles 配置选项中指定的文件名顺序查找，看是否能在 import/require 的目录下匹配到一个存在的文件名。

3. 然后使用 resolve.extensions 选项，以类似的方式解析文件扩展名。

webpack 会根据构建目标，为这些选项提供合理的默认配置。

# 解析 loader

loader 的解析规则也遵循特定的规范。但是 resolveLoader 配置项可以为 loader 设置独立的解析规则。

# 缓存

每次文件系统访问文件都会被缓存，以便于更快触发对同一文件的多个并行或串行请求。在 watch 模式 下，只有修改过的文件会被从缓存中移出。如果关闭 watch 模式，则会在每次编译前清理缓存。

欲了解更多上述配置信息，请查阅 Resolve API。

# 参考资料

https://webpack.docschina.org/concepts/module-resolution/

* any list
{:toc}