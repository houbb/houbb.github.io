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

在开始 Spring.NET 的验证之前。可以看一下微软自带的验证[缺陷](http://www.peterblum.com/DES/CompareFrameworks.aspx)。


In our opinion, validation is not applicable only to the presentation layer so there is no reason to tie it to any particular technology. 
As such, the Spring.NET Validation Framework is designed in a way that enables data validation in different application layers using the same validation rules.

The goals of the validation framework are the following:

- Allow for the validation of any object, whether it is a UI control or a domain object.

- Allow the same validation framework to be used in both Windows Forms and ASP.NET applications, as well as in the service layer (to validate parameters passed to the service, for example).

- Allow composition of the validation rules so arbitrarily complex validation rule sets can be constructed.

- Allow validators to be conditional so they only execute if a specific condition is met.






