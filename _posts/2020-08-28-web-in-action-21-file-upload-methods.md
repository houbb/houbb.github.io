---
layout: post
title:  web 实战-21-文件上传的 3 种方式：伪刷新、文件流、Base64
date:  2020-08-28 10:37:20 +0800
categories: [web]
tags: [web, http, sf]
published: true
---

# 伪刷新上传

伪刷新，在iframe标签进行上传提交操作，因为iframe已经隐藏了，它刷新了用户也看不到

```html
<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title></title>
    <script>
        onload = function () {
            filedata.onchange = function () {
                if (filedata.files.length > 0) {
                    form1.submit();
                }
            };
            btn1.onclick = function () {
                var str = iframeBox.document.body.innerHTML;
                var res = JSON.parse(str);
                p1.innerHTML = str;
                if (res.Path) {
                    p2.innerHTML = '<img src="' + res.Path + '" />';
                }
            };
        };
    </script>
</head>
<body>

    <form id="form1" method="post" enctype="multipart/form-data" target="iframeBox" action="Handler1.ashx">
        <input type="file" id="filedata" name="FileData" />
    </form>

    <iframe id="iframeBox" name="iframeBox" style="display:none"></iframe>

    <br />

    <div>
        <input type="button" id="btn1" value="获取返回值" />
        <p id="p1"></p>
        <p id="p2"></p>
    </div>

</body>
</html>
```

对应的 action 实现

```java
public void ProcessRequest(HttpContext context)
{
    HttpPostedFile file = context.Request.Files["FileData"];
    if (!file.ContentType.Contains("image/"))
    {
        context.Response.Write("{\"Msg\":\"请上传图片！\",\"Path\":\"\"}");
        context.Response.End();
    }
    string[] arr = file.FileName.Split(new char[] { '.' }, StringSplitOptions.RemoveEmptyEntries);

    DateTime now = DateTime.Now;
    string fileName = Guid.NewGuid().ToString() + "." + arr[arr.Length - 1];
    string relPath = string.Format("/Upload/{0}{1}{2}/", now.Year.ToString(), now.Month.ToString(), now.Day.ToString());
    string absPath = context.Request.MapPath("~" + relPath);
    if (!Directory.Exists(absPath))
    {
        Directory.CreateDirectory(absPath);
    }
    file.SaveAs(absPath + fileName);

    context.Response.Write("{\"Msg\":\"成功！\",\"Path\":\"" + relPath + fileName + "\"}");
}
```

# FormData 上传

