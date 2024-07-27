---
layout: post
title:  Spring.NET-03-validation
date:  2017-04-09 22:22:22 +0800
categories: [Spring]
tags: [spring, dotnet]
header-img: "static/app/res/img/article-bg.jpeg"
published: false
---


# Validation Framework

在开始 Spring.NET 的验证之前。

可以看一下微软自带的验证[缺陷](http://www.peterblum.com/DES/CompareFrameworks.aspx)。


在我们看来，验证不仅适用于表示层，因此没有理由将其与任何特定技术绑定。因此，Spring.NET 验证框架的设计方式使得可以在不同的应用程序层中使用相同的验证规则进行数据验证。

验证框架的目标如下：

- 允许验证任何对象，无论是 UI 控件还是领域对象。

- 允许在 Windows Forms 和 ASP.NET 应用程序中使用相同的验证框架，以及在服务层中使用（例如，验证传递给服务的参数）。

- 允许组合验证规则，以构建任意复杂的验证规则集。

- 允许验证器是有条件的，因此它们仅在满足特定条件时执行。

* any list
{:toc}