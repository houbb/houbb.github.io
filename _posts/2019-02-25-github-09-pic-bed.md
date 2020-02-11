---
layout: post
title: Github 等图床代码实现 fugire bed
date:  2019-2-25 14:33:11 +0800
categories: [Tool]
tags: [github, pic, sh]
published: true
---

# 背景

平时自己写博客，经常用用到各种各种图片。

直接使用起来实际上还是比较麻烦的，就琢磨着自己实现一个图床自用。

## 开发迭代

遵循 mvp 原则，先从 jar 开始开发。


# 什么是微博图床？

微博图床，指把图片上传到新浪微博的图库，然后用这个图片外链达到节约本地服务器空间及加快图片加载速度的目的。

相比于其它的图床，利用微博当图床具有加载速度快、不限流量、不限容量等优点。

网上有许多浏览器插件或在线工具能够实现。

直接利用第三方的工具如果只是上传一两张图片倒也方便，如果要大批量上传并获取外链就得自己写一个了。

# 微博图床实现方法探究

## 官方 api

目前已知有两个方法能实现，其一是利用微博官方的开放平台的发微博 API 实现。

这种方法也是我最先考虑的方法，因为毕竟是官方渠道，应该靠谱些。

然而经过一番折腾后，我发现这一方法根本不可行。

因为微博限制了这一 API 的调用频次，在连续上传时立即就会被封堵。

