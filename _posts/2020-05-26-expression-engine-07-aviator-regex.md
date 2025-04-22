---
layout: post
title:  java 表达式引擎概览-07-google aviator regex 正则表达式提取
date:  2020-5-26 15:11:16 +0800
categories: [Engine]
tags: [engine, expression-engine]
published: true
---

# 目标

google aviator regex 正则表达式提取


## 官方文档

AviatorScript 中正则表达式也是一等公民，作为基本类型来支持， `/`  括起来的正则表达式就是一个 java.util.Pattern 实例，例如 `/\d+/`  表示 1 个或者多个数字，正则表达式语法和  java 完全相同，但是对于需要转义的字符不需要连续的反斜杠 `\\` ，只要一个 `\` 即可，比如我们要匹配 `.av` 为结尾的文件，正则可以写成 `/^.*\.av$/` ，这里的 `\.` 来转义后缀里的 `.` 符号。

正则表达式能参与的运算只有比较运算符和正则匹配运算符 `=~` :


```js
## examples/regexp.av

let p = /^(.*)\.av$/;

println(p == p); ## print true

println("regexp.av" =~ p); ##print true

println("$0=" + $0);
println("$1=" + $1);
```

我们定义了一个正则表达式 p，用于匹配以 .av 结尾的文件名，匹配是用 =~ 运算符，匹配运算符左侧是字符串，右侧是正则表达式，如果匹配成功，返回 true，否则返回 false。

这里 regexp.av 是匹配成功，因此打印 true ， 如果匹配成功，同时 AviatorScript 会将正则中的匹配的分组放入 $0 ， $1 , $2  ... 的变量中，其中 $0  表示匹配的整个字符串，而 $1 表示第一个分组，以此类推。这里就是文件名，正则中用括号括起来的第一个分组 `(.*)` 。

因此上面将打印：


# 实际测试

## maven 

```xml
<dependencies>
        <dependency>
            <groupId>com.googlecode.aviator</groupId>
            <artifactId>aviator</artifactId>
            <version>5.4.3</version>
        </dependency>
    </dependencies>
```

## 测试

```java
package org.example;

import com.googlecode.aviator.AviatorEvaluator;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class Main {

    /**
     * 给出 Java 中提取包路径+异常名的正则。比如 java.lang.NumberFormatException。com.alibaba.FastJsonException
     * googlecode aviator 5.4.3，
     *
     * 形如：
     */
    public static void main(String[] args) {
        String input = "哈哈哈哈\n Caught exception: java.lang.NumberFormatException at line 42. Another one: com.alibaba.FastJsonException. 哈哈哈哈\n";

        Map<String, Object> env = new HashMap<>();
        env.put("input", input);

        // 正则表达式，异常类名前后可以有任意内容
        String script = "input =~ /([\\s\\S]*?)([a-zA-Z_][a-zA-Z0-9_]*(\\.[a-zA-Z_][a-zA-Z0-9_]*)+Exception)([\\s\\S]*)/; return $2;";

        Object result = AviatorEvaluator.execute(script, env);

        // 输出匹配到的异常类名
        System.out.println(result);  // 输出: java.lang.NumberFormatException
    }

}
```

这里需要加一下 `([\\s\\S]*?)` 将无关的内容移除掉。


# 参考资料

https://www.yuque.com/boyan-avfmj/aviatorscript/guhmrc

* any list
{:toc}