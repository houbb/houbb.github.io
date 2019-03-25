---
layout: post
title: java8-23-optional 优雅的避免 NPE
date:  2019-2-27 15:48:49 +0800
categories: [Java]
tags: [jdk8, java, sh]
published: true
---

# Optional

jdk8 引入了  Optional，用来避免 NPE。

# 用Optional取代null

如果你作为Java程序员曾经遭遇过NullPointerException，请举起手。如果这是你最常遭遇的异常，请继续举手。非常可惜，这个时刻，我们无法看到对方，但是我相信很多人的手这个时刻是举着的。

我们还猜想你可能也有这样的想法：“毫无疑问，我承认，对任何一位Java程序员来说，无论是初出茅庐的新人，还是久经江湖的专家，NullPointerException都是他心中的痛，可是我们又无能为力，因为这就是我们为了使用方便甚至不可避免的像null引用这样的构造所付出的代价。”这就是程序设计世界里大家都持有的观点，然而，这可能并非事实的全部真相，只是我们根深蒂固的一种偏见。

1965年，英国一位名为Tony Hoare的计算机科学家在设计ALGOL W语言时提出了null引用的想法。ALGOL W是第一批在堆上分配记录的类型语言之一。Hoare选择null引用这种方式，“只是因为这种方法实现起来非常容易”。虽然他的设计初衷就是要“通过编译器的自动检测机制，确保所有使用引用的地方都是绝对安全的”，他还是决定为null引用开个绿灯，因为他认为这是为“不存在的值”建模最容易的方式。很多年后，他开始为自己曾经做过这样的决定而后悔不迭，把它称为“我价值百万的重大失误”。我们已经看到它带来的后果——程序员对对象的字段进行检查，判断它的值是否为期望的格式，最终却发现我们查看的并不是一个对象，而是一个空指针，它会立即抛出一个让人厌烦的NullPointerException异常。

实际上，Hoare的这段话低估了过去五十年来数百万程序员为修复空引用所耗费的代价。近十年出现的大多数现代程序设计语言，包括Java，都采用了同样的设计方式，其原因是为了与更老的语言保持兼容，或者就像Hoare曾经陈述的那样，“仅仅是因为这样实现起来更加容易”。

让我们从一个简单的例子入手，看看使用null都有什么样的问题。

# 如何为缺失的值建模

假设你需要处理下面这样的嵌套对象，这是一个拥有汽车及汽车保险的客户。

```java
public class Person {
    private Car car;
    public Car getCar() { return car; }
}
public class Car {
    private Insurance insurance;
    public Insurance getInsurance() { return insurance; }
}
public class Insurance {
    private String name;
    public String getName() { return name; }
}
```

那么，下面这段代码存在怎样的问题呢？

```java
public String getCarInsuranceName(Person person) {
    return person.getCar().getInsurance().getName();
}
```

这段代码看起来相当正常，但是现实生活中很多人没有车。

所以调用getCar方法的结果会怎样呢？

在实践中，一种比较常见的做法是返回一个null引用，表示该值的缺失，即用户没有车。

而接下来，对getInsurance的调用会返回null引用的insurance，这会导致运行时出现一个NullPointerException，终止程序的运行。

但这还不是全部。如果返回的person值为null会怎样？

如果getInsurance的返回值也是null，结果又会怎样？

## 采用防御式检查减少NullPointerException

怎样做才能避免这种不期而至的NullPointerException呢？

通常，你可以在需要的地方添加null的检查（过于激进的防御式检查甚至会在不太需要的地方添加检测代码），并且添加的方式往往各有不同。下面这个例子是我们试图在方法中避免NullPointerException的第一次尝试。

```java
public String getCarInsuranceName(Person person) {
    if (person != null) {
        Car car = person.getCar();
        if (car != null) {
            Insurance insurance = car.getInsurance();
            if (insurance != null) {
                return insurance.getName();
            }
        }
    }
    return "Unknown";
}
```

这个方法每次引用一个变量都会做一次null检查，如果引用链上的任何一个遍历的解变量值为null，它就返回一个值为“Unknown”的字符串。唯一的例外是保险公司的名字，你不需要对它进行检查，原因很简单，因为任何一家公司必定有个名字。注意到了吗，由于你掌握业务领域的知识，避免了最后这个检查，但这并不会直接反映在你建模数据的Java类之中。

