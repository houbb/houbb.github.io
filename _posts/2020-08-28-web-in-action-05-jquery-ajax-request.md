---
layout: post
title:  web 实战-04-jquery 实现 ajax 请求
date:  2020-08-28 10:37:20 +0800
categories: [web]
tags: [web, http, sf]
published: true
---

# 依赖引入

此处使用 CDN 引入

```html
<script src="http://code.jquery.com/jquery-2.1.1.min.js"></script>
```

有时候国内上面的网络不通，可以尝试下百度的 CDN:

```html
<script src="http://libs.baidu.com/jquery/2.0.0/jquery.min.js"></script>
```

# ajax提交form表单方法

AJAX提交form表单，这在日常项目中是经常用到的。

前台无论是简单的html、jsp或者使用了easyui框架，只要是提交表单一般都会使用到AJAX。

## AJAX提交表单分为两种

1、无返回结果的，就是把表单数据直接提交给后台，让后台直接处理；

最简单的就是 `$("#formid").submit();` 直接将form表单提交到后台。

2、返回有结果的，这种情况下，后台不管是执行成功还是失败，最终的信息都需要返回到前台。

第二种是使用最多的一种，因为程序的执行成功与否都需要给用户提示，程序一般也都是多步完成的，执行完插入操作，需要发起流程，这就需要在界面上判断成功与否。ajax本身属于有返回结果的一类，其中的success方法就是处理后台返回结果的。

# ajax 提交表单的方式

## 将 form 表单数据序列化

```js
$.ajax({  
  type: "POST",  
  url:your-url,  
  data:$('#yourformid').serialize(),  
  async: false,  
  error: function(request) {  
      alert("Connection error");  
  },  
  success: function(data) {  
      //接收后台返回的结果  
  }  
});
```

需要注意的是，使用这种方法的前提是form表单中的项一定要有 `name` 属性，后台获取的键值对为 key=name 值，value=各项值。

注意：无论是input标签还是span标签或者其他标签，一定要有name属性，没有name属性后台是获取不到该项的。

## get 实战例子

### 后端

```java
@GetMapping("/get/noResult")
@ResponseBody
public void getObject(User user) {
    System.out.println("getObject called");
    System.out.println("user: " + user);
}
```

- 当然你也可以跳转到一个新的页面：

```java
@GetMapping("/get/pageResult")
public String getPageResult(User user) {
    System.out.println("pageResult called");
    System.out.println("user: " + user);
    return "index";
}
```

### 前端

```html
<form id="no-result-form">
    用户名：<input name="name" type="text">
    密码：<input name="password" type="password">
</form>

<button id="no-result-btn">提交</button>
```

- js

```js
<script src="http://libs.baidu.com/jquery/2.0.0/jquery.min.js"></script>
<script>
    $(function(){
        $("#no-result-btn").on('click', function () {
            $.ajax({
                type: "get",
                url: "/form/ajax/get/noResult",
                data: $('#no-result-form').serialize(),
            });
        });
    });
</script>
```

jquery 也可以这样写：

```js
$(document).ready(function(){
    //jQuery 实现
});
```

### ajax.get 语法

语法：

get() 方法通过远程 HTTP GET 请求载入信息。

这是一个简单的 GET 请求功能以取代复杂 $.ajax 。请求成功时可调用回调函数。

如果需要在出错时执行函数，请使用 $.ajax。

```
$(selector).get(url,data,success(response,status,xhr),dataType)
```

- url

必需。规定将请求发送的哪个 URL。

- data

可选。规定连同请求发送到服务器的数据。

- success(response,status,xhr)

可选。规定当请求成功时运行的函数。

额外的参数：

response - 包含来自请求的结果数据

status - 包含请求的状态

xhr - 包含 XMLHttpRequest 对象

- dataType

可选。规定预计的服务器响应的数据类型。

默认地，jQuery 将智能判断。

可能的类型：

"xml"

"html"

"text"

"script"

"json"

"jsonp"

### get 写法


上述请求也可以写成：

