---
layout: post
title: http 请求 使用FormData提交文件与对象信息 对象中内嵌对象
date:  2023-05-24 +0800
categories: [WEB]
tags: [web, http, sh]
published: true
---

# 背景

一般的接口后端如果使用 json 的格式传递，那么传递对象比较简单。

但是如果后端接口使用的是 formdata 形式，同时后端接口对象中又内嵌对象，应该如何处理呢？

# 说明

## 对象

我们使用FormData有时候不仅仅要传给后端文件，还需要传给后端对象信息。

**使用FormData传对象是用key-value形式的，所以传对象不能传整个对象，要传属性**

后端接口用对象接收即可，因为可以将传来的属性自动封装到实体类中（前端传来的属性名称和实体类

的属性名称一定要一致，否则无法封装）。

## 对象内嵌

还有当我们传的对象里面还有引用对象的时候，比如User类里面还有一个Depot类，我们就应该这样

```js
formData.append(“depot.id”, this.formData.depot.id);
```

这样的话，就可以成功传给User类里的Depot类了

# 例子

## 后端

```java
@PostMapping("/add")
public Result add(User user, MultipartFile image, HttpServletRequest request){
}
```

## 前端

注意看 `depot.id` 这个属性传递，会映射到后端 user 对象的内嵌对象 user.depot 中的 id 属性。

需要加一下双引号，避免出现 `.` 导致 js 的解析失败。

```js
axios.post(url, {
	usename: '名称',
	age: 10,
	"depot.id": "内嵌对象标识",
	"depot.name": "内嵌对象名称"
}).then(function (response) {
    var res = response.data;
    if(res.success){
        obj.$message({
            type: 'success',
            message: '添加成功!'
        });
        vue.jump("user_list_page");
    }else {
        obj.$message.error({
            type: 'fail',
            message: res.msg
        });
    }
});
```

# 参考资料

https://blog.csdn.net/qq_42039738/article/details/106206935

* any list
{:toc}