---
layout: post
title:  Vue-08-vue element-ui 使用入门
date:  2017-09-04 20:38:53 +0800
categories: [Vue]
tags: [ui, vue, learn-note, sh]
published: true
---

# 说明

最基本的，直接依赖 cdn 的方式。

## 引入

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8"/>
    <title>用户首页</title>
    <!-- 引入样式 -->
    <link rel="stylesheet" href="https://unpkg.com/element-ui/lib/theme-chalk/index.css"/>
</head>
<body>

<script src="https://unpkg.com/vue/dist/vue.js"></script>
<!-- 引入组件库 -->
<script src="https://unpkg.com/element-ui/lib/index.js"></script>

<!--axios-->
<script src="https://unpkg.com/axios/dist/axios.min.js"></script>
<script src="https://cdn.bootcss.com/qs/6.5.1/qs.min.js"></script>
</body>
</html>
```

大部分的直接按照官方使用即可。

比如最简单的分割线

```html
<el-divider></el-divider>
```

但是也存在一些问题。

## message 无法正常使用

查了很多答案，使用 require, import

但是最基本的 cdn 实际上是不支持这些的。

```js
doQuery() {
    var req = {
        userId: this.queryForm.userId,
        userName: this.queryForm.userName,
        pageNum: this.page.pageNum,
        pageSize: this.page.pageSize
    }
    //axios 中的 this 并不指向 vue
    var _this = this;
    axios.post('/user/list', req).then(function (response) {
        if(response.data.respCode === '0000') {
            _this.tableData = response.data.list;
            _this.page.total = response.data.total;
        } else {
            ELEMENT.Message.error(response.data.respMessage);
        }
    }).catch(function (error) {
        ELEMENT.Message.error("请求失败");
        console.log(error);
    });
},
```

后来发现使用 `ELEMENT.Message.error("请求失败");` 可以正常输出。

# 参考资料

[CDN方式使用ElementUI的Message组件](https://blog.csdn.net/mouday/article/details/106754088)

* any list
{:toc}