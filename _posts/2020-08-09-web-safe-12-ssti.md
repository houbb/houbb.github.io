---
layout: post
title:  web 安全系列-12-SSTI 模板注入
date:  2020-08-09 10:37:20 +0800
categories: [web]
tags: [web, web-safe, sf]
published: true
---

# 什么是注入

看之前先记住一句话：注入就是格式化字符串漏洞的一种体现

我们都知道，在 01 的世界里，很多的漏洞都能归结为格式化字符串漏洞（不管是二进制还是web），二进制中我们能通过格式化字符串漏洞覆盖返回地址等，web中 SQL 注入就是一个非常好的例子，我们在开发者本来认为我们应该插入正常数据的地方插入了sql语句，这就破坏了原本的SQL 语句的格式，从而执行了与原句完全不同含义的SQL 语句达到了攻击者的目的，同理 XSS 在有些情况下的闭合标签的手法也是利用了格式化字符串这种思想，总之，凡是出现注入的地方就有着格式化字符串的影子。

# 什么是模板注入

SSTI （服务器端模板注入）也是格式化字符串的一个非常好的例子，如今的开发已经形成了非常成熟的 MVC 的模式，我们的输入通过 V 接收，交给 C ，然后由 C 调用 M 或者其他的 C 进行处理，最后再返回给 V ，这样就最终显示在我们的面前了，那么这里的 V 中就大量的用到了一种叫做模板的技术，这种模板请不要认为只存在于 Python 中，感觉网上讲述的都是Python 的 SSTI ,在这之前也给了我非常大的误导(只能说自己没有好好研究，浅尝辄止)，请记住，凡是使用模板的地方都可能会出现 SSTI 的问题，SSTI 不属于任何一种语言，沙盒绕过也不是，沙盒绕过只是由于模板引擎发现了很大的安全漏洞，然后模板引擎设计出来的一种防护机制，不允许使用没有定义或者声明的模块，这适用于所有的模板引擎。

# 常见的模板引擎

## 1.php 常用的

### Smarty

Smarty算是一种很老的PHP模板引擎了，非常的经典，使用的比较广泛

### Twig

Twig是来自于Symfony的模板引擎，它非常易于安装和使用。它的操作有点像Mustache和liquid。

### Blade

Blade 是 Laravel 提供的一个既简单又强大的模板引擎。

和其他流行的 PHP 模板引擎不一样，Blade 并不限制你在视图中使用原生 PHP 代码。所有 Blade 视图文件都将被编译成原生的 PHP 代码并缓存起来，除非它被修改，否则不会重新编译，这就意味着 Blade 基本上不会给你的应用增加任何额外负担。

## 2.Java 常用的

### JSP

这个引擎我想应该没人不知道吧，这个应该也是我最初学习的一个模板引擎，非常的经典

### FreeMarker

FreeMarker是一款模板引擎： 即一种基于模板和要改变的数据， 并用来生成输出文本（HTML网页、电子邮件、配置文件、源代码等）的通用工具。 它不是面向最终用户的，而是一个Java类库，是一款程序员可以嵌入他们所开发产品的组件。

### Velocity

Velocity作为历史悠久的模板引擎不单单可以替代JSP作为Java Web的服务端网页模板引擎，而且可以作为普通文本的模板引擎来增强服务端程序文本处理能力。

## 3.Python 常用的

### Jinja2

flask jinja2 一直是一起说的，使用非常的广泛，是我学习的第一个模板引擎

### django

django 应该使用的是专属于自己的一个模板引擎，我这里姑且就叫他 django，我们都知道 django 以快速开发著称，有自己好用的ORM，他的很多东西都是耦合性非常高的，你使用别的就不能发挥出 django 的特性了

### tornado

tornado 也有属于自己的一套模板引擎，tornado 强调的是异步非阻塞高并发

## 4.注意：

同一种语言不同的模板引擎支持的语法虽然很像，但是还是有略微的差异的，比如
 
tornado render() 中支持传入自定义函数，以及函数的参数，然后在两个大括号 `{`中执行,但是 django 的模板引擎相对于tornado 来说就相对难用一些（当然方便永远和安全是敌人）

# SSTI 怎么产生的

服务端接收了用户的恶意输入以后，未经任何处理就将其作为 Web 应用模板内容的一部分，模板引擎在进行目标编译渲染的过程中，执行了用户插入的可以破坏模板的语句，因而可能导致了敏感信息泄露、代码执行、GetShell 等问题.

> 单纯的字符串拼接并不能带来注入问题，关键要看你拼接的是什么，如果是控制语句，就会造成数据域与代码域的混淆，这样就会出洞

