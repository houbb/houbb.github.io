---
layout: post
title: Ajax 详解-01-AJAX（Asynchronous JavaScript and XML）入门介绍
date:  2020-3-27 17:53:59 +0800
categories: [HTML]
tags: [html, js, sh]
published: true
---

# 什么是Ajax

Ajax 是一种在无需重新加载整个网页的情况下，能够更新部分网页的技术。

Ajax的全称是Asynchronous JavaScript and XML，即异步JavaScript+XML。

它并不是新的编程语言，而是几种原有技术的结合体。

它由以下几种技术组合而成，包括：

- HTML/XHTML——主要的内容表示语言。

- CSS——为XHTML提供文本格式定义。

- DOM——对已载入的页面进行动态更新。

- XML——数据交换格式。

- XSLT——将XML转换为XHTML（用CSS修饰样式）。

- XMLHttp——用XMLHttpRequest来和服务器进行异步通信，是主要的通信代理。

- JavaScript——用来编写Ajax引擎的脚本语言。

实际上，在Ajax解决方案中这些技术都是可选的，不过只有三种是必须的：HTML/XHTML、DOM以及JavaScript。

# 使用方式

## 1. 创建Ajax核心对象XMLHttpRequest(记得考虑兼容性)

```js
var xhr=null;  
if (window.XMLHttpRequest)  
{// 兼容 IE7+, Firefox, Chrome, Opera, Safari  
xhr=new XMLHttpRequest();  
} else{// 兼容 IE6, IE5 
  xhr=new ActiveXObject("Microsoft.XMLHTTP");  
} 
```

## 2.向服务器发送请求

```js
xhr.open(method,url,async);  
send(string);//post请求时才使用字符串参数，否则不用带参数。
```

method：请求的类型；GET 或 POST

url：文件在服务器上的位置

async：true（异步）或 false（同步）

- 注意：post请求一定要设置请求头的格式内容

```js
xhr.open("POST","test.html",true);  
xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded");  
xhr.send("fname=Henry&lname=Ford");  //post请求参数放在send里面，即请求体
```

## 3.服务器响应处理（区分同步跟异步两种情况）

responseText 获得字符串形式的响应数据。

responseXML 获得XML 形式的响应数据。

### 3.1 同步处理

```js
xhr.open("GET","info.txt",false);  
xhr.send();  
document.getElementById("myDiv").innerHTML=xhr.responseText; //获取数据直接显示在页面上
```

### 3.2 异步处理

相对来说比较复杂，要在请求状态改变事件中处理。

```js
xhr.onreadystatechange=function()  { 
if (xhr.readyState==4 &&xhr.status==200)  { 
   document.getElementById("myDiv").innerHTML=xhr.responseText;  
  }
} 
```

# XMLHttpRequest对象

当需要异步与服务器交换数据时，需要XMLHttpRequest对象来异步交换。XMLHttpRequest对象的主要属性有：

```
onreadystatechange——每次状态改变所触发事件的事件处理程序。
responseText——从服务器进程返回数据的字符串形式。
responseXML——从服务器进程返回的DOM兼容的文档数据对象。
status——从服务器返回的数字代码，如404（未找到）和200（已就绪）。
status Text——伴随状态码的字符串信息。
readyState——对象状态值。对象状态值有以下几个：
0 - (未初始化)还没有调用send()方法
1 - (载入)已调用send()方法，正在发送请求
2 - (载入完成)send()方法执行完成
3 - (交互)正在解析响应内容
4 - (完成)响应内容解析完成，可以在客户端调用了
对于readyState的状态值，其中“0”状态是在定义后自动具有的状态值，而对于成功访问的状态（得到信息）我们大多数采用“4”进行判断。
```

Ajax的核心就是是JavaScript对象XmlHttpRequest，这个对象为向服务器发送请求和解析服务器响应提供了流畅的接口。

XmlHttpRequest可以使用JavaScript向服务器提出请求并处理响应，而不阻塞用户。

XHR对象由IE5率先引入，在IE5中XHR对象是通过MSXML库中一个ActiveX对象实现的，根据IE版本不同可能会遇到不同版本XHR对象，而IE7+与其它现代浏览器均支持原生的XHR对象，在这些浏览器中我们只需使用XMLHttpRequest构造函数就可以构造XHR对象，因此一个浏览器兼容的创建XHR对象的函数写法大概是这个样子：

