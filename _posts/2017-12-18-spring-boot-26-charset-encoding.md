---
layout: post
title:  Spring Boot-26-springboot 文件上传名称中文乱码问题整理 
date:  2017-12-19 14:43:25 +0800
categories: [Spring]
tags: [spring, web, springboot]
published: true
---

# 现象

前端文件上传，后端获取文件名中文乱码。

比如前段上传 `上传文件.zip`；后端接收到 `ä¸ä¼ æä»¶.zip`。

前后端的文件编码都是 UTF-8 格式，使用 chrome 浏览器测试。

这个问题的复现也比较奇怪，本地测试正常，服务器运营就会出现。

一度怀疑是系统的默认编码问题。

## 后端

最基本的 UTF-8 请求格式过滤配置：

```java
@Bean
public FilterRegistrationBean filterRegistrationBean() {
    FilterRegistrationBean registrationBean = new FilterRegistrationBean();
    CharacterEncodingFilter characterEncodingFilter = new CharacterEncodingFilter();
    characterEncodingFilter.setForceEncoding(true);
    characterEncodingFilter.setEncoding("UTF-8");
    registrationBean.setFilter(characterEncodingFilter);
    return registrationBean;
}
```

文件名称的获取：

```java
@PostMapping(value = "/upload")
@ResponseBody
public BaseResp upload(HttpServletRequest request,
                       HttpServletResponse response) throws IOException, ServletException {
    if (request instanceof StandardMultipartHttpServletRequest) {
        StandardMultipartHttpServletRequest sm = (StandardMultipartHttpServletRequest) request;
        MultipartFile multipartFile = sm.getFile("file");
        String filename = multipartFile.getOriginalFilename();
        
        //filename 乱码
        return RespUtil.success(filename);
    } else {
        return RespUtil.fail("文件上传失败");
    }
}
```

## 前端

```html
<input style="display:none"
           accept="image/gif,image/jpeg,image/jpg,image/png"
           type="file" id="imageUpload" ref="imageUpload">
```

对应的 js:

```js
var input = this.$refs.imageUpload
input.addEventListener("change", () => {
    var formData = new FormData()
    formData.append("file", input.files[0])
    var config = {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    };

    //axios 中的 this 并不指向 vue
    var _this = this;
    axios.post("/o/upload/upload", formData, config).then((response) => {
        if (response.data.respCode === '0000') {
            var filePath = response.data.respMessage;
            var link = '![图片说明](' + filePath + ')'
            // 更新内容
            _this.article.content += '\n' + link;
            // 上面双向绑定应该是无效的
            _this.simplemde.value(_this.article.content);
            // 清空文件内容，避免相同的文件无法监听到 change
            input.value = '';
        } else {
            ELEMENT.Message.error(response.data.respMessage);
        }
    }).catch(function (error) {
        ELEMENT.Message.error("请求失败");
        console.log(error);
    });
})
```

# 解决方案

先说最终的解决方案，直接修改了获取原始文件名的方式：

```java
String value = new String("我是中文乱码".getBytes("ISO-8859-1"),"UTF-8");
```

# 解决步骤

## 1-前端指定编码

一开始怀疑是前端没有指定编码导致，于是调整 header 参数：

```js
var config = {
    headers: {
        "Content-Type": "multipart/form-data"
    }
};
```

调整为：

```js
var config = {
    headers: {
        "Content-Type": "multipart/form-data;charset=UTF-8"
    }
};
```

发现问题依然存在。

## 2-后端指定编码

于是去查了一圈，有的说设置一下缺失的编码即可解决。

```java
public BaseResp upload(HttpServletRequest request,
                           HttpServletResponse response) throws IOException, ServletException {
        String encoding = request.getCharacterEncoding();
        if(StringUtil.isEmpty(encoding)) {
            request.setCharacterEncoding("UTF-8");
        }

        // 原来的逻辑
}
```

日志发现 `request.getCharacterEncoding()` 一开始确实是 null，但是设置之后依然无效。

## 3-对文件名进行编码

然后就怀疑是不是中文名称没有转成 UTF-8 导致的，于是修改名称的获取方式：