我们将上面的代码标记为“深层质疑”，原因是它不断重复着一种模式：每次你不确定一个变量是否为null时，都需要添加一个进一步嵌套的if块，也增加了代码缩进的层数。很明显，这种方式不具备扩展性，同时还牺牲了代码的可读性。面对这种窘境，你也许愿意尝试另一种方案。

下面的代码清单中，我们试图通过一种不同的方式避免这种问题。

```java
public String getCarInsuranceName(Person person) {
    if (person == null) {
        return "Unknown";
    }
    Car car = person.getCar();
    if (car == null) {
        return "Unknown";
    }
    Insurance insurance = car.getInsurance();
    if (insurance == null) {
        return "Unknown";
    }
    return insurance.getName();
}
```

第二种尝试中，你试图避免深层递归的if语句块，采用了一种不同的策略：每次你遭遇null变量，都返回一个字符串常量“Unknown”。

然而，这种方案远非理想，现在这个方法有了四个截然不同的退出点，使得代码的维护异常艰难。

更糟的是，发生null时返回的默认值，即字符串“Unknown”在三个不同的地方重复出现——出现拼写错误的概率不小！当然，你可能会说，我们可以用把它们抽取到一个常量中的方式避免这种问题。

进一步而言，这种流程是极易出错的；如果你忘记检查了那个可能为null的属性会怎样？

通过这一章的学习，你会了解使用null来表示变量值的缺失是大错特错的。

你需要更优雅的方式来对缺失的变量值建模。

## null 带来的种种问题

让我们一起回顾一下到目前为止进行的讨论，在Java程序开发中使用null会带来理论和实际操作上的种种问题。

它是错误之源。NullPointerException是目前Java程序开发中最典型的异常。

它会使你的代码膨胀。它让你的代码充斥着深度嵌套的null检查，代码的可读性糟糕透顶。

它自身是毫无意义的。null自身没有任何的语义，尤其是，它代表的是在静态类型语言中以一种错误的方式对缺失变量值的建模。

它破坏了Java的哲学。Java一直试图避免让程序员意识到指针的存在，唯一的例外是：null指针。

它在Java的类型系统上开了个口子。null并不属于任何类型，这意味着它可以被赋值给任意引用类型的变量。这会导致问题，原因是当这个变量被传递到系统中的另一个部分后，你将无法获知这个null变量最初的赋值到底是什么类型。

# Optional 类入门

为了更好的解决和避免NPE异常，Java 8中引入了一个新的类java.util.Optional。

这是一个封装Optional值的类。

举例来说，使用新的类意味着，如果你知道一个人可能有也可能没有车，那么Person类内部的car变量就不应该声明为Car，遭遇某人没有车时把null引用赋值给它，而是将其声明为Optional类型。

变量存在时，Optional类只是对类简单封装。变量不存在时，缺失的值会被建模成一个“空”的Optional对象，由方法Optional.empty()返回。Optional.empty()方法是一个静态工厂方法，它返回Optional类的特定单一实例。

## null & Optional.empty()

你可能还有疑惑，null引用和Optional.empty()有什么本质的区别吗？

从语义上，你可以把它们当作一回事儿，但是实际中它们之间的差别非常大： 如果你尝试解引用一个null ，一定会触发NullPointerException，不过使用Optional.empty()就完全没事儿，它是Optional类的一个有效对象，多种场景都能调用，非常有用。关于这一点，接下来的部分会详细介绍。

使用Optional而不是null的一个非常重要而又实际的语义区别是，第一个例子中，我们在声明变量时使用的是Optional类型，而不是Car类型，这句声明非常清楚地表明了这里发生变量缺失是允许的。与此相反，使用Car这样的类型，可能将变量赋值为null，这意味着你需要独立面对这些，你只能依赖你对业务模型的理解，判断一个null是否属于该变量的有效范畴。

牢记上面这些原则，你现在可以使用Optional类对最初的代码进行重构，结果如下。

```java
public class Person {
    private Optional<Car> car;

    public Optional<Car> getCar() {
        return car;
    }
}
public class Insurance {
    private String name;

    public String getName() {
        return name;
    }
}
public class Car {
    private Optional<Insurance> insurance;

    public Optional<Insurance> getInsurance() {
        return insurance;
    }
}
```

发现Optional是如何丰富你模型的语义了吧。代码中person引用的是Optional，而car引用的是Optional，这种方式非常清晰地表达了你的模型中一个person可能拥有也可能没有car的情形，同样，car可能进行了保险，也可能没有保险。

