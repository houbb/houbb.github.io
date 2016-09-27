---
layout: post
title: Freemarker
date:  2016-5-7 17:21:21 +0800
categories: [HTML]
tags: [Freemarker]
published: true
---

* any list
{:toc}

## Freemarker

> [freemarker](http://freemarker.org/)

> [freemarker zh_CN](http://swiftlet.net/archives/category/freemarker)

## Getting Started

<label class="label label-info">Template</label> + <label class="label label-primary">data-model</label> = <label class="label label-success">output</label>

> Template

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <title>Title</title>
    <meta http-equiv="content-type" content="text/html; charset=utf-8">
    <meta http-equiv="x-ua-compatible" content="IE=edge">
    <meta name="renderer" content="webkit">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
</head>
<body>

<h1>Welcome ${user}!</h1>
<p>Our latest product:
    <a href="${latestProduct.url}">${latestProduct.name}</a>!

</body>
</html>
```

> data model

- product class

```java
public class Product {
    private String url;
    private String name;

    public Product(String url, String name) {
        this.url = url;
        this.name = name;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
```

- create html class code

```java
public class Demo {
    public static void main(String[] args) throws Exception {
        Template template = FreemarkerHelper.getTemplate("demo.ftl");

        //map build
        Map<String, Object> root = new HashMap<String, Object>();
        map.put("user", "echo");
        Product product = new Product("www.google.com", "greenhouse");
        map.put("latestProduct", product);

        FileHelper.createFile(template, "demo.html", root);
    }
}
```

There are some utility class as following.

- get path of package web which save ftl and html.

```java
public class PathHelper {
    public static final String LOCAL_WEB_PATH = "/src/main/web/";

    public static String getWebPath() {
        String rootPath = System.getProperty("user.dir");

        return rootPath + LOCAL_WEB_PATH;
    }
}
```

- get freemarker template

<label class="label label-warning">Warning</label>

Do not needlessly re-create Configuration instances; it's expensive, among others because you lose the template cache.
Configuration instances meant to be application-level **singletons**.

```java
public class FreemarkerHelper {
    private FreemarkerHelper() {}
    private static Configuration configuration = null;

    /**
     * define Configuration
     * @return
     * @throws Exception
     */
    public static Configuration getConfiguration() throws Exception {
        if(configuration == null) {
            configuration = new Configuration();
            configuration.setDirectoryForTemplateLoading(new File(PathHelper.getWebPath()));    //path
            configuration.setObjectWrapper(new DefaultObjectWrapper());
        }

        return configuration;
    }

    /**
     * Get template by ftl name under web;
     * @param ftlName
     * @return
     * @throws Exception
     */
    public static Template getTemplate(String ftlName) throws Exception {
        Configuration configuration1 = getConfiguration();
        Template template = configuration1.getTemplate(ftlName, "UTF-8");       //default charset UTF-8

        return template;
    }
}
```

- create file

```java
public class FileHelper {
    /**
     * create html by template, htmlName, and modal map;
     * @param template
     * @param htmlName
     * @param map
     * @throws Exception
     */
    public static void createFile(Template template, String htmlName, Map<String, Object> map) throws Exception {
        File file = new File(PathHelper.getWebPath()+htmlName);
        if (!file.exists()) {
            file.createNewFile();
        }
        Writer out = new BufferedWriter(new FileWriter(file));
        template.process(map, out);
        out.flush();
    }
}
```

> output

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <title>Title</title>
    <meta http-equiv="content-type" content="text/html; charset=utf-8">
    <meta http-equiv="x-ua-compatible" content="IE=edge">
    <meta name="renderer" content="webkit">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
</head>

<body>

<h1>Welcome echo!</h1>
<p>Our latest product:
    <a href="www.google.com">greenhouse</a>!

</body>

</html>
```

## Base directives

> if

With the if directive you can conditionally skip a section of the template.

- we change the ftl like this

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <title>Title</title>
</head>

<body>

    <h1>Welcome ${user}!</h1>

    <#-- Here is the if directive demo -->
    <#if user == "echo">
        echo
    <#elseif user != "hello">
        not hello
    <#else>
        sb. we do not know.
    </#if>

</body>

</html>
```

- output

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <title>Title</title>
</head>

<body>

    <h1>Welcome echo!</h1>

        echo

</body>

</html>
```

> list

The generic form of the list directive is:
```
 <#list sequence as loopVariable>repeatThis</#list>.
```
The repeatThis part will be repeated for each item in the sequence that you have specified with sequence, one after the other,
starting from the first item.

- change the Demo.java like this

```java
public class Demo {
    public static void main(String[] args) throws Exception {
        Template template = FreemarkerHelper.getTemplate("demo.ftl");

        //map build
        Map<String, Object> map = new HashMap<String, Object>();
        List<Product> productList = new LinkedList<Product>();

        Product product = new Product("www.google.com", "greenhouse");
        Product product2 = new Product("www.baidu.com", "bluesky");
        productList.add(product);
        productList.add(product2);
        map.put("productList", productList);

        FileHelper.createFile(template, "demo.html", map);
    }
}
```

- ftl like this

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <title>Title</title>
</head>

<body>

    <#-- Here is the list directive demo -->
    <#list productList as product>
     <a href="${product.url}">${product.name}</a>
    </#list>

</body>

</html>
```

- output

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <title>Title</title>
</head>

<body>

     <a href="www.google.com">greenhouse</a>
     <a href="www.baidu.com">bluesky</a>

</body>

</html>
```

> include

With the include directive you can insert the content of another file into the template.

- +add file copyright_footer.ftl

```html
<i>
    Copyright (c) 2016 <a href="houbb.github.io">Echo</a>,
    <br>
    All Rights Reserved.
</i>
```

- change ftl like this

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <title>Title</title>
</head>

<body>

    <#-- Here is the include directive demo -->
    <#include "copyright_footer.ftl">

</body>

</html>
```

- output

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <title>Title</title>
</head>

<body>

<i>
    Copyright (c) 2016 <a href="houbb.github.io">Echo</a>,
    <br>
    All Rights Reserved.
</i>
</body>

</html>
```

## Using built-ins

> [builtins](http://freemarker.org/docs/ref_builtins.html)

## Missing variables

<label class="label label-warning">missing</label>

A non-existent variable and a variable with null value is the same for FreeMarker, so the "missing" term used here covers both cases.

- what will happen if missing ?

```java
public class Demo {
    public static void main(String[] args) throws Exception {
        Template template = FreemarkerHelper.getTemplate("demo.ftl");

        //map build
        Map<String, Object> map = new HashMap<String, Object>();
        map.put("user", "this is a long name...");

        FileHelper.createFile(template, "demo.html", map);
    }
}
```

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <title>Title</title>
</head>

<body>

    <#-- Here is the missing demo -->
    ${missing}

</body>

</html>
```

result

```
freemarker.core.InvalidReferenceException: Expression missing is undefined on line 10, column 7 in demo.ftl.
...
```

- how to solve this problem?

change the ftl like this

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <title>Title</title>
</head>

<body>

    <#-- Here is the missing demo -->
    ${missing!'default value'}

    <#if missing??>
        ${missing}
    <#else>
        missing
    </#if>

</body>

</html>
```

output

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <title>Title</title>
</head>

<body>

        default value

        missing

</body>

</html>
```