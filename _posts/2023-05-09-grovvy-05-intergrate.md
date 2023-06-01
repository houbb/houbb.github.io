---
layout: post
title: grovvy-05-Integrating Groovy into applications 整合到应用
date:  2023-05-09 +0800
categories: [Lang]
tags: [grovvy, lang, sh]
published: true
---

# 1. Groovy集成机制

Groovy语言提供了多种在运行时将其整合到应用程序（Java甚至Groovy）中的方式，从最基本的简单代码执行到最完整的集成，包括缓存和编译器定制。

本节中的所有示例都使用Groovy编写，但是相同的集成机制也可以从Java中使用。

## 1.1. Eval

groovy.util.Eval类是在运行时动态执行Groovy的最简单方式。

可以通过调用eval方法来实现：

```groovy
import groovy.util.Eval

assert Eval.me('33*3') == 99
assert Eval.me('"foo".toUpperCase()') == 'FOO'
```

也支持多个参数：

```groovy
assert Eval.x(4, '2*x') == 8                
assert Eval.me('k', 4, '2*k') == 8          
assert Eval.xy(4, 5, 'x*y') == 20           
assert Eval.xyz(4, 5, 6, 'x*y+z') == 26    
```

Eval类非常适用于评估简单的脚本，但是它不具备扩展性：脚本没有缓存，并且不适合评估多行的脚本。

## 1.2. GroovyShell

### 1.2.1. 多个源文件

groovy.lang.GroovyShell类是评估脚本的首选方式，它具备缓存生成的脚本实例的能力。

尽管Eval类返回编译脚本执行的结果，但是GroovyShell类提供了更多选项。

```groovy
def shell = new GroovyShell()                           
def result = shell.evaluate '3*5'                       
def result2 = shell.evaluate(new StringReader('3*5'))   
assert result == result2
def script = shell.parse '3*5'                          
assert script instanceof groovy.lang.Script
assert script.run() == 15                
```

### 1.2.2. 在脚本和应用程序之间共享数据

可以使用 groovy.lang.Binding 在应用程序和脚本之间共享数据：

```groovy
def sharedData = new Binding()                          
def shell = new GroovyShell(sharedData)                 
def now = new Date()
sharedData.setProperty('text', 'I am shared data!')     
sharedData.setProperty('date', now)                     

String result = shell.evaluate('"At $date, $text"')     

assert result == "At $now, I am shared data!"
```

请注意，也可以从脚本中向绑定对象中写入数据：

```groovy
def sharedData = new Binding()                          
def shell = new GroovyShell(sharedData)                 

shell.evaluate('foo=123')                               

assert sharedData.getProperty('foo') == 123   
```

重要的是要理解，如果要向绑定对象中写入数据，您需要使用未声明的变量。

如果使用def或像下面的示例中的显式类型，将会失败，因为这样会创建一个局部变量：

```groovy
def sharedData = new Binding()
def shell = new GroovyShell(sharedData)

shell.evaluate('int foo=123')

try {
    assert sharedData.getProperty('foo')
} catch (MissingPropertyException e) {
    println "foo is defined as a local variable"
}
```

在多线程环境中使用共享数据时必须非常小心。传递给GroovyShell的Binding实例不是线程安全的，并且由所有脚本共享。

可以通过利用由parse方法返回的Script实例来解决Binding实例的共享问题：

```groovy
def shell = new GroovyShell()

def b1 = new Binding(x:3)                       
def b2 = new Binding(x:4)                       
def script = shell.parse('x = 2*x')
script.binding = b1
script.run()
script.binding = b2
script.run()
assert b1.getProperty('x') == 6
assert b2.getProperty('x') == 8
assert b1 != b2
```

然而，你必须意识到你仍然共享同一个脚本实例。因此，如果有两个线程同时处理同一个脚本，这种技术就不能使用。

在这种情况下，你必须确保创建两个不同的脚本实例：

