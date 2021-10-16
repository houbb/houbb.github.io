---
layout: post
title: JavaScript 代码的静态类型检查器 Flow 移除Flow内容
date: 2021-10-12 21:01:55 +0800
categories: [FrontEnd]
tags: [front-end, tool, web, sh]
published: true
---

# 移除Flow内容

如果有类型错误的话就应该引起注意并且及时修改，更不能发布代码，不过在开发阶段，即便还没完美解决 Flow 的提醒，我们还是会经常运行代码的， 特别是在进行调试或者其他测试的时候。

另外，因为Flow的语法并不是标准的JavaScript语法，所以我们也是要在代码最终上线前移除Flow相关的代码。

在这里，我们就可以安装一个 Babel 插件，试着运行下面的代码，

```
npm install --save-dev  babel-cli
```

然后我们修改.babelrc文件，将transform-flow-comments添加到plugins里面，如下，

```json
{
  "plugins": [
      "flow",
      "transform-flow-comments"
  ]
}
```

然后执行我们在package.json里面配置好的命令build，把src目录的档案编译到dist目录中

```
npm run build
```

控制台输出了以下信息，

```
my-project@ build E:\Flow
babel src/ -d lib/
src\index.js -> lib\index.js
```

然后我们来查看一下编译后的index.js长什么样？

```js
function foo(x) {
  return x + 666;
}

foo('HelloWorld!');
```

可以明显的看到，原本有使用的Flow标记，或是有类型注释的代码，都被清除了，变成了最原始的标准js。

# 参考资料

https://www.kancloud.cn/sllyli/flow/1141895

* any list
{:toc}