```java
StandardMultipartHttpServletRequest sm = (StandardMultipartHttpServletRequest) request;
MultipartFile multipartFile = sm.getFile("file");
String filename = multipartFile.getOriginalFilename();

// 转码处理
filename = new String(filename.getBytes(), "UTF-8");
```

很不幸，依然是乱码。

## 4-移除强制转换

然后怀疑是不是强转 utf-8 导致的，于是做了如下调整：

```java
@Bean
public FilterRegistrationBean filterRegistrationBean() {
    FilterRegistrationBean registrationBean = new FilterRegistrationBean();
    CharacterEncodingFilter characterEncodingFilter = new CharacterEncodingFilter();
    // 注释掉强制换换
    //characterEncodingFilter.setForceEncoding(true);
    characterEncodingFilter.setEncoding("UTF-8");
    registrationBean.setFilter(characterEncodingFilter);
    return registrationBean;
}
```

注释掉编码设置。

```java
public BaseResp upload(HttpServletRequest request,
                           HttpServletResponse response) throws IOException, ServletException {
        //String encoding = request.getCharacterEncoding();
        //if(StringUtil.isEmpty(encoding)) {
        //    request.setCharacterEncoding("UTF-8");
        //}
}
```

发现依然无效。

## 5-正确的方式

最后找到了正确的方式，如下：

```java
String value = new String("我是中文乱码".getBytes("ISO-8859-1"),"UTF-8");
```

至于原因，是因为看了一篇对于乱码形式介绍的文章。

比如前段上传 `上传文件.zip`；后端接收到 `ä¸ä¼ æä»¶.zip`。

而且大部分中文都是这种形式，就去查一查有没有规律，还真找到了。

# 乱码知识回顾

ps: 内容较长，可以跳过。

## 字符编码理论简述

本文主要是围绕Web开发中涉及到的中文编码这一常见问题展开，包括了对字符编码基础理论的简述以及常见几种编码标准的介绍。

其中包括：ASCII、ISO8859-1、Unicode、GBK。

下面先对这些字符编码集进行简单的介绍。

### 1.1 ASCII

ASCII也就是美国信息交换标准码，采用单字节编码方案，但是编码只用了后七位字节，表示范围0-127共128个字符。ASCII码相对于其它编码也是最早出现的。

从上世纪60年代提出开始，到1986年最终定型。

为什么选择7位编码?

ASCII在最初设计的时候需要至少能表示64个码元：包括26个字母+10个数字+图形标示+控制字符，如果用6bit编码，可扩展部分没有了，所以至少需要7bit。

那么8bit呢？最终也被标准委员会否定，原因很简单：满足编码需求的前提下，最小化传输开销。

### 1.2 ISO8859-1

ISO-8859-1也被称为Latin1，使用单字节8bit编码，可以表示256个西欧字符。

其隶属于ISO8859标准的一部分，还有ISO8859-2、ISO8859-3等等。

每一种编码都对应一个地区的字符集。

比如：ISO8859-1表示西欧字符，ISO-8859-16表示中欧字符集，等等。

### 1.3 Unicode

不管是ASCII还是ISO8859-1，其编码范围都是有局限的。

而Unicode标准的目标就是消除传统编码的局限性。

这里的局限性一方面指编码范围的局限性：比如ASCII只能表示128个字符。

还有编码兼容性方面的局限性：比如ISO8859代表的一系列编码字符集虽然可以表示大部分国家地区的字符，但是彼此的兼容性做的不好。

Unicode的目标就如同其名称的含义一样：“实现字符编码统一”

Unicode标准的实现方案有如下三种：UTF-8、UTF-16和UTF-32.

UTF-8是变长编码，使用1到4个字节。

UTF-8在设计时考虑到向前兼容，所以其前128个字符和ASCII完全一样，也就是说，所有ASCII同时也都符合UTF-8编码格式。

其格式如下：

```
0xxxxxxx
110xxxxx    10xxxxxx
1110xxxx    10xxxxxx    10xxxxxx
11110xxx    10xxxxxx    10xxxxxx    10xxxxxx
```

