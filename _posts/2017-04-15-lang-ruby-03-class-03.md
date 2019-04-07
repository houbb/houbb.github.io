---
layout: post
title:  Ruby-03-class
date:  2017-04-15 00:18:43 +0800
categories: [Lang]
tags: [ruby, lang]
header-img: "static/app/res/img/article-bg.jpeg"
published: true
---

# 类和对象

## Define a class

在 Ruby 中，类总是以关键字 `class` 开始，后跟类的名称。类名的首字母应该大写。

```ruby
class Customer
end
```

## Var in class

1. 局部变量

    局部变量是在方法中定义的变量。局部变量在方法外是不可用的。局部变量以小写字母或 `_` 开始
    
2. 实例变量

    实例变量可以跨任何特定的实例或对象中的方法使用。实例变量可以从对象到对象的改变。实例变量在变量名之前放置符号`@`
    
3. 类变量

    类变量可以跨不同的对象使用。类变量属于类，且是类的一个属性。类变量在变量名之前放置符号`@@`
    
4. 全局变量

    类变量不能跨类使用。如果您想要有一个可以跨类使用的变量，您需要定义全局变量。全局变量总是以美元符号`$`开始
    
    
## Create object use new

方法 new 是一种独特的方法，在 Ruby 库中预定义。new 方法属于类方法。

下面的实例创建了类 Customer 的两个对象 cust1 和 cust2：

```ruby
cust1 = Customer.new
cust2 = Customer.new
```

## Create object with define method

当您想要声明带参数的 new 方法时，您需要在创建类的同时声明方法 **initialize**。
initialize 方法是一种特殊类型的方法，将在调用带参数的类的 new 方法时执行。

(这个类似于构造器方法，只是个人觉得构造器方法名称还是和类名一致最方便。)

```ruby
class Customer
   @@no_of_customers=0
   
   def initialize(id, name, addr)
      @cust_id=id
      @cust_name=name
      @cust_addr=addr
   end
end
```

创建对象如下：

```ruby
cust1=Customer.new("1", "John", "Wisdom Apartments, Ludhiya")
cust2=Customer.new("2", "Poul", "New Empire road, Khandala")
```

## Member function of class

在 Ruby 中，函数被称为方法。类中的每个方法是以关键字 `def` 开始，后跟方法名。
方法名总是以小写字母开头。在 Ruby 中，您可以使用关键字 `end` 来结束一个方法。

```ruby
class Sample
   def function
      statement 1
      statement 2
   end
end
```

简单例子如下：

- hellofunc.rb 

```ruby
#!/usr/bin/ruby

class FunctionDemo
	def helloFunc
	   puts "hello function";
	end	
end

# create object 

object = FunctionDemo.new;
object.helloFunc;
```

测试结果

```
$ ruby hellofunc.rb 
hello function
```













* any list
{:toc}



 