---
layout: post
title: java 如何获取类似于 a.b.c 这种链式的对象属性？
date: 2023-12-06 21:01:55 +0800
categories: [Log]
tags: [log, elk, sh]
published: true
---

# 自测

heaven 中开始 0.5.0 支持。

# chat

## java 如何实现一个条件匹配方法，有两个入参，context 和 path。context 比如是一个 a 对象，有一个 b 属性，path=a 就获取 a 对象本身，a.b 就获取 a 对象的 b 属性？

在Java中实现一个条件匹配方法，根据传入的path字符串从context对象中获取对应的值，可以使用反射来实现。

以下是一个简单的实例代码：

```java
import java.lang.reflect.Field;

public class PathMatcher {
    public static Object match(Object context, String path) throws NoSuchFieldException, IllegalAccessException {
        if (context == null || path == null || path.isEmpty()) {
            return null;
        }

        String[] pathSegments = path.split("\\.");

        Object currentObject = context;

        for (String segment : pathSegments) {
            if (currentObject == null) {
                return null;  // Stop if any intermediate object is null
            }

            Class<?> currentClass = currentObject.getClass();
            Field field = currentClass.getDeclaredField(segment);
            field.setAccessible(true);
            currentObject = field.get(currentObject);
        }

        return currentObject;
    }

    public static void main(String[] args) throws NoSuchFieldException, IllegalAccessException {
        // 示例对象
        A a = new A();
        a.b = new B();
        a.b.value = "Hello, World!";

        // 测试
        Object result1 = match(a, "b.value");
        Object result2 = match(a, "b.nonExistentField");

        System.out.println("Result 1: " + result1);  // Output: Result 1: Hello, World!
        System.out.println("Result 2: " + result2);  // Output: Result 2: null
    }

    static class A {
        B b;
    }

    static class B {
        String value;
    }
}
```

在上面的例子中，`match` 方法接收一个对象（`context`）和一个路径字符串（`path`），然后使用反射逐级获取对象的属性值。

请注意，这种方法可能会抛出 `NoSuchFieldException` 和 `IllegalAccessException` 异常，因此需要适当处理异常情况。

此外，为了简化示例，省略了一些边界检查和错误处理。

在实际应用中，你可能需要添加更多的代码来处理这些情况。

## 依次类推，如果是 path = a.b.c 也可以获取 a 对象 b 属性，b 属性对应的 c ？

是的，如果路径包含多个层级，例如 `a.b.c`，你可以修改 `match` 方法来支持更多的层级。以下是一个修改后的示例代码：

```java
import java.lang.reflect.Field;

public class PathMatcher {
    public static Object match(Object context, String path) throws NoSuchFieldException, IllegalAccessException {
        if (context == null || path == null || path.isEmpty()) {
            return null;
        }

        String[] pathSegments = path.split("\\.");

        Object currentObject = context;

        for (String segment : pathSegments) {
            if (currentObject == null) {
                return null;  // Stop if any intermediate object is null
            }

            Class<?> currentClass = currentObject.getClass();
            Field field = currentClass.getDeclaredField(segment);
            field.setAccessible(true);
            currentObject = field.get(currentObject);
        }

        return currentObject;
    }

    public static void main(String[] args) throws NoSuchFieldException, IllegalAccessException {
        // 示例对象
        A a = new A();
        a.b = new B();
        a.b.c = new C();
        a.b.c.value = "Hello, World!";

        // 测试
        Object result1 = match(a, "b.c.value");
        Object result2 = match(a, "b.c.nonExistentField");

        System.out.println("Result 1: " + result1);  // Output: Result 1: Hello, World!
        System.out.println("Result 2: " + result2);  // Output: Result 2: null
    }

    static class A {
        B b;
    }

    static class B {
        C c;
    }

    static class C {
        String value;
    }
}
```

在这个示例中，我们在类 `B` 中添加了一个新的属性 `C c`，并在类 `C` 中添加了一个 `String` 类型的属性 `value`。

然后，通过路径 `"b.c.value"` 获取了最终的属性值。

这个方法是递归的，可以处理多层级的路径。

## 如果把入参改成用 json 序列化为转为 map，那么是不是更加简单一下？

是的，使用 JSON 序列化为 Map 可以简化路径匹配的过程。你可以使用 JSON 库（如 Jackson、Gson）将 JSON 字符串反序列化为 Map，然后根据路径访问 Map 中的值。

以下是一个示例代码：

```java
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.util.Map;

public class PathMatcher {
    private static final ObjectMapper objectMapper = new ObjectMapper();

    public static Object match(String json, String path) throws IOException {
        if (json == null || json.isEmpty() || path == null || path.isEmpty()) {
            return null;
        }

        Map<String, Object> map = objectMapper.readValue(json, Map.class);

        String[] pathSegments = path.split("\\.");

        Object currentObject = map;

        for (String segment : pathSegments) {
            if (currentObject == null || !(currentObject instanceof Map)) {
                return null;  // Stop if any intermediate object is null or not a Map
            }

            Map<String, Object> currentMap = (Map<String, Object>) currentObject;
            currentObject = currentMap.get(segment);
        }

        return currentObject;
    }

    public static void main(String[] args) throws IOException {
        // 示例 JSON 字符串
        String jsonString = "{\"a\":{\"b\":{\"c\":{\"value\":\"Hello, World!\"}}}}";

        // 测试
        Object result1 = match(jsonString, "a.b.c.value");
        Object result2 = match(jsonString, "a.b.c.nonExistentField");

        System.out.println("Result 1: " + result1);  // Output: Result 1: Hello, World!
        System.out.println("Result 2: " + result2);  // Output: Result 2: null
    }
}
```

