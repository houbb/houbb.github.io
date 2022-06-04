---
layout: post
title:  如何实现短链服务 short url-02-短链的实现原理
date:  2022-06-02 09:22:02 +0800
categories: [Tool]
tags: [tool, sh]
published: true
---

# 什么是短链接

顾名思义，短链接即是长度较短的网址。

通过短链接技术，我们可以将长度较长的链接压缩成较短的链接。

并通过跳转的方式，将用户请求由短链接重定向到长链接上去。

短链接主要用在诸如微博，BBS等对帖子字数有限制的网站，通过使用短链接，用户可以把注意力放在帖子的内容上，而不是在担心链接超长的问题。这

里以百度的 dwz.cn 短链接服务为例，我们使用百度搜索"hello world"，链接为https://www.baidu.com/s?ie=utf-8&f=8&rsv_bp=0&rsv_idx=1&tn=baidu&wd=hello%20world&rsv_pq=8487bffe00068c60&rsv_t=a9e0f5b6haiMQwAi4N2y8PHDv37rM6sjjKrHJb6KdMGg2dQuUjAnmSEnXtE&rqlang=cn&rsv_enter=1&rsv_sug3=10&rsv_sug1=9&rsv_sug7=100，统计了一下，这条链接长度为230。

如此长的链接占据微博篇幅不说，也会影响微博的美观度。这个时候我们可以使用百度短链接服务压缩一下上面的长链接，压缩后的链接为：http://dwz.cn/5DDXhH。可以看到，压缩后的链接长度比原链接明显变短了。

## 想将生成短链接，我们需要注意两个问题：

1. 如何将任意长的字符串转化为较短长或者固定长的字符串．

2. 如何将短链接还原成之前的长链接，使之能够访问．

# 常见的短链接压缩算法

常见的短链接压缩算法有两种，

## Hash实现

通过一定方式将任意长的文本转化为一个固定长的字符串，只要目标文本长度适当，那么我们对于不同的输入通过哈希几乎(注意是几乎)不可能得到对应同一个字符串．通过对长链接进行Hash运算，将Hash值作为这个长链接的唯一标示．但是通过Hash实现可能会造成碰撞．不一样的长网址缩短成了同一个短网址，那也就做不到复原了．

对于碰撞问题，有一种缓冲方法就是在呈现碰撞了以后后边在增加随机字符，随机字符的增加能够缓解碰撞的疑问，但是这终究是一种缓冲的办法，没有彻底解决碰撞．

第一种是对 URL 进行hash运算，在得到的hash值上做进一步运算，得到一个较短的hash值。

## 自增

第二种是通过数据库自增ID或分布式key-value系统模拟发号器进行发号压缩URL。

两种方式各有优劣，hash运算简单易实现，但是有一定的冲突率。

随着 URL 压缩数量的增加，冲突数也会增加，最终导致一部分用户跳转到错误的地址上，影响用户体验。

而发号器发号压缩 URL 优缺点恰好和hash压缩算法相反，优点是不存在冲突问题。

缺点是，实现上稍复杂，要协调发号器取初始号。

我们可以设置一个自增id，对于每一个新的长链接给他一个不重复的id．

原理：当服务器接收到一个网址时首先检验这个网址在服务器中是否再存，如果不存在，存储这个新网址并分发一个id，这个id设置成自增，保证了每一个存储的网址的id都是唯一标示．比如上面的，当一个链接过来时，给这个链接发一个0，再有一个链接过来时，给后面这个链接一个1，以此类推．

数据实现：我们发现短链接后面的参数好像都是定长的，但是如果通过id进行时，参数不定长，且随着id的自增，可能会出现这种情况：url.cn/10000000．我们可以将十进制的id转化为多进制，比如在以'0-9a-z'这36个字符表示的36进制中，一亿可以被表示为1njchs，基本实现不重复够用．如果数据量更大，我们可以采用62进制进行转化：

### NODE JS 实现

```js
function EncodeStr(number) {

    if(!parseInt(number)){
        let codemsg = "请传入数字类型";
        return {
            success:false,
            msg:codemsg
        }
    }
    let randomInsertStr = 'a';
    var chars = '0123456789bcdefghigklmnopqrstuvwxyzABCDEFGHIGKLMNOPQRSTUVWXYZ'.split(''),
        radix = chars.length,
        qutient = +number,
        arr = [];
    do {
        mod = qutient % radix;
        qutient = (qutient - mod) / radix;
        arr.unshift(chars[mod]);
    } while (qutient);
    let  codeStr = arr.join('');
    codeStr = codeStr.length < 6 ?  (codeStr+randomInsertStr + randomWord(false,5-codeStr.length,0,[randomInsertStr])):codeStr;
    return codeStr;
}
let randomWord = (randomFlag, min, max,ruledOutStr)=>{
    var str = "",
        range = min,
        pos='',
        arr = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
    if(ruledOutStr){
        ruledOutStr.map(item=>{
            arr = arr.join("").split(item).join('').split('')
        })
    }

    // 随机产生
    if(randomFlag){
        range = Math.round(Math.random() * (max-min)) + min;
    }
    for(var i=0; i<range; i++){
        pos = Math.round(Math.random() * (arr.length-1));
        str += arr[pos];
    }
    return str;
};
```

