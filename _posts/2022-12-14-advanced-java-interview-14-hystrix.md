---
layout: post 
title: java 知识进阶面试-14-HA hystrix
date: 2022-12-14 21:01:55 +0800
categories: [Java] 
tags: [java, interview, sh]
published: true
---

# Hystrix 是什么？

在分布式系统中，每个服务都可能会调用很多其他服务，被调用的那些服务就是依赖服务，有的时候某些依赖服务出现故障也是很正常的。

Hystrix 可以让我们在分布式系统中对服务间的调用进行控制，加入一些调用延迟或者依赖故障的容错机制。

Hystrix 通过将依赖服务进行资源隔离，进而阻止某个依赖服务出现故障时在整个系统所有的依赖服务调用中进行蔓延；同时 Hystrix 还提供故障时的 fallback 降级机制。

总而言之，Hystrix 通过这些方法帮助我们**提升分布式系统的可用性和稳定性**。

# Hystrix 的历史

Hystrix 是高可用性保障的一个框架。Netflix（可以认为是国外的优酷或者爱奇艺之类的视频网站）的 API 团队从 2011 年开始做一些提升系统可用性和稳定性的工作，Hystrix 就是从那时候开始发展出来的。

在 2012 年的时候，Hystrix 就变得比较成熟和稳定了，Netflix 中，除了 API 团队以外，很多其他的团队都开始使用 Hystrix。

时至今日，Netflix 中每天都有数十亿次的服务间调用，通过 Hystrix 框架在进行，而 Hystrix 也帮助 Netflix 网站提升了整体的可用性和稳定性。

2018 年 11 月，Hystrix 在其 Github 主页宣布，不再开放新功能，推荐开发者使用其他仍然活跃的开源项目。维护模式的转变绝不意味着 Hystrix 不再有价值。相反，Hystrix 激发了很多伟大的想法和项目，我们高可用的这一块知识还是会针对 Hystrix 进行讲解。

# Hystrix 的设计原则

对依赖服务调用时出现的调用延迟和调用失败进行控制和容错保护。

- 在复杂的分布式系统中，阻止某一个依赖服务的故障在整个系统中蔓延。比如某一个服务故障了，导致其它服务也跟着故障。

- 提供 fail-fast（快速失败）和快速恢复的支持。

- 提供 fallback 优雅降级的支持。

- 支持近实时的监控、报警以及运维操作。

举个栗子。

有这样一个分布式系统，服务 A 依赖于服务 B，服务 B 依赖于服务 C/D/E。在这样一个成熟的系统内，比如说最多可能只有 100 个线程资源。正常情况下，40 个线程并发调用服务 C，各 30 个线程并发调用 D/E。

调用服务 C，只需要 20ms，现在因为服务 C 故障了，比如延迟，或者挂了，此时线程会 hang 住 2s 左右。

40 个线程全部被卡住，由于请求不断涌入，其它的线程也用来调用服务 C，同样也会被卡住。

这样导致服务 B 的线程资源被耗尽，无法接收新的请求，甚至可能因为大量线程不断的运转，导致自己宕机。这种影响势必会蔓延至服务 A，导致服务 A 也跟着挂掉。

