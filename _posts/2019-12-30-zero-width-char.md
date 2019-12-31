---
layout: post
title: java 零宽字符
date:  2019-12-25 16:57:12 +0800
categories: [Spring]
tags: [spring mvc]
published: true
---

# 零宽字符

## 什么是零宽度字符？

零宽度字符是一些不可见的，不可打印的字符。它们存在于页面中主要用于调整字符的显示格式，下面就是一些常见的零宽度字符及它们的unicode码和原本用途：

零宽度空格符 (zero-width space) U+200B : 用于较长单词的换行分隔

零宽度非断空格符 (zero width no-break space) U+FEFF : 用于阻止特定位置的换行分隔

零宽度连字符 (zero-width joiner) U+200D : 用于阿拉伯文与印度语系等文字中，使不会发生连字的字符间产生连字效果

零宽度断字符 (zero-width non-joiner) U+200C : 用于阿拉伯文，德文，印度语系等文字中，阻止会发生连字的字符间的连字效果

左至右符 (left-to-right mark) U+200E : 用于在混合文字方向的多种语言文本中（例：混合左至右书写的英语与右至左书写的希伯来语），规定排版文字书写方向为左至右

右至左符 (right-to-left mark) U+200F : 用于在混合文字方向的多种语言文本中，规定排版文字书写方向为右至左

## 网站

