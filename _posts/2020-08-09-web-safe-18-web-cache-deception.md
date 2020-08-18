---
layout: post
title:  web 安全系列-18-web cache deception Web Cache欺骗攻击
date:  2020-08-09 10:37:20 +0800
categories: [web]
tags: [web, web-safe, sf]
published: true
---

# Web Cache 欺骗攻击

网站通常都会通过如CDN、负载均衡器、或者反向代理来实现Web缓存功能。

通过缓存频繁访问的文件，降低服务器响应延迟。

例如，网站 htttp://www.example.com 配置了反向代理。

对于那些包含用户个人信息的页面，如 http://www.example.com/home.php ，由于每个用户返回的内容有所不同，因此这类页面通常是动态生成，并不会在缓存服务器中进行缓存。通常缓存的主要是可公开访问的静态文件，如css文件、js文件、txt文件、图片等等。此外，很多最佳实践类的文章也建议，对于那些能公开访问的静态文件进行缓存，并且忽略HTTP缓存头。

Web cache 攻击类似于RPO相对路径重写攻击，都依赖于浏览器与服务器对URL的解析方式。

当访问不存在的URL时，如 http://www.example.com/home.php/non-existent.css ，浏览器发送get请求，依赖于使用的技术与配置，服务器返回了页面 http://www.example.com/home.php 的内容，同时URL地址仍然是 http://www.example.com/home.php/non-existent.css，http头的内容也与直接访问 http://www.example.com/home.php 相同，cacheing header、content-type（此处为text/html）也相同。

# 背景介绍

## 什么是Web缓存

很多网站都会使用web缓存功能来减少web服务器的延迟，以便更快地响应用户的内容请求。

为了避免重复处理用户的请求，web服务器引入了缓存机制，将经常被请求的文件缓存起来，减少响应延迟。

通常被缓存的文件都是静态文件或者公共文件，如样式表（css）、脚本（js）、文本文件（txt）、图片（png、bmp、gif）等等。

通常情况下，这些文件不会包含任何敏感信息。许多指导性文章在提及web缓存的配置时，会建议缓存所有公开型静态文件，并忽略掉这些文件的HTTP缓存头信息。

有多种方法能够实现缓存，比如，浏览器端也可以使用缓存机制：缓存文件后，一段时间内浏览器不会再次向web服务器请求已缓存的文件。这类缓存与web缓存欺骗攻击无关。

实现缓存的另一种方法就是将一台服务器部署在客户端和web服务器之间，充当缓存服务器角色，这种实现方法会受到web缓存欺骗攻击影响。

### 实现缓存的方式

这类缓存有各种表现形式，包括：

- CDN（Content Delivery Network，内容分发网络）

CDN是一种分布式代理网络，目的是快速响应内容请求。

每个客户端都有一组代理服务器为其服务，缓存机制会选择离客户端最近的一个节点来提供服务。

- 负载均衡（Load balancer）

负载均衡除了能够通过多台服务器平衡网络流量，也能缓存内容，以减少服务器的延迟。

- 反向代理（Reverse proxy）

反向代理服务器会代替用户向web服务器请求资源，然后缓存某些数据。

### 实际例子

了解了这些缓存机制后，让我们来看看web缓存的实际工作过程。

举个例子，“http://www.example.com”配置了一个反向代理服务器作为web缓存。

与其他网站类似，这个网站使用了公共文件，如图片、css文件以及脚本文件。

这些文件都是静态文件，该网站的所有或绝大部分用户都会用到这些文件，对每个用户来说，此类文件返回的内容没有差别。这些文件没有包含任何用户信息，因此从任何角度来看，它们都不属于敏感文件。

某个静态文件第一次被请求时，该请求会直接穿透代理服务器。缓存机制没见过这个文件，因此会向服务器请求这个文件，然后服务器会返回文件内容。现在，缓存机制需要识别所接收的文件的类型。不同缓存机制的处理流程有所不同，但在大多数情况下，代理服务器会根据URL的尾部信息提取文件的扩展名，然后再根据具体的缓存规则，决定是否缓存这个文件。

