---
layout: post
title: 权限体系之-20-passport 安全之 XSS
date: 2025-11-20 14:12:33 +0800
categories: [plateform]
tags: [plateform, sh]
published: true
---

# chat

## 是什么？

好的，咱们把 **XSS 攻击一次讲透**，从“是什么 → 怎么发生 → 有哪些类型 → 有多危险 → 如何防 → 实战最佳实践”全程打通。

---

# 一、什么是 XSS？

**XSS（Cross-Site Scripting，跨站脚本攻击）**
简单说就是：

> 攻击者把恶意 JavaScript 注入到页面中，当其他用户访问页面时，这段脚本就在他们浏览器中执行。

本质：
浏览器“信任了不该信任的内容”，把用户输入当成了代码执行。

核心公式：

```
用户输入 → 未过滤 → 直接渲染到页面 → 浏览器执行
```

---

# 二、XSS 能干什么？（为什么危险）

XSS 不只是弹个 alert，它是真·高危漏洞：

| 能力                | 实际后果         |
| ----------------- | ------------ |
| 读取 Cookie / Token | 劫持登录态，直接接管账号 |
| 模拟用户操作            | 自动发帖、转账、改资料  |
| 页面钓鱼              | 嵌入假登录框骗密码    |
| 远程加载木马            | 植入键盘记录，长期监控  |
| 绕过权限系统            | 构造后台请求       |

✅ 在企业系统里：
XSS = 管理员权限沦陷 = 数据泄露 / 系统失控

---

# 三、XSS 的三大类型

## 1. 反射型 XSS（Reflected）

用户输入的数据立刻返回到页面中。

典型场景：

```
/search?keyword=<script>恶意代码</script>
```

页面直接渲染 keyword，就被执行。

特点：

* 需要诱导点击链接
* 不持久
* 常见于搜索、错误页面

---

## 2. 存储型 XSS（Stored）

恶意代码被存进数据库，所有访问者都会中招。

比如：

* 评论区
* 用户昵称
* 个人简介

攻击者提交：

```
<script>...</script>
```

后台存了，所有人加载页面就执行。

✅ 最危险的一种

---

## 3. DOM 型 XSS

不是后端问题，而是前端 JS 逻辑问题。

例如：

```javascript
document.getElementById("box").innerHTML = location.hash;
```

攻击者构造 URL：

```
http://xxx.com/#<script>代码</script>
```

浏览器自己执行，服务器完全不知情。

---

# 四、XSS 常见触发点

🚩 高危位置：

* v-html
* innerHTML
* eval()
* setTimeout("字符串")
* new Function()
* document.write()
* location.href 动态拼接

🚩 高风险输入源：

* URL 参数
* 表单内容
* 评论、富文本
* Cookie
* localStorage
* WebSocket 推送

---

# 五、典型 XSS 漏洞示例

危险写法（Vue）：

```vue
<div v-html="userInput"></div>
```

如果 userInput = `<script>steal()</script>`
你网页就变攻击平台了。

危险写法（JS）：

```js
element.innerHTML = userContent;
```

---

# 六、XSS 防御核心原则

一句话总结：

> 所有用户输入都是不可信的
> 所有输出都必须转义

### 四大防御策略：

1. ✅ 输出时统一转义（核心）
2. ✅ 不信任任何输入
3. ✅ 避免动态执行 JS
4. ✅ 强制 CSP 内容安全策略

---

# 七、XSS 防御的黄金公式

## ✅ 正确思想

| 场景     | 正确做法               |
| ------ | ------------------ |
| 普通文本   | 转义显示               |
| HTML内容 | 白名单过滤              |
| JSON数据 | 严格序列化              |
| URL    | encodeURIComponent |

---

# 八、前端 Vue3 防 XSS 实战

### 1. 永远避免 v-html

❌ 错误：

```vue
<div v-html="content"></div>
```

✅ 安全：

```vue
<div>{{ content }}</div>
```

Vue 默认会自动转义。

---

### 2. 使用 DOMPurify（专业级过滤）

```bash
npm install dompurify
```

```js
import DOMPurify from 'dompurify'

const safeHtml = DOMPurify.sanitize(dirtyHtml);
```

