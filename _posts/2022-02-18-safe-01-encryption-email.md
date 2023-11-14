---
layout: post
title: java 如何判断字符串是否为邮箱？email 邮箱正则表达式怎么写？怎么样可以实现最高性能的邮箱匹配？
date: 2022-02-18 21:01:55 +0800 
categories: [Safe]
tags: [safe, web, in-action, sh]
published: true
---

# 背景

希望判断一个字符串是否为邮箱。

# 实际验证一下

## 1. 简单的 

详细解释一下这个邮箱正则：`^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$`

chat:

这个正则表达式用于验证电子邮件地址的基本格式。下面是对该正则表达式的详细解释：

1. `^`: 表示匹配字符串的开始。

2. `[a-zA-Z0-9_-]+`: 匹配邮箱用户名部分，其中：
   - `[a-zA-Z0-9_-]`: 表示可以包含大小写字母、数字、下划线、连字符。
   - `+`: 表示前述字符集合可以出现一次或多次。

3. `@`: 表示匹配邮箱地址中的“@”符号。

4. `[a-zA-Z0-9_-]+`: 同上，匹配邮箱域名的一部分。

5. `(\.[a-zA-Z0-9_-]+)+`: 匹配域名中的点号部分，其中：
   - `\.`: 表示匹配一个点号。在正则表达式中，点号通常需要用反斜杠转义。
   - `[a-zA-Z0-9_-]+`: 匹配点号后的域名部分。
   - `+`: 表示前述整个组（点号+域名）可以出现一次或多次，以允许匹配多级域名。

6. `$`: 表示匹配字符串的结束。

综合起来，这个正则表达式用于验证包含用户名和域名的基本电子邮件地址格式。

需要注意的是，这个正则表达式并没有涵盖电子邮件地址的所有可能情况，因为电子邮件地址的规范相当复杂。

在实际应用中，你可能需要根据具体需求对正则表达式进行进一步调整。

### java 代码

```java
    /**
     * 邮箱正则表达式
     *
     * https://blog.csdn.net/Architect_CSDN/article/details/89478042
     * https://www.cnblogs.com/lst619247/p/9289719.html
     *
     * 只有英文的邮箱。
     * @since 0.1.68
     */
    private static final Pattern EMAIL_ENGLISH_PATTERN = Pattern.compile("^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\\.[a-zA-Z0-9_-]+)+$");

    
    /**
     * 是否为邮件
     * @param string 字符
     * @return 结果
     * @since 0.1.68
     */
    public static boolean isEmail(final String string) {
        return isPatternMatch(string, EMAIL_ENGLISH_PATTERN);
    }

    /**
     * 验证字符串是否匹配正则表达式
     * @param string 字符串
     * @param pattern 正则表达式
     * @return 是否匹配
     * @since 0.1.68
     */
    private static boolean isPatternMatch(final String string, final Pattern pattern) {
        return pattern.matcher(string).find();
    }
```

# chat

## Q1-java 判断是否为邮箱的高性能正则

在 Java 中，可以使用正则表达式来判断一个字符串是否是邮箱。

以下是一个简单的高性能邮箱正则表达式示例：

```java
import java.util.regex.Pattern;

public class EmailValidator {
    private static final String EMAIL_REGEX = "^[a-zA-Z0-9_+&*-]+(?:\\.[a-zA-Z0-9_+&*-]+)*@(?:[a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,7}$";
    private static final Pattern pattern = Pattern.compile(EMAIL_REGEX);

    public static boolean isValidEmail(String email) {
        return pattern.matcher(email).matches();
    }

    public static void main(String[] args) {
        String[] emails = {
            "test@example.com",
            "user123@gmail.com",
            "invalid.email@.com",
            "missing.at.sign@example.com",
            "to@to@double.at.sign.com"
        };

        for (String email : emails) {
            System.out.println(email + " is valid: " + isValidEmail(email));
        }
    }
}
```

这个正则表达式的解释如下：

- `^[a-zA-Z0-9_+&*-]+`: 匹配邮箱的用户名部分，允许包含字母、数字、下划线、加号、和星号。
- `(?:\\.[a-zA-Z0-9_+&*-]+)*`: 非捕获组，匹配可能出现的点号后跟用户名的情况，允许出现零次或多次。
- `@(?:[a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,7}$`: 匹配邮箱的域名部分，要求域名包含一个以上的子域名，以及一个顶级域名，顶级域名为2到7个字母。

注意，虽然这个正则表达式可以匹配一般的邮箱地址，但邮箱地址的规范非常复杂，因此完美的解决方案可能需要更加复杂的正则表达式或者其他验证手段。


### Q1.1 详细解释一下这个正则

详细解释一下正则表达式：`^[a-zA-Z0-9_+&*-]+(?:\\.[a-zA-Z0-9_+&*-]+)*@(?:[a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,7}$`

这个正则表达式用于验证电子邮件地址的格式。下面是对该正则表达式的详细解释：

