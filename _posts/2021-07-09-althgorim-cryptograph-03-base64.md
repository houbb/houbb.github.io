---
layout: post
title: Base64 加密算法详解
date:  2020-6-17 09:20:31 +0800
categories: [Algorithm]
tags: [algorithm, secret, sh]
published: true
---

## 场景

对于很多场景，比如说图片展示，还有一些前后端请求，有时候通过 url 会比较麻烦。

通过 Base64 转换处理之后比较方便，当然也有把这个当做一种加密策略的。（实际上只是转码，不是严格意义的加密）

Base64是一种能将任意Binary资料用64种字元组合成字串的方法，而这个Binary资料和字串资料彼此之间是可以互相转换的，十分方便。

在实际应用上，Base64除了能将Binary资料可视化之外，也常用来表示字串加密过后的内容。

## java 实现方式

### 早期作法

早期在Java上做Base64的编码与解码，会使用到JDK里sun.misc套件下的BASE64Encoder和BASE64Decoder这两个类别，用法如下：

```java
final BASE64Encoder encoder = new BASE64Encoder();
final BASE64Decoder decoder = new BASE64Decoder();
final String text = "字串文字";
final byte[] textByte = text.getBytes("UTF-8");
//编码
final String encodedText = encoder.encode(textByte);
System.out.println(encodedText);
//解码
System.out.println(new String(decoder.decodeBuffer(encodedText), "UTF-8"));

final BASE64Encoder encoder = new BASE64Encoder();
final BASE64Decoder decoder = new BASE64Decoder();
final String text = "字串文字";
final byte[] textByte = text.getBytes("UTF-8");
//编码
final String encodedText = encoder.encode(textByte);
System.out.println(encodedText);

//解码
System.out.println(new String(decoder.decodeBuffer(encodedText), "UTF-8"));
```

从以上程式可以发现，在Java用Base64一点都不难，不用几行程式码就解决了！

只是这个sun.misc套件所提供的Base64功能，**编码和解码的效率并不太好，而且在以后的Java版本可能就不被支援了，完全不建议使用。**

### Apache Commons Codec作法

Apache Commons Codec有提供Base64的编码与解码功能，会使用到org.apache.commons.codec.binary套件下的Base64类别，用法如下：

```java
final Base64 base64 = new Base64();
final String text = "字串文字";
final byte[] textByte = text.getBytes("UTF-8");
//编码
final String encodedText = base64.encodeToString(textByte);
System.out.println(encodedText);
//解码
System.out.println(new String(base64.decode(encodedText), "UTF-8"));

final Base64 base64 = new Base64();
final String text = "字串文字";
final byte[] textByte = text.getBytes("UTF-8");
//编码
final String encodedText = base64.encodeToString(textByte);
System.out.println(encodedText);
//解码
System.out.println(new String(base64.decode(encodedText), "UTF-8"));
```

以上的程式码看起来又比早期用sun.misc套件还要更精简，效能实际执行起来也快了不少。

缺点是需要引用Apache Commons Codec，很麻烦。

### Java 8之后的作法

Java 8的java.util套件中，新增了Base64的类别，可以用来处理Base64的编码与解码，用法如下：

```java
final Base64.Decoder decoder = Base64.getDecoder();
final Base64.Encoder encoder = Base64.getEncoder();
final String text = "字串文字";
final byte[] textByte = text.getBytes("UTF-8");
//编码
final String encodedText = encoder.encodeToString(textByte);
System.out.println(encodedText);
//解码
System.out.println(new String(decoder.decode(encodedText), "UTF-8"));

final Base64.Decoder decoder = Base64.getDecoder();
final Base64.Encoder encoder = Base64.getEncoder();
final String text = "字串文字";
final byte[] textByte = text.getBytes("UTF-8");
//编码
final String encodedText = encoder.encodeToString(textByte);
System.out.println(encodedText);
//解码
System.out.println(new String(decoder.decode(encodedText), "UTF-8"));
```

与 sun.misc 套件和Apache Commons Codec所提供的Base64编解码器来比较的话，Java 8提供的Base64拥有更好的效能。

实际测试编码与解码速度的话，**Java 8提供的Base64，要比sun.mis c套件提供的还要快至少11倍，比Apache Commons Codec提供的还要快至少3倍。**

因此在Java上若要使用Base64，这个Java 8底下的java.util套件所提供的Base64类别绝对是首选！

## 原理

完整的BASE64定义可见RFC 1421和RFC 2045。编码后的数据比原始数据略长，为原来的4/3。

在电子邮件中，根据RFC 822规定，每76个字符，还需要加上一个回车换行。可以估算编码后数据长度大约为原长的135.1%。

转换的时候，将三个byte的数据，先后放入一个24bit的缓冲区中，先来的byte占高位。数据不足3byte的话，于缓冲器中剩下的bit用0补足。然后，每次取出6（因为26=64）个bit，按照其值选择 `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/` 中的字符作为编码后的输出。不断进行，直到全部输入数据转换完成。

当原数据长度不是3的整数倍时, 如果最后剩下一个输入数据（原始数据按3个一组，剩下一个），在编码结果后加2个"="；如果最后剩下两个输入数据（原始数据按3个一组，剩下两个），编码结果后加1个"="；如果没有剩下任何数据，就什么都不要加，这样才可以保证数据还原的正确性。

### Base64 索引表

Base64索引表：

```
0	A	16	Q	32	g	48	w
1	B	17	R	33	h	49	x
2	C	18	S	34	i	50	y
3	D	19	T	35	j	51	z
4	E	20	U	36	k	52	0
5	F	21	V	37	l	53	1
6	G	22	W	38	m	54	2
7	H	23	X	39	n	55	3
8	I	24	Y	40	o	56	4
9	J	25	Z	41	p	57	5
10	K	26	a	42	q	58	6
11	L	27	b	43	r	59	7
12	M	28	c	44	s	60	8
13	N	29	d	45	t	61	9
14	O	30	e	46	u	62	+
15	P	31	f	47	v
```