```groovy
def shell = new GroovyShell()

def b1 = new Binding(x:3)
def b2 = new Binding(x:4)
def script1 = shell.parse('x = 2*x')            
def script2 = shell.parse('x = 2*x')            
assert script1 != script2
script1.binding = b1                            
script2.binding = b2                            
def t1 = Thread.start { script1.run() }         
def t2 = Thread.start { script2.run() }         
[t1,t2]*.join()                                 
assert b1.getProperty('x') == 6
assert b2.getProperty('x') == 8
assert b1 != b2
```

## 1.2.3. Custom script class

我们已经看到`parse`方法返回`groovy.lang.Script`的实例，但是可以使用自定义的类，只要它扩展了`Script`类本身。

它可以用于为脚本提供额外的行为，如下面的示例所示：

```groovy
abstract class MyScript extends Script {
    String name

    String greet() {
        "Hello, $name!"
    }
}
```

这个自定义类定义了一个名为`name`的属性和一个名为`greet`的新方法。

通过使用自定义配置，可以将这个类作为脚本的基类使用：

```groovy
import org.codehaus.groovy.control.CompilerConfiguration

def config = new CompilerConfiguration()                                    
config.scriptBaseClass = 'MyScript'                                         

def shell = new GroovyShell(this.class.classLoader, new Binding(), config)  
def script = shell.parse('greet()')                                         
assert script instanceof MyScript
script.setName('Michel')
assert script.run() == 'Hello, Michel!'
```

# 1.3. GroovyClassLoader - 动态加载和编译类

在前面的部分中，我们展示了 GroovyShell 是一个执行脚本的简单工具，但是它使得除了脚本以外的编译变得复杂。

在内部，它使用了groovy.lang.GroovyClassLoader，在运行时进行类的编译和加载。

通过利用GroovyClassLoader而不是GroovyShell，您将能够加载类，而不是脚本的实例:

```groovy
import groovy.lang.GroovyClassLoader

def gcl = new GroovyClassLoader()                                           
def clazz = gcl.parseClass('class Foo { void doIt() { println "ok" } }')    
assert clazz.name == 'Foo'                                                  
def o = clazz.newInstance()                                                 
o.doIt()  
```


一个GroovyClassLoader会保留它创建的所有类的引用，因此很容易造成内存泄漏。

特别是，如果执行相同的脚本两次，如果脚本是一个字符串，那么将获得两个不同的类！

```groovy
import groovy.lang.GroovyClassLoader

def gcl = new GroovyClassLoader()
def clazz1 = gcl.parseClass('class Foo { }')                                
def clazz2 = gcl.parseClass('class Foo { }')                                
assert clazz1.name == 'Foo'                                                 
assert clazz2.name == 'Foo'
assert clazz1 != clazz2 
```

这是因为GroovyClassLoader不跟踪源文本。如果要获得相同的实例，源必须是一个文件，就像这个例子中的方式一样：

```groovy
def gcl = new GroovyClassLoader()
def clazz1 = gcl.parseClass(file)                                           
def clazz2 = gcl.parseClass(new File(file.absolutePath))                    
assert clazz1.name == 'Foo'                                                 
assert clazz2.name == 'Foo'
assert clazz1 == clazz2 
```

使用文件作为输入，GroovyClassLoader能够缓存生成的类文件，这样就避免了在相同源码上运行时创建多个类。

# 1.4. GroovyScriptEngine

groovy.util.GroovyScriptEngine类为依赖于脚本重载和脚本依赖项的应用程序提供了一个灵活的基础。

虽然GroovyShell专注于独立的脚本和GroovyClassLoader处理任何Groovy类的动态编译和加载，但GroovyScriptEngine会在GroovyClassLoader之上添加一层，用于处理脚本依赖和重载。

为了说明这一点，我们将创建一个脚本引擎并在一个无限循环中执行代码。首先，您需要创建一个包含以下脚本的目录：

ReloadingTest.groovy

```groovy
class Greeter {
    String sayHello() {
        def greet = "Hello, world!"
        greet
    }
}

new Greeter()
```

接下来可以使用脚本引擎执行：

