---
layout: post
title: Mybatis 特殊转移字符 大于小于等于 怎么写？
date:  2018-10-27 06:41:12 +0800
categories: [Mybatis]
tags: [mybatis, java, sf]
published: true
---

# 特殊符号

```
     &							&amp;		
     <							&lt;
	 >							&gt;
	 "							&quot;  //双引号
     '							&apos;  //单引号
   a<=b                 	a &lt;=b 或者 a <![CDATA[<= ]]>b 
   a>=b                 	a &gt;=b 或者 a <![CDATA[>= ]]>b
   a!=b						a <![CDATA[ <> ]]>b 或者 a <![CDATA[!= ]]>b
```

# 参考资料

[mybatis中大于,小于，大于等于，小于等于，转义写法](https://blog.csdn.net/weixin_42555133/article/details/90172797)

* any list
{:toc}