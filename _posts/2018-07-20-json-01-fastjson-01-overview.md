---
layout: post
title:  Json 之 FastJson
date:  2018-07-20 09:24:03 +0800
categories: [Java]
tags: [java, json, config, sf]
published: true
---

# FastJson

[Fastjson](https://github.com/alibaba/fastjson) 是一个Java库，可用于将Java对象转换为其JSON表示。它还可以用于将JSON字符串转换为等效的Java对象。Fastjson可以使用任意Java对象，包括您没有源代码的预先存在的对象。

## 多余的属性 json 转为对象

- User.java

```java
public class User {
    private String name;
    // getter and setter
}
```

- User.json

```json
{"name":"ryo", "age": 12}
```

直接可以转换成功 

```java
User user = JSON.parseObject(json, User.class);
```

## json 转换为 List<Map>

有时候需要将 json 转换为 list:

```java
List<Map<String, String>> listMapList = JSON.parseObject(json, new TypeReference<List<Map<String,String>>>(){});
```

# 序列化为什么这么快

## 自行编写类似StringBuilder的工具类SerializeWriter。 

把java对象序列化成json文本，是不可能使用字符串直接拼接的，因为这样性能很差。

比字符串拼接更好的办法是使用java.lang.StringBuilder。

StringBuilder虽然速度很好了，但还能够进一步提升性能的，fastjson中提供了一个类似StringBuilder的com.alibaba.fastjson.serializer.SerializeWriter。 
SerializeWriter提供一些针对性的方法减少数组越界检查。

例如 `public void writeIntAndChar(int i, char c) {}`，这样的方法一次性把两个值写到buf中去，能够减少一次越界检查。

目前SerializeWriter还有一些关键的方法能够减少越界检查的，我还没实现。

也就是说，如果实现了，能够进一步提升serialize的性能。 

## 使用 ThreadLocal 来缓存buf

这个办法能够减少对象分配和gc，从而提升性能。

SerializeWriter中包含了一个char[] buf，每序列化一次，都要做一次分配，使用ThreadLocal优化，能够提升性能。 

## 使用asm避免反射 

获取java bean的属性值，需要调用反射，fastjson引入了asm的来避免反射导致的开销。

fastjson内置的asm是基于objectweb asm 3.3.1改造的，只保留必要的部分，fastjson asm部分不到1000行代码，引入了asm的同时不导致大小变大太多。 

## 使用一个特殊的IdentityHashMap优化性能。 

fastjson对每种类型使用一种serializer，于是就存在class -> JavaBeanSerizlier的映射。

fastjson使用IdentityHashMap而不是HashMap，避免equals操作。

我们知道HashMap的算法的transfer操作，并发时可能导致死循环，但是ConcurrentHashMap比HashMap系列会慢，因为其使用volatile和lock。

fastjson自己实现了一个特别的IdentityHashMap，去掉transfer操作的IdentityHashMap，能够在并发时工作，但是不会导致死循环。 

## 缺省启用sort field输出 

json的object是一种key/value结构，正常的hashmap是无序的，fastjson缺省是排序输出的，这是为deserialize优化做准备。 

## 集成jdk实现的一些优化算法 

在优化fastjson的过程中，参考了jdk内部实现的算法，比如int to char[]算法等等。 

# deserializer的主要优化算法 

deserializer也称为parser或者decoder，fastjson在这方面投入的优化精力最多。 

## 读取token基于预测。 

所有的parser基本上都需要做词法处理，json也不例外。

fastjson词法处理的时候，使用了基于预测的优化算法。

比如key之后，最大的可能是冒号":"，value之后，可能是有两个，逗号","或者右括号"}"。

在com.alibaba.fastjson.parser.JSONScanner中提供了这样的方法： 

```java
public void nextToken(int expect) {  
    for (;;) {  
        switch (expect) {  
            case JSONToken.COMMA: //   
                if (ch == ',') {  
                    token = JSONToken.COMMA;  
                    ch = buf[++bp];  
                    return;  
                }  
  
                if (ch == '}') {  
                    token = JSONToken.RBRACE;  
                    ch = buf[++bp];  
                    return;  
                }  
  
                if (ch == ']') {  
                    token = JSONToken.RBRACKET;  
                    ch = buf[++bp];  
                    return;  
                }  
  
                if (ch == EOI) {  
                    token = JSONToken.EOF;  
                    return;  
                }  
                break;  
        // ... ...  
    }  
}  
```

从上面摘抄下来的代码看，基于预测能够做更少的处理就能够读取到token。 

## sort field fast match算法 

fastjson的serialize是按照key的顺序进行的，于是fastjson做deserializer时候，采用一种优化算法，就是假设key/value的内容是有序的，读取的时候只需要做key的匹配，而不需要把key从输入中读取出来。

通过这个优化，使得fastjson在处理json文本的时候，少读取超过50%的token，这个是一个十分关键的优化算法。

基于这个算法，使用asm实现，性能提升十分明显，超过300％的性能提升。 

- 例子

```
{ "id" : 123, "name" : "魏加流", "salary" : 56789.79}  
  ------      --------          ----------    
```

在上面例子看，虚线标注的三个部分是key，如果key_id、key_name、key_salary这三个key是顺序的，就可以做优化处理，这三个key不需要被读取出来，只需要比较就可以了。 

这种算法分两种模式，一种是快速模式，一种是常规模式。

快速模式是假定key是顺序的，能快速处理，如果发现不能够快速处理，则退回常规模式。

保证性能的同时，不会影响功能。 

在这个例子中，常规模式需要处理13个token，快速模式只需要处理6个token。 

实现sort field fast match算法的代码在这个类[com.alibaba.fastjson.parser.deserializer.ASMDeserializerFactory|http://code.alibabatech.com/svn/fastjson/trunk/fastjson/src/main/java/com/alibaba/fastjson/parser/deserializer/ASMDeserializerFactory.java]，是使用asm针对每种类型的VO动态创建一个类实现的。 

这里是有一个用于演示sort field fast match算法的代码： 

http://code.alibabatech.com/svn/fastjson/trunk/fastjson/src/test/java/data/media/ImageDeserializer.java 

```java
// 用于快速匹配的每个字段的前缀  
char[] size_   = "\"size\":".toCharArray();  
char[] uri_    = "\"uri\":".toCharArray();  
char[] titile_ = "\"title\":".toCharArray();  
char[] width_  = "\"width\":".toCharArray();  
char[] height_ = "\"height\":".toCharArray();  
  
// 保存parse开始时的lexer状态信息  
int mark = lexer.getBufferPosition();  
char mark_ch = lexer.getCurrent();  
int mark_token = lexer.token();  
  
int height = lexer.scanFieldInt(height_);  
if (lexer.matchStat == JSONScanner.NOT_MATCH) {  
    // 退出快速模式, 进入常规模式  
    lexer.reset(mark, mark_ch, mark_token);  
    return (T) super.deserialze(parser, clazz);  
}  
  
String value = lexer.scanFieldString(size_);  
if (lexer.matchStat == JSONScanner.NOT_MATCH) {  
    // 退出快速模式, 进入常规模式  
    lexer.reset(mark, mark_ch, mark_token);  
    return (T) super.deserialze(parser, clazz);  
}  
Size size = Size.valueOf(value);  
  
// ... ...  
  
// batch set  
Image image = new Image();  
image.setSize(size);  
image.setUri(uri);  
image.setTitle(title);  
image.setWidth(width);  
image.setHeight(height);  
  
return (T) image;  
```

## 使用asm避免反射 

deserialize的时候，会使用asm来构造对象，并且做batch set，也就是说合并连续调用多个setter方法，而不是分散调用，这个能够提升性能。 

## 对utf-8的json bytes，针对性使用优化的版本来转换编码。 

这个类是com.alibaba.fastjson.util.UTF8Decoder，来源于JDK中的UTF8Decoder，但是它使用ThreadLocal Cache Buffer，避免转换时分配char[]的开销。 

ThreadLocal Cache的实现是这个类com.alibaba.fastjson.util.ThreadLocalCache。

第一次1k，如果不够，会增长，最多增长到128k。 

```java
//代码摘抄自com.alibaba.fastjson.JSON  
public static final <T> T parseObject(byte[] input, int off, int len, CharsetDecoder charsetDecoder, Type clazz,  
                                      Feature... features) {  
    charsetDecoder.reset();  
  
    int scaleLength = (int) (len * (double) charsetDecoder.maxCharsPerByte());  
    char[] chars = ThreadLocalCache.getChars(scaleLength); // 使用ThreadLocalCache，避免频繁分配内存  
  
    ByteBuffer byteBuf = ByteBuffer.wrap(input, off, len);  
    CharBuffer charByte = CharBuffer.wrap(chars);  
    IOUtils.decode(charsetDecoder, byteBuf, charByte);  
  
    int position = charByte.position();  
  
    return (T) parseObject(chars, position, clazz, features);  
}  
```

## symbolTable算法。 

我们看xml或者javac的parser实现，经常会看到有一个这样的东西symbol table，它就是把一些经常使用的关键字缓存起来，在遍历char[]的时候，同时把hash计算好，通过这个hash值在hashtable中来获取缓存好的symbol，避免创建新的字符串对象。

这种优化在fastjson里面用在key的读取，以及enum value的读取。

这是也是parse性能优化的关键算法之一。

以下是摘抄自JSONScanner类中的代码，这段代码用于读取类型为enum的value。 

```java
int hash = 0;  
for (;;) {  
    ch = buf[index++];  
    if (ch == '\"') {  
        bp = index;  
        this.ch = ch = buf[bp];  
        strVal = symbolTable.addSymbol(buf, start, index - start - 1, hash); // 通过symbolTable来获得缓存好的symbol，包括fieldName、enumValue  
        break;  
    }  
      
    hash = 31 * hash + ch; // 在token scan的过程中计算好hash  
  
    // ... ...  
}  
```


# 拓展阅读

[ASM](https://asm.ow2.io/asm4-guide.pdf)

* any list
{:toc}