当然，这种情况一般不属于模板引擎的问题，大多数原因都是开发者并没有很好的处理，比如下面的php 代码

## php 例子

```php
<?php
require_once dirname(__FILE__).‘/../lib/Twig/Autoloader.php‘;
Twig_Autoloader::register(true);
$twig = new Twig_Environment(new Twig_Loader_String());
$output = $twig->render("Hello \{\{name\}\}", array("name" => $_GET["name"]));  // 将用户输入作为模版变量的值
echo $output;
```

这段代码明显没有什么问题，用户的输入到时候渲染的时候就是 name 的值，由于name 外面已经有双花括号了。基本是没有什么问题的。

但是有些代码就是不这么写，比如下面这段代码

```php
<?php
require_once dirname(__FILE__).‘/../lib/Twig/Autoloader.php‘;
Twig_Autoloader::register(true);

$twig = new Twig_Environment(new Twig_Loader_String());
$output = $twig->render("Hello {$_GET[‘name‘]}");  // 将用户输入作为模版内容的一部分
echo $output;
```

你看，现在开发者将用户的输入直接放在要渲染的字符串中了

注意：不要把这里的 `{}` 当成是模板变量外面的括号，这里的括号实际上只是为了区分变量和字符串常量而已，于是我们输入

\{\{ xxxx \}\}

服务器就凉了。

## JAVA 实例：

实例一：

漏洞分析：https://paper.seebug.org/70/

作者挖掘记录：https://secalert.net/#cve-2016-4977

这个漏洞相对于前面的就显得很神奇了，我下面简单的说一下，想看详细的可以看上面的链接：

我们访问这个URL 的时候会报错并在页面上输出 K0rz3n

```
http://localhost:8080/oauth/authorize?response_type=token&client_id=acme&redirect_uri=K0rz3n
```

为什么会报错呢？因为K0rz3n 并不符合 redirect_uri 的格式规范

但当我们请求下面这个URL 的时候

```
http://localhost:8080/oauth/authorize?response_type=token&client_id=acme&redirect_uri=${2334-1}
```

同样会报错，但是非常奇怪的是，我们的

`${}`

表达式居然被执行了，输出了 2333，模板注入实锤了，我们来看一下代码，分析一下

### WhitelabelErrorEndpoint.java

```java
@FrameworkEndpoint
public class WhitelabelErrorEndpoint {

    private static final String ERROR = "<html><body><h1>OAuth Error</h1><p>${errorSummary}</p></body></html>"; //这里是我们的字符串模板

    @RequestMapping("/oauth/error")
    public ModelAndView handleError(HttpServletRequest request) {
        Map<String, Object> model = new HashMap<String, Object>();
        Object error = request.getAttribute("error");
        // The error summary may contain malicious user input,
        // it needs to be escaped to prevent XSS
        String errorSummary;
        if (error instanceof OAuth2Exception) {
            OAuth2Exception oauthError = (OAuth2Exception) error;
            errorSummary = HtmlUtils.htmlEscape(oauthError.getSummary());
        }
        else {
            errorSummary = "Unknown error";
        }
        model.put("errorSummary", errorSummary);
        return new ModelAndView(new SpelView(ERROR), model);//通过模板渲染
    }

}
```

我们看到，当拿到错误信息以后，就交给了 SpelView(),我们跟进去看一下

```java
class SpelView implements View {

    ...

    public SpelView(String template) {
        this.template = template;
        this.context.addPropertyAccessor(new MapAccessor());
        this.helper = new PropertyPlaceholderHelper("${", "}");
        this.resolver = new PlaceholderResolver() {
            public String resolvePlaceholder(String name) {//这里相当于是去一层${}
                Expression expression = parser.parseExpression(name);
                Object value = expression.getValue(context);
                return value == null ? null : value.toString();
            }
        };
    }

    ...

    public void render(Map<String, ?> model, HttpServletRequest request, HttpServletResponse response)
            throws Exception {
        ...
        String result = helper.replacePlaceholders(template, resolver);//replacePlaceholders是一个递归调用，能将第二个参数的${} 中的值取出来，不管有多少层括号
        ...
    }
}
```

resolver 这个参数是经过递归的去

`${}`

处理的，不信我们看一下 replacePlaceholders()

```java
public String replacePlaceholders(String value, final Properties properties) {
    Assert.notNull(properties, "'properties' must not be null");
    return replacePlaceholders(value, new PlaceholderResolver() {
        @Override
        public String resolvePlaceholder(String placeholderName) {
            return properties.getProperty(placeholderName);
        }
    });
}
```

