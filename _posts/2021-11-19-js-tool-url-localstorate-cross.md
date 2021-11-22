---
layout: post
title: JS localstorge 跨域问题
date: 2021-11-19 21:01:55 +0800
categories: [WEB]
tags: [web, front-end, sh]
published: true
---
 
# 背景

最近想实现一下 SSO。

其中涉及前端到不同应用之间的 token 传递问题。

# 存储方式

html5标准中一个亮点就是提供了浏览器本地存储的功能。方式有两种：localStorage和 sessionStorage。 

相对于cookie，他们具有存储空间大的特点，一般可以存储5M左右，而cookie一般只有4k。

## 区别

localStorage和 sessionStorage的主要区别是：

localStorage的生命周期是永久的，意思就是如果不主动清除，存储的数据将一直被保存。

而sessionStorage顾名思义是针对一个session的数据存储，生命周期为当前窗口，一旦窗口关闭，那么存储的数据将被清空。

## 方法

当然作为孪生兄弟，两者也有很多相同点。比如存取数据的方法就是一样的。

```js
#localStorage和sessionStorage的一些方法：
#添加键值对： setItem(key,value);
#获取键值对： getItem(key);
#删除键值对： removeItem(key);
#清除所有键值对： clear();
#获取属性名称（键名称）： key(index);
#获取键值对的数量： length;

#localStorage 的存取方式
localStorage.age = 88; // 用localStorage属性的方式来添加条目
localStorage.setItem("animal","cat"); // 推荐使用setItem的方式存储一个名为animal，值为cat的数据
var animal = localStorage.getItem("animal"); //读取本地存储中名为animal的数据，并赋值给变量animal
console.log(animal);  
localStorage.removeItem("animal"); //删除单条数据
localStorage.clear(); //清除所有数据

#sessionStorage 的存取方式
sessionStorage.work = "police";
sessionStorage.setItem("person", "Li Lei");
var person = sessionStorage.getItem("person");
console.log(person);
```

## 跨域

另外，不同浏览器无法共享localStorage和sessionStorage中的信息。

同一浏览器的相同域名和端口的不同页面间可以共享相同的 localStorage，但是不同页面间无法共享sessionStorage的信息。

这里需要注意的是，页面仅指顶级窗口，如果一个页面包含多个iframe且他们属于同源页面，那么他们之间是可以共享sessionStorage的。

在实际开发过程中，遇到的最多的问题就是localStorage的同源策略问题。

为了了解这个问题，我们先得清楚什么是同源策略。

**同源策略（same-origin policy）是浏览器执行的一种安全措施，目的是为了保证用户信息的安全，防止恶意的网站窃取数据。**

浏览器的同源策略具体如下：

```
URL	                  说明	      是否允许通信
http://www.a.com/a.js
http://www.a.com/b.js	同一域名下	允许

http://www.a.com/lab/a.js
http://www.a.com/script/b.js	同一域名下不同文件夹	允许

http://www.a.com:8000/a.js
http://www.a.com/b.js	同一域名，不同端口	不允许

http://www.a.com/a.js
https://www.a.com/b.js	同一域名，不同协议	不允许

http://www.a.com/a.js
http://70.32.92.74/b.js	域名和域名对应ip	不允许

http://www.a.com/a.js
http://script.a.com/b.js	主域相同，子域不同	不允许

http://www.a.com/a.js
http://file.a.com/b.js	同一域名，不同二级域名（同上）	不允许（cookie这种情况下也不允许访问）

http://www.cnblogs.com/a.js
http://www.a.com/b.js	不同域名	不允许
```

# 解决方案

只要不同源就不能共享localStorage的数据。

但是在实际开发中又时常会遇到这样的需求，那我们该如何解决呢？

目前广泛采用的是postMessage和iframe相结合的方法。

postMessage(data,origin)方法允许来自不同源的脚本采用异步方式进行通信，可以实现跨文本档、多窗口、跨域消息传递。

接受两个参数：


data：要传递的数据，HTML5规范中提到该参数可以是JavaScript的任意基本类型或可复制的对象，然而并不是所有浏览器支持任意类型的参数，部分浏览器只能处理字符串参数，所以在传递参数时需要使用JSON.stringify()方法对对象参数序列化。

origin：字符串参数，指明目标窗口的源，协议+主机+端口号[+URL]，URL会被忽略，所以可以不写，只是为了安全考虑，postMessage()方法只会将message传递给指定窗口，当然也可以将参数设置为"*"，这样可以传递给任意窗口，如果要指定和当前窗口同源的话设置为"/"。

## 具体示例：

http://www.test.com/index_a.html

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>cross domain</title>
</head>
<body>
    <h2>Status</h2>
    <p></p>
    <a href="http://www.test2.com/index_b.html">去index_b查看结果</a>
    <iframe src="http://www.test2.com/getmessage.html" frameborder="0"></iframe>
    <script>
        window.onload = function(){
            //在页面加载完成后主页面向iframe发送请求
            window.frames[0].postMessage('jogging, reading and writing','http://www.test2.com');
        }

        // 主页面监听message事件,
        window.addEventListener('message', function(e){
            var data = e.data;
            document.querySelector('p').innerHTML = data;
        }, false);
    </script>
</body>
</html>
```

- http://www.test2.com/getmessage.html

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>getmessage</title>
</head>
<body>
    <script>
        //iframe接收消息，并把当前颜色发送给主页面  
        window.addEventListener('message', function(e) {  
            if (e.source != window.parent)   
                return;  
            console.log(e.data);
            localStorage.setItem('task',e.data);

            window.parent.postMessage('finished', '*');  
        }, false);
    </script>
</body>
</html>
```

- http://www.test2.com/index_b.html

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Document</title>
</head>
<body>
    <div>点击获取任务</div>
    <p></p>
    <script>
        document.querySelector('div').addEventListener('click', function(){
            document.querySelector('p').innerHTML = localStorage.getItem('task');
        }, false);
    </script>
</body>
</html>
```

以上示例中，很好的实现了localStorage的跨域存储功能。这样就算解决问题了吗？

我们还会遇到另一个棘手的问题。在safari浏览器下，这种方法就不可行了。

由于safari浏览器的默认限制，父页面无法向iframe里的跨域页面传递信息。这时针对safari浏览器就得另辟蹊径了。

本人在项目中用的方法是在safari浏览器下，用url传值的方法来实现跨域存储功能。

用这种方法有一个问题必须要先考虑的，就是safari浏览器的url能够支持多长的字符呢？ 

url的长度极限是由两方面决定的，一个是浏览器本身的限制，另一个就是服务器的限制。

有人在Apache 2.4服务器上设置了一个非常大的LimitRequestLine 和 LimitRequestFieldSize，然后进行测试，结果表明safari浏览器可以支持超过64k个字符的长度。

一般服务器默认支持2~3万个字符长度的url不成问题。

**所以只要需要传输的数据量不是非常大的话，可以直接通过url来进行传递，如此就能解决safari下的跨域存储问题**。

## URL 传值

这是一种非常简单的方式。

个人比较推荐。

# 参考资料

[localstorage的跨域存储方案](https://www.jianshu.com/p/e86d92aeae69)

* any list
{:toc}