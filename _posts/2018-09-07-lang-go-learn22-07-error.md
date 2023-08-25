---
layout: post
title:  22讲通关go-07 错误处理：如何通过 error、deferred、panic 等处理错误？
date:  2018-09-07 09:51:23 +0800
categories: [Lang]
tags: [go, lang, learn, sh]
published: true
---


# 07 错误处理：如何通过 error、deferred、panic 等处理错误？

上节课我为你讲解了结构体和接口，并留了一个小作业，让你自己练习实现有两个方法的接口。现在我就以“人既会走也会跑”为例进行讲解。

首先定义一个接口 WalkRun，它有两个方法 Walk 和 Run，如下面的代码所示：

```go
type WalkRun interface {
   Walk()
   Run()
}
```

现在就可以让结构体 person 实现这个接口了，如下所示：

```
func (p *person) Walk(){
   fmt.Printf("%s能走\n",p.name)
}

func (p *person) Run(){
   fmt.Printf("%s能跑\n",p.name)
}
```

关键点在于，让接口的每个方法都实现，也就实现了这个接口。

提示：%s 是占位符，和 p.name 对应，也就是 p.name 的值，具体可以参考 fmt.Printf 函数的文档。

下面进行本节课的讲解。这节课我会带你学习 Go 语言的错误和异常，在我们编写程序的时候，可能会遇到一些问题，该怎么处理它们呢？


# 参考资料

http://learn.lianglianglee.com/%e4%b8%93%e6%a0%8f/22%20%e8%ae%b2%e9%80%9a%e5%85%b3%20Go%20%e8%af%ad%e8%a8%80-%e5%ae%8c/06%20%20struct%20%e5%92%8c%20interface%ef%bc%9a%e7%bb%93%e6%9e%84%e4%bd%93%e4%b8%8e%e6%8e%a5%e5%8f%a3%e9%83%bd%e5%ae%9e%e7%8e%b0%e4%ba%86%e5%93%aa%e4%ba%9b%e5%8a%9f%e8%83%bd%ef%bc%9f.md

* any list
{:toc}