```js
$("#no-result-btn").on('click', function () {
    $.get(
        "/form/ajax/get/noResult",
        $('#no-result-form').serialize()
    );
});
```

这里的 `$('#no-result-form').serialize()` 是 jQuery 帮我们实现的表单序列化，实际上是对参数进行了拼接，等价于：

```js
$("#no-result-btn").on('click', function () {
    var name = $("#no-result-form input[name=name]").val();
    var password = $("#no-result-form input[name=password]").val();
    $.get(
        url: "/form/ajax/get/noResult",
        data: "name="+name+"&password="+password
    );
});
```

当然，对于 get 请求，我们也可以直接把参数拼接在 url 后面。

就像我们点击之后的 url 一样：http://localhost:8080/form/ajax/get/noResult?name=adminstrator&password=123456

```js
$("#no-result-btn").on('click', function () {
    var name = $("#no-result-form input[name=name]").val();
    var password = $("#no-result-form input[name=password]").val();
    $.get("/form/ajax/get/noResult?name="+name+"&password="+password);
});
```

### 测试

点击 url 变为 http://localhost:8080/form/ajax/get/noResult?name=adminstrator&password=123456

## get 解析响应结果

有时候我们需要给用户适当的提示，比如可能操作失败之类的。

### 后端

```java
@GetMapping("/get/textResult")
@ResponseBody
public String getTextResult(User user) {
    System.out.println("getObject called");
    System.out.println("user: " + user);
    return Resp.okJson();
}
```

这里返回的是一个 json，定义如下：

```java
public class Resp {

    private String code;

    private String message;

    //Getter & Setter

    public static String okJson() {
        Resp resp = new Resp();
        resp.setCode("0000");
        resp.setMessage("成功");
        return JSON.toJSONString(resp);
    }

}
```

### 前端

form 表单保持不变，我们新加一个按钮

```html
<button id="result-btn">提交获取结果</button>
```

对应 js

```js
$("#result-btn").on('click', function () {
    $.get("/form/ajax/get/textResult",
        $("#no-result-form").serialize(),
        function (data) {
            alert(data);
        }
    );
});
```

此时弹框显示 `{"code":"0000","message":"成功"}`

- 反序列化

我们通常都关心 code 是什么，然后进行提示。这个时候就需要对 json 结果反序列化。

```js
$("#result-btn").on('click', function () {
    $.get("/form/ajax/get/textResult",
        $("#no-result-form").serialize(),
        function (data) {
            var resp = JSON.parse(data);
            alert("响应码：" + resp.code+", 消息："+ resp.message)
        }
    );
});
```

提示：

```
响应码：0000, 消息：成功
```

## 传递 json 到后端

### 后端代码

```java
@PostMapping("/post/jsonParam")
@ResponseBody
public String postJsonParam(@RequestBody User user) {
    System.out.println("postJsonParam called");
    System.out.println("user: " + user);
    return Resp.okJson();
}
```

### 前端代码

form 不变，新加一个按钮。

```html
<button id="json-param-btn">提交JSON</button>
```

如何提交 json 参数到后端呢？

这就变成了如何对表单实现序列化的问题。

### 基本实现

```js
$("#json-param-btn").on('click', function () {
    var name = $("#no-result-form input[name=name]").val();
    var password = $("#no-result-form input[name=password]").val();
    var user = {};
    user.name = name;
    user.password = password;
    var json = JSON.stringify(user);
    console.log("json: " + json);
    $.ajax({
        type: "post",
        url: "/form/ajax/post/jsonParam",
        data: json,
        contentType: "application/json; charset=utf-8",
        async: true,
        success:function (data) {
            alert(data);
        }
    });
});
```

我们请求的参数是：

```json
{"name": "adminstrator", "password": "123456"}
```

功能虽然实现了，但是感觉很麻烦，几个属性还行，属性多了这样写很麻烦。

可以简单一些吗？

### jQuery 的序列化

- serialize()

jquery 自带的两种序列化方式，我们看下效果

```js
var form = $("#no-result-form");
console.log("serialize: " + form.serialize());
```

输出效果：

