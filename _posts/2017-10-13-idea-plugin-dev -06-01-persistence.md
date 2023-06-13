---
layout: post
title:  Idea Plugin Dev-06-01-persistence
date:  2017-10-13 10:24:52 +0800
categories: [Java]
tags: [java, idea, idea-plugin]
published: true
---

# Persistence Model

IntelliJ 平台持久性模型用于存储各种信息。 

例如，运行配置和设置是使用持久性模型存储的。

根据持久化数据的类型，有两种不同的方法：

组件的持久化状态

保留敏感数据

# Persisting State of Components

IntelliJ 平台提供了一个 API，允许组件或服务在 IDE 重启之间保持它们的状态。 

您可以使用简单的 API 来保留一些值，也可以使用 PersistentStateComponent 接口来保留更复杂的组件的状态。

## 介绍一下 idea 插件中的 Persisting State of Components

在 IntelliJ IDEA 插件开发中，可以使用 `com.intellij.openapi.components.PersistentStateComponent` 接口来实现组件的持久化状态。

这个接口允许您在插件启动期间将组件的状态保存到持久化存储中，并在插件重新加载时将其恢复。

要使用 `PersistentStateComponent` 接口，可以按照以下步骤进行操作：

1. 创建一个新的类，实现 `PersistentStateComponent` 接口，并指定要持久化的组件的状态类型。

例如，创建一个名为 `MyPluginState` 的类，并将其状态类型设置为 `MyPluginState`。

```java
import com.intellij.openapi.components.PersistentStateComponent;
import com.intellij.openapi.components.State;
import com.intellij.openapi.components.Storage;
import com.intellij.openapi.components.StoragePathMacros;
import com.intellij.util.xmlb.XmlSerializerUtil;
import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;

@State(name = "MyPluginState", storages = {@Storage(StoragePathMacros.WORKSPACE_FILE)})
public class MyPluginState implements PersistentStateComponent<MyPluginState> {

    public String myProperty;

    @Nullable
    @Override
    public MyPluginState getState() {
        return this;
    }

    @Override
    public void loadState(@NotNull MyPluginState state) {
        XmlSerializerUtil.copyBean(state, this);
    }
}
```

在上述代码中，`@State` 注解用于指定组件的状态名称和存储位置。`@Storage` 注解指定了存储的类型，这里使用 `StoragePathMacros.WORKSPACE_FILE` 表示将状态保存在工作区文件中。`myProperty` 是要持久化的组件的一个属性。

2. 在插件的 `plugin.xml` 文件中注册该状态组件。

```xml
<application-components>
    <component>
        <implementation-class>MyPluginState</implementation-class>
    </component>
</application-components>
```

在上述代码中，`<implementation-class>` 元素指定了要注册的组件实现类。

3. 在插件中使用状态组件。

```java
MyPluginState state = ServiceManager.getService(MyPluginState.class);
String property = state.myProperty;
// 使用组件的状态
```

在上述代码中，通过 `ServiceManager.getService()` 方法获取状态组件的实例，然后可以访问组件的状态属性。

通过实现 `PersistentStateComponent` 接口，您可以在 IntelliJ IDEA 插件中实现组件的持久化状态。

这使得您可以将组件的属性保存到插件的配置文件中，从而在插件重新加载时恢复它们。这对于需要保留用户设置、配置和其他状态的插件非常有用。

请注意，状态组件的属性应该是可序列化的，并且可以通过 `XmlSerializerUtil` 类进行序列化和反序列化。确保组件的状态类正确实现了序列化接口和方法，以便在保存和加载状态时正确处理属性。

希望这个介绍能够帮助您理解在 IntelliJ IDEA 插件中如何持久化组件的状态。

# Persisting Sensitive Data

## 用法

```java
private CredentialAttributes createCredentialAttributes(String key) {
  return new CredentialAttributes(
    CredentialAttributesKt.generateServiceName("MySystem", key)
  );
}
```

### Retrieve Stored Credentials

```java
String key = null; // e.g. serverURL, accountID
CredentialAttributes credentialAttributes = createCredentialAttributes(key);

Credentials credentials = PasswordSafe.getInstance().get(credentialAttributes);
if (credentials != null) {
  String password = credentials.getPasswordAsString();
}

// or get password only
String password = PasswordSafe.getInstance().getPassword(credentialAttributes);
```

### Store Credentials

```java
CredentialAttributes credentialAttributes =
    createCredentialAttributes(serverId); // see previous sample
Credentials credentials = new Credentials(username, password);
PasswordSafe.getInstance().set(credentialAttributes, credentials);
```

# 参考资料

https://plugins.jetbrains.com/docs/intellij/persistence.html

* any list
{:toc}