[FormData](https://developer.mozilla.org/zh-CN/docs/Web/API/FormData/Using_FormData_Objects)

FormData对象用以将数据编译成键值对，以便用XMLHttpRequest来发送数据。

其主要用于发送表单数据，但亦可用于发送带键数据(keyed data)，而独立于表单使用。

如果表单enctype属性设为multipart/form-data ，则会使用表单的submit()方法来发送数据，从而，发送数据具有同样形式。

## 前端

```html
<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title></title>
</head>
<body>
    <input type="file" id="FileData" />
    <br />
    <input type="button" id="btn1" value="上传" />
    <script>
        btn1.onclick = function () {
            var formData = new FormData();
            formData.append("FileData", FileData.files[0]);
            var request = new XMLHttpRequest();
            request.open("POST", "Handler1.ashx");
            request.onload = function (e) {
                if (request.status == 200) {
                    var res = e.target.responseText;
                }
            };
            request.send(formData);
        };
    </script>
</body>
</html>
```

后端保持不变。

## 从零开始创建FormData对象

你可以自己创建一个FormData对象，然后调用它的append()方法来添加字段，像这样：

```js
var formData = new FormData();

formData.append("username", "Groucho");
formData.append("accountnum", 123456); //数字123456会被立即转换成字符串 "123456"

// HTML 文件类型input，由用户选择
formData.append("userfile", fileInputElement.files[0]);

// JavaScript file-like 对象
var content = '<a id="a"><b id="b">hey!</b></a>'; // 新文件的正文
var blob = new Blob([content], { type: "text/xml"});

formData.append("webmasterfile", blob);

var request = new XMLHttpRequest();
request.open("POST", "http://foo.com/submitform.php");
request.send(formData);
```

## 通过HTML表单创建FormData对象

```js
var formData = new FormData(someFormElement);

var formElement = document.querySelector("form");
var request = new XMLHttpRequest();
request.open("POST", "submitform.php");
request.send(new FormData(formElement));    
```

你还可以在创建一个包含Form表单数据的FormData对象之后和发送请求之前，附加额外的数据到FormData对象里，像这样：

```js
var formElement = document.querySelector("form");
var formData = new FormData(formElement);
var request = new XMLHttpRequest();
request.open("POST", "submitform.php");
formData.append("serialnumber", serialNumber++);
request.send(formData);
```

这样你就可以在发送请求之前自由地附加不一定是用户编辑的字段到表单数据里。

## 使用FormData对象上传文件

你还可以使用FormData上传文件。

使用的时候需要在表单中添加一个文件类型的input：

```html
<form enctype="multipart/form-data" method="post" name="fileinfo">
  <label>Your email address:</label>
  <input type="email" autocomplete="on" autofocus name="userid" placeholder="email" required size="32" maxlength="64" /><br />
  <label>Custom file label:</label>
  <input type="text" name="filelabel" size="12" maxlength="32" /><br />
  <label>File to stash:</label>
  <input type="file" name="file" required />
  <input type="submit" value="Stash the file!" />
</form>
<div></div>
```

然后使用下面的代码发送请求：

```js
var form = document.forms.namedItem("fileinfo");
form.addEventListener('submit', function(ev) {

  var oOutput = document.querySelector("div"),
      oData = new FormData(form);

  oData.append("CustomField", "This is some extra data");

  var oReq = new XMLHttpRequest();
  oReq.open("POST", "stash.php", true);
  oReq.onload = function(oEvent) {
    if (oReq.status == 200) {
      oOutput.innerHTML = "Uploaded!";
    } else {
      oOutput.innerHTML = "Error " + oReq.status + " occurred when trying to upload your file.<br \/>";
    }
  };

  oReq.send(oData);
  ev.preventDefault();
}, false);
```

你还可以直接向FormData对象附加File或Blob类型的文件，如下所示：

```js
data.append("myfile", myBlob, "filename.txt");
```

使用append()方法时，可以通过第三个可选参数设置发送请求的头 Content-Disposition 指定文件名。如果不指定文件名（或者不支持该参数时），将使用名字“blob”。

如果你设置正确的配置项，你也可以通过jQuery来使用FormData对象：

```js
var fd = new FormData(document.querySelector("form"));
fd.append("CustomField", "This is some extra data");
$.ajax({
  url: "stash.php",
  type: "POST",
  data: fd,
  processData: false,  // 不处理数据
  contentType: false   // 不设置内容类型
});
```

# base64 文件上传

优点：

1.浏览器可以马上展示图像，不需要先上传到服务端，减少服务端的垃圾图像

2.前端可以压缩、处理后上传到服务端，减少传输过程中的等待时间和服务器压力

缺点：

1.生成编码后保存成图片，倘若不做处理，会比原来的图片容量大，具体请看：Base64编码为什么会使数据量变大

2.图片越大生成的编码越多，编码越多开发者工具中查看它时卡顿越久，谷歌浏览器好点，一些国产了浏览器直接假死，也就是说会影响前端调试。

## 前端

```html
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title></title>
    <style>
        td {
            padding: 10px;
        }
    </style>
</head>
<body>

    <table>
        <tr>
            <td>选择图片：</td>
            <td><input type="file" id="file1" /></td>
        </tr>
        <tr>
            <td>原图预览：</td>
            <td id="ytyl"></td>
        </tr>
        <tr>
            <td></td>
            <td><input type="button" value="压缩" id="btnYaSuo" /></td>
        </tr>
        <tr>
            <td>压缩预览：</td>
            <td id="ysyl"></td>
        </tr>
        <tr>
            <td></td>
            <td><input type="button" value="上传" id="btnUpload" /></td>
        </tr>
    </table>

    <canvas id="myCanvas" style="display:none">
        Your browser does not support the HTML5 canvas tag.
    </canvas>

    <script>

        file1.onchange = function () {
            if (file1.files.length < 1 || !/image\/\w+/.test(file1.files[0].type)) {
                //判断格式正则：/image\/png/，/image\/jpeg/，/image\/gif/
                alert("请确保文件为图像类型");
                return;
            }
            var reader = new FileReader();
            reader.readAsDataURL(file1.files[0]);
            reader.onload = function (e) {
                var result = e.target.result;
                if (result && result.length > 0) {
                    ytyl.innerHTML = '<img src="' + result + '" id="img1" />';
                }
            };
        };

        btnYaSuo.onclick = function () {
            var imgobj = document.getElementById("img1");
            var canvas = document.getElementById("myCanvas");
            canvas.width = imgobj.width;
            canvas.height = imgobj.height;
            var context = canvas.getContext("2d");
            context.drawImage(imgobj, 0, 0, canvas.width, canvas.height);
            //取值：image/jpeg、image/png（默认值）
            var dataUrl = canvas.toDataURL("image/jpeg", 0.9);
            ysyl.innerHTML = '<img src="' + dataUrl + '" id="img2" />';
        };

        btnUpload.onclick = function () {
            //var imgobj = document.getElementById("img1"); //未压缩的图像
            var imgobj = document.getElementById("img2");
            if (!imgobj) {
                return;
            }
            //做为普通的字符串POST到服务端
            var data = { "FileData": imgobj.getAttribute("src") };
            //$.post("Handler1.ashx", data, function (res) { }, "json");
        };

    </script>

</body>
</html>
```

## 后端

```java
public void ProcessRequest(HttpContext context)
{
    string base64Code = context.Request.Form["FileData"];
    if (string.IsNullOrEmpty(base64Code))
    {
        context.Response.Write("{\"Msg\":\"请上传文件！\"}");
        context.Response.End();
    }

    string ext = string.Empty;
    if (base64Code.Contains("data:image/jpeg;base64,"))
    {
        ext = ".jpg";
        base64Code = base64Code.Substring(23);
    }
    else if (base64Code.Contains("data:image/png;base64,"))
    {
        ext = ".png";
        base64Code = base64Code.Substring(22);
    }
    else
    {
        context.Response.Write("{\"Msg\":\"文件格式只支持JPG、PNG！\"}");
        context.Response.End();
    }

    DateTime now = DateTime.Now;
    string fileName = Guid.NewGuid().ToString() + ext;
    string relPath = string.Format("/Upload/{0}{1}{2}/", now.Year.ToString(), now.Month.ToString(), now.Day.ToString());
    string absPath = HttpContext.Current.Request.MapPath("~" + relPath);
    if (!Directory.Exists(absPath))
    {
        Directory.CreateDirectory(absPath);
    }
    byte[] arr = Convert.FromBase64String(base64Code);
    FileStream file = System.IO.File.Open(absPath + fileName, FileMode.CreateNew);
    file.Write(arr, 0, arr.Length);
    file.Close();

    context.Response.Write("{\"Msg\":\"上传成功！\",\"Path\":\"" + relPath + fileName + "\"}");
    context.Response.End();
}
```


# 参考资料

[Java Servlet 3.1 规范笔记](https://emacsist.github.io/emacsist/servlet/Java%20Servlet%203.1%20%E8%A7%84%E8%8C%83%E7%AC%94%E8%AE%B0.html)

[SpringBoot拦截器读取流后不能再读取（详解）](https://blog.csdn.net/weixin_39933264/article/details/100181291)

* any list
{:toc}