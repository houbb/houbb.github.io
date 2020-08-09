---
layout: post
title:  web 安全系列-06-URL Redirect 开放重定向漏洞
date:  2020-08-09 10:37:20 +0800
categories: [web]
tags: [web, web-safe, sf]
published: true
---

# 漏洞描述

也称URL跳转、URL重定向漏洞，由于目标网站未对程序跳转的URL地址及参数做合法性判断，导致应用程序直接跳转到参数中指定的的URL地址。

攻击者可通过将跳转地址修改为指向恶意站点，即可发起网络钓鱼、诈骗甚至窃取用户凭证等。

# 常见应用场景

主要是业务逻辑中需要进行跳转的地方。

比如登录处、注册处、访问用户信息、订单信息、加入购物车、分享、收藏等处。

![输入图片说明](https://images.gitee.com/uploads/images/2020/0809/174456_916dd969_508704.png)

假设有一个正规网站http://nerddinner.com/，还有一个恶意网站或钓鱼网站http://nerddiner.com/（注意：这里少了个n）。

一天，小白收到了别人发的链接：http://nerddinner.com/Account/LogOn?returnUrl=http://nerddiner.com。

1. 打开链接后进入了登录界面，小白输入了自己的帐号名密码进行登录。

2. 登录成功后重定向到了恶意网站。

3. 恶意网站是一个仿造正规网站的登录页面，并在上面提示用户名或密码错误。

4. 小白按照提示重新输入了帐号密码信息。

5. 恶意网站保存了客户的用户名密码，然后重定向会正规网站。

6. 小白继续平时正常的操作。

# 漏洞危害

攻击者可能会使用Web服务器攻击其他站点；

如果对输出没有做严格限制，将可能导致反射性XSS漏洞；

黑产将利用此漏洞，从信任网站跳转到攻击者构造的恶意网站用来进行钓鱼、诈骗等行为；

## 配合 XSS

![输入图片说明](https://images.gitee.com/uploads/images/2020/0809/174730_8bbef664_508704.png)

1. 恶意用户在正规网站下挂了跳转到恶意网站的脚本。

2. 普通用户访问到含恶意脚本的页面会跳转到恶意网站。

3. 恶意网站是一个仿造正规网站的登录页面，并在上面提示需要重新登录。

4. 小白按照提示重新输入了帐号密码信息。

5. 恶意网站保存了客户的用户名密码，然后重定向会正规网站。

注：这种方式每次访问含恶意脚本的页面都会跳转到恶意网站（提示重新登录），而开放重定向只会提示用户名密码错误一次，相对而言，开放重定向的无感知效果要好一点。

# 修复建议

严格控制将要跳转的域名，如果某个业务事先已经确定将要跳转的网站，最稳妥的方式是将其直接编码在源代码中，通过URL中传入的参数来映射跳转网址。

严格验证跳转URL参数的有效性、合法性。

校验传入的URL参数是否为可信域名

## 后端校验代码

```java
public ActionResult LogOn(LogOnModel model, string returnUrl)
{
    //Your logon logic here.
    FormsAuthentication.SetAuthCookie(model.UserName, false);
    if (!string.IsNullOrEmpty(returnUrl)
        && Url.IsLocalUrl(returnUrl) //Comment out this code will cause open redirection 
        )
    {
        return Redirect(returnUrl);
    }
    return RedirectToAction("Index", "Home");
}
```

## 提示用户

很多软件，比如知乎，简书，如果跳转的是外部链接，会提示用户注意个人隐私安全。

这其实是一个不错的处理方式。

# 拓展阅读 

[web 安全系列](https://houbb.github.io/2020/08/09/web-safe-00-overview)

# 参考资料

[开放重定向漏洞](https://vulwiki.readthedocs.io/zh_CN/latest/web/urlre/)

[URL跳转（开放重定向）挖掘技巧及实战案例全汇总](https://cloud.tencent.com/developer/article/1516344)

[Web安全相关（三）：开放重定向(Open Redirection)](https://www.cnblogs.com/Erik_Xu/p/5497479.html)

[隐蔽重定向漏洞](https://zh.wikipedia.org/wiki/%E9%9A%B1%E8%94%BD%E9%87%8D%E5%AE%9A%E5%90%91%E6%BC%8F%E6%B4%9E)

[CA3007：查看公开重定向漏洞的代码](https://docs.microsoft.com/zh-cn/visualstudio/code-quality/ca3007?view=vs-2019)

* any list
{:toc}