```groovy
def binding = new Binding()
def engine = new GroovyScriptEngine([tmpDir.toURI().toURL()] as URL[])          

while (true) {
    def greeter = engine.run('ReloadingTest.groovy', binding)                   
    println greeter.sayHello()                                                  
    Thread.sleep(1000)
}
```

接下来没秒都会打印:

```
Hello, world!
Hello, world!
...
```

如果不打断执行，把脚本内容修改为:

- ReloadingTest.groovy

```groovy
class Greeter {
    String sayHello() {
        def greet = "Hello, Groovy!"
        greet
    }
}

new Greeter()
```

那么打印内容会变成：

```
Hello, world!
...
Hello, Groovy!
Hello, Groovy!
...
```

但也可以在另一个脚本上建立依赖关系。

为了说明这一点，在同一个目录中创建以下文件，而不中断正在执行的脚本：

- Dependency.groovy

```groovy
class Dependency {
    String message = 'Hello, dependency 1'
}
```

更新测试脚本内容：

- ReloadingTest.groovy

```groovy
import Dependency

class Greeter {
    String sayHello() {
        def greet = new Dependency().message
        greet
    }
}

new Greeter()
```

则脚本输出会变成：

```
Hello, Groovy!
...
Hello, dependency 1!
Hello, dependency 1!
...
```

作为最后的测试，您可以更新Dependency.groovy文件，而无需触碰ReloadingTest文件：

- Dependency.groovy

```groovy
class Dependency {
    String message = 'Hello, dependency 2'
}
```

您应该观察到依赖文件已重新加载：

```
Hello, dependency 1!
...
Hello, dependency 2!
Hello, dependency 2!
```

# 1.5. CompilationUnit

最终，您可以通过直接依赖于org.codehaus.groovy.control.CompilationUnit类来执行更多的编译操作。

该类负责确定编译的各个步骤，并允许您引入新的步骤或在各个阶段停止编译。这就是联合编译器生成存根的方式。

然而，不推荐覆盖CompilationUnit，并且只有在没有其他标准解决方案可行时才应该这样做。

# 2. JSR 223 javax.script API

JSR-223是一个用于在Java中调用脚本框架的标准API。它自Java 6起可用，并旨在为从Java调用多种语言提供一个通用框架。

Groovy提供了自己更丰富的集成机制，如果您不打算在同一个应用程序中使用多种语言，则建议使用Groovy集成机制，而不是有限的JSR-223 API。

以下是如何初始化JSR-223引擎以与Java交互的示例：

```java
import javax.script.ScriptEngine;
import javax.script.ScriptEngineManager;
import javax.script.ScriptException;
...
ScriptEngineManager factory = new ScriptEngineManager();
ScriptEngine engine = factory.getEngineByName("groovy");
```

你可以更加简单的执行脚本：

```java
Integer sum = (Integer) engine.eval("(1..10).sum()");
assertEquals(Integer.valueOf(55), sum);
```

可以分享变量：

```java
engine.put("first", "HELLO");
engine.put("second", "world");
String result = (String) engine.eval("first.toLowerCase() + ' ' + second.toUpperCase()");
assertEquals("hello WORLD", result);
```

下面的示例说明了如何调用可调用函数：

```java
import javax.script.Invocable;
...
ScriptEngineManager factory = new ScriptEngineManager();
ScriptEngine engine = factory.getEngineByName("groovy");
String fact = "def factorial(n) { n == 1 ? 1 : n * factorial(n - 1) }";
engine.eval(fact);
Invocable inv = (Invocable) engine;
Object[] params = {5};
Object result = inv.invokeFunction("factorial", params);
assertEquals(Integer.valueOf(120), result);
```

默认情况下，引擎对脚本函数保持硬引用。

要更改这一点，您应该将引擎级作用域属性设置为脚本上下文的名称 #jsr223.groovy.engine.keep.globals，并将其设置为字符串 phantom（虚引用）以使用虚引用，weak（弱引用）以使用弱引用，或 soft（软引用）以使用软引用 - 大小写不敏感。任何其他字符串将导致使用硬引用。

# 参考资料

chatGPT

https://groovy-lang.org/integrating.html

* any list
{:toc}