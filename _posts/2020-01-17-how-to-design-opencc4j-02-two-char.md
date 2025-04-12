---
layout: post
title: java 开源中文的繁简体转换 opencc4j-02-一个汉字竟然对应两个 char？
date:  2020-1-9 10:09:32 +0800
categories: [Search]
tags: [nlp, java, pinyin, sh]
published: true
---

# Opencc4j

[Opencc4j](https://github.com/houbb/opencc4j) 支持中文繁简体转换，考虑到词组级别。

[开源中文的繁简体转换 opencc4j-01-使用入门概览](https://houbb.github.io/2020/01/09/how-to-design-opencc4j-01-overview)

[开源中文的繁简体转换 opencc4j-02-一个汉字竟然对应两个 char？](https://houbb.github.io/2020/01/09/how-to-design-opencc4j-02-two-char)

[开源中文的繁简体转换 opencc4j-03-简体还是繁体，你说了算!](https://houbb.github.io/2020/01/09/how-to-design-opencc4j-03-simple-or-not)

[开源中文的繁简体转换 opencc4j-04-香港繁简体的支持](https://houbb.github.io/2020/01/09/how-to-design-opencc4j-04-hk)

[开源中文的繁简体转换 opencc4j-05-日文转换支持](https://houbb.github.io/2020/01/09/how-to-design-opencc4j-05-jp)

## Features 特点

- 严格区分「一简对多繁」和「一简对多异」。

- 完全兼容异体字，可以实现动态替换。

- 严格审校一简对多繁词条，原则为「能分则不合」。

- 词库和函数库完全分离，可以自由修改、导入、扩展。

- 兼容 Windows、Linux、Mac 平台。

- 支持自定义分词

- 支持判断单个字（词）是否为简体/繁体

- 支持返回字符串中简体/繁体的列表信息 

- 支持中国台湾、香港地区繁简体转换

- 支持与日文字的转换

# 从一个 bug 说起

很久很久以前，收到了一个用户的 issue [部分生僻字转小写之后会得到一个乱码（不可见字符）](https://github.com/houbb/opencc4j/issues/48)

内容如下：

```
例如“嘪球”在转换之后得到“𪡃球”，还有其他一些字也存在这个问题。查阅源码发现是 TSCharacters.txt 文件中定义的 “嘪 𪡃”导致，是否可以将这类会产生乱码的字用转化之前的字本身来代替，作为兜底策略，防止得到乱码。

只需要把该文件中，映射后为乱码的kv对替换掉即可，例如“嘪 𪡃”替换成“嘪 嘪”。
```

第一个感觉是，这合理吗？

也就没太放在心上，甚至怀疑是不是用户缺少对应的字库？

无独有偶，回头又看了另一个非常类似的问题。

[关于部分异体字实际占用两个字符的情况](https://github.com/houbb/opencc4j/issues/43)

描述如下：

```
在实际使用库转换一些古籍文本时，有不少的文字转换失败，实际调试发现，有些异体字如𨦟，其占用两个char作为一个完整意义上的可见字符，而库中源码将字符串转为字符串数组的方式可能会将这种关联断掉，导致转换失败。

实际自己的魔改实践发现，java.lang.String#codePointCount方法可以得到一个字符串中所含有的完整【字符】数量，例图二，我想请问您是否有打算兼容这种情况。
```

![pic1](https://private-user-images.githubusercontent.com/38535244/256159324-5d783cd2-8766-4380-ba55-fbd640980c56.png?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3NDQzNjEyMzksIm5iZiI6MTc0NDM2MDkzOSwicGF0aCI6Ii8zODUzNTI0NC8yNTYxNTkzMjQtNWQ3ODNjZDItODc2Ni00MzgwLWJhNTUtZmJkNjQwOTgwYzU2LnBuZz9YLUFtei1BbGdvcml0aG09QVdTNC1ITUFDLVNIQTI1NiZYLUFtei1DcmVkZW50aWFsPUFLSUFWQ09EWUxTQTUzUFFLNFpBJTJGMjAyNTA0MTElMkZ1cy1lYXN0LTElMkZzMyUyRmF3czRfcmVxdWVzdCZYLUFtei1EYXRlPTIwMjUwNDExVDA4NDIxOVomWC1BbXotRXhwaXJlcz0zMDAmWC1BbXotU2lnbmF0dXJlPTU1YjdjNjQ5Y2RhYTFiNTJlMGU2NDU0NjIxNGI1N2ZlN2U0ZGQ5ZDYzMmVhY2NiZDc3YzA1Yzk1MWJlOWY0MTgmWC1BbXotU2lnbmVkSGVhZGVycz1ob3N0In0.nGIVoVKu9ynj4DdUi6XA1uL0CUg0T7G7IWeVUPILSZM)

![pic2](https://private-user-images.githubusercontent.com/38535244/256159324-5d783cd2-8766-4380-ba55-fbd640980c56.png?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3NDQzNjEyMzksIm5iZiI6MTc0NDM2MDkzOSwicGF0aCI6Ii8zODUzNTI0NC8yNTYxNTkzMjQtNWQ3ODNjZDItODc2Ni00MzgwLWJhNTUtZmJkNjQwOTgwYzU2LnBuZz9YLUFtei1BbGdvcml0aG09QVdTNC1ITUFDLVNIQTI1NiZYLUFtei1DcmVkZW50aWFsPUFLSUFWQ09EWUxTQTUzUFFLNFpBJTJGMjAyNTA0MTElMkZ1cy1lYXN0LTElMkZzMyUyRmF3czRfcmVxdWVzdCZYLUFtei1EYXRlPTIwMjUwNDExVDA4NDIxOVomWC1BbXotRXhwaXJlcz0zMDAmWC1BbXotU2lnbmF0dXJlPTU1YjdjNjQ5Y2RhYTFiNTJlMGU2NDU0NjIxNGI1N2ZlN2U0ZGQ5ZDYzMmVhY2NiZDc3YzA1Yzk1MWJlOWY0MTgmWC1BbXotU2lnbmVkSGVhZGVycz1ob3N0In0.nGIVoVKu9ynj4DdUi6XA1uL0CUg0T7G7IWeVUPILSZM)

一个汉字对应两个 char，当年的自己还是想的太简单了。

# 汉字编码真奇妙

一般的汉字对应一个 Unicode char，但是有时候会有例外。

直接 `string.toCharArray()` 会导致拆分错误。

那么，一切就要从最基本的编码知识还是说起，感觉枯燥的小伙伴可以直接跳过。

### 一、Unicode 编码基础

#### 1. 码点（Code Point）
   - Unicode为每个字符分配唯一的数字标识（码点），格式为 `U+XXXX`（如 `U+4E00` 表示汉字"一"）。
   - 范围：`U+0000` 到 `U+10FFFF`（共约 111万 个码位）。

#### 2. 平面（Plane）
   - Unicode将码点空间划分为 17个平面，每个平面包含 65,536（`0x0000`–`0xFFFF`）个码点。
   - 基本多文种平面（BMP, Plane 0）：`U+0000`–`U+FFFF`，涵盖绝大多数常用字符（如拉丁字母、汉字基础部分）。
   - 补充平面（Supplementary Planes, Plane 1–16）：`U+10000`–`U+10FFFF`，包含较少使用的字符（如古汉字、emoji）。

### 二、汉字在 Unicode 中的分布
#### 1. 基本汉字（BMP内）
   - 基本区：`U+4E00`–`U+9FFF`  
     - 包含 20,971 个常用汉字（如"中" `U+4E2D`）。
   - 扩展A区：`U+3400`–`U+4DBF`  
     - 包含 6,582 个汉字（如"𠀀" `U+3400`）。
   - 扩展B–G区：分布在补充平面中（见下文）。

#### 2. 扩展汉字（补充平面）
   - 扩展B区：`U+20000`–`U+2A6DF`（Plane 2）  
     - 包含 42,711 个汉字（如"𠮷" `U+20BB7`）。
   - 扩展C–H区：如 `U+2A700`–`U+2B81F`（Plane 2-3）  
     - 涵盖古汉字、方言字等（如"𪜎" `U+2A70E`）。

### 三、UTF-16 编码与补充平面字符
#### 1. UTF-16 编码规则
   - BMP字符（U+0000–U+FFFF）：直接用一个16位单元（`char`）表示。
   - 补充平面字符（U+10000–U+10FFFF）：使用 代理对（Surrogate Pair） 编码：
     1. 高位代理（High Surrogate）：`0xD800`–`0xDBFF`（前导代理）。
     2. 低位代理（Low Surrogate）：`0xDC00`–`0xDFFF`（后随代理）。
   - 计算方式：  
     ```plaintext
     码点 = 0x10000 + ((高位代理 - 0xD800) << 10) + (低位代理 - 0xDC00)
     ```

#### 2. 示例：汉字"𠮷"（U+20BB7）
   - 码点计算：
     1. 码点 `0x20BB7` 减去 `0x10000` → `0x10BB7`。
     2. 高位代理 = `0xD800 + (0x10BB7 >> 10)` → `0xD842`。
     3. 低位代理 = `0xDC00 + (0x10BB7 & 0x3FF)` → `0xDFB7`。
   - UTF-16编码：`0xD842 0xDFB7`（Java中用两个`char`表示）。

### 四、处理补充平面字符的实践
#### 1. Java中的关键方法
   - 获取码点：`codePointAt(int index)`  
     - 自动处理代理对，返回完整码点。
   - 判断字符类型：  
     - `Character.isHighSurrogate(char)`  
     - `Character.isLowSurrogate(char)`
   - 码点转字符数：`Character.charCount(int codePoint)`  
     - 返回 `1`（BMP）或 `2`（补充平面）。

#### 2. 代码示例：遍历字符串中的完整字符
```java
public static void printCodePoints(String s) {
    int length = s.length();
    for (int i = 0; i < length; ) {
        int codePoint = s.codePointAt(i);
        int charCount = Character.charCount(codePoint);
        System.out.printf("字符: %s → 码点: U+%04X%n", 
            s.substring(i, i + charCount), codePoint);
        i += charCount;
    }
}

// 输入： "A𠮷B"
// 输出：
// 字符: A → 码点: U+0041
// 字符: 𠮷 → 码点: U+20BB7
// 字符: B → 码点: U+0042
```

# 解决方案

## chars 拆分

知道了问题所在，剩下的主要问题就是修正。

我们将以前粗暴的 toCharArray 修正一下，兼容特殊的异体字。

修正后的方法如下：

```java
    public static List<String> toCharList(String input) {
        if(StringUtil.isEmpty(input)) {
            return Collections.emptyList();
        }

        List<String> characters = new ArrayList<>();
        int length = input.length();
        for (int i = 0; i < length; ) {
            char high = input.charAt(i);
            if (Character.isHighSurrogate(high) && i + 1 < length) {
                char low = input.charAt(i + 1);
                if (Character.isLowSurrogate(low)) {
                    characters.add(new String(new char[]{high, low}));
                    i += 2;
                    continue;
                }
            }
            characters.add(Character.toString(high));
            i += 1;
        }
        return characters;
    }
```

然后就是各种调整，将 char 全部改为 string 匹配处理。

## 中文的判断

以前对于中文的字符判断，格局也是小了。

```java
    /**
     * 是否为中文
     * @param ch 中文
     * @return 是否
     * @since 0.1.76
     */
    public static boolean isChinese(final char ch) {
        return ch >= 0x4E00 && ch <= 0x9FA5;
    }
```

这个是不够的，也要调整一下

```java
    /**
     * 兼容异体字
     * @param s 字符
     * @return 结果
     */
    public static boolean isChineseForSingle(final String s) {
        if (s == null || s.isEmpty() || s.length() > 2) {
            return false; // 非空且长度不超过2
        }

        // 获取字符串的码点（支持代理对）
        int codePoint = s.codePointAt(0);

        // 检查字符串长度是否与码点所需字符数匹配
        if (s.length() != Character.charCount(codePoint)) {
            return false; // 非法代理对或长度不匹配
        }

        // 扩展中文判断范围（按需调整）
        return (codePoint >= 0x4E00 && codePoint <= 0x9FFF) ||   // 基本汉字
                (codePoint >= 0x3400 && codePoint <= 0x4DBF) ||   // 扩展A
                (codePoint >= 0x20000 && codePoint <= 0x2A6DF);    // 扩展B（示例）
    }
```

如此，经过一番调整以后，终于算是兼容了多字符的场景。

# 测试验证

V1.9.1 版本支持这种特性，测试例子如下

```java
String originText = "\uD862\uDD9F";
Assert.assertEquals(true, ZhConverterUtil.isChinese(originText));
// 此处兼容缺失的映射，返回本身
String text = "\uD86A\uDC43还有\uD862\uDD9F";
Assert.assertEquals("\uD86A\uDC43还有\uD862\uDD9F", ZhConverterUtil.toSimple(text));
Assert.assertEquals("\uD86A\uDC43還有\uD862\uDD9F", ZhConverterUtil.toTraditional(text));
```

# 小结

还是要保持空杯的心态，不要想当然。

就连我们日常使用的汉字，随手的转字符数组，可能都会存在问题。

我是老马，期待与你的下次重逢。

## 拓展阅读

[pinyin 汉字转拼音](https://github.com/houbb/pinyin)

[pinyin2hanzi 拼音转汉字](https://github.com/houbb/pinyin2hanzi)

[segment 高性能中文分词](https://github.com/houbb/segment)

[opencc4j 中文繁简体转换](https://github.com/houbb/opencc4j)

[nlp-hanzi-similar 汉字相似度](https://github.com/houbb/nlp-hanzi-similar)

[word-checker 拼写检测](https://github.com/houbb/word-checker)

[sensitive-word 敏感词](https://github.com/houbb/sensitive-word)


* any list
{:toc}