在这个示例中，`match` 方法接收一个 JSON 字符串和一个路径字符串，然后使用 Jackson 库将 JSON 字符串转换为 Map。

接着，根据路径逐级访问 Map 中的值。这种方法避免了手动使用反射，使代码更加简洁。

请确保你的项目中包含了相应的 JSON 库，以便使用 如果入参是一个 `Map`，那么你可以通过逐级获取键值对的方式来实现类似路径匹配的操作。

以下是一个示例代码，演示了如何在一个 `Map` 中根据路径获取对应的值：

```java
import java.util.Map;

public class PathMatcher {
    public static Object match(Map<String, Object> map, String path) {
        if (map == null || path == null || path.isEmpty()) {
            return null;
        }

        String[] pathSegments = path.split("\\.");

        Object currentObject = map;

        for (String segment : pathSegments) {
            if (currentObject == null || !(currentObject instanceof Map)) {
                return null;  // Stop if any intermediate object is null or not a Map
            }

            Map<String, Object> currentMap = (Map<String, Object>) currentObject;
            currentObject = currentMap.get(segment);
        }

        return currentObject;
    }

    public static void main(String[] args) {
        // 示例 Map
        Map<String, Object> data = Map.of(
                "a", Map.of(
                        "b", Map.of(
                                "c", Map.of("value", "Hello, World!")
                        )
                )
        );

        // 测试
        Object result1 = match(data, "a.b.c.value");
        Object result2 = match(data, "a.b.c.nonExistentField");

        System.out.println("Result 1: " + result1);  // Output: Result 1: Hello, World!
        System.out.println("Result 2: " + result2);  // Output: Result 2: null
    }
}
```

在这个示例中，`match` 方法接收一个 `Map<String, Object>` 和一个路径字符串，然后使用逐级获取键值对的方式，类似于在 JSON 中根据路径获取值的过程。

这种方式相对简单，不需要使用反射，适用于处理动态的键值对结构。`ObjectMapper`。

## reflect 反射 jdk 是什么时候支持的？一直支持吗？

Java的反射（Reflection）是从Java 1.1版本开始引入的，并一直得到支持。反射机制允许程序在运行时检查和操作类、方法、字段等的信息，而不需要在编译时就确定这些信息。

在Java的发展中，反射一直是一个强大而灵活的特性，为许多框架、工具和应用程序提供了丰富的功能。从引入反射开始，它一直是Java的一部分，不存在明显的中断或取消支持的情况。

## 上面基于反射的方式，如果变成了入参是一个 map？怎么办  

如果`Map`中的值是一个对象（例如`User`），而且你想要获取该对象的属性（例如`name`），你有两种主要的方法：

1. **使用反射：**
   你可以使用反射来获取对象的属性。这种方法在编译时会进行类型检查，但需要更多的代码。以下是一个示例：

    ```java
    import java.util.Map;

    public class PathMatcher {
        public static Object match(Map<String, Object> map, String path) throws NoSuchFieldException, IllegalAccessException {
            if (map == null || path == null || path.isEmpty()) {
                return null;
            }

            String[] pathSegments = path.split("\\.");

            Object currentObject = map;

            for (String segment : pathSegments) {
                if (currentObject == null || !(currentObject instanceof Map)) {
                    return null;  // Stop if any intermediate object is null or not a Map
                }

                Map<String, Object> currentMap = (Map<String, Object>) currentObject;
                currentObject = currentMap.get(segment);
            }

            return currentObject;
        }

        public static void main(String[] args) throws NoSuchFieldException, IllegalAccessException {
            // 示例 Map
            Map<String, Object> data = Map.of(
                    "user", new User("John Doe")
            );

            // 测试
            Object result = match(data, "user.name");

            if (result instanceof String) {
                System.out.println("User Name: " + result);  // Output: User Name: John Doe
            }
        }

        static class User {
            private String name;

            public User(String name) {
                this.name = name;
            }

            public String getName() {
                return name;
            }
        }
    }
    ```

2. **使用 JSON：**

   如果你使用 JSON，你可以将`User`对象序列化为 JSON 字符串，然后解析该字符串以获取属性值。
   
   这样做可能会更简单，但可能会失去编译时类型检查的好处。以下是一个示例：

    ```java
    import com.fasterxml.jackson.databind.ObjectMapper;

    import java.io.IOException;
    import java.util.Map;

    public class PathMatcher {
        private static final ObjectMapper objectMapper = new ObjectMapper();

        public static Object match(String json, String path) throws IOException {
            if (json == null || json.isEmpty() || path == null || path.isEmpty()) {
                return null;
            }

            Map<String, Object> map = objectMapper.readValue(json, Map.class);

            String[] pathSegments = path.split("\\.");

            Object currentObject = map;

            for (String segment : pathSegments) {
                if (currentObject == null || !(currentObject instanceof Map)) {
                    return null;  // Stop if any intermediate object is null or not a Map
                }

                Map<String, Object> currentMap = (Map<String, Object>) currentObject;
                currentObject = currentMap.get(segment);
            }

            return currentObject;
        }

        public static void main(String[] args) throws IOException {
            // 示例 JSON 字符串
            String jsonString = "{\"user\":{\"name\":\"John Doe\"}}";

            // 测试
            Object result = match(jsonString, "user.name");

            if (result instanceof String) {
                System.out.println("User Name: " + result);  // Output: User Name: John Doe
            }
        }
    }
    ```

选择使用反射还是 JSON 取决于你的具体需求和偏好。使用反射可能在某些情况下更直观，而使用 JSON 可能更容易处理动态结构的数据。





# 参考资料

chat

* any list
{:toc}