### 存储实现：

对于小型系统，简单的mysql系统的表自增索引即可实现(注意自增id数据类型，int只能到65535)

大型系统可以搭建分布式key-value系统进行存储．

我使用mysql简单建了一张表，用于保存长网址的数据，只有两个字段，一个是主键用于保存id，一个url字段用于存放原始的长网址．

在进行长网址转换时，先检查数据表中是否存在该长网址，如果存在直接获取该记录的id，否在创建一条新的记录并返回该记录的id，对于这id进行进制转化处理后拼接到准备好的域名后面得到一个对应的短网址返回给用户．

## 摘要算法

将长网址 md5 生成 32 位签名串,分为 4 段, 每段 8 个字节

对这四段循环处理, 取 8 个字节, 将他看成 16 进制串与 0x3fffffff(30位1) 与操作, 即超过 30 位的忽略处理

这 30 位分成 6 段, 每 5 位的数字作为字母表的索引取得特定字符, 依次进行获得 6 位字符串

总的 md5 串可以获得 4 个 6 位串,取里面的任意一个就可作为这个长 url 的短 url 地址

这种算法虽然会生成四个短链接，但是存在重复几率．

# 几个细节问题

## Q：同一长链接，每次转成的短链接是否一样

A：同一长链接，每次转成的短链接不一定一样，原因在于如果查询缓存时，如果未命中，发号器会发新号给这个链接。

需要说明的是，缓存应该缓存经常转换的热门链接，假设设定缓存过期时间为一小时，如果某个链接很活跃的话，缓存查询命中后，缓存会刷新这个链接的存活时间，重新计时，这个链接就会长久存在缓存中。

对于一些生僻链接，从存入缓存开始，在存活时间内很可能不会被再次访问，存活时间结束缓存会删除记录。

下一次转换这个生僻链接，缓存不命中，发号器会重新发号。这样一来会导致一条长链接对应多条短链接的情况出现，不仅浪费存储空间，又浪费发号器资源。

那么是否有办法解决这个问题呢？是不是可以考虑建立一个长链接-短链接的key-value表，将所有的长链接和对应的短链接都存入其中，这样一来就实现了长短链接一一对应的了。

但是想法是美好的，现实是不行的，原因在于，将所有的长链接-短链接对存入这样的表中，本身就需要耗费大量的存储空间，相对于生僻链接可能会对应多条短链接浪费的那点空间，这样做显然就得不偿失了。

## 重定向的问题(301还是302)

短链接重定向的执行过程：

1. 用户访问短链接：https://dwz.cn/9WnR9Qcx

2. 短链接服务器dwz.cn收到请求，根据URL路径9WnR9Qcx获取到原始的长链接：http://www.lishanlei.cn/

3. 服务器返回状态码，将响应头中的Location设置为：http://www.lishanlei.cn/

4. 浏览器重新向http://www.lishanlei.cn/发送请求

5. 返回响应

```
Request URL: https://dwz.cn/9WnR9Qcx
Request Method: GET
Status Code: 302 Found
Remote Address: 220.181.164.108:443
Referrer Policy: no-referrer-when-downgrade
 
Access-Control-Allow-Credentials: true
Access-Control-Allow-Headers: Origin,Accept,Content-Type,X-Requested-With
Access-Control-Allow-Methods: POST,GET,PUT,PATCH,DELETE,HEAD
Access-Control-Allow-Origin: 
Content-Length: 47
Content-Type: text/html; charset=utf-8
Date: Wed, 03 Oct 2018 05:42:18 GMT
Location: http://www.lishanlei.cn/
```

那么服务器在返回状态码时应该选取301还是302呢？

301是永久重定向，而302是临时重定向．

如果选取301，短链接生成以后就不会变化，所以用301符合http语义，这样对服务器的压力会有所减少．但是这样一来，我们就无法统计短地址被点击的次数了．

而**选择302会增加服务器的压力，但是我们可以统计短链接被点击的次数，这些数据可能对于公司的发展规划非常重要．**

综上所述，我认为更好的应该选择302


# 安全问题

其是针对第三方授权应用，建议获取短链接重定向的完整URL地址后再安全浏览。

并安装安全防护软件，对可能存在的恶意网址、恶意钓鱼地址、恶意XSS跨站脚本攻击及网马攻击等行为进行有效拦截。

# 参考资料

https://blog.csdn.net/X5fnncxzq4/article/details/84332640

https://juejin.cn/post/6844903891675381768

https://blog.51cto.com/hackgy/946817

* any list
{:toc}