---
layout: post
title: Ajax 的替代方案-fetch
date:  2020-3-27 17:53:59 +0800
categories: [HTML]
tags: [html, js, sh]
published: true
---

# fetch

跨网络异步获取资源的功能以前是使用XMLHttpRequest对象实现的，Fetch API提供了更好的替代方案，可以很容易的被其他技术使用（如Servise Workers）

fetch，说白了，就是XMLHttpRequest的一种替代方案。

如果有人问你，除了Ajax获取后台数据之外，还有没有其他的替代方案？

你就可以回答，除了XMLHttpRequest对象来获取后台的数据之外，还可以使用一种更优的解决方案fetch。

fetch的支持性还不是很好，但是在谷歌浏览器中已经支持了fetch

# 返回 promise

Fetch API提供了一个全局的fetch()方法，该方法会返回一个Promise

当fetch请求接收到一个代表错误的状态码时（如404、500），返回的Promise不会被标记为reject，而是被标记为resolve，但是会将response的ok属性设置为false。

只有当网络错误或请求被阻止时才会被标记为reject状态

```js
fetch('https://127.0.0.1/125.jpg').then(function(res){
  if(res.ok) {
    return res.blob();
  }else {
    console.log('服务器响应出错了'); // 资源404、服务器500等
  }
}).catch(function(err){
  console.log('Network response was not ok.'); // 网络出错
})
```

# fetch() 方法的两个参数

fetch()方法接收两个参数：第一个参数表示要获取的资源路径；第二个参数表示请求的配置项（可选）

```js
fetch('https://127.0.0.1/api/articles/1/3').then(function(res){
  if(res.ok) {
    return res.json();
  }
})

// 定义第二个参数
fetch('https://127.0.0.1/api/articles/1/3', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    token:'token'
  },
  cache: 'default',
  mode: 'cors',
}).then(function(res){
  if(res.ok) {
    return res.json();
  }
})
```

# 设置请求的头信息

在POST提交的过程中，一般是表单提交，可是，经过查询，发现默认的提交方式是：

`Content-Type:text/plain;charset=UTF-8`，这个显然是不合理的,改为 `application/x-www-form-urlencoded`

```js
fetch('https://www.baidu.com/search/error.html', {
    method: 'POST',
    headers: new Headers({
      'Content-Type': 'application/x-www-form-urlencoded' // 指定提交方式为表单提交
    }),
    body: new URLSearchParams([["foo", 1],["bar", 2]]).toString()
  })
  .then((res)=>{
    return res.text()
  })
  .then((res)=>{
    console.log(res)
  })
```

# 默认不使用 cookie

默认情况下, fetch 不会从服务端发送或接收任何 cookies，要发送 cookies，必须设置 credentials 选项

```js
fetch('http://127.0.0.1/search/name', {
  method: 'GET',
  credentials: 'include' // 强制加入凭据头
})
.then((res)=>{
  return res.text()
})
```

# GET请求及传参

GET请求中如果需要传递参数怎么办？

这个时候，只能把参数写在URL上来进行传递了。

```js
fetch('http://127.0.0.1/search?a=1&b=2', { // 在URL中写上传递的参数
    method: 'GET'
  })
  .then((res)=>{
    return res.text()
  })
```

# POST 请求及传参

POST请求的参数，放在第二个参数的body属性中

```js
fetch('http://127.0.0.1/searchs', { 
     method: 'POST',
    body: new URLSearchParams([["foo", 1],["bar", 2]]).toString() // 这里是请求对象
  })
  .then((res)=>{
    return res.text()
  })
```

POST提交改为application/x-www-form-urlencoded

```js
fetch('http://127.0.0.1/searchs', { 
  method: 'POST',
  headers: new Headers({
    'Content-Type': 'application/x-www-form-urlencoded' // 指定提交方式为表单提交
  }),
  body: new URLSearchParams([["foo", 1],["bar", 2]]).toString() // 这里是请求对象
})
.then((res)=>{
  return res.text()
})
```

# 拓展阅读

[ajax]()

[axios]()

# 参考资料

[JS代替ajax向服务端请求的新方案：fetch](https://www.jianshu.com/p/bad1b614eb81)

[文档](https://developer.mozilla.org/zh-CN/docs/Web/API/Fetch_API) 

[fetch github](https://github.com/github/fetch) 

* any list
{:toc}