```
serialize: name=adminstrator&password=123456
```

- serializeArray()

实际输出如下：

```
[ 
  {name: 'name', value: 'admin'}, 
  {name: 'password', value: '123456'},
]
```

显然，这两种都不符合我们的需求。

### 自己实现

那只好自己实现一个了。

```js
$.fn.serializeObject = function()
{
	var o = {};
	var a = this.serializeArray();
	$.each(a, function() {
		if (o[this.name] !== undefined) {
			if (!o[this.name].push) {
				o[this.name] = [o[this.name]];
			}
			o[this.name].push(this.value || '');
		} else {
			o[this.name] = this.value || '';
		}
	});
	return o;
};
```

然后通过 `$("#form").serializeObject();` 就可以得到json对象

### 实际使用

下面实现之后，我们以后写表单的 json 序列化就会简单很多。

```js
<script src="http://libs.baidu.com/jquery/2.0.0/jquery.min.js"></script>
<script>
    $(function(){
        $.fn.serializeObject = function()
        {
            var o = {};
            var a = this.serializeArray();
            $.each(a, function() {
                if (o[this.name] !== undefined) {
                    if (!o[this.name].push) {
                        o[this.name] = [o[this.name]];
                    }
                    o[this.name].push(this.value || '');
                } else {
                    o[this.name] = this.value || '';
                }
            });
            return o;
        };

        $("#json-param-btn").on('click', function () {
            var form = $("#no-result-form").serializeObject();

            $.ajax({
                type: "post",
                url: "/form/ajax/post/jsonParam",
                data: JSON.stringify(form),
                contentType: "application/json; charset=utf-8",
                async: true,
                success:function (data) {
                    alert(data);
                }
            });
        });
    });
</script>
```




# JS 的序列化和反序列化

## 序列化

即js中的Object转化为字符串

（1）使用toJSONString

```js
var last=obj.toJSONString(); //将JSON对象转化为JSON字符 
```

（2）使用stringify

```js
var last=JSON.stringify(obj); //将JSON对象转化为JSON字符
```

## 反序列化

即js中JSON字符串转化为Object

(1)使用parse

```js
var obj = JSON.parse(data); //由JSON字符串转换为JSON对象
```

（2）使用parseJSON

```js
var obj = data.parseJSON(); //由JSON字符串转换为JSON对象
```

（3）使用eval

```js
var obj=eval("("+data+")");  
```

为什么要 eval这里要添加 "("+data+");//”呢？ 

原因在于：eval本身的问题。 

由于json是以”{}”的方式来开始以及结束的，在JS中，它会被当成一个语句块来处理，所以必须强制性的将它转换成一种表达式。

# 通过窗口查找form提交

```js
var obj = document.getElementById("xx_iframe").contentWindow;  
obj.$("#yourform").form("submit",{  
  success :function(data){  
      //对结果处理  
  }    
});
```

因为在当前界面上弹出对话框，然后在对话框上的按钮触发对话框中表单提交，对话框又是链接的另外的html页面，如此通过 `$("#formid")` 的方式是找不到对话框中的form的，因此这种情况下只能使用这种方式提交表单。

另外ajax中封装的get,post请求也都属于有返回结果的一类。

总的来说，无返回结果的和有返回结果的(将form表单数据序列化+通过窗口实现form提交)，form表单都必须要有name属性。

# 拓展阅读

axios

# 参考资料

[jqeury CDN](http://www.jq22.com/cdn/)

[jquery 拓展阅读](https://www.w3cschool.cn/ajax/ajax-uy1r2or1.html)

[jQuery ajax - ajax() 方法](https://www.w3school.com.cn/jquery/ajax_ajax.asp)

[jQuery ajax - get() 方法](https://www.w3school.com.cn/jquery/ajax_get.asp)

[js的json序列化和反序列化](js的json序列化和反序列化)

[ajax 请求](https://www.w3school.com.cn/jquery/ajax_ajax.asp)

[表单序列化为json字符串](https://blog.csdn.net/lzandwss/article/details/78728197)

* any list
{:toc}