字节首部为0的话，也就是前面说的ASCII了。

此外，字节首部连续1的个数就代表了该字符编码后所占的字节数。目前全世界的网页编码绝大多数使用的就是UTF-8，占比接近90%。

UTF-16也是变长编码，但其最初是固定16-bit宽度的定长编码，主要因为Unicode涵盖的字符太多了。两字节更本不够用！

UTF-32是32-bit定长编码，优点：定长编码在处理效率上相对于变长编码要高，此外，可通过索引访问任意字符是其另一大优势；缺点也很明显：32bit太浪费了！存储效率太低！

big-endian和little-endian？

在多字节编码标准中可能会遇到这样的问题：假如一个字符用两个字节表示，那么当读取这个字符的时候，哪个字节表示高有效位？哪个表示低有效位呢？这就涉及到字节的存储顺序问题。

在Unicode中UTF-16和UTF-32都会面临这个问题。通常用BOM（Byte Order Mark）来进行区分。BOM用一个"U+FEFF"来表示，这个值在Unicode中是没有对应字符的。不仅可以用其来指定字节顺序，还可以表示字节流的编码方式。

```java
System.out.println("len1:" + "a".getBytes("UTF16").length);     //len1:4
System.out.println("len2:" + "aa".getBytes("UTF16").length);    //len2:6
```

为什么是4和6，不应该是2和4吗？。

输出编码后的字节序列可以发现，起始的两个字节都是："fe ff"。

Java的char类型用什么编码格式？

Java语言规范规定了Java的char类型使用的是UTF-16。这就是为什么Java的char占用两个字节的原因。

此外，Java标准库实现的对char与String的序列化规定使用UTF-8。

Java的Class文件中的字符串常量与符号名字也都规定用UTF-8编码。

这大概是当时设计者为了平衡运行时的时间效率（采用定长编码的UTF-16，当然，在设计java的时候UTF-16还是定长的）与外部存储的空间效率（采用变长的UTF-8编码）而做的取舍。

### 1.4 GBK

GBK 是用于对简体中文进行编码。每个字符用两字节表示，同时兼容GB2312标准。

## 可能发生的中文乱码

这一小节介绍软件开发中常见的中文编码乱码问题，在下面示例中：对于给定的一个包含中文的字符串"你好Java"，看一下都会出现哪些乱码问题。

### 2.1 中文变问号，如：?????

```
"你好Java"  ------>  "??Java"
```

这种情况一般是由于中文字符经ISO8859-1编码造成的。

下面是编码的具体过程：

原字符串："你好Java"

``` 
你	    好	    J	a	v	a
4f60	597d	4a	61	76	61
```

经ISO8859-1编码后：

```
你	好	J	a	v	a
3f	3f	4a	61	76	61
```

编码后字符串："??Java"

```java
String str = "你好Java";
System.out.println(byteToHexString(str.getBytes(CHARSET_ISO88591)));        //3f 3f 4a 61 76 61
System.out.println(new String(str.getBytes(CHARSET_ISO88591)));             //??Java
```

我们知道ISO8859-1是单字节编码，而对于汉字已经超出ISO8859-1的编码范围，会被转化为"3f"，我们查表可知，"3f"对应的字符正是"?"。

中文变问号的乱码情况是非常常见的，大部分开源软件的默认编码设置成了ISO8859-1，这点需要格外注意。

### 2.2 中文变奇怪字符，如：ä½ å¥½ 或者 ÄãºÃ

```
"你好Java"  ------>  "ä½ å¥½Java"
```

原字符串："你好Java"

```
你	    好	    J	a	v	a
4f60	597d	4a	61	76	61
```

经UTF-8编码后，一个中文用三个字节表示：

```
你 | 好 | J| a| v| a
---|---|---|---|---|---|---|---
e4 bd a0 | e5 a5 bd | 4a| 61| 76| 61
```

乱码原因：**UTF8编码或GBK编码，再由ISO8859-1解码。**

对照ISO8859-1编码表后发现：e4 bd a0分别对应三个字符："ä½ ",e5 a5 bd分别对应三个字符"å¥½",

