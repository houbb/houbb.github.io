---
layout: post
title:  Ruby-04-var, operator
date:  2017-04-15 00:18:43 +0800
categories: [Lang]
tags: [ruby, lang]
header-img: "static/app/res/img/article-bg.jpeg"
published: true
---


# 变量

Ruby 支持五种类型的变量。

- 一般小写字母、下划线开头：变量（Variable）。

- $开头：全局变量（Global variable）。

- @开头：实例变量（Instance variable）。

- @@开头：类变量（Class variable）类变量被共享在整个继承链中

- 大写字母开头：常数（Constant）。


# 全局变量

全局变量以 `$` 开头。未初始化的全局变量的值为 **nil**，在使用 -w 选项后，会产生警告。

给全局变量赋值会改变全局状态，所以不建议使用全局变量。

```ruby
#!/usr/bin/ruby
# -*- coding: UTF-8 -*-
 
$global_variable = 10
class Class1
  def print_global
      puts "全局变量在 Class1 中输出为 #$global_variable"
  end
end
class Class2
  def print_global
      puts "全局变量在 Class2 中输出为 #$global_variable"
  end
end
 
class1obj = Class1.new
class1obj.print_global
class2obj = Class2.new
class2obj.print_global
```

输出

```
全局变量在 Class1 中输出为 10
全局变量在 Class2 中输出为 10
```

> 注意

在 Ruby 中，您可以通过在变量或常量前面放置 `#` 字符，来访问任何变量或常量的值。


# 实例变量

实例变量以 `@` 开头。未初始化的实例变量的值为 nil。

```ruby
#!/usr/bin/ruby
 
class Customer
   def initialize(id, name, addr)
      @cust_id=id
      @cust_name=name
      @cust_addr=addr
   end
   def display_details()
      puts "Customer id #@cust_id"
      puts "Customer name #@cust_name"
      puts "Customer address #@cust_addr"
    end
end
 
# 创建对象
cust1=Customer.new("1", "John", "Wisdom Apartments, Ludhiya")
cust2=Customer.new("2", "Poul", "New Empire road, Khandala")
 
# 调用方法
cust1.display_details()
cust2.display_details()
```

# 类变量

类变量以 `@@` 开头，且必须初始化后才能在方法定义中使用。
引用一个未初始化的类变量会产生错误。类变量在定义它的类或模块的子类或子模块中可共享使用。

```ruby
#!/usr/bin/ruby
 
class Customer
   @@no_of_customers=0
   def initialize(id, name, addr)
      @cust_id=id
      @cust_name=name
      @cust_addr=addr
   end
   def display_details()
      puts "Customer id #@cust_id"
      puts "Customer name #@cust_name"
      puts "Customer address #@cust_addr"
    end
    def total_no_of_customers()
       @@no_of_customers += 1
       puts "Total number of customers: #@@no_of_customers"
    end
end
 
# 创建对象
cust1=Customer.new("1", "John", "Wisdom Apartments, Ludhiya")
cust2=Customer.new("2", "Poul", "New Empire road, Khandala")
 
# 调用方法
cust1.total_no_of_customers()
cust2.total_no_of_customers()
```

# 局部变量

局部变量以小写字母或下划线 `_` 开头。局部变量的作用域从 class、module、def 或 do 到相对应的结尾或者从左大括号到右大括号 {}。

当调用一个未初始化的局部变量时，它被解释为调用一个不带参数的方法。

对未初始化的局部变量赋值也可以当作是变量声明。变量会一直存在，直到当前域结束为止。局部变量的生命周期在 Ruby 解析程序时确定。

在上面的实例中，局部变量是 id、name 和 addr。


# 常量

常量以大写字母开头。定义在类或模块内的常量可以从类或模块的内部访问，定义在类或模块外的常量可以被全局访问。

常量不能定义在方法内。引用一个未初始化的常量会产生错误。对已经初始化的常量赋值会产生警告。

```ruby
#!/usr/bin/ruby
# -*- coding: UTF-8 -*-
 
class Example
   VAR1 = 100
   VAR2 = 200
   def show
       puts "第一个常量的值为 #{VAR1}"
       puts "第二个常量的值为 #{VAR2}"
   end
end
 
# 创建对象
object=Example.new()
object.show
```

# 伪变量

它们是特殊的变量，有着局部变量的外观，但行为却像常量。您不能给这些变量赋任何值。

| Var | Desc |
|:----|:----|
| self | 当前方法的接收器对象 |
| true | 代表 true 的值 |
| false | 代表 false 的值 |
| nil | 代表 undefined 的值 |
| nil | 代表 undefined 的值 |
| `__FILE__` | 当前源文件的名称 |
| `__LINE__` | 当前行在源文件中的编号 |




# 算术运算符

这一方面，很多语言都是类似的。

假设变量 a 的值为 10，变量 b 的值为 20，那么：

