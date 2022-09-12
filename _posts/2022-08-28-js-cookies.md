---
layout: post
title:  js 获取 cookies 信息
date:  2022-08-28 09:22:02 +0800
categories: [JS]
tags: [js, id, uuid, sh]
published: true
---

# JS设置cookie、读取cookie、删除cookie

JavaScript是运行在客户端的脚本，因此一般是不能够设置Session的，因为Session是运行在服务器端的。

而cookie是运行在客户端的，所以可以用JS来设置cookie。

假设有这样一种情况，在某个用例流程中，由A页面跳至B页面，若在A页面中采用JS用变量temp保存了某一变量的值，在B页面的时候，同样需要使用JS来引用temp的变量值，对于JS中的全局变量或者静态变量的生命周期是有限的，当发生页面跳转或者页面关闭的时候，这些变量的值会重新载入，即没有达到保存的效果。

解决这个问题的最好的方案是采用cookie来保存该变量的值，那么如何来设置和读取cookie呢？

首先需要稍微了解一下cookie的结构，简单地说：cookie是以键值对的形式保存的，即 `key=value` 的格式。各个cookie之间一般是以 `;` 分隔。

# JS设置 cookie:

假设在A页面中要保存变量username的值("jack")到cookie中,key值为name，则相应的JS代码为：

```js
document.cookie="name="+username;
```

# JS读取cookie:

假设cookie中存储的内容为：name=jack;password=123

则在B页面中获取变量username的值的JS代码如下：

```js
var username=document.cookie.split(";")[0].split("=")[1];
//JS操作cookies方法!
//写cookies
function setCookie(name,value)
{
var Days = 30;
var exp = new Date();
exp.setTime(exp.getTime() + Days*24*60*60*1000);
document.cookie = name + "="+ escape (value) + ";expires=" + exp.toGMTString();
}
```

# 读取cookies

```js
function getCookie(name)
{
var arr,reg=new RegExp("(^| )"+name+"=([^;]*)(;|$)");
if(arr=document.cookie.match(reg))
return unescape(arr[2]);
else
return null;
}
```

# 删除cookies

```js
function delCookie(name)
{
var exp = new Date();
exp.setTime(exp.getTime() - 1);
var cval=getCookie(name);
if(cval!=null)
document.cookie= name + "="+cval+";expires="+exp.toGMTString();
}
//使用示例
setCookie("name","hayden");
alert(getCookie("name"));
//如果需要设定自定义过期时间
//那么把上面的setCookie　函数换成下面两个函数就ok;
//程序代码
function setCookie(name,value,time)
{
var strsec = getsec(time);
var exp = new Date();
exp.setTime(exp.getTime() + strsec*1);
document.cookie = name + "="+ escape (value) + ";expires=" + exp.toGMTString();
}
function getsec(str)
{
alert(str);
var str1=str.substring(1,str.length)*1;
var str2=str.substring(0,1);
if (str2=="s")
{
return str1*1000;
}
else if (str2=="h")
{
return str1*60*60*1000;
}
else if (str2=="d")
{
return str1*24*60*60*1000;
}
}
//这是有设定过期时间的使用示例：
//s20是代表20秒
//h是指小时，如12小时则是：h12
//d是天数，30天则：d30
setCookie("name","hayden","s20");
```




# 参考资料

https://www.jb51.net/article/64330.htm

* any list
{:toc}