---
layout: post
title: SOFARPC 介绍-02-编程界面
date:  2022-07-09 09:22:02 +0800
categories: [SOFA]
tags: [sofa, rpc, sh]
published: true
---


# 非 Spring 环境 API 使用

## 服务发布

服务发布过程涉及到三个类 RegistryConfig ，ServerConfig ，ProviderConfig 。

### 1. RegistryConfig

```java
RegistryConfig registryConfig = new RegistryConfig()
            .setProtocol("zookeeper")
            .setAddress("127.0.0.1:2181")
```

RegistryConfig 表示注册中心。如上声明了服务注册中心的地址和端口是127.0.0.1:2181，协议是 Zookeeper。

### 2. ServerConfig

```java
ServerConfig serverConfig = new ServerConfig()
            .setPort(8803)
            .setProtocol("bolt");
```

ServerConfig 表示服务运行容器。如上声明了一个使用8803端口和 bolt 协议的 server 。

### 3. ProviderConfig

```java
ProviderConfig<HelloWorldService> providerConfig = new ProviderConfig<HelloWorldService>()
            .setInterfaceId(HelloWorldService.class.getName())    
            .setRef(new HelloWorldServiceImpl())    
            .setServer(serverConfig)  
            .setRegistry(registryConfig);
providerConfig.export();
```

ProviderConfig 表示服务发布。如上声明了服务的接口，实现和该服务运行的 server 。 最终通过 export 方法将这个服务发布出去了。

## 服务引用

服务引用涉及到两个类， RegistryConfig 和 ConsumerConfig 。

```java
ConsumerConfig<HelloService> consumerConfig = new ConsumerConfig<HelloService>()
            .setInterfaceId(HelloService.class.getName())       
            .setRegistry(registryConfig);
HelloService helloService = consumerConfig.refer();
```

ConsumerConfig 表示服务引用，如上声明了所引用服务的接口和服务注册中心。 

最终通过 refer 方法将这个服务引用，获取到该服务的远程调用的代理。

# SOFABoot 环境 XML 配置使用

在xml方式中发布和引用服务的方式如下。 

sofa:service 元素表示发布服务， sofa:reference 元素表示引用服务。 

sofa:binding 表示服务发布或引用的协议。

```xml
<bean id="personServiceImpl" class="com.alipay.sofa.boot.examples.demo.rpc.bean.PersonServiceImpl"/>
<sofa:service ref="personServiceImpl" interface="com.alipay.sofa.boot.examples.demo.rpc.bean.PersonService">
    <sofa:binding.bolt/>
</sofa:service>
```

一个服务也可以通过多种协议进行发布，如下：

```xml
<sofa:service ref="personServiceImpl" interface="com.alipay.sofa.boot.examples.demo.rpc.bean.PersonService">
    <sofa:binding.bolt/>
    <sofa:binding.rest/>
    <sofa:binding.dubbo/>
</sofa:service>
```

服务引用

```xml
<sofa:reference id="personReferenceBolt" interface="com.alipay.sofa.boot.examples.demo.rpc.bean.PersonService">
     <sofa:binding.bolt/>
</sofa:reference>
```

也可以是其他的协议

```xml
<sofa:reference id="personReferenceRest" interface="com.alipay.sofa.boot.examples.demo.rpc.bean.PersonService">
     <sofa:binding.rest/>
</sofa:reference>
```

# SOFABoot 环境注解使用

## 注解服务发布与服务引用

除了常规的 xml 方式发布服务外,我们也支持在SOFABoot 环境下,注解方式的发布与引用,同 xml 类似,我们有 `@SofaService` 和 `@SofaReference`,同时对于多协议,存在 `@SofaServiceBinding` 和 `@SofaReferenceBinding` 注解

### 服务发布

如果要发布一个 RPC 服务. 我们只需要在 Bean 上面打上@SofaService注解.指定接口和协议类型即可

```java
@SofaService(interfaceType = AnnotationService.class, bindings = { @SofaServiceBinding(bindingType = "bolt") })
@Component
public class AnnotationServiceImpl implements AnnotationService {
    @Override
    public String sayAnnotation(String stirng) {
        return stirng;
    }
}
```

### 服务引用

对于需要引用远程服务的 bean, 只需要在属性,或者方法上,打上Reference 的注解即可，支持 bolt, dubbo, rest 协议。

```java
@Component
public class AnnotationClientImpl {

    @SofaReference(interfaceType = AnnotationService.class, binding = @SofaReferenceBinding(bindingType = "bolt"))
    private AnnotationService annotationService;

    public String sayClientAnnotation(String str) {

        String result = annotationService.sayAnnotation(str);

        return result;
    }
}
```

# SOFABoot 环境动态 API 使用

SOFABoot 为 RPC 服务的发布和引用提供了一套编程 API 方式，方便直接在代码中发布和引用 RPC 服务，与 Spring 的 ApplicationContextAware 类似，为使用编程 API 方式，首先需要实现 ClientFactoryAware 接口获取编程组件 API：

```java
public class ClientFactoryBean implements ClientFactoryAware {
    private ClientFactory clientFactory;

    @Override
    public void setClientFactory(ClientFactory clientFactory) {
        this.clientFactory = clientFactory;
    }
}
```

以 DirectService 为例，看下如何使用 clientFactory 通过编程 API 方式发布 RPC 服务：

```java
ServiceClient serviceClient = clientFactory.getClient(ServiceClient.class);

ServiceParam serviceParam = new ServiceParam();
serviceParam.setInterfaceType(DirectService.class);
serviceParam.setInstance(new DirectServiceImpl());

List<BindingParam> params = new ArrayList<BindingParam>();
BindingParam serviceBindingParam = new BoltBindingParam();
params.add(serviceBindingParam);
serviceParam.setBindingParams(params);

serviceClient.service(serviceParam);
```

上面的代码中

1. 首先通过 clientFactory 获得 ServiceClient 对象

2. 然后构造 ServiceParam 对象，ServiceParam 对象包含发布服务所需参数，通过 setInstance 方法来设置需要被发布成 RPC 服务的对象，setInterfaceType 来设置服务的接口

3. 最后，调用 ServiceClient 的 service 方法，发布一个 RPC 服务

通过编程 API 方式引用 RPC 服务的代码也是类似的：

```java
ReferenceClient referenceClient = clientFactory.getClient(ReferenceClient.class);
ReferenceParam<DirectService> referenceParam = new ReferenceParam<DirectService>();
referenceParam.setInterfaceType(DirectService.class);

BindingParam refBindingParam = new BoltBindingParam();
referenceParam.setBindingParam(refBindingParam);

DirectService proxy = referenceClient.reference(referenceParam);
proxy.sayDirect("hello");
```

同样，引用一个 RPC 服务只需从 ClientFactory 中获取一个 ReferenceClient ，然后和发布一个服务类似，构造出一个 ReferenceParam，然后设置好服务的接口，最后调用 ReferenceClient 的 reference 方法即可。

# 参考资料

https://www.sofastack.tech/projects/sofa-rpc/programing-rpc/

* any list
{:toc}