如果文件被缓存，下一次任何客户端请求这个文件时，缓存机制不需要向服务器发起请求，会直接向客户端返回这个文件。

## 服务器的响应

Web缓存欺骗攻击依赖于浏览器以及web服务器的响应，这一点与RPO攻击类似，读者可以参考The Spanner[1]以及XSS Jigsaw[2]发表的两篇文章了解相关概念。

假设某个URL地址为“http://www.example.com/home.php/nonexistent.css ”，其中home.php是一个真实页面，而nonexistent.css是个不存在的页面，那么当用户访问这个地址，会出现什么情况呢？

在这种情况下，浏览器会向该URL发送一个GET请求。我们比较感兴趣的是服务器的反应。取决于服务器的实现技术以及具体配置，web服务器可能会返回一个200 OK响应，同时返回home.php页面的内容，表明该URL与已有的页面一致。

服务器返回的HTTP响应头与home.php页面的响应头相同：即这两个响应头包含一样的缓存头部以及一样的内容类型（本例中内容类型为text/html），如下图所示：

![输入图片说明](https://images.gitee.com/uploads/images/2020/0818/172819_96fc768a_508704.png)

# Web 缓存欺骗方法

未经授权的攻击者很容易就能利用这个漏洞，具体步骤如下：

1、攻击者诱使用户访问“https://www.bank.com/account.do/logo.png ”。

2、受害者的浏览器会请求“https://www.bank.com/account.do/logo.png ”。

3、请求到达代理服务器，代理服务器没有缓存过这个文件，因此会向web服务器发起请求。

4、Web服务器返回受害者的账户页面，响应代码为200 OK，表明该URL与已有页面一致。

5、代理机制收到文件内容，识别出该URL的结尾为静态文件扩展名（.png）。由于在代理服务器上已经设置了对所有静态文件进行缓存，并会忽略掉缓存头部，因此伪造的.png文件就会被缓存下来。与此同时，缓存目录中会创建名为“account.do”的一个新的目录，logo.png文件会缓存在这个目录中。

6、用户收到对应的账户页面。

7、攻击者访问“https://www.bank.com/account.do/logo.png ”页面。请求到达代理服务器，代理服务器会将已缓存的受害者账户页面发给攻击者的浏览器。

![输入图片说明](https://images.gitee.com/uploads/images/2020/0818/172940_971b4d68_508704.png)

# 漏洞存在的条件

漏洞要存在，至少需要满足下面两个条件：

1. web cache功能根据扩展进行保存，并忽略caching header;

2. 当访问如 http://www.example.com/home.php/non-existent.css 不存在的页面，会返回 home.php 的内容。

# 漏洞防御

防御措施主要包括3点：

1. 设置缓存机制，仅仅缓存http caching header允许的文件，这能从根本上杜绝该问题;

2. 果缓存组件提供选项，设置为根据content-type进行缓存;

3. 访问 http://www.example.com/home.php/non-existent.css 这类不存在页面，不返回 home.php 的内容，而返回404或者302。

#  Web Cache欺骗攻击实例

## Paypal

Paypal在未修复之前，通过该攻击，可以获取的信息包括：用户姓名、账户金额、信用卡的最后4位数、交易数据、emaill地址等信息。 

受该攻击的部分页面包括：

```
https://www.paypal.com/myaccount/home/attack.css
https://www.paypal.com/myaccount/settings/notifications/attack.css
https://history.paypal.com/cgi-bin/webscr/attack.css?cmd=_history-details
```

# 拓展阅读  

[web 安全系列](https://houbb.github.io/2020/08/09/web-safe-00-overview)

# 参考资料

[Web Cache 欺骗攻击](https://websec.readthedocs.io/zh/latest/vuln/webcache.html)

[Web 缓存投毒与缓存欺骗](https://r1dd1er.top/2020/02/10/web%E7%BC%93%E5%AD%98%E6%8A%95%E6%AF%92&%E7%BC%93%E5%AD%98%E6%AC%BA%E9%AA%97/)

[实战 Web 缓存中毒](https://xz.aliyun.com/t/2585)

* any list
{:toc}