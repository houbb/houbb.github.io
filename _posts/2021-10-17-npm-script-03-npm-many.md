---
layout: post
title: 入门篇 02：运行多个 npm script 的各种姿势
date: 2021-10-12 21:01:55 +0800
categories: [FrontEnd]
tags: [front-end, tool, web, sh]
published: true
---

# 运行多个 npm script 的各种姿势

前端项目通常会包括多个 npm script，对多个命令进行编排是很自然的需求，有时候需要将多个命令串行，即脚本遵循严格的执行顺序；

有时候则需要让它们并行来提高速度，比如不相互阻塞的 npm script。

社区中也有比 npm 内置的多命令运行机制更好用的解决方案：npm-run-all。

# 哪来那么多命令？

通常来说，前端项目会包含 js、css、less、scss、json、markdown 等格式的文件，为保障代码质量，给不同的代码添加检查是很有必要的，代码检查不仅保障代码没有低级的语法错误，还可确保代码都遵守社区的最佳实践和一致的编码风格，在团队协作中尤其有用，即使是个人项目，加上代码检查，也会提高你的效率和质量。

我通常会给前端项目加上下面 4 种代码检查：

- eslint，可定制的 js 代码检查，1.1 中有详细的配置步骤；

- stylelint，可定制的样式文件检查，支持 css、less、scss；

- jsonlint，json 文件语法检查，踩过坑的同学会清楚，json 文件语法错误会知道导致各种失败；

- markdownlint-cli，Markdown 文件最佳实践检查，个人偏好；

需要注意的是，html 代码也应该检查，但是工具支持薄弱，就略过不表。此外，为代码添加必要的单元测试也是质量保障的重要手段，常用的单测技术栈是：