配合 v-html 才可安全使用。

---

### 3. 禁止使用 eval / new Function

任何动态 JS 字符串执行 = XSS 温床。

---

# 九、后端 Spring Boot 防御方案

## 1. 全局 XSS Filter（推荐）

```java
@Component
@WebFilter(urlPatterns = "/*")
public class XssFilter implements Filter {

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        chain.doFilter(new XssHttpServletRequestWrapper((HttpServletRequest) request), response);
    }
}
```

配合 Wrapper 过滤：

```java
public class XssHttpServletRequestWrapper extends HttpServletRequestWrapper {

    public XssHttpServletRequestWrapper(HttpServletRequest request) {
        super(request);
    }

    @Override
    public String getParameter(String name) {
        String value = super.getParameter(name);
        return HtmlUtils.htmlEscape(value);
    }
}
```

---

## 2. JSON 输出防护

配置 Jackson：

```java
@Bean
public ObjectMapper objectMapper() {
    ObjectMapper mapper = new ObjectMapper();
    mapper.getFactory().setCharacterEscapes(new HtmlCharacterEscapes());
    return mapper;
}
```

---

# 十、浏览器层防护：CSP（最强防线）

HTTP 头：

```http
Content-Security-Policy:
default-src 'self';
script-src 'self';
object-src 'none';
```

Spring Boot 配置：

```java
http.headers().contentSecurityPolicy(
    "default-src 'self'; script-src 'self'; object-src 'none';"
);
```

效果：

* 禁止页面执行外部恶意脚本
* 阻断内联脚本

---

# 十一、完整防御体系推荐

### ✅ 前端

* 禁用 v-html
* DOMPurify 清洗富文本
* 路由参数统一 encode
* 不拼接 HTML

### ✅ 后端

* XSS Filter 全局过滤
* Controller 参数校验
* 默认 HTML escape

### ✅ 浏览器

* CSP
* HttpOnly Cookie
* SameSite

---

# 十二、推荐的综合最佳实践

### ✅ 最安全组合

| 层级     | 防护                |
| ------ | ----------------- |
| Vue    | 自动转义显示            |
| API    | HTML Escape 处理    |
| Header | CSP 强制策略          |
| Cookie | HttpOnly + Secure |

---

# 十三、简单总结（白话版）

> XSS 就是别人把代码塞到你页面里，然后借你的系统攻击你的用户。

防御核心只有一句话：

✅ 不信任任何用户输入
✅ 永远不要直接渲染未处理的内容
✅ 所有输出必须经过转义或清洗

---

# 落地方案

明白，我给你整理一套 **Spring Boot + Vue3 企业级防 XSS 攻击完整配置**，覆盖前端、后端、浏览器策略，企业级可直接落地。我们按层级拆解：

---

## 一、前端 Vue3 防 XSS

### 1️⃣ 避免 v-html

❌ 错误写法：

```vue
<div v-html="userInput"></div>
```

✅ 安全写法：

```vue
<div>{{ userInput }}</div>
```

* Vue3 默认会自动对 `{{}}` 插值进行 HTML 转义。

---

### 2️⃣ 富文本或 HTML 内容需要安全处理

使用 **DOMPurify** 过滤用户输入的 HTML：

```bash
npm install dompurify
```

```js
import DOMPurify from 'dompurify'

const safeHtml = DOMPurify.sanitize(dirtyHtml, {
  ALLOWED_TAGS: ['b','i','u','p','br','ul','li','a','img'],
  ALLOWED_ATTR: ['href','src','alt','title']
})
```

然后再渲染：

```vue
<div v-html="safeHtml"></div>
```

✅ 注意：

* 不允许直接执行 JS（如 `onerror`、`onclick` 等事件）
* ALLOWED_TAGS/ATTR 可根据业务精简

---

### 3️⃣ URL 参数处理

```js
const keyword = encodeURIComponent(route.query.keyword)
```

* 防止反射型 XSS

---

### 4️⃣ 避免动态执行 JS

```js
// 不安全
eval(userInput)
new Function(userInput)
```

---

## 二、后端 Spring Boot 防 XSS

### 1️⃣ 全局 XSS Filter

