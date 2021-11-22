---
layout: post
title: JS 如何获取 url ? 后的参数信息
date: 2021-11-19 21:01:55 +0800
categories: [WEB]
tags: [web, front-end, sh]
published: true
---
 
# 浏览器 url 信息

| 属性 | 说明 |
|:---|:---|
| window.location.pathname | 设置或获取对象指定的文件名或路径。 |
| window.location.href | 设置或获取当前 URL |
| window.location.host | 设置或获取 location 或 URL 的 hostname 和 port 号码。 |
| window.location.port | 设置或获取与 URL 关联的端口号码 |
| window.location.protocol |设置或获取 URL 的协议部分。 |
| window.location.hash | 设置或获取 href 属性中在井号“#”后面的分段。 |
| window.location.search | 设置或获取 href 属性中跟在问号后面的部分。 |

# js获取url？号后面的参数

## 1

```js
function getQueryString(name) { 
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i"); 
    var r = window.location.search.substr(1).match(reg); 
    if (r != null) return unescape(r[2]); 
    return null; 
} 
```

## 2

```js
function getRequest() {  
   var url = location.search; //获取url中"?"符后的字串  
   var theRequest = new Object();  
   if (url.indexOf("?") != -1) {  
      var str = url.substr(1);  
      strs = str.split("&");  
      for(var i = 0; i < strs.length; i ++) {  
         theRequest[strs[i].split("=")[0]]=unescape(strs[i].split("=")[1]);  
      }  
   }  
   return theRequest;  
}  
```

## 3

```js
/** 
 * 获取指定的URL参数值 
 * URL:http://www.quwan.com/index?name=tyler 
 * 参数：paramName URL参数 
 * 调用方法:getParam("name") 
 * 返回值:tyler 
 */ 
function getParam(paramName) { 
    paramValue = "", isFound = !1; 
    if (this.location.search.indexOf("?") == 0 && this.location.search.indexOf("=") > 1) { 
        arrSource = unescape(this.location.search).substring(1, this.location.search.length).split("&"), i = 0; 
        while (i < arrSource.length && !isFound) arrSource[i].indexOf("=") > 0 && arrSource[i].split("=")[0].toLowerCase() == paramName.toLowerCase() && (paramValue = arrSource[i].split("=")[1], isFound = !0), i++ 
    } 
    return paramValue == "" && (paramValue = null), paramValue 
} 
```

## 4

比较实用的方法

```js
function getQueryVariable(variable)
{
       //? 后面的内容
       var query = window.location.search.substring(1);
       var vars = query.split("&");
       for (var i=0;i<vars.length;i++) {
               var pair = vars[i].split("=");
               if(pair[0] == variable){return pair[1];}
       }
       return false;
}
```

### 例子

```
http://www.runoob.com/index.php?id=1&image=awesome.jpg
```

调用 getQueryVariable("id") 返回 1。

调用 getQueryVariable("image") 返回 "awesome.jpg"。


# 实际应用

## 场景

当前页面，根据传过来的 callbackurl 做页面跳转。

```
http://localhost:8080/login?systemId=cms&callbackUrl=http://localhost:8081/home
```

## 获取参数

```js
//systemId
let systemId = getLocationSearchVar('systemId'); 
if(systemId && systemId != '') {
   this.systemId = systemId;
   this.callbackUrl = getLocationSearchVar('callbackUrl');
   console.log(this.systemId);
   console.log(this.callbackUrl);

   // window.location.href = 'http://www.baidu.com';
}
```

但是发现页面跳转的时候会失败。

因为 url 中的地址会被转义。

## URL 的转义处理

```js
//转译
encodeURIComponent("https://zhidao.baidu.com");
//https%3A%2F%2Fzhidao.baidu.com
 
//逆转译
decodeURIComponent("https%3A%2F%2Fzhidao.baidu.com");
//https://zhidao.baidu.com
```

# 参考资料

https://www.cnblogs.com/sherryweb/p/11643050.html

[js获取url地址的参数的方法](https://zhuanlan.zhihu.com/p/72581171)

[获取URL地址时某些参数被转义](https://blog.csdn.net/weixin_39513821/article/details/85002541)

* any list
{:toc}