```js
var xmlhttp;
if (window.XMLHttpRequest) {
  // code for IE7+, Firefox, Chrome, Opera, Safari
  xmlhttp=new XMLHttpRequest();
} else {
  // code for IE6, IE5
  xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
}
```

# XMLHttpRequest对象用法

XMLHttpRequest对象有两个重要方法 open 与 send。

## 1. open() 方法

open() 有三个参数。第一个参数定义发送请求所使用的方法，第二个参数规定服务器端脚本的URL，第三个参数规定应当对请求进行异步地处理。

```js
xmlHttp.open("GET","test.php",true);
```

对于open方法，有几点需要注意：

1. URL是相对于当前页面的路径，也可以似乎用绝对路径。

2. open方法不会向服务器发送真正请求，它相当于初始化请求并准备发送。

3. 只能向同一个域中使用相同协议和端口的URL发送请求，否则会因为安全原因报错。

4. 真正能够向服务器发送请求需要调用send方法，并仅在POST请求可以传入参数，不需要则发送null，在调用send方法之后请求被发往服务器。  

请求发往服务器，服务器根据请求生成响应（Response），传回给XHR对象，在收到响应后相应数据会填充到XHR对象的属性，有四个相关属性会被填充：

- responseText——从服务器进程返回数据的字符串形式。

- responseXML——从服务器进程返回的DOM兼容的文档数据对象。

- status——从服务器返回的数字代码，如404（未找到）和200（已就绪）。

- status Text——伴随状态码的字符串信息。

在收到响应后第一步是检查响应状态，确保响应是否成功返回（状态为200）。

```js
xhr.open('get','default.aspx,false'); //准备同步请求
xhr.send();
if(xhr.status>=200 && xhr.status<300 || xhr.status==304){
     //do something
}else{
      //error handler
}
```

上面代码在发送同步请求的时候没问题，只有得到响应后才会执行检查status语句，但是在异步请求时，JavaScript会继续执行，不等生成响应就检查状态码，这样我们不能保证检查状态码语句是在得到响应后执行（实际上也几乎不可能，服务器再快一个HTTP请求也不会快过一条JavaScript执行数度），这时候我们可以检查XHR对象的readyState属性，该属性表示请求/响应过程中的当前活动阶段，每当readyState值改变的时候都会触发一次onreadystatechange事件。

我们可以利用这个事件检查每次readyState变化的值，当为4的时候表示所有数据准备就绪，有一点我们需要注意：

**必须在open方法之前指定onreadtstatechange事件处理程序。**

```js
xmlhttp.onreadystatechange=function(){
  if (xmlhttp.readyState==4 && xmlhttp.status==200){
    document.getElementById("myDiv").innerHTML=xmlhttp.responseText;
    }
  }
xmlhttp.open("GET","/try/ajax/ajax_info.txt",true);
xmlhttp.send();
```

## 2. send() 方法

send() 方法将请求送往服务器。

如果我们假设 HTML 文件和 PHP 文件位于相同的目录，那么代码是这样的：

```js
xmlHttp.send(null);
```

## 其他方法