1. `^`: 表示匹配字符串的开始。

2. `[a-zA-Z0-9_+&*-]+`: 匹配邮箱用户名部分，其中：
   - `[a-zA-Z0-9_+&*-]`: 表示可以包含大小写字母、数字、下划线、加号、和星号。
   - `+`: 表示前述字符集可以出现一次或多次。

3. `(?:\\.[a-zA-Z0-9_+&*-]+)*`: 这是一个非捕获组，匹配可能出现的点号（句点）后跟用户名的情况，其中：
   - `(?: ... )`: 表示非捕获组，它允许对其中的表达式进行分组而不捕获匹配的结果。
   - `\\.`: 表示匹配一个点号。在正则表达式中，点号通常需要用反斜杠转义，因为点号本身是一个特殊字符。
   - `[a-zA-Z0-9_+&*-]+`: 同上，匹配点号后的用户名部分。
   - `*`: 表示前述整个组（点号+用户名）可以出现零次或多次。

4. `@`: 表示匹配邮箱地址中的“@”符号。

5. `(?:[a-zA-Z0-9-]+\\.)+`: 这是另一个非捕获组，匹配域名部分，其中：
   - `(?: ... )`: 同上，是一个非捕获组。
   - `[a-zA-Z0-9-]+`: 匹配域名的一部分，允许包含大小写字母、数字和连字符。
   - `\\.`: 匹配域名中的点号。
   - `+`: 表示前述整个组（域名部分）可以出现一次或多次，以允许匹配多级域名。

6. `[a-zA-Z]{2,7}`: 匹配顶级域名（TLD），其中：
   - `[a-zA-Z]`: 表示匹配一个大小写字母。
   - `{2,7}`: 表示前述字母可以重复出现 2 到 7 次，以匹配常见的 TLD 长度。

7. `$`: 表示匹配字符串的结束。

综合起来，这个正则表达式用于验证典型的邮箱地址格式，包括用户名、@符号、域名等部分的规范性。

请注意，这个正则表达式可能无法涵盖所有情况，因为电子邮件地址的规范相当复杂，但对于一般情况而言，这是一个相对常见的邮箱验证正则表达式。

### Q1.2 这个正则表达式的性能如何？还能更好吗

这个正则表达式对于一般的邮箱地址验证而言是相对高效的，因为它主要关注常见的邮箱格式，并且没有过多复杂的匹配规则。

在实际使用中，性能的好坏也受到其他因素的影响，例如输入的字符串长度、硬件性能等。

然而，如果对性能有更高的要求，可以考虑以下几点进行改进：

1. **简化正则表达式：** 如果你只关心基本的邮箱格式验证，可以简化正则表达式，去除一些不太必要的部分。例如，如果不需要考虑邮箱的顶级域名长度限制，可以将 `{2,7}` 部分去掉。

2. **预编译正则表达式：** 如果你要多次使用相同的正则表达式进行验证，可以使用 `Pattern.compile` 预编译正则表达式，以提高性能。

3. **使用非捕获组：** 正则表达式中的非捕获组 `(?: ... )` 比捕获组对性能更友好，因为它不会捕获匹配的结果。

下面是一个经过简化和预编译的示例：

```java
import java.util.regex.Pattern;

public class EmailValidator {
    private static final Pattern EMAIL_REGEX = Pattern.compile("^[a-zA-Z0-9_+&*-]+(\\.[a-zA-Z0-9_+&*-]+)*@[a-zA-Z0-9-]+(\\.[a-zA-Z0-9-]+)+$");

    public static boolean isValidEmail(String email) {
        return EMAIL_REGEX.matcher(email).matches();
    }

    public static void main(String[] args) {
        String[] emails = {
            "test@example.com",
            "user123@gmail.com",
            "invalid.email@.com",
            "missing.at.sign@example.com",
            "to@to@double.at.sign.com"
        };

        for (String email : emails) {
            System.out.println(email + " is valid: " + isValidEmail(email));
        }
    }
}
```

这个简化后的正则表达式在结构上更为清晰，并且去除了一些不太必要的部分。

再次强调，根据实际需求和应用场景，可能需要根据性能测试结果对正则表达式进行微调。

## Q2-如何用 java 代码实现是否为邮箱的判断，不用正则？

如果你不想使用正则表达式，你可以使用 `javax.mail.internet.InternetAddress` 类来判断是否为有效的邮箱地址。这个类提供了一些邮箱地址相关的功能，包括解析和验证。

以下是一个示例代码：

```java
import javax.mail.internet.AddressException;
import javax.mail.internet.InternetAddress;

public class EmailValidator {
    public static boolean isValidEmail(String email) {
        boolean isValid = false;
        try {
            InternetAddress internetAddress = new InternetAddress(email);
            internetAddress.validate();
            isValid = true;
        } catch (AddressException e) {
            // 邮箱地址无效
        }
        return isValid;
    }

    public static void main(String[] args) {
        String[] emails = {
            "test@example.com",
            "user123@gmail.com",
            "invalid.email@.com",
            "missing.at.sign@example.com",
            "to@to@double.at.sign.com"
        };

        for (String email : emails) {
            System.out.println(email + " is valid: " + isValidEmail(email));
        }
    }
}
```

