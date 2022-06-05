---
layout: post
title:  如何实现短链服务 short url-06-vue js 实现页面拷贝
date:  2022-06-02 09:22:02 +0800
categories: [WEB]
tags: [web, http, sh]
published: true
---

# 说明

为了提升用户复制体验，添加点击按钮复制功能。

# 实现

## 页面

```html
<el-button type="primary" @click="addShortUrl" icon="el-icon-plus">添加</el-button>
<el-button type="success" @click="copyShortUrl" v-if="shortUrl !== ''" icon="el-icon-copy-document">复制</el-button>
```

## js

```js
copyShortUrl() {
    copy(this.shortUrl);
    ELEMENT.Message.success('复制成功');
},
```

其中 copy 是一个固定的方法：

```js
/**
 * 复制
 *
 * @param data 数据
 */
function copy(data)
{
    const url = data;
    const oInput = document.createElement('input');
    oInput.value = url;
    document.body.appendChild(oInput);
    oInput.select(); // 选择对象;
    document.execCommand('Copy'); // 执行浏览器复制命令
    oInput.remove()
};
```

# 参考资料

https://blog.csdn.net/weixin_43742274/article/details/119116055

* any list
{:toc}