### 2.3 中文变“复杂中文”如：浣犲ソ

下面依然是"你好Java"经过UTF-8编码后对应的字节序列：

```
你 | 好 | J| a| v| a
---|---|---|---|---|---|---|---
e4 bd a0 | e5 a5 bd | 4a| 61| 76| 61
```

在GBK表中查找：e4 bd对应字符："浣",a0 e5对应字符："犲",a5 bd对应字符："ソ"

同理，如果GBK编码的中文用UTF-8来解码的话，同样会出现乱码问题。

### 2.4 中文变成一堆黑色菱形+问号，如：�����

首先问号+黑色菱形的字符是Unicode中的"REPLACEMENT CHARACTER",该字符的主要作用是用来表示不识别的字符。

所以产生乱码的原因可能有很多，下面通过原字符串："你好Java"，重现一种乱码方式：

```
原字符串：String str = "你好Java"
 
你 | 好 | J| a| v| a
---|---|---|---|---|---
4f60 | 597d | 4a| 61| 76| 61
 
UTF-16编码后
 
fe ff 4f 60 59 7d 0 4a 0 61 0 76 0 61
```

其中"fe ff"就是字节流起始的BOM标识符。"fe ff"在Unicode标准中属于"noncharacters",只用于内部使用。

所以，在输出该字节序列的时候，没有该码元对应的字符，对于不识别字符，就会用��替代。

# 结合自身的问题

结合我们遇到的中文乱码问题，很明显对应的是：UTF8编码或GBK编码，再由ISO8859-1解码。

知道原因，最直接的方式就是反过来：ISO8859-1 获取 bytes，然后转换为 UTF-8，也就是开始的答案：

```java
String value = new String("我是中文乱码".getBytes("ISO-8859-1"),"UTF-8");
```

当然，问题的解决方案是多样的，这里汇总一下，便于后续使用和学习。

# 乱码解决方案

## 编写字符编码过滤器

```java
@WebFilter(urlPatterns = "/*",filterName = "CharacterEncodingFilter")
public class CharacterEncodingFilter implements Filter{
    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
    }
 
    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain) throws IOException, ServletException {
        HttpServletRequest request = (HttpServletRequest) servletRequest;
        HttpServletResponse response = (HttpServletResponse) servletResponse;
        request.setCharacterEncoding("UTF-8");
        response.setCharacterEncoding("UTF-8");
 
        filterChain.doFilter(request , response);
    }
    @Override
    public void destroy() {
    }
}
```

然后启动类上加上@ServletComponentScan。@WebFilter是servlet3.0才有的注解。

当然这个过滤器你还可以这么写

```java
public class CharacterEncodingFilter implements Filter{
    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
    }
 
    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain) throws IOException, ServletException {
        HttpServletRequest request = (HttpServletRequest) servletRequest;
        HttpServletResponse response = (HttpServletResponse) servletResponse;
        request.setCharacterEncoding("UTF-8");
        response.setCharacterEncoding("UTF-8");
 
        filterChain.doFilter(request , response);
    }
    @Override
    public void destroy() {
    }
}
```

写个bean配置类，如下

```java
@Bean
public FilterRegistrationBean registerAuthFilter() {
    FilterRegistrationBean registration = new FilterRegistrationBean();
    registration.setFilter(new CharacterEncodingFilter();
    registration.addUrlPatterns("/*");
    registration.setName("CharacterEncodingFilter");
    registration.setOrder(1); 
    return registration;
}
```

ps: 其实这个就是我们前面看到的，springboot 有内置的过滤器。

等价于

```java
@Configuration
public class UtfConfig {
 
    @Bean
    public FilterRegistrationBean filterRegistrationBean() {
        FilterRegistrationBean registrationBean = new FilterRegistrationBean();
        CharacterEncodingFilter characterEncodingFilter = new CharacterEncodingFilter();
        characterEncodingFilter.setForceEncoding(true);
        characterEncodingFilter.setEncoding("utf-8");
        registrationBean.setFilter(characterEncodingFilter);
        return registrationBean;
    }
 
}
```

## 在 application.yml 指定编码格式为utf-8