[zero-width-web](https://yuanfux.github.io/zero-width-web/)

这个网站可以将自己不想给别人看到的数据转换成零宽字符隐藏到一段话里,感觉挺有意思的我就去网上找了下相关的内容，发现几乎都是js实现的(可能浏览器上效果更好）。

本人我是学习java的就想用java也实现一个这样的效果，然后翻阅读大量的相关信息明白了实现的原理，就着手写出。

原理是利用零宽字符这种在文本中不显示的特殊字符，对加密文本进行转码，嵌入到普通文本当中，从而隐藏加密内容；表面看起来是一段普通文本，复制粘贴不会丢失。

# 零宽度字符能做什么？

## 1. 传递隐密信息

利用零宽度字符不可见的特性，我们可以用零宽度字符在任何未对零宽度字符做过滤的网页内插入不可见的隐形文本。

下面是一个简单的利用零宽度字符对文本进行加密与解密的JavaScript例子：

```java
function encode (text) {

// Array.from 能让我们正确读取宽度为2的Unicode字符，例：?
  const textArray = Array.from(text);

// 用codePointAt读取所有字符的十进制Unicode码
// 用toString将十进制Unicode码转化成二进制（除了二进制，我们也可以使用更大的进制来缩短加密后的信息长度，以此提升效率）
  const binarify = textArray.map(c => c.codePointAt(0).toString(2));

// 此时binarify中的值是 ["110001", "110010", "110011", "11111011000000000"]，下一步我们需要将"1"，"0"和分隔符映射到响应的零宽度字符上去

// 我们用零宽度连字符来代表1，零宽度断字符来代表0，零宽度空格符来代表分隔符
// 下面的''看上去像是空字符串，但其实都是长度为1，包含零宽度字符的字符串
  return binarify.map(c => Array.from(c).map(b => b === '1' ? '?' : '?').join('')).join('?')
}
```

注：在使用零宽度字符进行加密时，请尽量避免将加密后的隐形文本插入在明文的开头或者结尾处，以此来避免隐形文本在复制时被遗漏

- 解密

```java
function decode (text) {
  const split = text.split('?');

// 将文本转回成二进制数组
  const binary = split.map(c => Array.from(c).map(z => z === '?' ? '1' : '0').join(''));

// 此时binary中的值再次回到开始的 ["110001", "110010", "110011", "11111011000000000"]

// 最后一部只需要将二进制文本转回十进制，再使用 String.fromCodePoint 就可以得到原文本了
  return binary.map(b => String.fromCodePoint(parseInt(b, 2))).join('');
}
```

## 应用

### 1、隐形水印

通过零宽度字符我们可以对内部文件添加隐形水印。

在浏览者登录页面对内部文件进行浏览时，我们可以在文件的各处插入使用零宽度字符加密的浏览者信息，如果浏览者又恰好使用复制粘贴的方式在公共媒体上匿名分享了这个文件，我们就能通过嵌入在文件中的隐形水印轻松找到分享者了。

### 2、加密信息分享

通过零宽度字符我们可以在任何网站上分享任何信息。

敏感信息的审核与过滤在当今的互联网社区中扮演着至关重要的角色，但是零宽度字符却能如入无人之境一般轻松地穿透这两层信息分享的屏障。

对比明文哈希表加密信息的方式，零宽度字符加密在网上的隐蔽性可以说是达到了一个新的高度。

仅仅需要一个简单的识别/解密零宽度字符的浏览器插件，任何网站都可以成为信息分享的游乐场。

### 3、逃脱敏感词

通过零宽度字符我们可以轻松逃脱敏感词过滤。

敏感词自动过滤是维持互联网社区秩序的一项重要工具，只需倒入敏感词库和匹配相应敏感词，即可将大量的非法词汇拒之门外。

使用谐音与拼音来逃脱敏感词过滤会让语言传递信息的效率降低，而使用零宽度字符可以在逃脱敏感词过滤的同时将词义原封不动地传达给接受者，大大提高信息传播者与接受者之间交流的效率。

```java
// 利用零宽度字符来分隔敏感词
const censored = '敏感词';

let censor = censored.replace(/敏感词/g, ''); // ''

// 使用零宽度空格符对字符串进行分隔
const uncensored  = Array.from(censored).join('?');

censor = uncensored.replace(/敏感词/g, ''); // '敏?感?词'
```

# 源码

## 优化

将该源码归集到 secret 中。

```java
 //中文转unicode编码
    public static String gbEncoding(final String gbString) {
        char[] utfBytes = gbString.toCharArray();
        String unicodeBytes = "";
        for (int i = 0; i < utfBytes.length; i++) {
            String hexB = Integer.toHexString(utfBytes[i]);
            if (hexB.length() <= 2) {
                hexB = "00" + hexB;
            }
            unicodeBytes = unicodeBytes + "\\u" + hexB;
        }
        return unicodeBytes;
    }
  //unicode编码转中文
    public static String decodeUnicode(final String dataStr) {
        int start = 0;
        int end = 0;
        final StringBuffer buffer = new StringBuffer();
        while (start > -1) {
            end = dataStr.indexOf("\\u", start + 2);
            String charStr = "";
            if (end == -1) {
                charStr = dataStr.substring(start + 2, dataStr.length());
            } else {
                charStr = dataStr.substring(start + 2, end);
            }
            char letter = (char) Integer.parseInt(charStr, 16); // 16进制parse整形字符串。
            buffer.append(new Character(letter).toString());
            start = end;
        }
        return buffer.toString();
    }
    //汉字转换成二进制字符串
    public static String strToBinStr(String str) {
        char[] chars=str.toCharArray();
        StringBuffer result = new StringBuffer();
        for(int i=0; i<chars.length; i++) {
            result.append(Integer.toBinaryString(chars[i]));
            result.append(" ");
        }
        return result.toString();
    }
    //二进制字符串转换成汉字
    public static String BinStrTostr(String binary) {
        String[] tempStr=binary.split(" ");
        char[] tempChar=new char[tempStr.length];
        for(int i=0;i<tempStr.length;i++) {
            tempChar[i]=BinstrToChar(tempStr[i]);
        }
        return String.valueOf(tempChar);
    }
    //将二进制字符串转换成int数组
    public static int[] BinstrToIntArray(String binStr) {
        char[] temp=binStr.toCharArray();
        int[] result=new int[temp.length];
        for(int i=0;i<temp.length;i++) {
            result[i]=temp[i]-48;
        }
        return result;
    }
    //将二进制转换成字符
    public static char BinstrToChar(String binStr){
        int[] temp=BinstrToIntArray(binStr);
        int sum=0;
        for(int i=0; i<temp.length;i++){
            sum +=temp[temp.length-1-i]<<i;
        }
        return (char)sum;
    }
    //零宽字加密
    public static String ZeroWidthWrdEncryption(String str){
        char[] chars=gbEncoding(str).toCharArray();
        StringBuffer result = new StringBuffer();
        StringBuffer jtext = new StringBuffer("\\uFEFF");
        for(int i=0; i<chars.length; i++) {
           if(Integer.toBinaryString(chars[i]).length()==7){
               result.append("0");
               result.append(Integer.toBinaryString(chars[i]));
           }else {
               result.append("00");
               result.append(Integer.toBinaryString(chars[i]));
           }
        }
        for(int i=0; i<result.toString().length(); i++) {
            if(i%2==0){
                switch(result.toString().substring(i,i+2)){
                    case "00" :
                        jtext.append("\\u200a");
                        break;
                    case "01" :
                        jtext.append("\\u200b");
                        break;
                    case "10" :
                        jtext.append("\\u200c");
                        break;
                    case "11" :
                        jtext.append("\\u200d");
                        break;
                }
            }
        }
        jtext.append("\\uFEFF");
        return decodeUnicode(jtext.toString());
    }
    //零宽字解密
    public static String ZeroWidthWordDecryption(String txt){
        String text = gbEncoding(txt);
        String str = text.substring(text.indexOf("\\ufeff")+6, text.lastIndexOf("\\ufeff"));
        str = str.replace("\\u200a","00");
        str = str.replace("\\u200b","01");
        str = str.replace("\\u200c","10");
        str = str.replace("\\u200d","11");
        char[] tempChar=new char[str.length()/8];
        for(int i=0;i<str.length();i++) {
            if(i%8==0){
                tempChar[i/8]=BinstrToChar(str.substring(i,i+8));
            }
        }
        return decodeUnicode(String.valueOf(tempChar));
    }

    public static void main(String[] args) {
        String cat = ZeroWidthWrdEncryption("猫");
        String zoo = "狗"+cat+"狗";
        System.out.println("加密后:"+zoo);
        System.out.println("解密出:"+ZeroWidthWordDecryption(zoo));
    }

```

控制台上看到加密后的信息中有空格，但复制出来发到QQ上就看不到空格了。

PC版QQ上看到的可能有乱码，安卓版上没什么问题，所以看来零宽字符在浏览器上比较友好。

经验证，上面的代码效果并不好。


# JS 源码

[https://github.com/umpox/zero-width-detection](https://github.com/umpox/zero-width-detection) 源码

## 转为零宽字符

```js
const zeroPad = num => '00000000'.slice(String(num).length) + num;

const textToBinary = username => (
  username.split('').map(char => zeroPad(char.charCodeAt(0).toString(2))).join(' ')
);

const binaryToZeroWidth = binary => (
  binary.split('').map((binaryNum) => {
    const num = parseInt(binaryNum, 10);
    if (num === 1) {
      return '​'; // invisible &#8203;
    } else if (num === 0) {
      return '‌'; // invisible &#8204;
    }
    return '‍'; // invisible &#8205;
  }).join('﻿') // invisible &#65279;
);

export default (username) => {
  const binaryUsername = textToBinary(username);
  const zeroWidthUsername = binaryToZeroWidth(binaryUsername);
  return zeroWidthUsername;
};
```

## 零宽字符转为 username

```java
const zeroWidthToBinary = string => (
  string.split('﻿').map((char) => { // invisible &#65279;
    if (char === '​') { // invisible &#8203;
      return '1';
    } else if (char === '‌') { // invisible &#8204;
      return '0';
    }
    return ' '; // split up binary with spaces;
  }).join('')
);

const binaryToText = string => (
  string.split(' ').map(num => String.fromCharCode(parseInt(num, 2))).join('')
);

export default (zeroWidthUsername) => {
  const binaryUsername = zeroWidthToBinary(zeroWidthUsername);
  const textUsername = binaryToText(binaryUsername);
  return textUsername;
};
```

# html 几种空格的区别

## 1、`&nbsp;`
 
它叫不换行空格，全称No-Break Space，它是最常见和我们使用最多的空格，大多数的人可能只接触了 `&nbsp;`，它是按下space键产生的空格。

在HTML中，如果你用空格键产生此空格，空格是不会累加的（只算1个）。

要使用html实体表示才可累加，该空格占据宽度受字体影响明显而强烈。
 
## 2、`&ensp;`        
 
它叫“半角空格”，全称是En Space，en是字体排印学的计量单位，为em宽度的一半。根据定义，它等同于字体度的一半（如16px字体中就是8px）。名义上是小写字母n的宽度。此空格传承空格家族一贯的特性：透明的，此空格有个相当稳健的特性，就是其占据的宽度正好是1/2个中文宽度，而且基本上不受字体影响。
 
## 3、`&emsp;`        
 
它叫“全角空格”，全称是Em Space，em是字体排印学的计量单位，相当于当前指定的点数。例如，1 em在16px的字体中就是16px。此空格也传承空格家族一贯的特性：透明的，此空格也有个相当稳健的特性，就是其占据的宽度正好是1个中文宽度，而且基本上不受字体影响。
 
## 4、`&thinsp;`        
 
它叫窄空格，全称是Thin Space。我们不妨称之为“瘦弱空格”，就是该空格长得比较瘦弱，身体单薄，占据的宽度比较小。它是em之六分之一宽。
 
## 5、`&zwnj;` 
 
它叫零宽不连字，全称是Zero Width Non Joiner，简称“ZWNJ”，是一个不打印字符，放在电子文本的两个字符之间，抑制本来会发生的连字，而是以这两个字符原本的字形来绘制。Unicode中的零宽不连字字符映射为“”（zero width non-joiner，U+200C），HTML字符值引用为： `&#8204;`
 
## 6、`&zwj;`
 
它叫零宽连字，全称是Zero Width Joiner，简称“ZWJ”，是一个不打印字符，放在某些需要复杂排版语言（如阿拉伯语、印地语）的两个字符之间，使得这两个本不会发生连字的字符产生了连字效果。

零宽连字符的Unicode码位是U+200D (HTML: `&#8205; &zwj;`）。


# 参考资料

[零宽空白&#8203;特殊字符问题](https://blog.csdn.net/qq_26346941/article/details/80945453)

[零宽字符加解密[JAVA]](https://www.lxbkw.com/186.html)

[用零宽度字符水印揭露泄密者身份](https://www.sohu.com/a/228893180_354899)

[使用零宽度字符进行追踪溯源](http://www.arkteam.net/?p=3558)

[零宽度字符：和谐？屏蔽？不存在的](https://www.leevii.com/2018/09/zero-width-character.html)

[html 几种空格的区别](https://blog.csdn.net/u014068781/article/details/77962423)

* any list
{:toc}