### 不能整除的情况

如果要编码的字节数不能被3整除，最后会多出1个或2个字节，那么可以使用下面的方法进行处理：

先使用0字节值在末尾补足，使其能够被3整除，然后再进行Base64的编码。

在编码后的Base64文本后加上一个或两个'='号，代表补足的字节数。

也就是说，当最后剩余一个八位字节（一个byte）时，最后一个6位的Base64字节块有四位是0值，最后附加上两个等号；

如果最后剩余两个八位字节（2个byte）时，最后一个6位的base字节块有两位是0值，最后附加一个等号。 

参考下表：

```
文本（1 Byte）	A	 	 
二进制位	0	1	0	0	0	0	0 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 
二进制位（补0）	0	1	0	0	0	0	0	1	0	0	0	0	 	 	 	 	 	 	 	 	 	 	 	 
Base64编码	Q
文本（2 Byte）	B
二进制位	0	1	0	0	0	0	1	0	0	1	0	0	0	0	1	1	 	 	x	x	x	x	x	x
二进制位（补0）	0	1	0	0	0	0	1	0	0	1	0	0	0	0	1	1	0	0	x	x	x	x	x	x
Base64编码	Q	
```

## 一些拓展

标准的Base64并不适合直接放在URL里传输，因为URL编码器会把标准Base64中的"/"和"+"字符变为形如"%XX"的形式，而这些"%"号在存入数据库时还需要再进行转换，因为ANSI SQL中已将"%"号用作通配符。

为解决此问题，可采用一种用于URL的改进Base64编码，它不在末尾填充'='号，并将标 准Base64中的"+"和"/"分别改成了"*"和"-"，这样就免去了在URL编解码和数据库存储时所要作的转换，避免了编码信息长度在此过程中的增加，并统一了数据库、表单等处对象标识符的格式。

另有一种用于正则表达式的改进Base64变种，它将"+"和"/"改成了"!"和"-"，因为"+","*"以及前面在IRCu中用到的"["和"]"在正则表达式中都可能具有特殊含义。

此外还有一些变种，它们将"+/"改为"-"或"."（用作编程语言中的标识符名称）或".-"（用于XML中的Nmtoken）甚至"_:"（用于XML中的Name）。


## 实现

```java
public class Base64  
{  
  /** 
    * 将原始数据编码为base64编码 
    */  
    static public char[] encode(byte[] data)  
    {  
        char[] out = new char[((data.length + 2) / 3) * 4];  
  
        for (int i = 0, index = 0; i < data.length; i += 3, index += 4)  
        {  
                boolean quad = false;  
                boolean trip = false;  
                int val = (0xFF & (int) data[i]);  
                val <<= 8;  
                if ((i + 1) < data.length)  
                {  
                        val |= (0xFF & (int) data[i + 1]);  
                        trip = true;  
                }  
                val <<= 8;  
                if ((i + 2) < data.length)  
                {  
                        val |= (0xFF & (int) data[i + 2]);  
                        quad = true;  
                }  
                out[index + 3] = alphabet[(quad ? (val & 0x3F) : 64)];  
                val >>= 6;  
                out[index + 2] = alphabet[(trip ? (val & 0x3F) : 64)];  
                val >>= 6;  
                out[index + 1] = alphabet[val & 0x3F];  
                val >>= 6;  
                out[index + 0] = alphabet[val & 0x3F];  
        }  
        return out;  
    }  
    /** 
    * 将base64编码的数据解码成原始数据 
    */  
    static public byte[] decode(char[] data)  
    {  
      int len = ((data.length + 3) / 4) * 3;  
      if(data.length > 0 && data[data.length - 1] == '=')  
        --len;  
      if(data.length > 1 && data[data.length - 2] == '=')  
        --len;  
      byte[] out = new byte[len];  
      int shift = 0;  
      int accum = 0;  
      int index = 0;  
      for(int ix = 0; ix < data.length; ix++)  
      {  
        int value = codes[data[ix] & 0xFF];  
        if(value >= 0)  
        {  
          accum <<= 6;  
          shift += 6;  
          accum |= value;  
          if(shift >= 8)  
          {  
            shift -= 8;  
            out[index++] = (byte)((accum >> shift) & 0xff);  
          }  
        }  
      }  
      if(index != out.length)  
        throw new Error("miscalculated data length!");  
      return out;  
    }  
  
    static private char[] alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".toCharArray();  
  
    static private byte[] codes = new byte[256];  
    static {  
            for (int i = 0; i < 256; i++)  
                    codes[i] = -1;  
            for (int i = 'A'; i <= 'Z'; i++)  
                    codes[i] = (byte) (i - 'A');  
            for (int i = 'a'; i <= 'z'; i++)  
                    codes[i] = (byte) (26 + i - 'a');  
            for (int i = '0'; i <= '9'; i++)  
                    codes[i] = (byte) (52 + i - '0');  
            codes['+'] = 62;  
            codes['/'] = 63;  
    }  
}
```

## 参考资料

[关于base64编码Encode和Decode编码的几种方式](https://www.jb51.net/article/183139.htm)

[Base64 详解](https://www.jianshu.com/p/7c6ac9e044ab)

[BASE64 编码详解](https://zhuanlan.zhihu.com/p/27832862)

[Css中路径data:image/png;base64的用法详解](https://www.aimks.com/css-path-data-image-png-usage-base64.html)

* any list
{:toc}