如果出现乱码问题，这种方式解决的可能性不大，但可以尝试一下。

```yml
spring:
  http:
    encoding:
      charset: utf-8
      enabled: true
      force: true

server:
  tomcat:
    uri-encoding: UTF-8
```

结合源码会发现，其实 springboot 默认就是 UTF-8。

```java
@ConfigurationProperties(
    prefix = "spring.http.encoding"
)
public class HttpEncodingProperties {
    public static final Charset DEFAULT_CHARSET = Charset.forName("UTF-8");
    private Charset charset;
    private Boolean force;

    //xxx others
}
```

这个也建议和 maven 一起使用：

- pom.xml

设置项目本身的编码为 UTF-8

```xml
<properties>
		<project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
		<project.reporting.outputEncoding>UTF-8</project.reporting.outputEncoding>
		<java.version>1.8</java.version>
</properties>
```

## 使用 java 配置写一个字符编码配置类

```java
/**
 * 中文乱码解决
 */
@Configuration
public class CharsetConfig extends WebMvcConfigurerAdapter {
    @Bean
    public HttpMessageConverter<String> responseBodyConverter() {
        StringHttpMessageConverter converter = new StringHttpMessageConverter(
                Charset.forName("UTF-8"));
        return converter;
    }
    @Override
    public void configureMessageConverters(List<HttpMessageConverter<?>> converters) {
        super.configureMessageConverters(converters);
        converters.add(responseBodyConverter());
    }
    @Override
    public void configureContentNegotiation(ContentNegotiationConfigurer configurer) {
        configurer.favorPathExtension(false);
    }
}
```

StringHttpMessageConverter 是一个请求和响应信息的编码转换器，通过源码我们发现默认编码ISO-8859-1，不是UTF-8，所以我们只要通过上述配置将请求字符串转为UTF-8 即可

```java
public class StringHttpMessageConverter extends AbstractHttpMessageConverter<String> {
    public static final Charset DEFAULT_CHARSET = Charset.forName("ISO-8859-1");
    private volatile List<Charset> availableCharsets;
    private boolean writeAcceptCharset;
    //xxx
}
```

写到这里，我感觉中文乱码的问题很可能是出在这里。

前端实际上传递的是 UTF-8，但是被默认的 `ISO-8859-1` 编码执行了强转，所以又乱码了。

# 为什么请求的编码为空呢？

这里会有第二个疑问，为什么 `String encoding = request.getCharacterEncoding();` 是空的呢？

实际上，这也正是 springboot 默认使用 `ISO-8859-1`，导致乱码的罪魁祸首。

网上很多说是 IE 浏览器不会将页面上指定的编码写入http header发送给客户端，不过验证问题时使用的是 chrome。

所以，这个问题暂时存疑。

TODO

# 参考资料

https://bbs.csdn.net/topics/392401406

[CharacterEncodingFilter在SpringBoot中的配置](https://www.cnblogs.com/telwanggs/p/14648855.html)

[如何解决springboot参数传中文乱码？](https://www.wangt.cc/2021/01/%E5%A6%82%E4%BD%95%E8%A7%A3%E5%86%B3springboot%E5%8F%82%E6%95%B0%E4%BC%A0%E4%B8%AD%E6%96%87%E4%B9%B1%E7%A0%81%EF%BC%9F/)

[乱码](https://blog.csdn.net/liqun_super/article/details/104585960/)

[springboot设置UTF-8](https://blog.csdn.net/weixin_44182157/article/details/109114006)

[springboot全局字符编码设置（解决乱码问题）](https://blog.csdn.net/qq_39654841/article/details/81156695?)

[如何解决springboot参数传中文乱码](https://zhuanlan.zhihu.com/p/341145616)

[如何解决springboot参数传中文乱码](https://segmentfault.com/a/1190000038767926)

[Spring Boot 中文乱码问题解决方案汇总](https://www.jianshu.com/p/718826aee249)

[SpringBoot 解决乱码问题：通过 spring.http.encoding.charset 指定返回 UTF-8 编码](https://zhangzw.com/posts/20200815.html)

* any list
{:toc}
