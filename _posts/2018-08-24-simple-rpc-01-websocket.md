---
layout: post
title: java 从零开始手写 RPC (01) 基于 websocket 实现
date:  2018-08-24 16:23:15 +0800
categories: [Java]
tags: [java, dubbo, rpc, hand-write, sf]
published: true
---

# RPC

## 解决的问题

RPC 主要是为了解决的两个问题：

（1）解决分布式系统中，服务之间的调用问题。

（2）远程调用时，要能够像本地调用一样方便，让调用者感知不到远程调用的逻辑。

这一节我们来学习下如何基于 websocket 实现最简单的 rpc 调用，后续会实现基于 netty4 的版本。

> 开源地址： [https://github.com/houbb/rpc](https://github.com/houbb/rpc)

## 完整流程

![在这里插入图片描述](https://img-blog.csdnimg.cn/bb4ae48501794c87814ab6b83a45cd00.png)

其中左边的Client，对应的就是前面的Service A，而右边的Server，对应的则是Service B。

下面一步一步详细解释一下。

（1）Service A的应用层代码中，调用了Calculator的一个实现类的add方法，希望执行一个加法运算；

（2）这个Calculator实现类，内部并不是直接实现计算器的加减乘除逻辑，而是通过远程调用Service B的RPC接口，来获取运算结果，因此称之为Stub；

（3）Stub怎么和Service B建立远程通讯呢？这时候就要用到远程通讯工具了，也就是图中的Run-time Library，这个工具将帮你实现远程通讯的功能，比如Java的Socket，就是这样一个库，当然，你也可以用基于Http协议的HttpClient，或者其他通讯工具类，都可以，RPC并没有规定说你要用何种协议进行通讯；

（4）Stub通过调用通讯工具提供的方法，和Service B建立起了通讯，然后将请求数据发给Service B。需要注意的是，由于底层的网络通讯是基于二进制格式的，因此这里Stub传给通讯工具类的数据也必须是二进制，比如calculator.add(1,2)，你必须把参数值1和2放到一个Request对象里头（这个Request对象当然不只这些信息，还包括要调用哪个服务的哪个RPC接口等其他信息），然后序列化为二进制，再传给通讯工具类，这一点也将在下面的代码实现中体现；

（5）二进制的数据传到Service B这一边了，Service B当然也有自己的通讯工具，通过这个通讯工具接收二进制的请求；

（6）既然数据是二进制的，那么自然要进行反序列化了，将二进制的数据反序列化为请求对象，然后将这个请求对象交给Service B的Stub处理；

（7）和之前的Service A的Stub一样，这里的Stub也同样是个“假玩意”，它所负责的，只是去解析请求对象，知道调用方要调的是哪个RPC接口，传进来的参数又是什么，然后再把这些参数传给对应的RPC接口，也就是Calculator的实际实现类去执行。很明显，如果是Java，那这里肯定用到了反射。

（8）RPC接口执行完毕，返回执行结果，现在轮到Service B要把数据发给Service A了，怎么发？一样的道理，一样的流程，只是现在Service B变成了Client，Service A变成了Server而已：Service B反序列化执行结果->传输给Service A->Service A反序列化执行结果 -> 将结果返回给Application，完毕。

# 简单实现

假设服务 A，想调用服务 B 的一个方法。

因为不在同一个内存中，无法直接使用。如何可以实现类似 Dubbo 的功能呢？

这里不需要使用 HTTP 级别的通信，使用 TCP 协议即可。

## common

公用模块，定义通用对象。

- Rpc 常量

```java
public interface RpcConstant {

    /**
     * 地址
     */
    String ADDRESS = "127.0.0.1";

    /**
     * 端口号
     */
    int PORT = 12345;

}
```

- 请求入参

```java
public class RpcCalculateRequest implements Serializable {

    private static final long serialVersionUID = 6420751004355300996L;

    /**
     * 参数一
     */
    private int one;

    /**
     * 参数二
     */
    private int two;

    //getter & setter & toString()
}
```

- 服务接口

```java
public interface Calculator {

    /**
     * 计算加法
     * @param one 参数一
     * @param two 参数二
     * @return 返回结果
     */
    int add(int one, int two);

}
```

## server

- 服务接口的实现

```java
public class CalculatorImpl implements Calculator {

    @Override
    public int add(int one, int two) {
        return one + two;
    }

}
```

- 启动服务

```java
public static void main(String[] args) throws IOException {
    Calculator calculator = new CalculatorImpl();
    try (ServerSocket listener = new ServerSocket(RpcConstant.PORT)) {
        System.out.println("Server 端启动：" + RpcConstant.ADDRESS + ":" + RpcConstant.PORT);
        while (true) {
            try (Socket socket = listener.accept()) {
                // 将请求反序列化
                ObjectInputStream objectInputStream = new ObjectInputStream(socket.getInputStream());
                Object object = objectInputStream.readObject();
                System.out.println("Request is: " + object);
                // 调用服务
                int result = 0;
                if (object instanceof RpcCalculateRequest) {
                    RpcCalculateRequest calculateRpcRequest = (RpcCalculateRequest) object;
                    result = calculator.add(calculateRpcRequest.getOne(), calculateRpcRequest.getTwo());
                }
                // 返回结果
                ObjectOutputStream objectOutputStream = new ObjectOutputStream(socket.getOutputStream());
                objectOutputStream.writeObject(result);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }
}
```

启动日志:

```
Server 端启动：127.0.0.1:12345
```

## client

- 客户端调用

```java
public static void main(String[] args) {
    Calculator calculator = new CalculatorProxy();
    int result = calculator.add(1, 2);
    System.out.println(result);
}
```

- 计算的代理类

```java
public class CalculatorProxy implements Calculator {

    @Override
    public int add(int one, int two) {
        try {
            Socket socket = new Socket(RpcConstant.ADDRESS, RpcConstant.PORT);

            // 将请求序列化
            RpcCalculateRequest calculateRpcRequest = new RpcCalculateRequest(one, two);
            ObjectOutputStream objectOutputStream = new ObjectOutputStream(socket.getOutputStream());

            // 将请求发给服务提供方
            objectOutputStream.writeObject(calculateRpcRequest);

            // 将响应体反序列化
            ObjectInputStream objectInputStream = new ObjectInputStream(socket.getInputStream());
            Object response = objectInputStream.readObject();

            if (response instanceof Integer) {
                return (Integer) response;
            } else {
                throw new RuntimeException();
            }
        } catch (IOException | ClassNotFoundException e) {
            throw new RuntimeException(e);
        }
    }
}
```

- 调用日志

client 端

```
3
```

server 端

```
Server 端启动：127.0.0.1:12345
Request is: RpcCalculateRequest{one=1, two=2}
```

# 开源地址

为了便于大家学习，以上源码已经开源：

> [https://github.com/houbb/rpc](https://github.com/houbb/rpc)

我是老马，期待与你的下次重逢。


# 参考资料

https://www.jianshu.com/p/5b90a4e70783


* any list
{:toc}