| 运算符	| 描述	| 实例 |
|:----|:----|:----|
| +	    | 加法 - 把运算符两边的操作数相加	        | a + b 将得到 30 |
| -	    | 减法 - 把左操作数减去右操作数	            | a - b 将得到 -10  |
| *	    | 乘法 - 把运算符两边的操作数相乘	        | a * b 将得到 200 |
| /	    | 除法 - 把左操作数除以右操作数	            |     b / a 将得到 2 |
| %	    | 求模 - 把左操作数除以右操作数，返回余数	    | b % a 将得到 0 |
| **	| 指数 - 执行指数计算	                    | a**b 将得到 10 的 20 次方 |


赋值运算符和这个是一一对应的。


# 比较运算符

假设变量 a 的值为 10，变量 b 的值为 20，那么：

| 运算符	| 描述	| 实例 |
|:----|:----|:----|
| ==	    | 检查两个操作数的值是否相等，如果相等则条件为真。	            | (a == b) 不为真。|
| !=	    | 检查两个操作数的值是否相等，如果不相等则条件为真。	        | (a != b) 为真。|
| >	        | 检查左操作数的值是否大于右操作数的值，如果是则条件为真。	    | (a > b) 不为真。|
| <	        | 检查左操作数的值是否小于右操作数的值，如果是则条件为真。	    | (a < b) 为真。|
| >=	    | 检查左操作数的值是否大于或等于右操作数的值，如果是则条件为真。	| (a >= b) 不为真。|
| <=	    | 检查左操作数的值是否小于或等于右操作数的值，如果是则条件为真。	| (a <= b) 为真。|
| <=>	    | 联合比较运算符。如果第一个操作数等于第二个操作数则返回 0，如果第一个操作数大于第二个操作数则返回 1，如果第一个操作数小于第二个操作数则返回 -1。	| (a <=> b) 返回 -1。|
| ===	    | 用于测试 case 语句的 when 子句内的相等。	                   | (1...10) === 5 返回 true。|
| .eql?	    | 如果接收器和参数具有相同的类型和相等的值，则返回 true。	       | 1 == 1.0 返回 true，但是 1.eql?(1.0) 返回 false。|
| equal?	| 如果接收器和参数具有相同的对象 id，则返回 true。	           | 如果 aObj 是 bObj 的副本，那么 aObj == bObj 返回 true，a.equal?bObj 返回 false，但是 a.equal?aObj 返回 true。|



# 并行赋值

Ruby 也支持变量的并行赋值。这使得多个变量可以通过一行的 Ruby 代码进行初始化。

```ruby
a = 10
b = 20
c = 30
```

并行赋值如下：

```ruby
a, b, c = 10, 20, 30
```

并行赋值在交换两个变量的值时也很有用:

```ruby
a, b = b, c
```

# 范围运算符

在 Ruby 中，序列范围用于创建一系列连续的值 - 包含起始值、结束值（视情况而定）和它们之间的值。

在 Ruby 中，这些序列是使用 `..` 和 `...` 范围运算符来创建的。两点形式创建的范围包含起始值和结束值，三点形式创建的范围只包含起始值不包含结束值。



# defined? 运算符

defined? 是一个特殊的运算符，以方法调用的形式来判断传递的表达式是否已定义。它返回表达式的描述字符串，如果表达式未定义则返回 nil。

一、One

```ruby
defined? variable # 如果 variable 已经初始化，则为 True
```

二、Two

```ruby
defined? method_call # 如果方法已经定义，则为 True
```

三、Three

```ruby
# 如果存在可被 super 用户调用的方法，则为 True
defined? super
```

四、Four

```ruby
defined? yield   # 如果已传递代码块，则为 True
```

# 点运算符和双冒号运算符

您可以通过在方法名称前加上模块名称和一条下划线来调用模块方法。您可以使用模块名称和两个冒号来引用一个常量。

`::` 是一元运算符，允许在类或模块内定义常量、实例方法和类方法，可以从类或模块外的任何地方进行访问。

请记住：在 Ruby 中，类和方法也可以被当作常量。

您只需要在表达式的常量名前加上 `::` 前缀，即可返回适当的类或模块对象。

如果未使用前缀表达式，则默认使用主 Object 类。


- One

```ruby
MR_COUNT = 0        # 定义在主 Object 类上的常量
module Foo
  MR_COUNT = 0
  ::MR_COUNT = 1    # 设置全局计数为 1
  MR_COUNT = 2      # 设置局部计数为 2
end
puts MR_COUNT       # 这是全局常量
puts Foo::MR_COUNT  # 这是 "Foo" 的局部常量
```

- Two

```ruby
CONST = ' out there'
class Inside_one
   CONST = proc {' in there'}
   def where_is_my_CONST
      ::CONST + ' inside one'
   end
end
class Inside_two
   CONST = ' inside two'
   def where_is_my_CONST
      CONST
   end
end
puts Inside_one.new.where_is_my_CONST
puts Inside_two.new.where_is_my_CONST
puts Object::CONST + Inside_two::CONST
puts Inside_two::CONST + CONST
puts Inside_one::CONST
puts Inside_one::CONST.call + Inside_two::CONST
```













* any list
{:toc}