很明显这里面递归调用了replacePlaceholders() 函数，最终能得到单纯的表达式，然后渲染的时候放在 `${}` 中就执行了。

# 检测方法

同常规的 SQL 注入检测，XSS 检测一样，模板注入漏洞的检测也是向传递的参数中承载特定 Payload 并根据返回的内容来进行判断的。

每一个模板引擎都有着自己的语法，Payload 的构造需要针对各类模板引擎制定其不同的扫描规则，就如同 SQL 注入中有着不同的数据库类型一样。

简单来说，就是更改请求参数使之承载含有模板引擎语法的 Payload，通过页面渲染返回的内容检测承载的 Payload 是否有得到编译解析，有解析则可以判定含有 Payload 对应模板引擎注入，否则不存在 SSTI。

![输入图片说明](https://images.gitee.com/uploads/images/2020/0810/214621_a3b49ca3_508704.png)

> 注意：有的时候出现 XSS 的时候，也有可能是 SSTI 漏洞，虽说模板引擎在大多数情况下都是使用的 xss 过滤的，但是也不排除有些意外情况的出现，比如有的模板引擎(比如 jinja2)在渲染的时候默认只针对特定的文件后缀名的文件(html,xhtml等)进行XSS过滤

## 快速判断模板引擎

检测到模板注入后，我们需要判断具体的模板引擎。

我们需要 fuzz 不同的字符，再通过返回的错误判断。

当模板引擎屏蔽错误后，该类当法就失效了，并且暴力 fuzz 也对攻击自动化不友好。

Burpsuite 则对不同模板接受的 payload 做了一个分类，并以此快速判断模板引擎：

![输入图片说明](https://images.gitee.com/uploads/images/2020/0810/215556_75e9d5d0_508704.png)

## 一张表

![输入图片说明](https://images.gitee.com/uploads/images/2020/0810/215705_fd26a68d_508704.png)

# 攻击思路

## 1.攻击方向

找到模板注入主要从三个方向进行攻击

(1)模板本身

(2)框架本身

(3)语言本身

(4)应用本身

## 2.攻击方法

我们知道 SSTI 能够造成很多种危害，包括 敏感信息泄露、RCE、GetShell 等，关键就在于如何才能利用这个注入点执行我们想执行的代码，那么我们寻找利用点的范围实际上就是在我们上面的四个地方，一个是模板本身支持的语法、内置变量、属性、函数，还有就是纯粹框架的全局变量、属性、函数，然后我们考虑语言本身的特性，比如面向对象的内省机制，最最最后我们无能为力的时候才考虑怎么寻找应用定义的一些东西，因为这个是几乎没有文档的，是开发者的自行设计，一般需要拿到应用的源码才能考虑，于是我将其放在最后一个

（1） 利用模板本身的特性进行攻击

（2）利用框架本身的特性进行攻击

（3）利用模语言本身的特性进行攻击

# 防御方法

(1) 和其他的注入防御一样，绝对不要让用户对传入模板的内容或者模板本身进行控制

(2) 减少或者放弃直接使用格式化字符串结合字符串拼接的模板渲染方式，使用正规的模板渲染方法

(3) 另一个选择是创建一个安全加固/沙箱环境，禁用或删除潜在的危险指令。

# 总结

这篇文章对 SSTI 的介绍和分析就告一段落了，由于个人水平有限，篇幅有限，也无法将再多的细节呈现给大家，如果你能在读我的文章中有于读别人的文章不一样的收获，那将是我莫大的荣幸，如果没有那说明我的知识储备或者是表达能力还有所欠缺，我会在后面的文章中改进。

# 拓展阅读  

[web 安全系列](https://houbb.github.io/2020/08/09/web-safe-00-overview)

# 参考资料

[一篇文章带你理解漏洞之 SSTI 漏洞](https://www.k0rz3n.com/2018/11/12/%E4%B8%80%E7%AF%87%E6%96%87%E7%AB%A0%E5%B8%A6%E4%BD%A0%E7%90%86%E8%A7%A3%E6%BC%8F%E6%B4%9E%E4%B9%8BSSTI%E6%BC%8F%E6%B4%9E/)

[模板注入](https://wizardforcel.gitbooks.io/web-hacking-101/content/16.html)

[服务端模板注入攻击 (SSTI) 之浅析](https://blog.knownsec.com/2015/11/server-side-template-injection-attack-analysis/)

[服务端模板注入攻击](https://zhuanlan.zhihu.com/p/28823933)

[python 模板注入](https://www.cnblogs.com/tr1ple/p/9415641.html)

* any list
{:toc}