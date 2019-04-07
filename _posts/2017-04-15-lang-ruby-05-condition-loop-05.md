---
layout: post
title:  Ruby-05-condition, loop
date:  2017-04-15 00:18:43 +0800
categories: [Lang]
tags: [ruby, lang]
header-img: "static/app/res/img/article-bg.jpeg"
published: true
---



## if..else


```ruby
if conditional [then]
      code...
[elsif conditional [then]
      code...]...
[else
      code...]
end
```

通常我们省略保留字 then 。若想在一行内写出完整的 if 式，则必须以 then 隔开条件式和程式区块。如下所示:

```ruby
if a == 4 then a = 7 end
```

or

```ruby
#!/usr/bin/ruby
# -*- coding: UTF-8 -*-
 
x=1
if x > 2
   puts "x 大于 2"
elsif x <= 2 and x != 0
   puts "x 是 1"
else
   puts "无法得知 x 的值"
end
```


# if 修饰符

if修饰词组表示当 if 右边之条件成立时才执行 if 左边的式子。即如果 conditional 为真，则执行 code。

```
code if condition
```

eg

```ruby
#!/usr/bin/ruby
 
$debug=1
print "debug\n" if $debug
```

# unless 语句

unless式和 if式作用相反，即如果 conditional 为假，则执行 code。如果 conditional 为真，则执行 else 子句中指定的 code。

```
unless conditional [then]
   code
else
   code
end
```


eg

```ruby
#!/usr/bin/ruby
# -*- coding: UTF-8 -*-
 
x=1
unless x>2
   puts "x 小于 2"
 else
  puts "x 大于 2"
end
```

# unless 修饰符

```ruby
code unless conditional
```

如果 conditional 为假，则执行 code。

eg:

```ruby
#!/usr/bin/ruby
# -*- coding: UTF-8 -*-
 
$var =  1
print "1 -- 这一行输出\n" if $var
print "2 -- 这一行不输出\n" unless $var
 
$var = false
print "3 -- 这一行输出\n" unless $var
```

# case 语句

(这个有些类似switch case, 但是条件判断更强大一些)

```ruby
case expression
[when expression [, expression ...] [then]
   code ]
[else
   code ]
end
```

case先对一个 expression 进行匹配判断，然后根据匹配结果进行分支选择。

它使用 `===` 运算符比较 when 指定的 expression，若一致的话就执行 when 部分的内容。


- 一行


通常我们省略保留字 then 。若想在一行内写出完整的 when 式，则必须以 then 隔开条件式和程式区块。如下所示:

```ruby
when a == 4 then a = 7 end
```

- 多行

```ruby
case expr0
when expr1, expr2
   stmt1
when expr3, expr4
   stmt2
else
   stmt3
end
```

is the same as:

```ruby
_tmp = expr0
if expr1 === _tmp || expr2 === _tmp
   stmt1
elsif expr3 === _tmp || expr4 === _tmp
   stmt2
else
   stmt3
end
```


实例

```ruby
#!/usr/bin/ruby
# -*- coding: UTF-8 -*-
 
$age =  5
case $age
when 0 .. 2
    puts "婴儿"
when 3 .. 6
    puts "小孩"
when 7 .. 12
    puts "child"
when 13 .. 18
    puts "少年"
else
    puts "其他年龄段的"
end
```

result

```
$ ruby case.ruby 
小孩
```

当 case 的"表达式"部分被省略时，将计算第一个when条件部分为真的表达式。

```ruby
#!/usr/bin/ruby

foo = false
bar = true
quu = false
 
case
when foo then puts 'foo is true'
when bar then puts 'bar is true'
when quu then puts 'quu is true'
end
```

result is

```
bar is true
```


# while 语句

```ruby
while conditional [do]
   code
end
```

or
 
```
while conditional [:]
   code
end
```

当 conditional 为真时，执行 code。

语法中 `do` 或 `:` 可以省略不写。但若要在一行内写出 while 式，则必须以 do 或 : 隔开条件式或程式区块。

```ruby
#!/usr/bin/ruby
# -*- coding: UTF-8 -*-
 
$i = 0
$num = 5
 
while $i < $num  do
   puts("在循环语句中 i = #$i" )
   $i +=1
end
```

# while 修饰符

```ruby
code while condition
```

or 

```ruby
begin 
  code 
end while conditional
```

当 conditional 为真时，执行 code。
如果 while 修饰符跟在一个没有 rescue 或 ensure 子句的 begin 语句后面，code 会在 conditional 判断之前执行一次。(有些类似do{}while())

```ruby
#!/usr/bin/ruby
# -*- coding: UTF-8 -*-
 
$i = 0
$num = 5
begin
   puts("在循环语句中 i = #$i" )
   $i +=1
end while $i < $num
```

# until 语句

```ruby
until conditional [do]
   code
end
```

当 conditional 为假时，执行 code。

语法中 do 可以省略不写。但若要在一行内写出 until 式，则必须以 do 隔开条件式或程式区块。

```ruby
#!/usr/bin/ruby
# -*- coding: UTF-8 -*-
 
$i = 0
$num = 5
 
until $i > $num  do
   puts("在循环语句中 i = #$i" )
   $i +=1;
end
```

# until 修饰符

```ruby
code until conditional
```
or
 
```ruby
begin
   code
end until conditional
```

当 conditional 为 false 时，执行 code。

如果 until 修饰符跟在一个没有 rescue 或 ensure 子句的 begin 语句后面，code 会在 conditional 判断之前执行一次。

```ruby
#!/usr/bin/ruby
# -*- coding: UTF-8 -*-
 
$i = 0
$num = 5
begin
   puts("在循环语句中 i = #$i" )
   $i +=1;
end until $i > $num
```

TBC...


