![其他方法](https://img-blog.csdn.net/20150716190353170)


# GET 还是 POST？

与 POST 相比，GET 更简单也更快，并且在大部分情况下都能用。

然而，在以下情况中，请使用 POST 请求：

1. 无法使用缓存文件（更新服务器上的文件或数据库）

2. 向服务器发送大量数据（POST 没有数据量限制）

3. 发送包含未知字符的用户输入时，POST 比 GET 更稳定也更可靠

## Get

一个简单的 GET 请求：

```js
xmlhttp.open("GET","demo_get.html",true);
xmlhttp.send();
```

在上面的例子中，可能得到的是缓存的结果。

为了避免这种情况，向 URL 添加一个唯一的 ID：

```js
xmlhttp.open("GET","demo_get.html?t=" + Math.random(),true);
xmlhttp.send();
```

如果希望通过 GET 方法发送信息，向 URL 添加信息：

```js
xmlhttp.open("GET","demo_get2.html?fname=Henry&lname=Ford",true);
xmlhttp.send();
```

## 一个简单 POST 请求：

```js
xmlhttp.open("POST","demo_post.html",true);
xmlhttp.send();
```

如果需要像 HTML 表单那样 POST 数据，请使用 setRequestHeader() 来添加 HTTP 头。

然后在 send() 方法中规定您希望发送的数据：

```js
xmlhttp.open("POST","ajax_test.html",true);
xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
xmlhttp.send("fname=Henry&lname=Ford");
```

## open() 

open() 方法的 url 参数是服务器上文件的地址：

```js
xmlhttp.open("GET","ajax_test.html",true);
```

该文件可以是任何类型的文件，比如 .txt 和 .xml，或者服务器脚本文件，比如 .asp 和 .php （在传回响应之前，能够在服务器上执行任务）。

# 异步 - True 或 False？

XMLHttpRequest 对象如果要用于 AJAX 的话，其 open() 方法的 async 参数必须设置为 true：

```js
xmlhttp.open("GET","ajax_test.html",true);
```

对于 web 开发人员来说，发送异步请求是一个巨大的进步。

很多在服务器执行的任务都相当费时。

AJAX 出现之前，这可能会引起应用程序挂起或停止。

通过 AJAX，JavaScript 无需等待服务器的响应，而是：

1. 在等待服务器响应时执行其他脚本

2. 当响应就绪后对响应进行处理

当使用 async=true 时，规定在响应处于 onreadystatechange 事件中的就绪状态时执行的函数：

```js
xmlhttp.onreadystatechange=function(){
  if (xmlhttp.readyState==4 && xmlhttp.status==200){
    document.getElementById("myDiv").innerHTML=xmlhttp.responseText;
    }
  }
xmlhttp.open("GET","ajax_info.txt",true);
xmlhttp.send();
```

# AJAX状态值与状态码区别

AJAX状态值是指，运行AJAX所经历过的几种状态，无论访问是否成功都将响应的步骤，可以理解成为AJAX运行步骤。

如：正在发送，正在响应等，由AJAX对象与服务器交互时所得；使用“ajax.readyState”获得。（由数字1~4单位数字组成）

AJAX状态码是指，无论AJAX访问是否成功，由HTTP协议根据所提交的信息，服务器所返回的HTTP头信息代码，该信息使用“ajax.status”所获得；（由数字1XX,2XX三位数字组成，详细查看RFC）

这就是我们在使用AJAX时为什么采用下面的方式判断所获得的信息是否正确的原因。

```js
if(ajax.readyState == 4 && ajax.status == 200) {。。。。);}
```

## AJAX运行步骤与状态值说明

在AJAX实际运行当中，对于访问XMLHttpRequest（XHR）时并不是一次完成的，而是分别经历了多种状态后取得的结果，对于这种状态在AJAX中共有5种，分别是：

```
0 - (未初始化)还没有调用send()方法
1 - (载入)已调用send()方法，正在发送请求
2 - (载入完成)send()方法执行完成，
3 - (交互)正在解析响应内容
4 - (完成)响应内容解析完成，可以在客户端调用了
```

对于上面的状态，其中“0”状态是在定义后自动具有的状态值，而对于成功访问的状态（得到信息）我们大多数采用“4”进行判断。

## AJAX状态码说明

```
1**：请求收到，继续处理
2**：操作成功收到，分析、接受
3**：完成此请求必须进一步处理
4**：请求包含一个错误语法或不能完成
5**：服务器执行一个完全有效请求失败
```

再具体就如下：

```
100——客户必须继续发出请求
101——客户要求服务器根据请求转换HTTP协议版本
200——交易成功
201——提示知道新文件的URL
202——接受和处理、但处理未完成
203——返回信息不确定或不完整
204——请求收到，但返回信息为空
205——服务器完成了请求，用户代理必须复位当前已经浏览过的文件
206——服务器已经完成了部分用户的GET请求
300——请求的资源可在多处得到
301——删除请求数据
302——在其他地址发现了请求数据
303——建议客户访问其他URL或访问方式
304——客户端已经执行了GET，但文件未变化
305——请求的资源必须从服务器指定的地址得到
306——前一版本HTTP中使用的代码，现行版本中不再使用
307——申明请求的资源临时性删除
400——错误请求，如语法错误
401——请求授权失败
402——保留有效ChargeTo头响应
403——请求不允许
404——没有发现文件、查询或URl
405——用户在Request-Line字段定义的方法不允许
406——根据用户发送的Accept拖，请求资源不可访问
407——类似401，用户必须首先在代理服务器上得到授权
408——客户端没有在用户指定的饿时间内完成请求
409——对当前资源状态，请求不能完成
410——服务器上不再有此资源且无进一步的参考地址
411——服务器拒绝用户定义的Content-Length属性请求
412——一个或多个请求头字段在当前请求中错误
413——请求的资源大于服务器允许的大小
414——请求的资源URL长于服务器允许的长度
415——请求资源不支持请求项目格式
416——请求中包含Range请求头字段，在当前请求资源范围内没有range指示值，请求也不包含If-Range请求头字段
417——服务器不满足请求Expect头字段指定的期望值，如果是代理服务器，可能是下一级服务器不能满足请求
500——服务器产生内部错误
501——服务器不支持请求的函数
502——服务器暂时不可用，有时是为了防止发生系统过载
503——服务器过载或暂停维修
504——关口过载，服务器使用另一个关口或服务来响应用户，等待时间设定值较长
505——服务器不支持或拒绝支请求头中指定的HTTP版本
```

# ajax的优点

Ajax的给我们带来的好处大家基本上都深有体会，在这里我只简单的讲几点：

## 无刷新更新数据。
AJAX最大优点就是能在不刷新整个页面的前提下与服务器通信维护数据。这使得Web应用程序更为迅捷地响应用户交互，并避免了在网络上发送那些没有改变的信息，减少用户等待时间，带来非常好的用户体验。

## 异步与服务器通信。

AJAX使用异步方式与服务器通信，不需要打断用户的操作，具有更加迅速的响应能力。优化了Browser和Server之间的沟通，减少不必要的数据传输、时间及降低网络上数据流量。

## 前端和后端负载平衡。

AJAX可以把以前一些服务器负担的工作转嫁到客户端，利用客户端闲置的能力来处理，减轻服务器和带宽的负担，节约空间和宽带租用成本。并且减轻服务器的负担，AJAX的原则是“按需取数据”，可以最大程度的减少冗余请求和响应对服务器造成的负担，提升站点性能。

## 基于标准被广泛支持。

AJAX基于标准化的并被广泛支持的技术，不需要下载浏览器插件或者小程序，但需要客户允许JavaScript在浏览器上执行。随着Ajax的成熟，一些简化Ajax使用方法的程序库也相继问世。同样，也出现了另一种辅助程序设计的技术，为那些不支持JavaScript的用户提供替代功能。

## 界面与应用分离。

Ajax使WEB中的界面与应用分离（也可以说是数据与呈现分离），有利于分工合作、减少非技术人员对页面的修改造成的WEB应用程序错误、提高效率、也更加适用于现在的发布系统。

# AJAX的缺点

## AJAX干掉了Back和History功能，即对浏览器机制的破坏。

在动态更新页面的情况下，用户无法回到前一个页面状态，因为浏览器仅能记忆历史记录中的静态页面。一个被完整读入的页面与一个已经被动态修改过的页面之间的差别非常微妙；用户通常会希望单击后退按钮能够取消他们的前一次操作，但是在Ajax应用程序中，这将无法实现。

## AJAX的安全问题。

AJAX技术给用户带来很好的用户体验的同时也对IT企业带来了新的安全威胁，Ajax技术就如同对企业数据建立了一个直接通道。

这使得开发者在不经意间会暴露比以前更多的数据和服务器逻辑。

Ajax的逻辑可以对客户端的安全扫描技术隐藏起来，允许黑客从远端服务器上建立新的攻击。

还有Ajax也难以避免一些已知的安全弱点，诸如跨站点脚步攻击、SQL注入攻击和基于Credentials的安全漏洞等等。

## 对搜索引擎支持较弱。

对搜索引擎的支持比较弱。如果使用不当，AJAX会增大网络数据的流量，从而降低整个系统的性能。

## 破坏程序的异常处理机制。

至少从目前看来，像Ajax.dll，Ajaxpro.dll这些Ajax框架是会破坏程序的异常机制的。

关于这个问题，曾在开发过程中遇到过，但是查了一下网上几乎没有相关的介绍。

后来做了一次试验，分别采用Ajax和传统的form提交的模式来删除一条数据……给我们的调试带来了很大的困难。

## 违背URL和资源定位的初衷。

例如，我给你一个URL地址，如果采用了Ajax技术，也许你在该URL地址下面看到的和我在这个URL地址下看到的内容是不同的。这个和资源定位的初衷是相背离的。

## AJAX不能很好支持移动设备。

一些手持设备（如手机、PDA等）现在还不能很好的支持Ajax，比如说我们在手机的浏览器上打开采用Ajax技术的网站时，它目前是不支持的。

## 客户端过肥，太多客户端代码造成开发上的成本。

编写复杂、容易出错 ；冗余代码比较多（层层包含js文件是AJAX的通病，再加上以往的很多服务端代码现在放到了客户端）；破坏了Web的原有标准。


# chat

## 详细介绍一下 ajax

**AJAX**（Asynchronous JavaScript and XML）是一种用于在网页中实现异步数据交换技术的术语。

通过使用 AJAX，网页可以在不刷新整个页面的情况下，异步获取数据并更新页面的部分内容。

以下是对 AJAX 的详细介绍：

### 1. **基本概念**
- **异步性**：AJAX 的核心特点是异步，即在向服务器请求数据时，页面的其他部分可以继续正常运行，不会被阻塞。传统的网页请求是同步的，需要等待服务器响应才能继续执行后续操作，而 AJAX 请求不需要等待响应，可以立即继续其他任务。
  
- **JavaScript**：AJAX 是通过 JavaScript 来执行的。JavaScript 可以在浏览器中创建并发送 HTTP 请求，并在服务器响应后处理返回的数据。

- **XML**：尽管 AJAX 的名字里有 XML，但它并不限于使用 XML 格式的数据。AJAX 请求可以处理多种数据格式，例如 JSON、HTML、纯文本等。

### 2. **工作原理**
AJAX 的工作流程大致如下：
1. **创建 XMLHttpRequest 对象**：这是执行 AJAX 请求的关键对象，它允许 JavaScript 在后台与服务器通信。
  
2. **发送请求**：通过 XMLHttpRequest 对象，JavaScript 可以发送 HTTP 请求到服务器。请求可以是 GET 或 POST 等方法。

3. **接收响应**：服务器处理请求并返回数据（例如 JSON 或 XML 格式）。浏览器接收到服务器的响应数据后，通过 JavaScript 对其进行处理。

4. **更新网页内容**：根据接收到的响应数据，JavaScript 可以更新网页的部分内容，而无需重新加载整个页面。

### 3. **使用示例**
以下是一个简单的 AJAX 请求示例，使用 JavaScript 的 XMLHttpRequest 对象发送一个 GET 请求，并将响应数据显示在网页上：

```javascript
// 创建 XMLHttpRequest 对象
var xhr = new XMLHttpRequest();

// 指定处理服务器响应的函数
xhr.onreadystatechange = function() {
  if (xhr.readyState === 4 && xhr.status === 200) {
    // 处理服务器返回的响应数据
    document.getElementById("result").innerHTML = xhr.responseText;
  }
};

// 初始化 GET 请求（异步）
xhr.open("GET", "https://api.example.com/data", true);

// 发送请求
xhr.send();
```

### 4. **AJAX 与 JSON**
现代 Web 开发中，JSON（JavaScript Object Notation）比 XML 更常用。JSON 是一种轻量级的数据交换格式，易于人们阅读和编写，也易于机器解析和生成。

```javascript
// 创建 XMLHttpRequest 对象
var xhr = new XMLHttpRequest();

// 指定处理服务器响应的函数
xhr.onreadystatechange = function() {
  if (xhr.readyState === 4 && xhr.status === 200) {
    // 将 JSON 响应解析为对象
    var data = JSON.parse(xhr.responseText);
    document.getElementById("result").innerHTML = data.name; // 假设 JSON 响应有一个 name 字段
  }
};

// 初始化 GET 请求（异步）
xhr.open("GET", "https://api.example.com/data", true);

// 发送请求
xhr.send();
```

### 5. **AJAX 的优势**
- **提高用户体验**：通过 AJAX，可以实现局部页面刷新，从而提高用户体验，使得页面响应更加迅速。
  
- **减少服务器压力**：由于无需重新加载整个页面，AJAX 可以减少服务器的负载，只请求所需的数据。

- **丰富的交互性**：AJAX 允许开发人员创建更加动态和互动的网页应用程序，例如实时搜索建议、自动保存等功能。

### 6. **AJAX 的劣势**
- **浏览器兼容性**：虽然现代浏览器都支持 XMLHttpRequest，但早期的浏览器之间存在一些兼容性问题。
  
- **调试困难**：AJAX 的异步特性有时会使调试和故障排除变得更复杂。
  
- **安全性问题**：由于 AJAX 请求通常涉及与服务器的通信，可能存在跨站请求伪造（CSRF）等安全问题，需要开发人员加以注意和防范。

### 7. **现代替代品**
随着 Web 技术的发展，出现了比传统 AJAX 更现代的替代品，如 `Fetch API`、`Axios`、`jQuery.ajax()` 等。这些工具提供了更简单、更直观的接口，来进行异步请求和数据处理。

### 8. **Fetch API 示例**
```javascript
fetch('https://api.example.com/data')
  .then(response => response.json())
  .then(data => {
    document.getElementById("result").innerHTML = data.name;
  })
  .catch(error => console.error('Error:', error));
```

### 9. **总结**
AJAX 是一种强大的工具，使得 Web 应用程序能够更加动态和响应迅速。尽管已经有了更现代的替代技术，但 AJAX 仍然是理解和实现异步操作的重要基础。

## 为什么需要 ajax

AJAX 是现代 Web 开发中不可或缺的一部分，其存在解决了传统网页交互中的许多问题。

以下是使用 AJAX 的主要原因：

### 1. **提升用户体验**
- **局部刷新**：在没有 AJAX 之前，网页上的任何数据更新都需要刷新整个页面。这种操作不仅耗时，还会打断用户的操作。通过 AJAX，网页可以实现局部刷新，只更新特定区域的内容，从而让用户感到页面更加流畅和响应迅速。
  
- **无刷新操作**：用户在提交表单、搜索内容或更新数据时，可以立即看到结果而不必等待页面重新加载。这种无缝的体验显著提升了用户的满意度。

### 2. **提高应用性能**
- **减少数据传输量**：由于 AJAX 只请求和传输需要更新的数据，而不是整个网页的内容，因此可以显著减少数据传输量，降低服务器和客户端的负担。
  
- **降低服务器负载**：传统网页每次刷新都会向服务器发送完整的页面请求，而 AJAX 只请求特定的数据资源，减少了服务器的处理压力。

### 3. **增强动态交互**
- **实时数据更新**：通过 AJAX，可以实现像聊天应用、实时股票报价、天气更新等需要频繁数据更新的功能，而不会对页面的其他部分造成影响。
  
- **异步操作**：AJAX 的异步特性允许网页在后台执行请求，而不会阻塞用户的其他操作。例如，用户可以在数据加载的同时继续浏览页面或执行其他任务。

### 4. **增强用户与服务器的交互**
- **即时反馈**：用户提交表单或执行某些操作后，服务器可以立即响应并反馈结果。比如在用户输入时提供实时的输入验证、自动保存草稿等功能。
  
- **后台数据处理**：在用户不知道的情况下，AJAX 可以在后台与服务器进行数据通信，完成诸如文件上传、数据同步等任务，而不干扰用户当前的操作。

### 5. **提供更加复杂和丰富的 Web 应用**
- **单页应用（SPA）**：AJAX 是单页应用的核心技术之一，通过 AJAX，单页应用可以实现内容的动态加载和更新，而不需要页面的完整刷新，从而提供类似桌面应用程序的流畅体验。
  
- **无缝整合第三方服务**：很多现代应用需要与第三方服务进行集成，如地图、支付网关、社交媒体分享等。AJAX 允许在不离开当前页面的情况下，与这些服务进行交互。

### 6. **历史兼容性与普遍性**
- **广泛支持**：尽管现代替代品如 Fetch API 和 Axios 提供了更简洁的接口，但 AJAX（特别是 XMLHttpRequest 对象）在所有主流浏览器中都得到了良好的支持。这使得 AJAX 成为开发者在构建跨浏览器兼容性应用时的可靠选择。

### 7. **节省时间和成本**
- **更高的开发效率**：通过 AJAX 技术，开发者可以更轻松地创建动态和交互性强的网页应用程序，而无需编写复杂的后台逻辑，节省开发时间和成本。

### 总结
AJAX 的主要价值在于它能够显著提高 Web 应用的用户体验、性能和交互能力。

通过实现异步数据交换和局部页面更新，AJAX 使得网页应用变得更加响应迅速、功能丰富，并且能够处理更复杂的用户需求。

## ajax 有什么优缺点？

AJAX 技术在 Web 开发中具有显著的优势，但也存在一些缺点和限制。

以下是 AJAX 的优缺点详细分析：

### **优点**

1. **提高用户体验**
   - **局部刷新**：AJAX 允许在不刷新整个页面的情况下更新页面的特定部分，使得用户操作更加流畅、自然。页面加载速度更快，用户无需等待整个页面重新加载。
   
   - **无刷新操作**：表单提交、搜索查询等操作可以在后台进行处理，用户能够立即看到结果，而不会因为页面刷新而中断操作。

2. **提高应用性能**
   - **减少数据传输量**：因为 AJAX 只传输必要的数据，而不是整个页面的内容，所以网络带宽的使用更为高效，加载时间也更短。
   
   - **降低服务器负载**：服务器只需要处理和返回请求的数据，而不是整个页面，这减少了服务器的处理压力和响应时间。

3. **增强动态交互**
   - **实时数据更新**：AJAX 使得页面能够实时更新数据，如实时搜索建议、动态数据加载等，提高了应用的互动性。
   
   - **异步操作**：AJAX 的异步特性允许在后台进行数据请求，用户可以继续与页面进行交互，而不会被操作阻塞。

4. **丰富的功能支持**
   - **单页应用（SPA）**：AJAX 是单页应用的重要技术，通过它可以实现页面部分内容的动态加载，而无需重新加载整个页面，提供桌面应用般的用户体验。
   
   - **跨平台兼容性**：AJAX 技术在所有主流浏览器中得到了广泛支持，使得开发者可以轻松构建跨浏览器兼容的应用。

5. **增强的应用灵活性**
   - **第三方集成**：AJAX 可以无缝地与第三方服务进行整合，例如地图服务、支付网关、社交媒体分享等，丰富应用的功能。

### **缺点**

1. **浏览器兼容性问题**
   - **历史浏览器问题**：尽管现代浏览器普遍支持 AJAX，但早期浏览器之间的实现方式存在差异，可能需要开发者编写额外的代码来处理这些差异，增加了开发的复杂性。

2. **调试困难**
   - **异步操作调试难度大**：由于 AJAX 请求是异步的，调试代码可能会变得更加复杂，尤其是在处理多个并发请求时，调试和故障排除变得更加困难。

3. **搜索引擎优化（SEO）问题**
   - **内容不易被索引**：由于 AJAX 动态加载的内容可能不会被搜索引擎索引，这可能会影响页面的 SEO 效果。虽然现代的搜索引擎能够处理部分 AJAX 加载内容，但仍存在一定的限制。

4. **安全性问题**
   - **跨站请求伪造（CSRF）**：AJAX 的广泛使用可能带来安全隐患，例如跨站请求伪造。开发者需要采取额外的安全措施，如使用 CSRF 令牌，来防范此类攻击。
   
   - **数据泄露风险**：通过 AJAX 请求传输的敏感数据在未加密的情况下可能被截获，因此需要确保数据传输的安全性。

5. **可能影响浏览器历史记录**
   - **浏览器导航问题**：由于 AJAX 请求不刷新页面，浏览器的前进和后退按钮可能不会像预期那样工作，需要额外处理浏览器的历史记录和状态管理。

6. **依赖 JavaScript**
   - **JavaScript 的依赖性**：AJAX 依赖于 JavaScript，如果用户禁用了浏览器中的 JavaScript 或浏览器不支持 JavaScript，那么 AJAX 功能将无法正常工作，可能需要提供备用的非 AJAX 功能。

### **总结**
AJAX 是一项强大且广泛应用的技术，可以显著提升 Web 应用的用户体验和性能。

然而，它也带来了一些挑战，如浏览器兼容性、安全问题和调试难度。开发者在使用 AJAX 时需要权衡这些优缺点，并采取适当的措施来应对潜在的缺陷。

## 现代前端有哪些 ajax 的替代方案？解决了什么问题？

现代前端开发中，虽然 AJAX 仍然在使用，但有许多更简洁、更强大的替代方案被广泛采用。这些替代方案不仅简化了异步请求的编写，还解决了一些传统 AJAX 的缺点和局限性。以下是几种常见的替代方案及其解决的问题：

### 1. **Fetch API**

#### **简介**:
Fetch API 是现代浏览器中内置的一个用于发起网络请求的接口。它比 XMLHttpRequest 更加简洁和直观，支持 Promise 机制，简化了异步操作的处理。

#### **解决的问题**:
- **简洁性**: Fetch API 提供了更简洁的语法，消除了回调地狱的问题。通过使用 Promise，可以更轻松地处理链式操作和错误捕获。
- **JSON 处理更便捷**: Fetch API 直接支持 JSON 格式的响应处理，通过 `.json()` 方法可以轻松地将响应解析为 JavaScript 对象。
- **现代浏览器支持**: Fetch API 得到了现代浏览器的广泛支持，符合 Web 标准，且更加模块化和易于使用。

#### **示例**:
```javascript
fetch('https://api.example.com/data')
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));
```

### 2. **Axios**

#### **简介**:
Axios 是一个基于 Promise 的 HTTP 客户端，可以用于浏览器和 Node.js。

它提供了丰富的功能，并且在处理请求和响应方面具有很高的灵活性。

#### **解决的问题**:
- **更好的浏览器兼容性**: Axios 自动处理了诸如跨域请求、JSON 数据序列化等常见问题，并且在老旧浏览器中也能良好工作。
- **请求和响应拦截器**: Axios 提供了请求和响应拦截器，可以在请求或响应之前轻松添加自定义逻辑，如在请求头中加入认证 token 或统一处理错误响应。
- **取消请求**: Axios 支持取消请求的功能，在处理用户频繁发起的请求时（如搜索建议）特别有用，避免不必要的资源浪费。
- **自动处理 JSON 数据**: Axios 自动处理 JSON 数据的序列化和反序列化，简化了与服务器的数据交互。

#### **示例**:
```javascript
axios.get('https://api.example.com/data')
  .then(response => console.log(response.data))
  .catch(error => console.error('Error:', error));
```

### 3. **GraphQL**

#### **简介**:
GraphQL 是一种用于 API 的查询语言，与 REST 不同，它允许客户端指定所需的数据结构。客户端只需一次请求即可获取所需的所有数据，避免了多个 AJAX 请求的问题。

#### **解决的问题**:
- **数据获取效率**: GraphQL 允许客户端精确指定所需的数据，减少了过多或过少数据传输的问题，尤其在复杂数据结构中更为高效。
- **减少请求数量**: 通过 GraphQL，可以在一次请求中获取多个资源的数据，而不需要发起多个独立的 AJAX 请求。
- **灵活性**: GraphQL 提供了比 REST API 更灵活的数据查询方式，适应复杂和动态的数据需求。

#### **示例**:
```javascript
fetch('https://api.example.com/graphql', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    query: `
      {
        user(id: "1") {
          name
          email
        }
      }
    `,
  }),
})
.then(response => response.json())
.then(data => console.log(data));
```

### 4. **jQuery.ajax()**

#### **简介**:
尽管 jQuery 已经不再是现代前端开发的主流选择，但其 `$.ajax()` 方法仍然广泛使用，尤其是在维护老旧代码库时。

#### **解决的问题**:
- **跨浏览器兼容性**: jQuery 简化了跨浏览器 AJAX 请求的实现，在 IE 等老旧浏览器中表现稳定。
- **丰富的功能选项**: `$.ajax()` 提供了丰富的配置选项，可以很方便地进行各种请求设置和处理。
- **简化代码**: jQuery 封装了复杂的 AJAX 请求，简化了开发工作量，尤其是在需要处理 DOM 操作时。

#### **示例**:
```javascript
$.ajax({
  url: 'https://api.example.com/data',
  method: 'GET',
  success: function(data) {
    console.log(data);
  },
  error: function(error) {
    console.error('Error:', error);
  }
});
```

### 5. **SuperAgent**

#### **简介**:
SuperAgent 是一个轻量级的 HTTP 请求库，功能丰富，适用于 Node.js 和浏览器环境。它提供了简单易用的链式 API，非常适合异步操作。

#### **解决的问题**:
- **链式操作**: SuperAgent 采用链式 API 风格，使得请求配置和响应处理更加直观。
- **灵活的插件支持**: SuperAgent 支持各种插件，能够扩展其功能，如自动重试、认证等。
- **错误处理**: 提供了更为灵活的错误处理机制，能够在网络请求失败时进行更好的故障处理。

#### **示例**:
```javascript
superagent
  .get('https://api.example.com/data')
  .then(response => console.log(response.body))
  .catch(error => console.error('Error:', error));
```

### **总结**

这些替代方案之所以受欢迎，是因为它们解决了传统 AJAX 的一些缺点，如回调地狱、复杂的错误处理、浏览器兼容性问题等。

同时，这些新工具提供了更现代、更高效的接口，让开发者能够更轻松地处理复杂的异步数据请求。

# 参考资料

[Ajax基本概念和原理](https://www.cnblogs.com/dulmcat/p/5812062.html)

[一 Ajax技术与原理](https://www.cnblogs.com/666666CFH88888888/p/9832401.html)

[Ajax原理一篇就够了](https://www.imooc.com/article/35241)

[Ajax工作原理及实例](https://www.jianshu.com/p/de06085dae7d)

[面试题 —— Ajax的基本原理总结](https://blog.csdn.net/chenjuan1993/article/details/81626487)

* any list
{:toc}