- [mocha](https://mochajs.org/)，测试用例组织，测试用例运行和结果收集的框架；

- [chai](http://chaijs.com/)，测试断言库，必要的时候可以结合 sinon 使用；

> TIP#4：测试工具如 [tap](http://www.node-tap.org/)、[ava](https://github.com/avajs/ava) 也都提供了命令行接口，能很好的集成到 npm script 中，原理是相通的。

包含了基本的代码检查、单元测试命令的 package.json 如下：

```json
{
  "name": "hello-npm-script",
  "version": "0.1.0",
  "main": "index.js",
  "scripts": {
    "lint:js": "eslint *.js",
    "lint:css": "stylelint *.less",
    "lint:json": "jsonlint --quiet *.json",
    "lint:markdown": "markdownlint --config .markdownlint.json *.md",
    "test": "mocha tests/"
  },
  "devDependencies": {
    "chai": "^4.1.2",
    "eslint": "^4.11.0",
    "jsonlint": "^1.6.2",
    "markdownlint-cli": "^0.5.0",
    "mocha": "^4.0.1",
    "stylelint": "^8.2.0",
    "stylelint-config-standard": "^17.0.0"
  }
}
```

# 让多个 npm script 串行？

在我们运行测试之前确保我们的代码都通过代码检查会是比较不错的实践，这也是让多个 npm script 串行的典型用例，实现方式也比较简单，只需要用 && 符号把多条 npm script 按先后顺序串起来即可，具体到我们的项目，修改如下图所示：

```
diff --git a/package.json b/package.json
index c904250..023d71e 100644
--- a/package.json
+++ b/package.json
@@ -8,7 +8,7 @@
-    "test": "mocha tests/"
+    "test": "npm run lint:js && npm run lint:css && npm run lint:json && npm run lint:markdown && mocha tests/"
   },
```

然后直接执行 npm test 或 npm t，从输出可以看到子命令的执行顺序是严格按照我们在 scripts 中声明的先后顺序来的：

```
eslint ==> stylelint ==> jsonlint ==> markdownlint ==> mocha
```

需要注意的是，串行执行的时候如果前序命令失败（通常进程退出码非0），后续全部命令都会终止，我们可以尝试在 index.js 中引入错误（删掉行末的分号）：

```
diff --git a/index.js b/index.js
index ab8bd0e..b817ea4 100644
--- a/index.js
+++ b/index.js
@@ -4,7 +4,7 @@ const add = (a, b) => {
   }

   return NaN;
-};
+}

 module.exports = { add  };
```

然后重新运行 npm t，结果如下，npm run lint:js 失败之后，后续命令都没有执行：


ps: 下面的测试日志，依然使用的是最初的 index.js

```
> hello-npm-script@0.1.0 test D:\code\hello-npm-script
> npm run lint:js && npm run lint:css && npm run lint:json && npm run lint:markdown && mocha tests/


> hello-npm-script@0.1.0 lint:js D:\code\hello-npm-script
> eslint *.js


D:\code\hello-npm-script\.eslintrc.js
  1:1  error  'module' is not defined  no-undef

D:\code\hello-npm-script\index.js
  1:7   error  'str' is assigned a value but never used  no-unused-vars
  3:10  error  'fn' is defined but never used            no-unused-vars

✖ 3 problems (3 errors, 0 warnings)

npm ERR! code ELIFECYCLE
npm ERR! errno 1
npm ERR! hello-npm-script@0.1.0 lint:js: `eslint *.js`
npm ERR! Exit status 1
npm ERR!
npm ERR! Failed at the hello-npm-script@0.1.0 lint:js script.
npm ERR! This is probably not a problem with npm. There is likely additional logging output above.

npm ERR! A complete log of this run can be found in:
npm ERR!     C:\Users\Administrator\AppData\Roaming\npm-cache\_logs\2021-10-17T04_50_54_752Z-debug.log
npm ERR! Test failed.  See above for more details.
```

# 让多个 npm script 并行？

在严格串行的情况下，我们必须要确保代码中没有编码规范问题才能运行测试，在某些时候可能并不是我们想要的，因为我们真正需要的是，代码变更时同时给出测试结果和测试运行结果。

这就需要把子命令的运行从串行改成并行，实现方式更简单，把连接多条命令的 `&&` 符号替换成 `&` 即可。

代码变更如下：

```
diff --git a/package.json b/package.json
index 023d71e..2d9bd6f 100644
--- a/package.json
+++ b/package.json
@@ -8,7 +8,7 @@
-    "test": "npm run lint:js && npm run lint:css && npm run lint:json && npm run lint:markdown && mocha tests/"
+    "test": "npm run lint:js & npm run lint:css & npm run lint:json & npm run lint:markdown & mocha tests/"
   },
```

重新运行 npm t，我们得到如下结果：

细心的同学可能已经发现上图中哪里不对，npm run lint:js 的结果在进程退出之后才输出，如果你自己运行，不一定能稳定复现这个问题，但 npm 内置支持的多条命令并行跟 js 里面同时发起多个异步请求非常类似，它只负责触发多条命令，而不管结果的收集，如果并行的命令执行时间差异非常大，上面的问题就会稳定复现。

怎么解决这个问题呢？

答案也很简单，在命令的增加 & wait 即可，这样我们的 test 命令长这样：

```
npm run lint:js & npm run lint:css & npm run lint:json & npm run lint:markdown & mocha tests/ & wait
```

加上 wait 的额外好处是，如果我们在任何子命令中启动了长时间运行的进程，比如启用了 mocha 的 --watch 配置，可以使用 ctrl + c 来结束进程，如果没加的话，你就没办法直接结束启动到后台的进程。

# 有没有更好的管理方式？

有强迫症的同学可能会觉得像上面这样用原生方式来运行多条命令很臃肿，幸运的是，我们可以使用 npm-run-all 实现更轻量和简洁的多命令运行。

用如下命令将 npm-run-all 添加到项目依赖中：

```
npm i npm-run-all -D
```

然后修改 package.json 实现多命令的串行执行：

```
diff --git a/package.json b/package.json
index b3b1272..83974d6 100644
--- a/package.json
+++ b/package.json
@@ -8,7 +8,8 @@
-    "test": "npm run lint:js & npm run lint:css & npm run lint:json & npm run lint:markdown & mocha tests/ & wait"
+    "mocha": "mocha tests/",
+    "test": "npm-run-all lint:js lint:css lint:json lint:markdown mocha"
   },
```

npm-run-all 还支持通配符匹配分组的 npm script，上面的脚本可以进一步简化成：

```
diff --git a/package.json b/package.json
index 83974d6..7b327cd 100644
--- a/package.json
+++ b/package.json
@@ -9,7 +9,7 @@
-    "test": "npm-run-all lint:js lint:css lint:json lint:markdown mocha"
+    "test": "npm-run-all lint:* mocha"
   },
```

如何让多个 npm script 并行执行？

也很简单：

```
diff --git a/package.json b/package.json
index 7b327cd..c32da1c 100644
--- a/package.json
+++ b/package.json
@@ -9,7 +9,7 @@
-    "test": "npm-run-all lint:* mocha"
+    "test": "npm-run-all --parallel lint:* mocha"
   },
```

并行执行的时候，我们并不需要在后面增加 & wait，因为 npm-run-all 已经帮我们做了。

> TIP#5：npm-run-all 还提供了很多配置项支持更复杂的命令编排，比如多个命令并行之后接串行的命令，感兴趣的同学请阅读文档，自己玩儿。


# 参考资料

https://www.kancloud.cn/sllyli/npm-script/1243452

* any list
{:toc}