```java
import jakarta.servlet.*;
import jakarta.servlet.annotation.WebFilter;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.util.HtmlUtils;

import java.io.IOException;

@Component
@WebFilter(urlPatterns = "/*")
public class XssFilter implements Filter {

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        chain.doFilter(new XssHttpServletRequestWrapper((HttpServletRequest) request), response);
    }
}
```

**Wrapper 对用户输入统一转义**

```java
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;
import org.springframework.web.util.HtmlUtils;

public class XssHttpServletRequestWrapper extends HttpServletRequestWrapper {

    public XssHttpServletRequestWrapper(HttpServletRequest request) {
        super(request);
    }

    @Override
    public String getParameter(String name) {
        String value = super.getParameter(name);
        return value != null ? HtmlUtils.htmlEscape(value) : null;
    }

    @Override
    public String[] getParameterValues(String name) {
        String[] values = super.getParameterValues(name);
        if (values == null) return null;
        for (int i = 0; i < values.length; i++) {
            values[i] = HtmlUtils.htmlEscape(values[i]);
        }
        return values;
    }

    @Override
    public String getHeader(String name) {
        String value = super.getHeader(name);
        return value != null ? HtmlUtils.htmlEscape(value) : null;
    }
}
```

---

### 2️⃣ JSON 输出统一转义

```java
import com.fasterxml.jackson.core.io.CharacterEscapes;
import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class JacksonConfig {

    @Bean
    public ObjectMapper objectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.getFactory().setCharacterEscapes(new HtmlCharacterEscapes());
        return mapper;
    }

    static class HtmlCharacterEscapes extends CharacterEscapes {
        private final int[] asciiEscapes;

        public HtmlCharacterEscapes() {
            asciiEscapes = standardAsciiEscapesForJSON();
            asciiEscapes['<'] = CharacterEscapes.ESCAPE_STANDARD;
            asciiEscapes['>'] = CharacterEscapes.ESCAPE_STANDARD;
            asciiEscapes['&'] = CharacterEscapes.ESCAPE_STANDARD;
            asciiEscapes['"'] = CharacterEscapes.ESCAPE_STANDARD;
            asciiEscapes['\''] = CharacterEscapes.ESCAPE_STANDARD;
        }

        @Override
        public int[] getEscapeCodesForAscii() {
            return asciiEscapes;
        }

        @Override
        public SerializableString getEscapeSequence(int ch) {
            return null;
        }
    }
}
```

✅ 这样返回给前端的 JSON 自动转义 `<`, `>`, `'`, `"` 等特殊字符，防止注入。

---

### 3️⃣ CSP（Content Security Policy）安全头

在 Spring Security 中设置：

```java
http.headers()
    .contentSecurityPolicy("default-src 'self'; script-src 'self'; object-src 'none'; style-src 'self'; img-src 'self' data:;")
    .and()
    .xssProtection(xss -> xss.block(true));
```

* `default-src 'self'`：默认只允许本域名资源
* `script-src 'self'`：禁止加载外部 JS
* `object-src 'none'`：禁止 Flash/插件执行
* `style-src 'self'`：只允许本地样式
* `img-src 'self' data:`：允许 base64 图片

---

### 4️⃣ Cookie 安全策略

```java
response.setHeader("Set-Cookie", "SESSION=xxx; HttpOnly; Secure; SameSite=Strict");
```

* 防止 XSS 偷 Cookie

---

## 三、前后端综合防护流程

1. 前端：

   * 避免 v-html
   * 富文本过滤 DOMPurify
   * URL 参数 encode
   * 不动态执行 JS

2. 后端：

   * XSS Filter 全局参数转义
   * JSON 输出转义
   * 富文本可用 Jsoup/HTML Sanitizer 做白名单过滤

3. 浏览器：

   * CSP 强制策略
   * HttpOnly + Secure Cookie
   * SameSite Cookie

---

## 四、额外建议

* 对于存储型 XSS：使用富文本白名单 + 后端二次过滤
* 对于 DOM 型 XSS：Vue3 自带模板渲染避免大部分
* 定期使用 **Burp Suite / OWASP ZAP** 扫描 XSS


* any list
{:toc}