与此同时，我们看到insurance公司的名称被声明成String类型，而不是Optional，这非常清楚地表明声明为insurance公司的类型必须提供公司名称。

使用这种方式，一旦解引用insurance公司名称时发生NullPointerException，你就能非常确定地知道出错的原因，不再需要为其添加null的检查。

**因为null的检查只会掩盖问题，并未真正地修复问题。**

insurance公司必须有个名字，所以，如果你遇到一个公司没有名称，你需要调查你的数据出了什么问题，而不应该再添加一段代码，将这个问题隐藏。

在你的代码中始终如一地使用Optional，能非常清晰地界定出变量值的缺失是结构上的问题，还是你算法上的缺陷，抑或是你数据中的问题。

另外，我们还想特别强调，引入Optional类的意图并非要消除每一个null引用。

与此相反，它的目标是帮助你更好地设计出普适的API，让程序员看到方法签名，就能了解它是否接受一个Optional的值。这种强制会让你更积极地将变量从Optional中解包出来，直面缺失的变量值。

## C# 的语言设计

C# 中默认方法对象是禁止为 null 的，需要特殊指定。

通过显示指定让使用者保持警惕。

# Guava Optional 

如果你是 jdk8 以前，想使用这个功能。

可以借助 [Guava Optional](https://github.com/google/guava/wiki/UsingAndAvoidingNullExplained#optional)


# 应用 Optional 的几种模式

到目前为止，一切都很顺利；你已经知道了如何使用Optional类型来声明你的域模型，也了解了这种方式与直接使用null引用表示变量值的缺失的优劣。但是，我们该如何使用呢？用这种方式能做什么，或者怎样使用Optional封装的值呢？

## 创建Optional 对象

使用Optional之前，你首先需要学习的是如何创建Optional对象。完成这一任务有多种方法。

### 声明一个空的Optional

正如前文已经提到，你可以通过静态工厂方法Optional.empty()，创建一个空的Optional对象：

```java
Optional<Car> optCar = Optional.empty();
```

### 依据一个非空值创建Optional

你还可以使用静态工厂方法Optional.of()，依据一个非空值创建一个Optional对象：

```java
Optional<Car> optCar = Optional.of(car);
```

如果car是一个null，这段代码会立即抛出一个NullPointerException，而不是等到你试图访问car的属性值时才返回一个错误。

### 可接受null的Optional


最后，使用静态工厂方法Optional.ofNullable()，你可以创建一个允许null值的Optional对象：

```java
Optional<Car> optCar = Optional.ofNullable(car);
```

如果car是null，那么得到的Optional对象就是个空对象。

你可能已经猜到，我们还需要继续研究“如何获取Optional变量中的值”。

尤其是，Optional提供了一个get方法，它能非常精准地完成这项工作，我们在后面会详细介绍这部分内容。

不过get方法在遭遇到空的Optional对象时也会抛出异常，所以不按照约定的方式使用它，又会让我们再度陷入由null引起的代码维护的梦魇。

因此，我们首先从无需显式检查的Optional值的使用入手，这些方法与Stream中的某些操作极其相似。

## 使用 map 从Optional 对象中提取和转换值

从对象中提取信息是一种比较常见的模式。

比如，你可能想要从insurance公司对象中提取公司的名称。

提取名称之前，你需要检查insurance对象是否为null，代码如下所示：

```java
String name = null;
if(insurance != null){
    name = insurance.getName();
}
```

为了支持这种模式，Optional提供了一个map方法。它的工作方式如下:

```java
Optional<Insurance> optionalInsurance = Optional.ofNullable(insurance);
Optional<String> name = optionalInsurance.map(Insurance::getName);
```

从概念上，这与我们在第4章和第5章中看到的流的map方法相差无几。

map操作会将提供的函数应用于流的每个元素。你可以把Optional对象看成一种特殊的集合数据，它至多包含一个元素。如果Optional包含一个值，那函数就将该值作为参数传递给map，对该值进行转换。如果Optional为空，就什么也不做。

这看起来挺有用，但是你怎样才能应用起来，重构之前的代码呢？

前文的代码里用安全的方式链接了多个方法。

```java
public String getCarInsuranceName(Person person) {
    return person.getCar().getInsurance().getName();
}
```

为了达到这个目的，我们需要求助Optional提供的另一个方法flatMap。

## 使用flatMap 链接Optional 对象

由于我们刚刚学习了如何使用map，你的第一反应可能是我们可以利用map重写之前的代码，如下所示：

```java
Optional<Person> optPerson = Optional.of(person);
Optional<String> name = optPerson.map(Person::getCar)
                    .map(Car::getInsurance)
                    .map(Insurance::getName);
```

不幸的是，这段代码无法通过编译。

为什么呢？optPerson是Optional类型的变量，调用map方法应该没有问题。

但getCar返回的是一个Optional类型的对象，这意味着map操作的结果是一个Optional<Optional>类型的对象。因此，它对getInsurance的调用是非法的，因为最外层的optional对象包含了另一个optional对象的值，而它当然不会支持getInsurance方法。

所以，我们该如何解决这个问题呢？

让我们再回顾一下你刚刚在流上使用过的模式：flatMap方法。

使用流时，flatMap方法接受一个函数作为参数，这个函数的返回值是另一个流。这个方法会应用到流中的每一个元素，最终形成一个新的流的流。但是flagMap会用流的内容替换每个新生成的流。换句话说，由方法生成的各个流会被合并或者扁平化为一个单一的流。这里你希望的结果其实也是类似的，但是你想要的是将两层的optional合并为一个。

![flatMap 流程](https://user-gold-cdn.xitu.io/2018/11/3/166da43a8495b455?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

这个例子中，传递给流的flatMap方法会将每个正方形转换为另一个流中的两个三角形。

那么，map操作的结果就包含有三个新的流，每一个流包含两个三角形，但flatMap方法会将这种两层的流合并为一个包含六个三角形的单一流。

类似地，传递给optional的flatMap方法的函数会将原始包含正方形的optional对象转换为包含三角形的optional对象。

如果将该方法传递给map方法，结果会是一个Optional对象，而这个Optional对象中包含了三角形；但flatMap方法会将这种两层的Optional对象转换为包含三角形的单一Optional对象。

### 1. 使用Optional获取car的保险公司名称

相信现在你已经对Optional的map和flatMap方法有了一定的了解，让我们看看如何应用。

```java
public String getCarInsuranceName(Optional<Person> person) {
        return person.flatMap(Person::getCar)
                .flatMap(Car::getInsurance)
                .map(Insurance::getName)
                // 如果Optional的j结果为空值，设置默认值
                .orElse("Unknown");
}
```

我们可以看到，处理潜在可能缺失的值时，使用Optional具有明显的优势。这一次，你可以用非常容易却又普适的方法实现之前你期望的效果——不再需要使用那么多的条件分支，也不会增加代码的复杂性。

### 2. 使用Optional解引用串接的Person/Car/Insurance对象

由Optional对象，我们可以结合使用之前介绍的map和flatMap方法，从Person中解引用出Car，从Car中解引用出Insurance，从Insurance对象中解引用出包含insurance公司名称的字符串。

![解引用](https://user-gold-cdn.xitu.io/2018/11/3/166da43a84b6db47?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

这里，我们从以Optional封装的Person入手，对其调用flatMap(Person::getCar)。如前所述，这种调用逻辑上可以划分为两步。

第一步，某个Function作为参数，被传递给由Optional封装的Person对象，对其进行转换。这个场景中，Function的具体表现是一个方法引用，即对Person对象的getCar方法进行调用。由于该方法返回一个Optional类型的对象，Optional内的Person也被转换成了这种对象的实例，结果就是一个两层的Optional对象，最终它们会被flagMap操作合并。

从纯理论的角度而言，你可以将这种合并操作简单地看成把两个Optional对象结合在一起，如果其中有一个对象为空，就构成一个空的Optional对象。

如果你对一个空的Optional对象调用flatMap，实际情况又会如何呢？

结果不会发生任何改变，返回值也是个空的Optional对象。与此相反，如果Optional封装了一个Person对象，传递给flapMap的Function，就会应用到Person上对其进行处理。这个例子中，由于Function的返回值已经是一个Optional对象，flapMap方法就直接将其返回。

第二步与第一步大同小异，它会将Optional转换为Optional。第三步则会将Optional转化为Optional对象，由于Insurance.getName()方法的返回类型为String，这里就不再需要进行flapMap操作了。

截至目前为止，返回的Optional可能是两种情况：如果调用链上的任何一个方法返回一个空的Optional，那么结果就为空，否则返回的值就是你期望的保险公司的名称。

那么，你如何读出这个值呢？毕竟你最后得到的这个对象还是个Optional，它可能包含保险公司的名称，也可能为空。我们使用了一个名为orElse的方法，当Optional的值为空时，它会为其设定一个默认值。

除此之外，还有很多其他的方法可以为Optional设定默认值，或者解析出Optional代表的值。接下来我们会对此做进一步的探讨。

## 默认行为及解引用Optional 对象

我们决定采用orElse方法读取这个变量的值，使用这种方式你还可以定义一个默认值，遭遇空的Optional变量时，默认值会作为该方法的调用返回值。Optional类提供了多种方法读取Optional实例中的变量值。

### 提供的获取实例方法

get()是这些方法中最简单但又最不安全的方法。如果变量存在，它直接返回封装的变量值，否则就抛出一个NoSuchElementException异常。所以，除非你非常确定Optional变量一定包含值，否则使用这个方法是个相当糟糕的主意。此外，这种方式即便相对于嵌套式的null检查，也并未体现出多大的改进。

orElse(T other)是我们在代码使用的方法，正如之前提到的，它允许你在Optional对象不包含值时提供一个默认值。

orElseGet(Supplier<? extends T> other)是orElse方法的延迟调用版，Supplier方法只有在Optional对象不含值时才执行调用。如果创建默认值是件耗时费力的工作，你应该考虑采用这种方式（借此提升程序的性能），或者你需要非常确定某个方法仅在Optional为空时才进行调用，也可以考虑该方式（这种情况有严格的限制条件）。

orElseThrow(Supplier<? extends X> exceptionSupplier)和get方法非常类似，它们遭遇Optional对象为空时都会抛出一个异常，但是使用orElseThrow你可以定制希望抛出的异常类型。

ifPresent(Consumer<? super T>)让你能在变量值存在时执行一个作为参数传入的方法，否则就不进行任何操作。

Optional类和Stream接口的相似之处，远不止map和flatMap这两个方法。

还有第三个方法filter，它的行为在两种类型之间也极其相似。

## 两个Optional 对象的组合

现在，我们假设你有这样一个方法，它接受一个Person和一个Car对象，并以此为条件对外部提供的服务进行查询，通过一些复杂的业务逻辑，试图找到满足该组合的最便宜的保险公司：

```java
public Insurance findCheapestInsurance(Person person, Car car) {
    // 不同的保险公司提供的查询服务
    // 对比所有数据
    return cheapestCompany;
}
```

我们还假设你想要该方法的一个null-安全的版本，它接受两个Optional对象作为参数，返回值是一个Optional对象，如果传入的任何一个参数值为空，它的返回值亦为空。

Optional类还提供了一个isPresent方法，如果Optional对象包含值，该方法就返回true，所以你的第一想法可能是通过下面这种方式实现该方法：

```java
public Optional<Insurance> nullSafeFindCheapestInsurance(Optional<Person> person, Optional<Car> car) {
    if (person.isPresent() && car.isPresent()) {
        return Optional.of(findCheapestInsurance(person.get(), car.get()));
    } else {
        return Optional.empty();
    }
}
```

这个方法具有明显的优势，我们从它的签名就能非常清楚地知道无论是person还是car，它的值都有可能为空，出现这种情况时，方法的返回值也不会包含任何值。

不幸的是，该方法的具体实现和你之前曾经实现的null检查太相似了：方法接受一个Person和一个Car对象作为参数，而二者都有可能为null。

利用Optional类提供的特性，有没有更好或更地道的方式来实现这个方法呢?

Optional类和Stream接口的相似之处远不止map和flatMap这两个方法。

还有第三个方法filter，它的行为在两种类型之间也极其相似，我们在接下来的一节会进行介绍。

## 使用filter 剔除特定的值

你经常需要调用某个对象的方法，查看它的某些属性。

比如，你可能需要检查保险公司的名称是否为“Cambridge-Insurance”。为了以一种安全的方式进行这些操作，你首先需要确定引用指向的Insurance对象是否为null，之后再调用它的getName方法，如下所示：

```java
Insurance insurance = ...;
if(insurance != null && "CambridgeInsurance".equals(insurance.getName())){
    System.out.println("ok");
}
```

使用Optional对象的filter方法，这段代码可以重构如下：

```java
Optional<Insurance> optInsurance = ...;
optInsurance.filter(insurance -> "CambridgeInsurance".equals(insurance.getName()))
            .ifPresent(x -> System.out.println("ok"));
```

filter方法接受一个谓词作为参数。如果Optional对象的值存在，并且它符合谓词的条件，filter方法就返回其值；否则它就返回一个空的Optional对象。

如果你还记得我们**可以将Optional看成最多包含一个元素的Stream对象**，这个方法的行为就非常清晰了。

如果Optional对象为空，它不做任何操作，反之，它就对Optional对象中包含的值施加谓词操作。如果该操作的结果为true，它不做任何改变，直接返回该Optional对象，否则就将该值过滤掉，将Optional的值置空。

下一节中，我们会探讨Optional类剩下的一些特性，并提供更实际的例子，展示多种你能够应用于代码中更好地管理缺失值的技巧。

# 使用 Optional 实战

相信你已经了解，有效地使用Optional类意味着你需要对如何处理潜在缺失值进行全面的反思。

这种反思不仅仅限于你曾经写过的代码，更重要的可能是，你如何与原生Java API实现共存共赢。

实际上，我们相信如果Optional类能够在这些API创建之初就存在的话，很多API的设计编写可能会大有不同。

为了保持后向兼容性，我们很难对老的Java API进行改动，让它们也使用Optional，但这并不表示我们什么也做不了。

你可以在自己的代码中添加一些工具方法，修复或者绕过这些问题，让你的代码能享受Optional带来的威力。

我们会通过几个实际的例子讲解如何达到这样的目的。


## 用Optional 封装可能为null 的值

现存Java API几乎都是通过返回一个null的方式来表示需要值的缺失，或者由于某些原因计算无法得到该值。

比如，如果Map中不含指定的键对应的值，它的get方法会返回一个null。但是，正如我们之前介绍的，大多数情况下，你可能希望这些方法能返回一个Optional对象。你无法修改这些方法的签名，但是你很容易用Optional对这些方法的返回值进行封装。我们接着用Map做例子，假设你有一个Map<String, Object>方法，访问由key索引的值时，如果map中没有与key关联的值，该次调用就会返回一个null。

```java
Object value = map.get("key");
```

使用Optional封装map的返回值，你可以对这段代码进行优化。

要达到这个目的有两种方式：你可以使用笨拙的if-then-else判断语句，毫无疑问这种方式会增加代码的复杂度；

或者你可以采用我们前文介绍的Optional.ofNullable方法：

```java
Optional<Object> value = Optional.ofNullable(map.get("key"));
```

每次你希望安全地对潜在为null的对象进行转换，将其替换为Optional对象时，都可以考虑使用这种方法。

## 异常与Optional 的对比

由于某种原因，函数无法返回某个值，这时除了返回null，Java API比较常见的替代做法是抛出一个异常。

这种情况比较典型的例子是使用静态方法Integer.parseInt(String)，将String转换为int。

在这个例子中，如果String无法解析到对应的整型，该方法就抛出一个NumberFormatException。

最后的效果是，发生String无法转换为int时，代码发出一个遭遇非法参数的信号，唯一的不同是，这次你需要使用try/catch 语句，而不是使用if条件判断来控制一个变量的值是否非空。

你也可以用空的Optional对象，对遭遇无法转换的String时返回的非法值进行建模，这时你期望parseInt的返回值是一个optional。

我们无法修改最初的Java方法，但是这无碍我们进行需要的改进，你可以实现一个工具方法，将这部分逻辑封装于其中，最终返回一个我们希望的Optional对象，

代码如下所示。

```java
public static Optional<Integer> stringToInt(String s) {
    try {
        return Optional.of(Integer.parseInt(s));
    } catch (NumberFormatException e) {
        return Optional.empty();
    }
}
```

我们的建议是，你可以将多个类似的方法封装到一个工具类中，让我们称之为OptionalUtility。

通过这种OptionalUtility.stringToInt方法，将String转换为一个Optional对象，而不再需要记得你在其中封装了笨拙的try/catch的逻辑了。

# 个人收获

1. 原来对于 Optional 的理解，完全停留在避免 NPE 上。现在看来，其实特性非常的丰富。

2. 使用 Optional 替代原来可能为 null 的编程，可以提升代码的健壮性。

# 拓展阅读

[空对象模式](https://blog.csdn.net/ryo1060732496/article/details/80444904)

# 参考资料

《java8 实战》

* any list
{:toc}