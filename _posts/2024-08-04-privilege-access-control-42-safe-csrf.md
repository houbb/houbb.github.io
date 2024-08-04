---
layout: post
title: privilege-42-跨站请求伪造（Cross-Site Request Forgery, CSRF）
date: 2024-08-04 21:01:55 +0800
categories: [Design]
tags: [design, privilege, safe, sh]
published: true
---


# chat

## 详细介绍一下 CSRF 攻击？

跨站请求伪造（Cross-Site Request Forgery, CSRF）是一种网络攻击方式，攻击者诱使用户在其身份认证的网页上执行恶意操作，从而对目标网站造成损害。

这种攻击利用了用户已经登录的状态，伪造用户的请求来进行未经授权的操作。

### 1. **CSRF 攻击的工作原理**

#### 1.1 攻击步骤

1. **用户登录**：用户在目标网站（如银行网站）上登录并获得身份验证凭证（如 Cookies）。
2. **攻击者设置恶意请求**：攻击者创建一个恶意网页或应用程序，其中包含一个伪造的请求，针对用户已经登录的目标网站。
3. **用户访问恶意页面**：用户在已登录的状态下访问了攻击者设置的恶意网页或点击了恶意链接。
4. **浏览器发送请求**：由于用户的浏览器会自动附带与目标网站相关的 Cookies，攻击者的恶意请求在用户不知情的情况下被发送到目标网站。
5. **目标网站处理请求**：目标网站认为这是来自已认证用户的合法请求，执行恶意操作（如转账、修改设置等）。

### 2. **CSRF 攻击示例**

#### 2.1 示例场景

假设用户在一个在线银行网站上已经登录，并且银行网站使用 Cookies 来保持用户的登录状态。

攻击者可以通过以下方式发起 CSRF 攻击：

- **攻击者网站上的恶意代码**：在攻击者的网站上插入一个 HTML 表单或 JavaScript 代码，这些代码会在用户访问攻击者网站时自动提交到银行网站。

**攻击者页面示例（HTML 表单）：**

```html
<form action="https://bank.example.com/transfer" method="POST" style="display:none;">
    <input type="hidden" name="account" value="attacker_account">
    <input type="hidden" name="amount" value="1000">
    <input type="submit">
</form>
<script>
    document.forms[0].submit();
</script>
```

当用户访问攻击者页面时，上述代码会自动提交请求到银行网站，尝试转账到攻击者账户。

### 3. **防护措施**

#### 3.1 **使用 CSRF 令牌**

- **生成和验证令牌**：在每个用户请求中，服务器生成一个唯一的 CSRF 令牌，并将其嵌入到表单或请求中。服务器在处理请求时验证令牌的有效性。

**生成和验证令牌示例（Java，Spring Boot）：**

```java
@Controller
public class TransferController {

    @GetMapping("/transfer")
    public String getTransferPage(Model model, HttpSession session) {
        // Generate a CSRF token and store it in the session
        String csrfToken = UUID.randomUUID().toString();
        session.setAttribute("csrfToken", csrfToken);
        model.addAttribute("csrfToken", csrfToken);
        return "transfer";
    }

    @PostMapping("/transfer")
    public String transferMoney(@RequestParam("amount") int amount,
                                @RequestParam("account") String account,
                                @RequestParam("csrfToken") String csrfToken,
                                HttpSession session) {
        // Validate CSRF token
        String sessionToken = (String) session.getAttribute("csrfToken");
        if (csrfToken == null || !csrfToken.equals(sessionToken)) {
            throw new SecurityException("Invalid CSRF token");
        }

        // Proceed with the transfer
        // ...
        return "success";
    }
}
```

**HTML 表单中嵌入 CSRF 令牌：**

```html
<form action="/transfer" method="POST">
    <input type="hidden" name="csrfToken" value="${csrfToken}">
    <input type="text" name="account" placeholder="Account">
    <input type="number" name="amount" placeholder="Amount">
    <button type="submit">Transfer</button>
</form>
```

#### 3.2 **使用 SameSite Cookie 属性**

- **SameSite 属性**：设置 Cookie 的 SameSite 属性，以限制第三方网站访问 Cookies，从而降低 CSRF 攻击的风险。

**设置 SameSite 属性示例（Java，Spring Boot）：**

```java
@Bean
public CookieSerializer cookieSerializer() {
    CookieSerializer cookieSerializer = new CookieSerializer();
    cookieSerializer.setSameSite("Strict"); // or "Lax"
    return cookieSerializer;
}
```

#### 3.3 **使用 HTTP Referer 或 Origin 头**

- **检查 Referer 和 Origin 头**：在服务器端检查请求中的 Referer 或 Origin 头，确保请求是从合法来源发出的。

**验证 Referer 头示例（Java，Spring Boot）：**

```java
@PostMapping("/transfer")
public String transferMoney(@RequestHeader("Referer") String referer,
                            @RequestParam("amount") int amount,
                            @RequestParam("account") String account) {
    // Validate the referer header
    if (!referer.startsWith("https://yourdomain.com")) {
        throw new SecurityException("Invalid referer");
    }

    // Proceed with the transfer
    // ...
    return "success";
}
```

#### 3.4 **避免使用 GET 请求执行敏感操作**

- **使用 POST 请求**：敏感操作（如修改账户信息、转账等）应使用 POST 请求而不是 GET 请求，因为 GET 请求可以更容易地被伪造和利用。

### 4. **综合防护措施**

为了全面防护 CSRF 攻击，可以结合以下措施：

1. **使用 CSRF 令牌**：为每个用户请求生成唯一的 CSRF 令牌，并在服务器端验证。
2. **设置 SameSite 属性**：为 Cookies 设置 SameSite 属性，限制跨站请求的 Cookie 发送。
3. **验证 Referer 或 Origin 头**：检查请求的来源，确保其合法。
4. **使用安全的 HTTP 方法**：避免使用 GET 请求执行敏感操作。

### 总结

CSRF 攻击利用了用户已经认证的状态，伪造请求以进行恶意操作。

通过使用 CSRF 令牌、设置 SameSite 属性、验证 Referer 或 Origin 头以及使用安全的 HTTP 方法，可以有效防护 CSRF 攻击，确保 Web 应用的安全性。

* any list
{:toc}