在这个示例中，`InternetAddress` 的构造函数会尝试解析给定的字符串作为邮箱地址，如果解析成功，而且地址有效，则 `validate()` 方法会返回而不抛出异常，因此我们通过捕获 `AddressException` 异常来判断邮箱地址是否有效。


PS: 这个不行，性能肯定很差。

## Q3-这样岂不是很慢？

使用 `InternetAddress` 类进行邮箱地址验证相对于正则表达式而言，可能会稍慢一些，因为这涉及到更多的解析和验证步骤。

如果性能对你来说非常关键，你可以使用正则表达式进行快速的基本验证，然后再使用 `InternetAddress` 进行更严格的验证。

以下是一个结合使用正则表达式和 `InternetAddress` 的例子：

```java
import javax.mail.internet.AddressException;
import javax.mail.internet.InternetAddress;

public class EmailValidator {
    private static final String EMAIL_REGEX = "^[a-zA-Z0-9_+&*-]+(?:\\.[a-zA-Z0-9_+&*-]+)*@(?:[a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,7}$";

    public static boolean isValidEmail(String email) {
        if (!email.matches(EMAIL_REGEX)) {
            return false; // 基本的正则验证失败
        }

        try {
            InternetAddress internetAddress = new InternetAddress(email);
            internetAddress.validate();
            return true; // 更严格的验证通过
        } catch (AddressException e) {
            return false; // InternetAddress 验证失败
        }
    }

    public static void main(String[] args) {
        String[] emails = {
            "test@example.com",
            "user123@gmail.com",
            "invalid.email@.com",
            "missing.at.sign@example.com",
            "to@to@double.at.sign.com"
        };

        for (String email : emails) {
            System.out.println(email + " is valid: " + isValidEmail(email));
        }
    }
}
```

这样，你可以通过正则表达式进行快速验证，然后再使用 `InternetAddress` 进行更详细的验证，以提高性能。


## Q4-合法的邮箱长度

根据 [RFC 5321](https://tools.ietf.org/html/rfc5321) 和 [RFC 5322](https://tools.ietf.org/html/rfc5322)，规定了电子邮件地址的长度限制。

RFC 5321 描述了邮件传输的基本规则，而 RFC 5322 描述了邮件的语法和格式。

根据这些标准，整个电子邮件地址（包括用户名、@符号和域名）的总长度不能超过 320 个字符。

在实际应用中，很多邮件服务提供商可能还会有一些自己的限制，因此具体的长度限制可能会有所不同。

以下是一个示例 Java 代码，用于检查电子邮件地址的长度是否在合法范围内：

```java
public class EmailValidator {
    private static final int MAX_EMAIL_LENGTH = 320;

    public static boolean isValidEmailLength(String email) {
        return email.length() <= MAX_EMAIL_LENGTH;
    }

    public static void main(String[] args) {
        String[] emails = {
            "user123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890@example.com",
            "user@example.com"
        };

        for (String email : emails) {
            System.out.println("Email: " + email + ", Length is valid: " + isValidEmailLength(email));
        }
    }
}
```

在这个示例中，`MAX_EMAIL_LENGTH` 设置为 320，`isValidEmailLength` 方法用于检查电子邮件地址的长度是否在合法范围内。你可以根据实际需求进行调整。

## Q5-最短的邮箱是？

在电子邮件标准中，并没有规定电子邮件地址的最短长度。从理论上讲，一个合法的电子邮件地址可能只包含一个字符作为用户名、一个字符作为域名，以及一个字符的顶级域名。

但是，实际上，大多数邮件服务提供商对电子邮件地址都有一些更具体的规定，通常要求更长的用户名和域名。

以下是一个例子，展示了一个非常短的合法电子邮件地址：

```java
public class EmailValidator {
    private static final int MIN_EMAIL_LENGTH = 5;

    public static boolean isValidEmailLength(String email) {
        return email.length() >= MIN_EMAIL_LENGTH;
    }

    public static void main(String[] args) {
        String[] emails = {
            "a@b.c",
            "x@y.z"
        };

        for (String email : emails) {
            System.out.println("Email: " + email + ", Length is valid: " + isValidEmailLength(email));
        }
    }
}
```

在这个示例中，`MIN_EMAIL_LENGTH` 设置为 5，`isValidEmailLength` 方法用于检查电子邮件地址的长度是否在合法范围内。

请注意，这只是一个示例，并不代表实际使用中的常见情况。

在实际应用中，你应该遵循通用的电子邮件地址格式和长度标准。

# 参考资料

无

* any list
{:toc}