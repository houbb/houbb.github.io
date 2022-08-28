---
layout: post
title: JS XHR HOOK js 实现 ajax 请求全局钩子函数
date:  2022-07-09 09:22:02 +0800
categories: [JS]
tags: [js, sh]
published: true
---

# ajax-hook

最近github上出现了一个神器ajax-hook，它可以拦截所有ajax请求并允许修改请求数据和响应数据！

实际项目中它可以用于请求添加统一签名、协议自动解析、接口调用统计等。

本文主要分析其源码实现，抛砖引玉了。

github : https://github.com/wendux/Ajax-hook

中文介绍：http://www.jianshu.com/p/9b634f1c9615

# 整体思路－代理模式

Ajax-hook实现的整体思路是实现一个XMLHttpRequest的代理对象，然后覆盖全局的XMLHttpRequest，这样一但上层调用 new XMLHttpRequest这样的代码时，其实创建的是Ajax-hook的代理对象实例。

具体原理图如下：

![why](https://upload-images.jianshu.io/upload_images/2896818-9ddfc807ed33d4a3.png)

上图中青色部分为Ajax-hook实现的代理XMLHttpRequest，内部会调用真正的XMLHttpRequest。

我们看一下hookAjax的部分源码：

```js

ob.hookAjax = function (funs) {
  //保存真正的XMLHttpRequest对象
  window._ahrealxhr = window._ahrealxhr || XMLHttpRequest
  //1.覆盖全局XMLHttpRequest，代理对象
  XMLHttpRequest = function () {
    //创建真正的XMLHttpRequest实例
    this.xhr = new window._ahrealxhr;
    for (var attr in this.xhr) {
      var type = "";
      try {
        type = typeof this.xhr[attr]
      } catch (e) {}
      if (type === "function") {
        //2.代理方法
        this[attr] = hookfun(attr);
      } else {
        //3.代理属性
        Object.defineProperty(this, attr, {
          get: getFactory(attr),
          set: setFactory(attr)
        })
      }
    }
  }
  ......
```

Ajax-hook 一开始先保存了真正的XMLHttpRequest对象到一个全局对象，然后在注释1处，Ajax-hook覆盖了全局的XMLHttpRequest对象，这就是代理对象的具体实现。

在代理对象内部，首先创建真正的XMLHttpRequest实例,记为xhr,然后遍历xhr所有属性和方法，在2处hookfun为xhr的每一个方法生成一个代理方法，在3处，通过defineProperty为每一个属性生成一个代理属性。

下面我们重点看一看代理方法和代理属性的实现。

# 代理方法

代理方法通过hookfun函数生成，我们看看hookfun的具体实现：

```js
function hookfun(fun) {
 return function () {
    var args = [].slice.call(arguments)
    //1.如果fun拦截函数存在，则先调用拦截函数
    if (funs[fun] && funs[fun].call(this, args, this.xhr)) {
      return;
    }
   //2.调用真正的xhr方法
   this.xhr[fun].apply(this.xhr, args);
 }
}
```

为了叙述清晰，我们假设fun为 send函数，其中funs为用户提供的拦截函数对象。

代码很简单，首先会根据用户提供的funs判断用户是否要拦截send, 如果提供了send的拦截方法，记为send_hook, 则上层调用代理对象send方法时，则会先调用send_hook，同时将调用参数和当前的xhr对象传递给send_hook，如果send_hook返回了true, 则调用终止，直接返回，相当于调用被终止了，如果没有返回或返回的是false,则会走到注释2处，此处调用了xhr的send方法，至此ajax send被调用成功。 

所以，我们在send_hook中可以拿到调用的参数并修改，因为参数是以数组形式传递，改变会被记录，当然，我们也可以返回true直接终止调用。

# 代理属性

属性如onload、onreadystatechange等，上层在调用ajax时通常要设置这些回调以处理请求到的数据，Ajax-hook也能够实现在请求返回时先拿到数据第一个进行处理，然后将处理过的数据传递给用户提供的回调。

要实现这个功能，直接的思路就是用户设置回调时将用户提供的回调保存起来，然后设置成代理回调，当数据返回时，代理回调会被调用，然后在代理回调中首先将返回的数据提供给拦截函数处理，然后再将处理后的数据传递给用户真正的回调。

那么问题来了，如何捕获用户设置回调的动作？

一段典型的用户调用代码如下：

```js
var xh=new XMLHttpRequest;
xh.open("https://xxx")
xh.onload=function(data){ //1
  //处理请求到的数据
}
```

也就是说上面代码1处的赋值时机代理对象怎么捕获？

如果在赋值的时候有机会执行代码就好了。

我们回过头来看看上面原理图，有没有注意到proxy props后面的小括号里的 es5，答案就在这里！ 

es5中对于属性引入了setter、getter,详细内容请参考：

Javascript getter: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get

Javascript setter: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/set

Ajax-hook通过getFactory和setFactory生成setter、getter方法。

我们来看看它们的实现：

```js
function getFactory(attr) {
    return function () {
        return this[attr + "_"] || this.xhr[attr]
    }
}

function setFactory(attr) {
    return function (f) {
        var xhr = this.xhr;
        var that = this;
        //区分是否回调属性
        if (attr.indexOf("on") != 0) {
            this[attr + "_"] = f;
            return;
        }
        if (funs[attr]) {
            xhr[attr] = function () {
                funs[attr](that) || f.apply(xhr, arguments);
            }
        } else {
            xhr[attr] = f;
        }
    }
}
```

代码比较简单，值得注意的是里面的属性加下划线是什么意思？请继续往下看。

# 属性修改

如果需要对返回的数据进行加工处理，比如返回的数据是json字符串，如果你想将它转化为对象再传递给上层，你可能会在onload回调中这么写：

```js
xhr.responseText = JSON.parse(xhr.responseText)
```

但是，这里有坑，因为xhr的responseText属性并不是writeable的（详情请移步 https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty ),

这也就意味着你无法直接更改xhr.responseText的值，而Ajax-hook也代理了这些原始属性，我们可以通过代理xhr对象来赋值：

```js
xhr.getProxy().responseText = JSON.parse(xhr.responseText)
```

关于，代理xhr对象 和 原生xhr对象的区别请参考Ajax-hook github文档

至此，Ajax-hook源码分析完毕。

# 总结

下面我们总结一下：

Ajax-hook使用代理的方式对原生XMLHttpRequest的方法及属性进行代理，然后覆盖全局XMLHttpRequest，实现拦截所有Ajax-hook的功能。

从代码角度来看，逻辑清晰，思维巧妙，简洁优雅，值得学习。

# 参考资料

[Ajax-hook 原理解析](https://www.jianshu.com/p/7337ac624b8e)

* any list
{:toc}