[微博开发文档](https://open.weibo.com/wiki/2/statuses/upload_pic)

## mini-发布

方法二是利用微博的 [MINI 发布框](http://weibo.com/minipublish) 的图片上传功能。

正是这个发布框暴露了微博的一个图片上传接口

```
http://picupload.service.weibo.com/interface/pic_upload.php
```

网上的这些微博图床大都也是利用这个接口实现的。

利用这一接口的优点是可以实现快速连续上传图片而不被封。

前提是必须要带着微博登录的 Cookie 才能访问。

# 模拟新浪登录

## 源码

```java
@Override
public String login(String username, String password) {
    String url = "https://login.sina.com.cn/sso/login.php?client=ssologin.js(v1.4.15)&_=";
    String post = "entry=sso&gateway=1&from=null&savestate=30&useticket=0&pagerefer=&vsnf=1"
            + "&su=" + Base64.encode(username.getBytes()) + "&service=sso&sp=" + password
            + "&sr=1024*768&encoding=UTF-8&cdult=3&domain=sina.com.cn&prelt=0&returntype=TEXT";
    String ret = "";
    URL u = null;
    HttpURLConnection con = null;
    InputStream inputStream = null;
    //尝试发送请求
    try {
        u = new URL(url);
        con = (HttpURLConnection) u.openConnection();
        con.setRequestMethod("POST");
        con.setDoOutput(true);
        con.setDoInput(true);
        con.setUseCaches(false);
        PrintWriter printWriter = new PrintWriter(con.getOutputStream());
        printWriter.write(post);
        printWriter.flush();
        //读取返回内容
        inputStream = con.getInputStream();
        InputStreamReader isr = new InputStreamReader(inputStream);
        BufferedReader bufr = new BufferedReader(isr);
        String str;
        while ((str = bufr.readLine()) != null) {
            ret += str;
        }
        //获取cookie
        Map<String, List<String>> map = con.getHeaderFields();
        Set<String> set = map.keySet();
        for (String key : set) {
            if ("Set-Cookie".equals(key)) {
                List<String> list = map.get(key);
                StringBuilder builder = new StringBuilder();
                for (String str1 : list) {
                    builder.append(str1);
                }
                ret = builder.toString();
            }
        }
        ret = StringUtils.subString(ret, "SUB=", ";");
        if (!"".equals(ret)) {
            ret = "SUB=" + ret;
        }
        return ret;
    } catch (Exception e) {
        throw new PicBedException(e);
    }
}
```

# 实现上传

## 源码

```java
public String upload(String imageBase64, String cookie) {

    String url = "http://picupload.weibo.com/interface/pic_upload.php?cb=https%3A%2F%2Fweibo.com%2Faj%2Fstatic%2Fupimgback.html%3F_wv%3D5%26callback%3DSTK_ijax_1551096206285100&mime=image%2Fjpeg&data=base64&url=weibo.com%2Fu%2F5734329255&markpos=1&logo=1&nick=&marks=0&app=miniblog&s=rdxt&pri=0&file_source=2";

    String ret = "";
    URL u = null;
    HttpURLConnection con = null;
    InputStream inputStream = null;
    //尝试发送请求
    try {
        u = new URL(url);
        con = (HttpURLConnection) u.openConnection();
        con.setRequestMethod("POST");
        con.setDoOutput(true);
        con.setDoInput(true);
        con.setUseCaches(false);
        con.setRequestProperty("Cookie", cookie);
        PrintWriter printWriter = new PrintWriter(con.getOutputStream());
        // 发送请求参数
        //post的参数 xx=xx&yy=yy
        printWriter.write("b64_data="+ imageBase64);
        // flush输出流的缓冲
        printWriter.flush();
        //读取返回内容
        inputStream = con.getInputStream();
        //https://weibo.com/aj/static/upimgback.html?_wv=5&callback=STK_ijax_1551096206285100&ret=1&pid=006g4EZxgy1g0iz2blozoj30u01aogo9
        InputStreamReader isr = new InputStreamReader(inputStream);
        BufferedReader bufr = new BufferedReader(isr);
        String str;
        while ((str = bufr.readLine()) != null) {
            ret+=str;
        }
        String retCode = StringUtils.subString(con.getHeaderField("location")+"&","&ret=","&");
        if ("1".equals(retCode)){
            ret = StringUtils.subString(con.getHeaderField("location")+"&","&pid=","&");
            if (!"".equals(ret)){
                ret = "http://wx1.sinaimg.cn/large/"+ret+".jpg";
            }
        }else {
            ret = retCode;
        }
        return ret;
    } catch (Exception e) {
        throw new PicBedException(e);
    }
}
```

## url 测试

经测试，这个 url 会一直报错 403。

所以自己去新浪发布一个图片，看了下 url:

```
https://picupload.weibo.com/interface/pic_upload.php?cb=https%3A%2F%2Fweibo.com%2Faj%2Fstatic%2Fupimgback.html%3F_wv%3D5%26callback%3DSTK_ijax_1551096206285100&mime=image%2Fjpeg&data=base64&p=1&url=weibo.com/u/6869870280&markpos=1&logo=1&nick=&marks=0&app=miniblog&s=json&pri=0&file_source=2
```

这里有个 cb，实际上编码前是：

```
&cb=http://weibo.com/aj/static/upimgback.html?_wv=5&callback=STK_ijax_   +（时间戳）
```

## 返回结果

```json
result{"code":"A20001","data":{"count":-4,"data":"eyJ1aWQiOjY4Njk4NzAyODAsImFwcCI6Im1pbmlibG9nIiwiY291bnQiOi00LCJ0aW1lIjoxNTgxMzk0NDg1LjE5MiwicGljcyI6eyJwaWNfMSI6eyJyZXQiOi00LCJuYW1lIjoicGljXzEifX19","pics":{"pic_1":{"ret":-4,"name":"pic_1"}}}}
```

这就很尴尬了，没有返回对应的 pid。

# 上传源码学习

## js 部分源码

```js
var i = {
    base64form: null,
    upload: function(b) {
    	var d, e = b,
    		h = "weibo.com/",
    		j = window.$CONFIG,
    		k = c.type;
    	if (k === "common") d = c.form;
    	else if (k === "base64") {
    		d = a.C("form");
    		i.base64form = d;
    		d.method = "POST";
    		var l = a.C("input");
    		l.name = "b64_data";
    		l.type = "hidden";
    		l.value = c.base64Str;
    		d.appendChild(l);
    		document.body.appendChild(d)
    	}
    	var m = {
    		marks: 1,
    		app: "miniblog",
    		s: "rdxt"
	};
	c.type === "common" || c.type === "base64" ? m = a.lib.kit.extra.merge({
		url: e.domain == "1" ? h + (j && j.watermark || j.domain) : 0,
		markpos: e.position || "",
		logo: e.logo || "",
		nick: e.nickname == "1" ? "@" + (j && j.nick) : 0
	}, m) : c.type === "custom" && (m = a.lib.kit.extra.merge(c.uploadArgs, m));
	k === "base64" && (m = a.lib.kit.extra.merge({
		mime: "image/jpeg",
		data: "base64"
	}, m));
	g = new Date;
	f = a.core.io.ijax({
		url: "http://picupload.service.weibo.com/interface/pic_upload.php",
		form: d,
		abaurl: "http://" + document.domain + "/aj/static/upimgback.html?_wv=5",
		abakey: "cb",
		timeout: 18e5,
		onComplete: i.handle,
		onTimeout: i.handle,
		args: m
	})
},
```

## 完成之后

```

```

## 成功之后的操作

```js
sendSucc: function(b) {
	var d = new Date - g,
		e = new Image,
		f = encodeURIComponent(navigator.userAgent),
		h = window.$CONFIG,
		i = a.lib.kit.extra.merge(b, {
			ct: "1",
			rnd: (new Date).getTime(),
			el: d,
			uid: h ? h.uid : 0,
			cl: f,
			tm: +(new Date),
			ip: "",
			app: c.app
		});
	i = a.core.json.jsonToQuery(i);
	i = "http://ww1.sinaimg.cn/do_not_delete/fc.html?" + i;
	e.setAttribute("src", i)
},
```

# 图片转 base64

# 微博图床 403 解决方法

在HTML代码的head中添加一句

```html
<meta name="referrer" content="no-referrer" />
```

# 参考资料

## 实现

[github-图片上传实现-weibo_image_uploader](https://github.com/consatan/weibo_image_uploader)

[github-超简单图床-imgApiJava](https://github.com/szvone/imgApiJava)

[github-github 图床实现-gitPic](https://github.com/zzzzbw/gitPic)

[github-页面管理-Tbed](https://github.com/Hello-hao/Tbed)

[github-PicUploader](https://github.com/xiebruce/PicUploader)

## 资料

[最小化微博上传图片](https://weibo.com/minipublish)

[微博官方简易发布器](http://weibo.com/minipublish)

[微博官方图片上传js](http://js.t.sinajs.cn/t5/home/js/page/content/simplePublish.js)

[WeiboPicBed](https://github.com/Suxiaogang/WeiboPicBed/blob/master/js/popup.js)

[超详细的Python实现新浪微博模拟登陆(小白都能懂)](http://www.jianshu.com/p/816594c83c74)

[调用网页接口实现发微博（PHP实现）](http://andrewyang.cn/post.php?id=1034)

[weibo-publisher](https://github.com/yangyuan/weibo-publisher)

## blogs

[利用微博当图床-php语言实现](https://mkblog.cn/854/)

[新浪图床API接口及源码](http://blog.kkksos.com/2018/09/21/12.html)

* any list
{:toc}