![service-invoke-road.png](https://github.com/doocs/advanced-java/raw/main/docs/high-availability/images/service-invoke-road.png)

Hystrix 可以对其进行资源隔离，比如限制服务 B 只有 40 个线程调用服务 C。

当此 40 个线程被 hang 住时，其它 60 个线程依然能正常调用工作。从而确保整个系统不会被拖垮。

# Hystrix 更加细节的设计原则

阻止任何一个依赖服务耗尽所有的资源，比如 tomcat 中的所有线程资源。

避免请求排队和积压，采用限流和 fail fast 来控制故障。

提供 fallback 降级机制来应对故障。

使用资源隔离技术，比如 bulkhead（舱壁隔离技术）、swimlane（泳道技术）、circuit breaker（断路技术）来限制任何一个依赖服务的故障的影响。

通过近实时的统计、监控、报警功能，来提高故障发现的速度。

通过近实时的属性和配置热修改功能，来提高故障处理和恢复的速度。

保护依赖服务调用的所有故障情况，而不仅仅只是网络故障情况。

# 小型电商网站的商品详情页系统架构

小型电商网站的页面展示采用页面全量静态化的思想。数据库中存放了所有的商品信息，页面静态化系统，将数据填充进静态模板中，形成静态化页面，推入 Nginx 服务器。

用户浏览网站页面时，取用一个已经静态化好的 html 页面，直接返回回去，不涉及任何的业务逻辑处理。

![架构](https://github.com/doocs/advanced-java/raw/main/docs/high-availability/images/e-commerce-website-detail-page-architecture-1.png)

下面是页面模板的简单 Demo 。

```xml
<html>
    <body>
        商品名称：#{productName}<br />
        商品价格：#{productPrice}<br />
        商品描述：#{productDesc}
    </body>
</html>
```

这样做，好处在于，用户每次浏览一个页面，不需要进行任何的跟数据库的交互逻辑，也不需要执行任何的代码，直接返回一个 html 页面就可以了，速度和性能非常高。

对于小网站，页面很少，很实用，非常简单，Java 中可以使用 velocity、freemarker、thymeleaf 等等，然后做个 cms 页面内容管理系统，模板变更的时候，点击按钮或者系统自动化重新进行全量渲染。

坏处在于，仅仅适用于一些小型的网站，比如页面的规模在几十到几万不等。对于一些大型的电商网站，亿级数量的页面，你说你每次页面模板修改了，都需要将这么多页面全量静态化，靠谱吗？每次渲染花个好几天时间，那你整个网站就废掉了。

# 大型电商网站的商品详情页系统架构

大型电商网站商品详情页的系统设计中，当商品数据发生变更时，会将变更消息压入 MQ 消息队列中。

缓存服务从消息队列中消费这条消息时，感知到有数据发生变更，便通过调用数据服务接口，获取变更后的数据，然后将整合好的数据推送至 redis 中。

Nginx 本地缓存的数据是有一定的时间期限的，比如说 10 分钟，当数据过期之后，它就会从 redis 获取到最新的缓存数据，并且缓存到自己本地。

用户浏览网页时，动态将 Nginx 本地数据渲染到本地 html 模板并返回给用户。

![大型电商网站的商品详情页系统架构](https://github.com/doocs/advanced-java/raw/main/docs/high-availability/images/e-commerce-website-detail-page-architecture-2.png)

虽然没有直接返回 html 页面那么快，但是因为数据在本地缓存，所以也很快，其实耗费的也就是动态渲染一个 html 页面的性能。

如果 html 模板发生了变更，不需要将所有的页面重新静态化，也不需要发送请求，没有网络请求的开销，直接将数据渲染进最新的 html 页面模板后响应即可。

在这种架构下，我们需要保证系统的高可用性。

如果系统访问量很高，Nginx 本地缓存过期失效了，redis 中的缓存也被 LRU 算法给清理掉了，那么会有较高的访问量，从缓存服务调用商品服务。

但如果此时商品服务的接口发生故障，调用出现了延时，缓存服务全部的线程都被这个调用商品服务接口给耗尽了，每个线程去调用商品服务接口的时候，都会卡住很长时间，后面大量的请求过来都会卡在那儿，此时缓存服务没有足够的线程去调用其它一些服务的接口，从而导致整个大量的商品详情页无法正常显示。

这其实就是一个商品接口服务故障导致缓存服务资源耗尽的现象。

# 基于 Hystrix 线程池技术实现资源隔离

上一讲提到，如果从 Nginx 开始，缓存都失效了，Nginx 会直接通过缓存服务调用商品服务获取最新商品数据（我们基于电商项目做个讨论），有可能出现调用延时而把缓存服务资源耗尽的情况。

这里，我们就来说说，怎么通过 Hystrix 线程池技术实现资源隔离。

资源隔离，就是说，你如果要把对某一个依赖服务的所有调用请求，全部隔离在同一份资源池内，不会去用其它资源了，这就叫资源隔离。

哪怕对这个依赖服务，比如说商品服务，现在同时发起的调用量已经到了 1000，但是分配给商品服务线程池内就 10 个线程，最多就只会用这 10 个线程去执行。

不会因为对商品服务调用的延迟，将 Tomcat 内部所有的线程资源全部耗尽。

Hystrix 进行资源隔离，其实是提供了一个抽象，叫做 Command。这也是 Hystrix 最最基本的资源隔离技术。

## 利用 HystrixCommand 获取单条数据

我们通过将调用商品服务的操作封装在 HystrixCommand 中，限定一个 key，比如下面的 GetProductInfoCommandGroup，在这里我们可以简单认为这是一个线程池，每次调用商品服务，就只会用该线程池中的资源，不会再去用其它线程资源了。

```java
public class GetProductInfoCommand extends HystrixCommand<ProductInfo> {

    private Long productId;

    public GetProductInfoCommand(Long productId) {
        super(HystrixCommandGroupKey.Factory.asKey("GetProductInfoCommandGroup"));
        this.productId = productId;
    }

    @Override
    protected ProductInfo run() {
        String url = "http://localhost:8081/getProductInfo?productId=" + productId;
        // 调用商品服务接口
        String response = HttpClientUtils.sendGetRequest(url);
        return JSONObject.parseObject(response, ProductInfo.class);
    }
}
```

我们在缓存服务接口中，根据 productId 创建 Command 并执行，获取到商品数据。

```java
@RequestMapping("/getProductInfo")
@ResponseBody
public String getProductInfo(Long productId) {
    HystrixCommand<ProductInfo> getProductInfoCommand = new GetProductInfoCommand(productId);

    // 通过command执行，获取最新商品数据
    ProductInfo productInfo = getProductInfoCommand.execute();
    System.out.println(productInfo);
    return "success";
}
```

上面执行的是 execute() 方法，其实是同步的。也可以对 command 调用 queue() 方法，它仅仅是将 command 放入线程池的一个等待队列，就立即返回，拿到一个 Future 对象，后面可以继续做其它一些事情，然后过一段时间对 Future 调用 get() 方法获取数据。这是异步的。

## 利用 HystrixObservableCommand 批量获取数据

只要是获取商品数据，全部都绑定到同一个线程池里面去，我们通过 HystrixObservableCommand 的一个线程去执行，而在这个线程里面，批量把多个 productId 的 productInfo 拉回来。

```java
public class GetProductInfosCommand extends HystrixObservableCommand<ProductInfo> {

    private String[] productIds;

    public GetProductInfosCommand(String[] productIds) {
        // 还是绑定在同一个线程池
        super(HystrixCommandGroupKey.Factory.asKey("GetProductInfoGroup"));
        this.productIds = productIds;
    }

    @Override
    protected Observable<ProductInfo> construct() {
        return Observable.unsafeCreate((Observable.OnSubscribe<ProductInfo>) subscriber -> {

            for (String productId : productIds) {
                // 批量获取商品数据
                String url = "http://localhost:8081/getProductInfo?productId=" + productId;
                String response = HttpClientUtils.sendGetRequest(url);
                ProductInfo productInfo = JSONObject.parseObject(response, ProductInfo.class);
                subscriber.onNext(productInfo);
            }
            subscriber.onCompleted();

        }).subscribeOn(Schedulers.io());
    }
}
```

在缓存服务接口中，根据传来的 id 列表，比如是以 , 分隔的 id 串，通过上面的 HystrixObservableCommand，执行 Hystrix 的一些 API 方法，获取到所有商品数据。

```java
public String getProductInfos(String productIds) {
    String[] productIdArray = productIds.split(",");
    HystrixObservableCommand<ProductInfo> getProductInfosCommand = new GetProductInfosCommand(productIdArray);
    Observable<ProductInfo> observable = getProductInfosCommand.observe();

    observable.subscribe(new Observer<ProductInfo>() {
        @Override
        public void onCompleted() {
            System.out.println("获取完了所有的商品数据");
        }

        @Override
        public void onError(Throwable e) {
            e.printStackTrace();
        }

        /**
         * 获取完一条数据，就回调一次这个方法
         * @param productInfo
         */
        @Override
        public void onNext(ProductInfo productInfo) {
            System.out.println(productInfo);
        }
    });
    return "success";
}
```

我们回过头来，看看 Hystrix 线程池技术是如何实现资源隔离的。

![hystrix-thread-pool-isolation.png](https://github.com/doocs/advanced-java/blob/main/docs/high-availability/images/hystrix-thread-pool-isolation.png)

从 Nginx 开始，缓存都失效了，那么 Nginx 通过缓存服务去调用商品服务。

缓存服务默认的线程大小是 10 个，最多就只有 10 个线程去调用商品服务的接口。

即使商品服务接口故障了，最多就只有 10 个线程会 hang 死在调用商品服务接口的路上，缓存服务的 Tomcat 内其它的线程还是可以用来调用其它的服务，干其它的事情。

# 基于 Hystrix 信号量机制实现资源隔离

Hystrix 里面核心的一项功能，其实就是所谓的资源隔离，要解决的最最核心的问题，就是将多个依赖服务的调用分别隔离到各自的资源池内。

避免说对某一个依赖服务的调用，因为依赖服务的接口调用的延迟或者失败，导致服务所有的线程资源全部耗费在这个服务的接口调用上。

一旦说某个服务的线程资源全部耗尽的话，就可能导致服务崩溃，甚至说这种故障会不断蔓延。

Hystrix 实现资源隔离，主要有两种技术：

- 线程池

- 信号量

默认情况下，Hystrix 使用线程池模式。

前面已经说过线程池技术了，这一小节就来说说信号量机制实现资源隔离，以及这两种技术的区别与具体应用场景。

## 信号量机制

信号量的资源隔离只是起到一个开关的作用，比如，服务 A 的信号量大小为 10，那么就是说它同时只允许有 10 个 tomcat 线程来访问服务 A，其它的请求都会被拒绝，从而达到资源隔离和限流保护的作用。

## 线程池与信号量区别

线程池隔离技术，并不是说去控制类似 tomcat 这种 web 容器的线程。

更加严格的意义上来说，Hystrix 的线程池隔离技术，控制的是 tomcat 线程的执行。

Hystrix 线程池满后，会确保说，tomcat 的线程不会因为依赖服务的接口调用延迟或故障而被 hang 住，tomcat 其它的线程不会卡死，可以快速返回，然后支撑其它的事情。

线程池隔离技术，是用 Hystrix 自己的线程去执行调用；而信号量隔离技术，是直接让 tomcat 线程去调用依赖服务。

信号量隔离，只是一道关卡，信号量有多少，就允许多少个 tomcat 线程通过它，然后去执行。

## 适用场景：

线程池技术，适合绝大多数场景，比如说我们对依赖服务的网络请求的调用和访问、需要对调用的 timeout 进行控制（捕捉 timeout 超时异常）。

信号量技术，适合说你的访问不是对外部依赖的访问，而是对内部的一些比较复杂的业务逻辑的访问，并且系统内部的代码，其实不涉及任何的网络请求，那么只要做信号量的普通限流就可以了，因为不需要去捕获 timeout 类似的问题。

## 信号量简单 Demo

业务背景里，比较适合信号量的是什么场景呢？

比如说，我们一般来说，缓存服务，可能会将一些量特别少、访问又特别频繁的数据，放在自己的纯内存中。

举个栗子。一般我们在获取到商品数据之后，都要去获取商品是属于哪个地理位置、省、市、卖家等，可能在自己的纯内存中，比如就一个 Map 去获取。对于这种直接访问本地内存的逻辑，比较适合用信号量做一下简单的隔离。

优点在于，不用自己管理线程池啦，不用 care timeout 超时啦，也不需要进行线程的上下文切换啦。信号量做隔离的话，性能相对来说会高一些。

假如这是本地缓存，我们可以通过 cityId，拿到 cityName。

```java
public class LocationCache {
    private static Map<Long, String> cityMap = new HashMap<>();

    static {
        cityMap.put(1L, "北京");
    }

    /**
     * 通过cityId 获取 cityName
     *
     * @param cityId 城市id
     * @return 城市名
     */
    public static String getCityName(Long cityId) {
        return cityMap.get(cityId);
    }
}
```

写一个 GetCityNameCommand，策略设置为信号量。run() 方法中获取本地缓存。

我们目的就是对获取本地缓存的代码进行资源隔离。

```java
public class GetCityNameCommand extends HystrixCommand<String> {

    private Long cityId;

    public GetCityNameCommand(Long cityId) {
        // 设置信号量隔离策略
        super(Setter.withGroupKey(HystrixCommandGroupKey.Factory.asKey("GetCityNameGroup"))
                .andCommandPropertiesDefaults(HystrixCommandProperties.Setter()
                        .withExecutionIsolationStrategy(HystrixCommandProperties.ExecutionIsolationStrategy.SEMAPHORE)));

        this.cityId = cityId;
    }

    @Override
    protected String run() {
        // 需要进行信号量隔离的代码
        return LocationCache.getCityName(cityId);
    }
}
```

在接口层，通过创建 GetCityNameCommand，传入 cityId，执行 execute() 方法，那么获取本地 cityName 缓存的代码将会进行信号量的资源隔离。

```java
@RequestMapping("/getProductInfo")
@ResponseBody
public String getProductInfo(Long productId) {
    HystrixCommand<ProductInfo> getProductInfoCommand = new GetProductInfoCommand(productId);

    // 通过command执行，获取最新商品数据
    ProductInfo productInfo = getProductInfoCommand.execute();

    Long cityId = productInfo.getCityId();

    GetCityNameCommand getCityNameCommand = new GetCityNameCommand(cityId);
    // 获取本地内存(cityName)的代码会被信号量进行资源隔离
    String cityName = getCityNameCommand.execute();

    productInfo.setCityName(cityName);

    System.out.println(productInfo);
    return "success";
}
```

# Hystrix 隔离策略细粒度控制

Hystrix 实现资源隔离，有两种策略：

- 线程池隔离

- 信号量隔离

对资源隔离这一块东西，其实可以做一定细粒度的一些控制。

```
execution.isolation.strategy
```

指定了 HystrixCommand.run() 的资源隔离策略：THREAD or SEMAPHORE，一种基于线程池，一种基于信号量。

```java
// to use thread isolation
HystrixCommandProperties.Setter().withExecutionIsolationStrategy(ExecutionIsolationStrategy.THREAD)

// to use semaphore isolation
HystrixCommandProperties.Setter().withExecutionIsolationStrategy(ExecutionIsolationStrategy.SEMAPHORE)
```

线程池机制，每个 command 运行在一个线程中，限流是通过线程池的大小来控制的；信号量机制，command 是运行在调用线程中（也就是 Tomcat 的线程池），通过信号量的容量来进行限流。

如何在线程池和信号量之间做选择？

默认的策略就是线程池。

线程池其实最大的好处就是对于网络访问请求，如果有超时的话，可以避免调用线程阻塞住。

而使用信号量的场景，通常是针对超大并发量的场景下，每个服务实例每秒都几百的 QPS，那么此时你用线程池的话，线程一般不会太多，可能撑不住那么高的并发，如果要撑住，可能要耗费大量的线程资源，那么就是用信号量，来进行限流保护。一般用信号量常见于那种基于纯内存的一些业务逻辑服务，而不涉及到任何网络访问请求。

## command key & command group

我们使用线程池隔离，要怎么对依赖服务、依赖服务接口、线程池三者做划分呢？

每一个 command，都可以设置一个自己的名称 command key，同时可以设置一个自己的组 command group。

```java
private static final Setter cachedSetter = Setter.withGroupKey(HystrixCommandGroupKey.Factory.asKey("ExampleGroup"))
                                                 .andCommandKey(HystrixCommandKey.Factory.asKey("HelloWorld"));

public CommandHelloWorld(String name) {
    super(cachedSetter);
    this.name = name;
}
```

command group 是一个非常重要的概念，默认情况下，就是通过 command group 来定义一个线程池的，而且还会通过 command group 来聚合一些监控和报警信息。

同一个 command group 中的请求，都会进入同一个线程池中。

## command thread pool

ThreadPoolKey 代表了一个 HystrixThreadPool，用来进行统一监控、统计、缓存。

默认的 ThreadPoolKey 就是 command group 的名称。

每个 command 都会跟它的 ThreadPoolKey 对应的 ThreadPool 绑定在一起。

如果不想直接用 command group，也可以手动设置 ThreadPool 的名称。

```java
private static final Setter cachedSetter = Setter.withGroupKey(HystrixCommandGroupKey.Factory.asKey("ExampleGroup"))
                                                 .andCommandKey(HystrixCommandKey.Factory.asKey("HelloWorld"))
                                                 .andThreadPoolKey(HystrixThreadPoolKey.Factory.asKey("HelloWorldPool"));

public CommandHelloWorld(String name) {
    super(cachedSetter);
    this.name = name;
}
```

## command key & command group & command thread pool

command key ，代表了一类 command，一般来说，代表了下游依赖服务的某个接口。

command group ，代表了某一个下游依赖服务，这是很合理的，一个依赖服务可能会暴露出来多个接口，每个接口就是一个 command key。

command group 在逻辑上对一堆 command key 的调用次数、成功次数、timeout 次数、失败次数等进行统计，可以看到某一个服务整体的一些访问情况。

一般来说，推荐根据一个服务区划分出一个线程池，command key 默认都是属于同一个线程池的。

比如说有一个服务 A，你估算出来服务 A 每秒所有接口加起来的整体 QPS 在 100 左右，你有一个服务 B 去调用服务 A。

你的服务 B 部署了 10 个实例，每个实例上，用 command group 去对应下游服务 A。给一个线程池，量大概是 10 就可以了，这样服务 B 对服务 A 整体的访问 QPS 就大概是每秒 100 了。

但是，如果说 command group 对应了一个服务，而这个服务暴露出来的几个接口，访问量很不一样，差异非常之大。

你可能就希望在这个服务对应 command group 的内部，包含对应多个接口的 command key，做一些细粒度的资源隔离。

就是说，希望对同一个服务的不同接口，使用不同的线程池。

```
command key -> command group

command key -> 自己的 thread pool key
```

逻辑上来说，多个 command key 属于一个 command group，在做统计的时候，会放在一起统计。每个 command key 有自己的线程池，每个接口有自己的线程池，去做资源隔离和限流。

说白点，就是说如果你的 command key 要用自己的线程池，可以定义自己的 thread pool key，就 ok 了。

## coreSize

设置线程池的大小，默认是 10。一般来说，用这个默认的 10 个线程大小就够了。

```
HystrixThreadPoolProperties.Setter().withCoreSize(int value);
```

## queueSizeRejectionThreshold

如果说线程池中的 10 个线程都在工作中，没有空闲的线程来做其它的事情，此时再有请求过来，会先进入队列积压。

如果说队列积压满了，再有请求过来，就直接 reject，拒绝请求，执行 fallback 降级的逻辑，快速返回。

控制 queue 满了之后 reject 的 threshold，因为 maxQueueSize 不允许热修改，因此提供这个参数可以热修改，控制队列的最大大小。

```java
HystrixThreadPoolProperties.Setter().withQueueSizeRejectionThreshold(int value);
```

## execution.isolation.semaphore.maxConcurrentRequests

设置使用 SEMAPHORE 隔离策略的时候允许访问的最大并发量，超过这个最大并发量，请求直接被 reject。

这个并发量的设置，跟线程池大小的设置，应该是类似的，但是基于信号量的话，性能会好很多，而且 Hystrix 框架本身的开销会小很多。

默认值是 10，尽量设置的小一些，因为一旦设置的太大，而且有延时发生，可能瞬间导致 tomcat 本身的线程资源被占满。

```java
HystrixCommandProperties.Setter().withExecutionIsolationSemaphoreMaxConcurrentRequests(int value);
```

# 深入 Hystrix 执行时内部原理

前面我们了解了 Hystrix 最基本的支持高可用的技术：资源隔离 + 限流。

1. 创建 command；

2. 执行这个 command；

3. 配置这个 command 对应的 group 和线程池。

这里，我们要讲一下，你开始执行这个 command，调用了这个 command 的 execute() 方法之后，Hystrix 底层的执行流程和步骤以及原理是什么。

在讲解这个流程的过程中，我会带出来 Hystrix 其他的一些核心以及重要的功能。

这里是整个 8 大步骤的流程图，我会对每个步骤进行细致的讲解。学习的过程中，对照着这个流程图，相信思路会比较清晰。

![new-hystrix-process.jpg](https://github.com/doocs/advanced-java/blob/main/docs/high-availability/images/new-hystrix-process.jpg)

## 步骤一：创建 command

一个 HystrixCommand 或 HystrixObservableCommand 对象，代表了对某个依赖服务发起的一次请求或者调用。创建的时候，可以在构造函数中传入任何需要的参数。

HystrixCommand 主要用于仅仅会返回一个结果的调用。

HystrixObservableCommand 主要用于可能会返回多条结果的调用。

```java
// 创建 HystrixCommand
HystrixCommand hystrixCommand = new HystrixCommand(arg1, arg2);

// 创建 HystrixObservableCommand
HystrixObservableCommand hystrixObservableCommand = new HystrixObservableCommand(arg1, arg2);
```

## 步骤二：调用 command 执行方法

执行 command，就可以发起一次对依赖服务的调用。

要执行 command，可以在 4 个方法中选择其中的一个：execute()、queue()、observe()、toObservable()。

其中 execute() 和 queue() 方法仅仅对 HystrixCommand 适用。

execute()：调用后直接 block 住，属于同步调用，直到依赖服务返回单条结果，或者抛出异常。

queue()：返回一个 Future，属于异步调用，后面可以通过 Future 获取单条结果。

observe()：订阅一个 Observable 对象，Observable 代表的是依赖服务返回的结果，获取到一个那个代表结果的 Observable 对象的拷贝对象。

toObservable()：返回一个 Observable 对象，如果我们订阅这个对象，就会执行 command 并且获取返回结果。

```java
K             value    = hystrixCommand.execute();
Future<K>     fValue   = hystrixCommand.queue();
Observable<K> oValue   = hystrixObservableCommand.observe();
Observable<K> toOValue = hystrixObservableCommand.toObservable();
```

execute() 实际上会调用 queue().get() 方法，可以看一下 Hystrix 源码。

```java
public R execute() {
    try {
        return queue().get();
    } catch (Exception e) {
        throw Exceptions.sneakyThrow(decomposeException(e));
    }
}
```

而在 queue() 方法中，会调用 toObservable().toBlocking().toFuture()。

```java
final Future<R> delegate = toObservable().toBlocking().toFuture();
```

也就是说，先通过 toObservable() 获得 Future 对象，然后调用 Future 的 get() 方法。

那么，其实无论是哪种方式执行 command，最终都是依赖于 toObservable() 去执行的。

## 步骤三：检查是否开启缓存（不太常用）

从这一步开始，就进入到 Hystrix 底层运行原理啦，看一下 Hystrix 一些更高级的功能和特性。

如果这个 command 开启了请求缓存 Request Cache，而且这个调用的结果在缓存中存在，那么直接从缓存中返回结果。否则，继续往后的步骤。

## 步骤四：检查是否开启了断路器

检查这个 command 对应的依赖服务是否开启了断路器。如果断路器被打开了，那么 Hystrix 就不会执行这个 command，而是直接去执行 fallback 降级机制，返回降级结果。

## 步骤五：检查线程池/队列/信号量是否已满

如果这个 command 线程池和队列已满，或者 semaphore 信号量已满，那么也不会执行 command，而是直接去调用 fallback 降级机制，同时发送 reject 信息给断路器统计。

## 步骤六：执行 command

调用 HystrixObservableCommand 对象的 construct() 方法，或者 HystrixCommand 的 run() 方法来实际执行这个 command。

- HystrixCommand.run() 返回单条结果，或者抛出异常。

```java
// 通过command执行，获取最新一条商品数据
ProductInfo productInfo = getProductInfoCommand.execute();
```

- HystrixObservableCommand.construct() 返回一个 Observable 对象，可以获取多条结果。

```java
Observable<ProductInfo> observable = getProductInfosCommand.observe();

// 订阅获取多条结果
observable.subscribe(new Observer<ProductInfo>() {
    @Override
    public void onCompleted() {
        System.out.println("获取完了所有的商品数据");
    }

    @Override
    public void onError(Throwable e) {
        e.printStackTrace();
    }

    /**
     * 获取完一条数据，就回调一次这个方法
     *
     * @param productInfo 商品信息
     */
    @Override
    public void onNext(ProductInfo productInfo) {
        System.out.println(productInfo);
    }
});
```

如果是采用线程池方式，并且 HystrixCommand.run() 或者 HystrixObservableCommand.construct() 的执行时间超过了 timeout 时长的话，那么 command 所在的线程会抛出一个 TimeoutException，这时会执行 fallback 降级机制，不会去管 run() 或 construct() 返回的值了。另一种情况，如果 command 执行出错抛出了其它异常，那么也会走 fallback 降级。这两种情况下，Hystrix 都会发送异常事件给断路器统计。

注意，我们是不可能终止掉一个调用严重延迟的依赖服务的线程的，只能说给你抛出来一个 TimeoutException。

如果没有 timeout，也正常执行的话，那么调用线程就会拿到一些调用依赖服务获取到的结果，然后 Hystrix 也会做一些 logging 记录和 metric 度量统计。

## 步骤七：断路健康检查

Hystrix 会把每一个依赖服务的调用成功、失败、Reject、Timeout 等事件发送给 circuit breaker 断路器。断路器就会对这些事件的次数进行统计，根据异常事件发生的比例来决定是否要进行断路（熔断）。

如果打开了断路器，那么在接下来一段时间内，会直接断路，返回降级结果。

如果在之后，断路器尝试执行 command，调用没有出错，返回了正常结果，那么 Hystrix 就会把断路器关闭。

## 步骤八：调用 fallback 降级机制

在以下几种情况中，Hystrix 会调用 fallback 降级机制。

- 断路器处于打开状态；

- 线程池/队列/semaphore 满了；

- command 执行超时；

- run() 或者 construct() 抛出异常。

一般在降级机制中，都建议给出一些默认的返回值，比如静态的一些代码逻辑，或者从内存中的缓存中提取一些数据，在这里尽量不要再进行网络请求了。

在降级中，如果一定要进行网络调用的话，也应该将那个调用放在一个 HystrixCommand 中进行隔离。

1. HystrixCommand 中，实现 getFallback() 方法，可以提供降级机制。

2. HystrixObservableCommand 中，实现 resumeWithFallback() 方法，返回一个 Observable 对象，可以提供降级结果。

如果没有实现 fallback，或者 fallback 抛出了异常，Hystrix 会返回一个 Observable，但是不会返回任何数据。

不同的 command 执行方式，其 fallback 为空或者异常时的返回结果不同。

- 对于 execute()，直接抛出异常。

- 对于 queue()，返回一个 Future，调用 get() 时抛出异常。

- 对于 observe()，返回一个 Observable 对象，但是调用 subscribe() 方法订阅它时，立即抛出调用者的 onError() 方法。

- 对于 toObservable()，返回一个 Observable 对象，但是调用 subscribe() 方法订阅它时，立即抛出调用者的 onError() 方法。

## 不同的执行方式

execute()，获取一个 Future.get()，然后拿到单个结果。

queue()，返回一个 Future。

observe()，立即订阅 Observable，然后启动 8 大执行步骤，返回一个拷贝的 Observable，订阅时立即回调给你结果。

toObservable()，返回一个原始的 Observable，必须手动订阅才会去执行 8 大步骤。

# 基于 request cache 请求缓存技术优化批量商品数据查询接口

Hystrix command 执行时 8 大步骤第三步，就是检查 Request cache 是否有缓存。

首先，有一个概念，叫做 Request Context 请求上下文，一般来说，在一个 web 应用中，如果我们用到了 Hystrix，我们会在一个 filter 里面，对每一个请求都施加一个请求上下文。就是说，每一次请求，就是一次请求上下文。然后在这次请求上下文中，我们会去执行 N 多代码，调用 N 多依赖服务，有的依赖服务可能还会调用好几次。

在一次请求上下文中，如果有多个 command，参数都是一样的，调用的接口也是一样的，而结果可以认为也是一样的。那么这个时候，我们可以让第一个 command 执行返回的结果缓存在内存中，然后这个请求上下文后续的其它对这个依赖的调用全部从内存中取出缓存结果就可以了。

这样的话，好处在于不用在一次请求上下文中反复多次执行一样的 command，避免重复执行网络请求，提升整个请求的性能。

举个栗子。

比如说我们在一次请求上下文中，请求获取 productId 为 1 的数据，第一次缓存中没有，那么会从商品服务中获取数据，返回最新数据结果，同时将数据缓存在内存中。

后续同一次请求上下文中，如果还有获取 productId 为 1 的数据的请求，直接从缓存中取就好了。

![hystrix-request-cache.png](https://github.com/doocs/advanced-java/raw/main/docs/high-availability/images/hystrix-request-cache.png)

HystrixCommand 和 HystrixObservableCommand 都可以指定一个缓存 key，然后 Hystrix 会自动进行缓存，接着在同一个 request context 内，再次访问的话，就会直接取用缓存。

下面，我们结合一个具体的业务场景，来看一下如何使用 request cache 请求缓存技术。当然，以下代码只作为一个基本的 Demo 而已。

现在，假设我们要做一个批量查询商品数据的接口，在这个里面，我们是用 HystrixCommand 一次性批量查询多个商品 id 的数据。

但是这里有个问题，如果说 Nginx 在本地缓存失效了，重新获取一批缓存，传递过来的 productIds 都没有进行去重，比如 productIds=1,1,1,2,2，那么可能说，商品 id 出现了重复，如果按照我们之前的业务逻辑，可能就会重复对 productId=1 的商品查询三次，productId=2 的商品查询两次。

我们对批量查询商品数据的接口，可以用 request cache 做一个优化，就是说一次请求，就是一次 request context，对相同的商品查询只执行一次，其余重复的都走 request cache。

## 实现 Hystrix 请求上下文过滤器并注册

定义 HystrixRequestContextFilter 类，实现 Filter 接口。

```java
/**
 * Hystrix 请求上下文过滤器
 */
public class HystrixRequestContextFilter implements Filter {

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {

    }

    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain) {
        HystrixRequestContext context = HystrixRequestContext.initializeContext();
        try {
            filterChain.doFilter(servletRequest, servletResponse);
        } catch (IOException | ServletException e) {
            e.printStackTrace();
        } finally {
            context.shutdown();
        }
    }

    @Override
    public void destroy() {

    }
}
```

然后将该 filter 对象注册到 SpringBoot Application 中。

```java
@SpringBootApplication
public class EshopApplication {

    public static void main(String[] args) {
        SpringApplication.run(EshopApplication.class, args);
    }

    @Bean
    public FilterRegistrationBean filterRegistrationBean() {
        FilterRegistrationBean filterRegistrationBean = new FilterRegistrationBean(new HystrixRequestContextFilter());
        filterRegistrationBean.addUrlPatterns("/*");
        return filterRegistrationBean;
    }
}
```

## command 重写 getCacheKey() 方法

在 GetProductInfoCommand 中，重写 getCacheKey() 方法，这样的话，每一次请求的结果，都会放在 Hystrix 请求上下文中。

下一次同一个 productId 的数据请求，直接取缓存，无须再调用 run() 方法。

```java
public class GetProductInfoCommand extends HystrixCommand<ProductInfo> {

    private Long productId;

    private static final HystrixCommandKey KEY = HystrixCommandKey.Factory.asKey("GetProductInfoCommand");

    public GetProductInfoCommand(Long productId) {
        super(Setter.withGroupKey(HystrixCommandGroupKey.Factory.asKey("ProductInfoService"))
                .andCommandKey(KEY));
        this.productId = productId;
    }

    @Override
    protected ProductInfo run() {
        String url = "http://localhost:8081/getProductInfo?productId=" + productId;
        String response = HttpClientUtils.sendGetRequest(url);
        System.out.println("调用接口查询商品数据，productId=" + productId);
        return JSONObject.parseObject(response, ProductInfo.class);
    }

    /**
     * 每次请求的结果，都会放在Hystrix绑定的请求上下文上
     *
     * @return cacheKey 缓存key
     */
    @Override
    public String getCacheKey() {
        return "product_info_" + productId;
    }

    /**
     * 将某个商品id的缓存清空
     *
     * @param productId 商品id
     */
    public static void flushCache(Long productId) {
        HystrixRequestCache.getInstance(KEY,
                HystrixConcurrencyStrategyDefault.getInstance()).clear("product_info_" + productId);
    }
}
```

这里写了一个 flushCache() 方法，用于我们开发手动删除缓存。

## controller 调用 command 查询商品信息

在一次 web 请求上下文中，传入商品 id 列表，查询多条商品数据信息。对于每个 productId，都创建一个 command。

如果 id 列表没有去重，那么重复的 id，第二次查询的时候就会直接走缓存。

```java
@Controller
public class CacheController {

    /**
     * 一次性批量查询多条商品数据的请求
     *
     * @param productIds 以,分隔的商品id列表
     * @return 响应状态
     */
    @RequestMapping("/getProductInfos")
    @ResponseBody
    public String getProductInfos(String productIds) {
        for (String productId : productIds.split(",")) {
            // 对每个productId，都创建一个command
            GetProductInfoCommand getProductInfoCommand = new GetProductInfoCommand(Long.valueOf(productId));
            ProductInfo productInfo = getProductInfoCommand.execute();
            System.out.println("是否是从缓存中取的结果：" + getProductInfoCommand.isResponseFromCache());
        }

        return "success";
    }
}
```

## 发起请求

调用接口，查询多个商品的信息。

```
http://localhost:8080/getProductInfos?productIds=1,1,1,2,2,5
```

在控制台，我们可以看到以下结果。

```
调用接口查询商品数据，productId=1
是否是从缓存中取的结果：false
是否是从缓存中取的结果：true
是否是从缓存中取的结果：true
调用接口查询商品数据，productId=2
是否是从缓存中取的结果：false
是否是从缓存中取的结果：true
调用接口查询商品数据，productId=5
是否是从缓存中取的结果：false
```

第一次查询 productId=1 的数据，会调用接口进行查询，不是从缓存中取结果。而随后再出现查询 productId=1 的请求，就直接取缓存了，这样的话，效率明显高很多。

## 删除缓存

我们写一个 UpdateProductInfoCommand，在更新商品信息之后，手动调用之前写的 flushCache()，手动将缓存删除。

```java
public class UpdateProductInfoCommand extends HystrixCommand<Boolean> {

    private Long productId;

    public UpdateProductInfoCommand(Long productId) {
        super(HystrixCommandGroupKey.Factory.asKey("UpdateProductInfoGroup"));
        this.productId = productId;
    }

    @Override
    protected Boolean run() throws Exception {
        // 这里执行一次商品信息的更新
        // ...

        // 然后清空缓存
        GetProductInfoCommand.flushCache(productId);
        return true;
    }
}
```

这样，以后查询该商品的请求，第一次就会走接口调用去查询最新的商品信息。

# 深入 Hystrix 断路器执行原理

## 状态机

Hystrix 断路器有三种状态，分别是关闭（Closed）、打开（Open）与半开（Half-Open），三种状态转化关系如下：

![状态机](https://github.com/doocs/advanced-java/raw/main/docs/high-availability/images/hystrix-circuit-breaker-state-machine.png)

Closed 断路器关闭：调用下游的请求正常通过

Open 断路器打开：阻断对下游服务的调用，直接走 Fallback 逻辑

Half-Open 断路器处于半开状态：SleepWindowInMilliseconds

## 常见方法

### Enabled

```java
HystrixCommandProperties.Setter()
    .withCircuitBreakerEnabled(boolean)
```

控制断路器是否工作，包括跟踪依赖服务调用的健康状况，以及对异常情况过多时是否允许触发断路。默认值 true。

### circuitBreaker.requestVolumeThreshold

```java
HystrixCommandProperties.Setter()
    .withCircuitBreakerRequestVolumeThreshold(int)
```

表示在一次统计的时间滑动窗口中（这个参数也很重要，下面有说到），至少经过多少个请求，才可能触发断路，默认值 20。

**经过 Hystrix 断路器的流量只有在超过了一定阈值后，才有可能触发断路。**

比如说，要求在 10s 内经过断路器的流量必须达到 20 个，而实际经过断路器的请求有 19 个，即使这 19 个请求全都失败，也不会去判断要不要断路。

### circuitBreaker.errorThresholdPercentage

```java
HystrixCommandProperties.Setter()
    .withCircuitBreakerErrorThresholdPercentage(int)
```

表示异常比例达到多少，才会触发断路，默认值是 50(%)。

### circuitBreaker.sleepWindowInMilliseconds

```java
HystrixCommandProperties.Setter()
    .withCircuitBreakerSleepWindowInMilliseconds(int)
```

断路器状态由 Close 转换到 Open，在之后 SleepWindowInMilliseconds 时间内，所有经过该断路器的请求会被断路，不调用后端服务，直接走 Fallback 降级机制，默认值 5000(ms)。

而在该参数时间过后，断路器会变为 Half-Open 半开闭状态，尝试让一条请求经过断路器，看能不能正常调用。如果调用成功了，那么就自动恢复，断路器转为 Close 状态。

### ForceOpen

```java
HystrixCommandProperties.Setter()
    .withCircuitBreakerForceOpen(boolean)
```

如果设置为 true 的话，直接强迫打开断路器，相当于是手动断路了，手动降级，默认值是 false。

### ForceClosed

```java
HystrixCommandProperties.Setter()
    .withCircuitBreakerForceClosed(boolean)
```

如果设置为 true，直接强迫关闭断路器，相当于手动停止断路了，手动升级，默认值是 false。

## Metrics 统计器

与 Hystrix 断路器紧密协作的，还有另一个重要组件 —— 统计器（Metrics）。

统计器中最重要的参数要数滑动窗口（metrics.rollingStats.timeInMilliseconds）以及桶（metrics.rollingStats.numBuckets）了，这里引用一段博文来解释滑动窗口（默认值是 10000 ms）：

一位乘客坐在正在行驶的列车的靠窗座位上，列车行驶的公路两侧种着一排挺拔的白杨树，随着列车的前进，路边的白杨树迅速从窗口滑过。

我们用每棵树来代表一个请求，用列车的行驶代表时间的流逝，那么，列车上的这个窗口就是一个典型的滑动窗口，这个乘客能通过窗口看到的白杨树就是 Hystrix 要统计的数据。

Hystrix 并不是只要有一条请求经过就去统计，而是将整个滑动窗口均分为 numBuckets 份，时间每经过一份就去统计一次。

在经过一个时间窗口后，才会判断断路器状态要不要开启，请看下面的例子。

# 实例 Demo

## HystrixCommand 配置参数

在 GetProductInfoCommand 中配置 Setter 断路器相关参数。

滑动窗口中，最少 20 个请求，才可能触发断路。

异常比例达到 40% 时，才触发断路。

断路后 3000ms 内，所有请求都被 reject，直接走 fallback 降级，不会调用 run() 方法。3000ms 过后，变为 half-open 状态。

run() 方法中，我们判断一下 productId 是否为 -1，是的话，直接抛出异常。这么写，我们之后测试的时候就可以传入 productId=-1，模拟服务执行异常了。

在降级逻辑中，我们直接给它返回降级商品就好了。

```java
public class GetProductInfoCommand extends HystrixCommand<ProductInfo> {

    private Long productId;

    private static final HystrixCommandKey KEY = HystrixCommandKey.Factory.asKey("GetProductInfoCommand");

    public GetProductInfoCommand(Long productId) {
        super(Setter.withGroupKey(HystrixCommandGroupKey.Factory.asKey("ProductInfoService"))
                .andCommandKey(KEY)
                .andCommandPropertiesDefaults(HystrixCommandProperties.Setter()
                        // 是否允许断路器工作
                        .withCircuitBreakerEnabled(true)
                        // 滑动窗口中，最少有多少个请求，才可能触发断路
                        .withCircuitBreakerRequestVolumeThreshold(20)
                        // 异常比例达到多少，才触发断路，默认50%
                        .withCircuitBreakerErrorThresholdPercentage(40)
                        // 断路后多少时间内直接reject请求，之后进入half-open状态，默认5000ms
                        .withCircuitBreakerSleepWindowInMilliseconds(3000)));
        this.productId = productId;
    }

    @Override
    protected ProductInfo run() throws Exception {
        System.out.println("调用接口查询商品数据，productId=" + productId);

        if (productId == -1L) {
            throw new Exception();
        }

        String url = "http://localhost:8081/getProductInfo?productId=" + productId;
        String response = HttpClientUtils.sendGetRequest(url);
        return JSONObject.parseObject(response, ProductInfo.class);
    }

    @Override
    protected ProductInfo getFallback() {
        ProductInfo productInfo = new ProductInfo();
        productInfo.setName("降级商品");
        return productInfo;
    }
}
```

## 断路测试类

我们在测试类中，前 30 次请求，传入 productId=-1，然后休眠 3s，之后 70 次请求，传入 productId=1。

```java
@SpringBootTest
@RunWith(SpringRunner.class)
public class CircuitBreakerTest {

    @Test
    public void testCircuitBreaker() {
        String baseURL = "http://localhost:8080/getProductInfo?productId=";

        for (int i = 0; i < 30; ++i) {
            // 传入-1，会抛出异常，然后走降级逻辑
            HttpClientUtils.sendGetRequest(baseURL + "-1");
        }

        TimeUtils.sleep(3);
        System.out.println("After sleeping...");

        for (int i = 31; i < 100; ++i) {
            // 传入1，走服务正常调用
            HttpClientUtils.sendGetRequest(baseURL + "1");
        }
    }
}
```

## 测试结果

测试结果，我们可以明显看出系统断路与恢复的整个过程。

```
调用接口查询商品数据，productId=-1
ProductInfo(id=null, name=降级商品, price=null, pictureList=null, specification=null, service=null, color=null, size=null, shopId=null, modifiedTime=null, cityId=null, cityName=null, brandId=null, brandName=null)
// ...
// 这里重复打印了 20 次上面的结果


ProductInfo(id=null, name=降级商品, price=null, pictureList=null, specification=null, service=null, color=null, size=null, shopId=null, modifiedTime=null, cityId=null, cityName=null, brandId=null, brandName=null)
// ...
// 这里重复打印了 8 次上面的结果


// 休眠 3s 后
调用接口查询商品数据，productId=1
ProductInfo(id=1, name=iphone7手机, price=5599.0, pictureList=a.jpg,b.jpg, specification=iphone7的规格, service=iphone7的售后服务, color=红色,白色,黑色, size=5.5, shopId=1, modifiedTime=2017-01-01 12:00:00, cityId=1, cityName=null, brandId=1, brandName=null)
// ...
// 这里重复打印了 69 次上面的结果
```

前 30 次请求，我们传入的 productId 为 -1，所以服务执行过程中会抛出异常。我们设置了最少 20 次请求通过断路器并且异常比例超出 40% 就触发断路。因此执行了 21 次接口调用，每次都抛异常并且走降级，21 次过后，断路器就被打开了。

之后的 9 次请求，都不会执行 run() 方法，也就不会打印以下信息。

```
调用接口查询商品数据，productId=-1
```

而是直接走降级逻辑，调用 getFallback() 执行。

休眠了 3s 后，我们在之后的 70 次请求中，都传入 productId 为 1。

由于我们前面设置了 3000ms 过后断路器变为 half-open 状态。

因此 Hystrix 会尝试执行请求，发现成功了，那么断路器关闭，之后的所有请求也都能正常调用了。


# 深入 Hystrix 线程池隔离与接口限流

前面讲了 Hystrix 的 request cache 请求缓存、fallback 优雅降级、circuit breaker 断路器快速熔断，这一讲，我们来详细说说 Hystrix 的线程池隔离与接口限流。

![hystrix-process.png](https://github.com/doocs/advanced-java/raw/main/docs/high-availability/images/hystrix-process.png)

Hystrix 通过判断线程池或者信号量是否已满，超出容量的请求，直接 Reject 走降级，从而达到限流的作用。

限流是限制对后端的服务的访问量，比如说你对 MySQL、Redis、Zookeeper 以及其它各种后端中间件的资源的访问的限制，其实是为了避免过大的流量直接打死后端的服务。

## 线程池隔离技术的设计

Hystrix 采用了 Bulkhead Partition 舱壁隔离技术，来将外部依赖进行资源隔离，进而避免任何外部依赖的故障导致本服务崩溃。

舱壁隔离，是说将船体内部空间区隔划分成若干个隔舱，一旦某几个隔舱发生破损进水，水流不会在其间相互流动，如此一来船舶在受损时，依然能具有足够的浮力和稳定性，进而减低立即沉船的危险。

Hystrix 对每个外部依赖用一个单独的线程池，这样的话，如果对那个外部依赖调用延迟很严重，最多就是耗尽那个依赖自己的线程池而已，不会影响其他的依赖调用。

## Hystrix 应用线程池机制的场景

- 每个服务都会调用几十个后端依赖服务，那些后端依赖服务通常是由很多不同的团队开发的。

- 每个后端依赖服务都会提供它自己的 client 调用库，比如说用 thrift 的话，就会提供对应的 thrift 依赖。

- client 调用库随时会变更。

- client 调用库随时可能会增加新的网络请求的逻辑。

- client 调用库可能会包含诸如自动重试、数据解析、内存中缓存等逻辑。

- client 调用库一般都对调用者来说是个黑盒，包括实现细节、网络访问、默认配置等等。

- 在真实的生产环境中，经常会出现调用者，突然间惊讶的发现，client 调用库发生了某些变化。

- 即使 client 调用库没有改变，依赖服务本身可能有会发生逻辑上的变化。

- 有些依赖的 client 调用库可能还会拉取其他的依赖库，而且可能那些依赖库配置的不正确。

- 大多数网络请求都是同步调用的。

- 调用失败和延迟，也有可能会发生在 client 调用库本身的代码中，不一定就是发生在网络请求中。

- 简单来说，就是你必须默认 client 调用库很不靠谱，而且随时可能发生各种变化，所以就要用强制隔离的方式来确保任何服务的故障不会影响当前服务。

## 线程池机制的优点

- 任何一个依赖服务都可以被隔离在自己的线程池内，即使自己的线程池资源填满了，也不会影响任何其他的服务调用。

- 服务可以随时引入一个新的依赖服务，因为即使这个新的依赖服务有问题，也不会影响其他任何服务的调用。

- 当一个故障的依赖服务重新变好的时候，可以通过清理掉线程池，瞬间恢复该服务的调用，而如果是 tomcat 线程池被占满，再恢复就很麻烦。

- 如果一个 client 调用库配置有问题，线程池的健康状况随时会报告，比如成功/失败/拒绝/超时的次数统计，然后可以近实时热修改依赖服务的调用配置，而不用停机。

- 基于线程池的异步本质，可以在同步的调用之上，构建一层异步调用层。

简单来说，最大的好处，就是资源隔离，确保说任何一个依赖服务故障，不会拖垮当前的这个服务。

## 线程池机制的缺点

- 线程池机制最大的缺点就是增加了 CPU 的开销。

- 除了 tomcat 本身的调用线程之外，还有 Hystrix 自己管理的线程池。

- 每个 command 的执行都依托一个独立的线程，会进行排队，调度，还有上下文切换。

Hystrix 官方自己做了一个多线程异步带来的额外开销统计，通过对比多线程异步调用+同步调用得出，Netflix API 每天通过 Hystrix 执行 10 亿次调用，每个服务实例有 40 个以上的线程池，每个线程池有 10 个左右的线程。）最后发现说，用 Hystrix 的额外开销，就是给请求带来了 3ms 左右的延时，最多延时在 10ms 以内，相比于可用性和稳定性的提升，这是可以接受的。

我们可以用 Hystrix semaphore 技术来实现对某个依赖服务的并发访问量的限制，而不是通过线程池/队列的大小来限制流量。

semaphore 技术可以用来限流和削峰，但是不能用来对调用延迟的服务进行 timeout 和隔离。

execution.isolation.strategy 设置为 SEMAPHORE，那么 Hystrix 就会用 semaphore 机制来替代线程池机制，来对依赖服务的访问进行限流。如果通过 semaphore 调用的时候，底层的网络调用延迟很严重，那么是无法 timeout 的，只能一直 block 住。一旦请求数量超过了 semaphore 限定的数量之后，就会立即开启限流。

## 接口限流 Demo

假设一个线程池大小为 8，等待队列的大小为 10。timeout 时长我们设置长一些，20s。

在 command 内部，写死代码，做一个 sleep，比如 sleep 3s。

- withCoreSize：设置线程池大小。

- withMaxQueueSize：设置等待队列大小。

- withQueueSizeRejectionThreshold：这个与 withMaxQueueSize 配合使用，等待队列的大小，取得是这两个参数的较小值。

如果只设置了线程池大小，另外两个 queue 相关参数没有设置的话，等待队列是处于关闭的状态。

```java
public class GetProductInfoCommand extends HystrixCommand<ProductInfo> {

    private Long productId;

    private static final HystrixCommandKey KEY = HystrixCommandKey.Factory.asKey("GetProductInfoCommand");

    public GetProductInfoCommand(Long productId) {
        super(Setter.withGroupKey(HystrixCommandGroupKey.Factory.asKey("ProductInfoService"))
                .andCommandKey(KEY)
                // 线程池相关配置信息
                .andThreadPoolPropertiesDefaults(HystrixThreadPoolProperties.Setter()
                        // 设置线程池大小为8
                        .withCoreSize(8)
                        // 设置等待队列大小为10
                        .withMaxQueueSize(10)
                        .withQueueSizeRejectionThreshold(12))
                .andCommandPropertiesDefaults(HystrixCommandProperties.Setter()
                        .withCircuitBreakerEnabled(true)
                        .withCircuitBreakerRequestVolumeThreshold(20)
                        .withCircuitBreakerErrorThresholdPercentage(40)
                        .withCircuitBreakerSleepWindowInMilliseconds(3000)
                        // 设置超时时间
                        .withExecutionTimeoutInMilliseconds(20000)
                        // 设置fallback最大请求并发数
                        .withFallbackIsolationSemaphoreMaxConcurrentRequests(30)));
        this.productId = productId;
    }

    @Override
    protected ProductInfo run() throws Exception {
        System.out.println("调用接口查询商品数据，productId=" + productId);

        if (productId == -1L) {
            throw new Exception();
        }

        // 请求过来，会在这里hang住3秒钟
        if (productId == -2L) {
            TimeUtils.sleep(3);
        }

        String url = "http://localhost:8081/getProductInfo?productId=" + productId;
        String response = HttpClientUtils.sendGetRequest(url);
        System.out.println(response);
        return JSONObject.parseObject(response, ProductInfo.class);
    }

    @Override
    protected ProductInfo getFallback() {
        ProductInfo productInfo = new ProductInfo();
        productInfo.setName("降级商品");
        return productInfo;
    }
}
```

我们模拟 25 个请求。前 8 个请求，调用接口时会直接被 hang 住 3s，那么后面的 10 个请求会先进入等待队列中等待前面的请求执行完毕。

最后的 7 个请求过来，会直接被 reject，调用 fallback 降级逻辑。

```java
@SpringBootTest
@RunWith(SpringRunner.class)
public class RejectTest {

    @Test
    public void testReject() {
        for (int i = 0; i < 25; ++i) {
            new Thread(() -> HttpClientUtils.sendGetRequest("http://localhost:8080/getProductInfo?productId=-2")).start();
        }
        // 防止主线程提前结束执行
        TimeUtils.sleep(50);
    }
}
```

从执行结果中，我们可以明显看出一共打印出了 7 个降级商品。这也就是请求数超过线程池+队列的数量而直接被 reject 的结果。

```
ProductInfo(id=null, name=降级商品, price=null, pictureList=null, specification=null, service=null, color=null, size=null, shopId=null, modifiedTime=null, cityId=null, cityName=null, brandId=null, brandName=null)
ProductInfo(id=null, name=降级商品, price=null, pictureList=null, specification=null, service=null, color=null, size=null, shopId=null, modifiedTime=null, cityId=null, cityName=null, brandId=null, brandName=null)
ProductInfo(id=null, name=降级商品, price=null, pictureList=null, specification=null, service=null, color=null, size=null, shopId=null, modifiedTime=null, cityId=null, cityName=null, brandId=null, brandName=null)
ProductInfo(id=null, name=降级商品, price=null, pictureList=null, specification=null, service=null, color=null, size=null, shopId=null, modifiedTime=null, cityId=null, cityName=null, brandId=null, brandName=null)
ProductInfo(id=null, name=降级商品, price=null, pictureList=null, specification=null, service=null, color=null, size=null, shopId=null, modifiedTime=null, cityId=null, cityName=null, brandId=null, brandName=null)
ProductInfo(id=null, name=降级商品, price=null, pictureList=null, specification=null, service=null, color=null, size=null, shopId=null, modifiedTime=null, cityId=null, cityName=null, brandId=null, brandName=null)
调用接口查询商品数据，productId=-2
调用接口查询商品数据，productId=-2
调用接口查询商品数据，productId=-2
调用接口查询商品数据，productId=-2
调用接口查询商品数据，productId=-2
调用接口查询商品数据，productId=-2
调用接口查询商品数据，productId=-2
调用接口查询商品数据，productId=-2
ProductInfo(id=null, name=降级商品, price=null, pictureList=null, specification=null, service=null, color=null, size=null, shopId=null, modifiedTime=null, cityId=null, cityName=null, brandId=null, brandName=null)
{"id": -2, "name": "iphone7手机", "price": 5599, "pictureList":"a.jpg,b.jpg", "specification": "iphone7的规格", "service": "iphone7的售后服务", "color": "红色,白色,黑色", "size": "5.5", "shopId": 1, "modifiedTime": "2017-01-01 12:00:00", "cityId": 1, "brandId": 1}
// 后面都是一些正常的商品信息，就不贴出来了
// ...
```

# 基于 timeout 机制为服务接口调用超时提供安全保护

一般来说，在调用依赖服务的接口的时候，比较常见的一个问题就是超时。

超时是在一个复杂的分布式系统中，导致系统不稳定，或者系统抖动。出现大量超时，线程资源会被 hang 死，从而导致吞吐量大幅度下降，甚至服务崩溃。

你去调用各种各样的依赖服务，特别是在大公司，你甚至都不认识开发一个服务的人，你都不知道那个人的技术水平怎么样，对那个人根本不了解。

Peter Steiner 说过，"On the Internet, nobody knows you're a dog"，也就是说在互联网的另外一头，你都不知道甚至坐着一条狗。

像特别复杂的分布式系统，特别是在大公司里，多个团队、大型协作，你可能都不知道服务是谁的，很可能说开发服务的那个哥儿们甚至是一个实习生。依赖服务的接口性能可能很不稳定，有时候 2ms，有时候 200ms，甚至 2s，都有可能。

如果你不对各种依赖服务接口的调用做超时控制，来给你的服务提供安全保护措施，那么很可能你的服务就被各种垃圾的依赖服务的性能给拖死了。

大量的接口调用很慢，大量的线程被卡死。如果你做了资源的隔离，那么也就是线程池的线程被卡死，但其实我们可以做超时控制，没必要让它们全卡死。

## TimeoutMilliseconds

在 Hystrix 中，我们可以手动设置 timeout 时长，如果一个 command 运行时间超过了设定的时长，那么就被认为是 timeout，然后 Hystrix command 标识为 timeout，同时执行 fallback 降级逻辑。

TimeoutMilliseconds 默认值是 1000，也就是 1000ms。

```java
HystrixCommandProperties.Setter()
    ..withExecutionTimeoutInMilliseconds(int)
```

## TimeoutEnabled

这个参数用于控制是否要打开 timeout 机制，默认值是 true。

```java
HystrixCommandProperties.Setter()
    .withExecutionTimeoutEnabled(boolean)
```

# 实例 Demo

我们在 command 中，将超时时间设置为 500ms，然后在 run() 方法中，设置休眠时间 1s，这样一个请求过来，直接休眠 1s，结果就会因为超时而执行降级逻辑。

```java
public class GetProductInfoCommand extends HystrixCommand<ProductInfo> {

    private Long productId;

    private static final HystrixCommandKey KEY = HystrixCommandKey.Factory.asKey("GetProductInfoCommand");

    public GetProductInfoCommand(Long productId) {
        super(Setter.withGroupKey(HystrixCommandGroupKey.Factory.asKey("ProductInfoService"))
                .andCommandKey(KEY)
                .andThreadPoolPropertiesDefaults(HystrixThreadPoolProperties.Setter()
                        .withCoreSize(8)
                        .withMaxQueueSize(10)
                        .withQueueSizeRejectionThreshold(8))
                .andCommandPropertiesDefaults(HystrixCommandProperties.Setter()
                        .withCircuitBreakerEnabled(true)
                        .withCircuitBreakerRequestVolumeThreshold(20)
                        .withCircuitBreakerErrorThresholdPercentage(40)
                        .withCircuitBreakerSleepWindowInMilliseconds(3000)
                        // 设置是否打开超时，默认是true
                        .withExecutionTimeoutEnabled(true)
                        // 设置超时时间，默认1000(ms)
                        .withExecutionTimeoutInMilliseconds(500)
                        .withFallbackIsolationSemaphoreMaxConcurrentRequests(30)));
        this.productId = productId;
    }

    @Override
    protected ProductInfo run() throws Exception {
        System.out.println("调用接口查询商品数据，productId=" + productId);

        // 休眠1s
        TimeUtils.sleep(1);

        String url = "http://localhost:8081/getProductInfo?productId=" + productId;
        String response = HttpClientUtils.sendGetRequest(url);
        System.out.println(response);
        return JSONObject.parseObject(response, ProductInfo.class);
    }

    @Override
    protected ProductInfo getFallback() {
        ProductInfo productInfo = new ProductInfo();
        productInfo.setName("降级商品");
        return productInfo;
    }
}
```

在测试类中，我们直接发起请求。

```java
@SpringBootTest
@RunWith(SpringRunner.class)
public class TimeoutTest {

    @Test
    public void testTimeout() {
        HttpClientUtils.sendGetRequest("http://localhost:8080/getProductInfo?productId=1");
    }
}
```

结果中可以看到，打印出了降级商品相关信息。

```
ProductInfo(id=null, name=降级商品, price=null, pictureList=null, specification=null, service=null, color=null, size=null, shopId=null, modifiedTime=null, cityId=null, cityName=null, brandId=null, brandName=null)
{"id": 1, "name": "iphone7手机", "price": 5599, "pictureList":"a.jpg,b.jpg", "specification": "iphone7的规格", "service": "iphone7的售后服务", "color": "红色,白色,黑色", "size": "5.5", "shopId": 1, "modifiedTime": "2017-01-01 12:00:00", "cityId": 1, "brandId": 1}
```




# 参考资料

https://github.com/doocs/advanced-java/blob/main/docs/high-availability/hystrix-timeout.md

https://github.com/doocs/advanced-java/blob/main/docs/high-availability/hystrix-thread-pool-current-limiting.md

https://github.com/doocs/advanced-java/blob/main/docs/high-availability/hystrix-circuit-breaker.md

https://github.com/doocs/advanced-java/blob/main/docs/high-availability/hystrix-request-cache.md

https://github.com/doocs/advanced-java/blob/main/docs/high-availability/hystrix-process.md

https://github.com/doocs/advanced-java/blob/main/docs/high-availability/hystrix-execution-isolation.md

https://github.com/doocs/advanced-java/blob/main/docs/high-availability/hystrix-semphore-isolation.md

https://github.com/doocs/advanced-java/blob/main/docs/high-availability/hystrix-thread-pool-isolation.md

https://github.com/doocs/advanced-java/blob/main/docs/high-availability/e-commerce-website-detail-page-architecture.md

https://github.com/doocs/advanced-java/blob/main/docs/high-availability/sentinel-vs-hystrix.md

* any list
{:toc}