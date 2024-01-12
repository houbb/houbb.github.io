---
layout: post
title: ETL-22-apache SeaTunnel Transform 转换 
date: 2024-01-05 21:01:55 +0800
categories: [ETL]
tags: [etl, sh]
published: true
---

# 贡献转换指南

本文档描述了如何理解、开发和贡献一个转换。

我们还提供了转换端到端测试，以验证转换对数据的输入和输出。

# 概念

使用SeaTunnel，您可以通过连接器读取或写入数据，但如果您需要在读取之后或写入之前处理数据，则需要使用转换。

使用转换对数据行或字段进行简单的编辑，例如拆分字段、更改字段值、添加或删除字段。

## 数据类型转换

转换从上游（源或转换）接收数据类型输入，并将新的数据类型输出到下游（接收器或转换），这个过程称为数据类型转换。

## 例子

### 示例1：移除字段

```
| A         | B         | C         |
|-----------|-----------|-----------|
| STRING    | INT       | BOOLEAN   |

| A         | B         |
|-----------|-----------|
| STRING    | INT       |
```

### Example 2：Sort fields

```
| B         | C         | A         |
|-----------|-----------|-----------|
| INT       | BOOLEAN   | STRING    |

| A         | B         | C         |
|-----------|-----------|-----------|
| STRING    | INT       | BOOLEAN   |
```

### Example 3：Update fields datatype

```
| A         | B         | C         |
|-----------|-----------|-----------|
| STRING    | INT       | BOOLEAN   |


| A         | B         | C         |
|-----------|-----------|-----------|
| STRING    | STRING    | STRING    |
```

### Example 4：Add new fields


```
| A         | B         | C         |
|-----------|-----------|-----------|
| STRING    | INT       | BOOLEAN   |


| A         | B         | C         | D         |
|-----------|-----------|-----------|-----------|
| STRING    | INT       | BOOLEAN   | DOUBLE    |
```


## 数据转换

在数据类型转换后，转换将从上游（源或转换）接收数据行输入，编辑成具有新数据类型的数据行，然后输出到下游（接收器或转换）。这个过程称为数据转换。

## 翻译

转换与执行引擎解耦，任何转换实现都可以在所有引擎上运行而无需更改代码和配置，这需要翻译层来适应转换和执行引擎。

示例：翻译数据类型和数据

```
Original:

| A         | B         | C         |
|-----------|-----------|-----------|
| STRING    | INT       | BOOLEAN   |

Datatype translation:

| A                 | B                 | C                 |
|-------------------|-------------------|-------------------|
| ENGINE<STRING>    | ENGINE<INT>       | ENGINE<BOOLEAN>   |

Data translation:

| A                 | B                 | C                 |
|-------------------|-------------------|-------------------|
| ENGINE<"test">    | ENGINE<1>         |  ENGINE<false>    |
```

# core apis

## SeaTunnelTransform核心API

SeaTunnelTransform提供了所有主要和基本的API，您可以通过继承它来执行任何转换操作。

从上游接收数据类型的输入。

```java
/**
 * 设置输入数据的数据类型信息。
 *
 * @param inputDataType 上游输入的数据类型信息。
 */
void setTypeInfo(SeaTunnelDataType<T> inputDataType);
```
向下游输出新的数据类型。
```java
/**
 * 获取此转换生成的记录的数据类型。
 *
 * @return 生成的数据类型。
 */
SeaTunnelDataType<T> getProducedType();
```
编辑输入数据并将新数据输出到下游。
```java
/**
 * 将输入数据转换为{@link this#getProducedType()}类型的数据。
 *
 * @param row 需要转换的数据。
 * @return 转换后的数据。
 */
T map(T row);
```

## SingleFieldOutputTransform

SingleFieldOutputTransform是一个抽象的单字段更改操作符。

定义输出字段

```java
/**
 * 输出新字段
 *
 * @return
 */
protected abstract String getOutputFieldName();
```
定义输出字段的数据类型
```java
/**
 * 输出新字段的数据类型
 *
 * @return
 */
protected abstract SeaTunnelDataType getOutputFieldDataType();
```
定义输出字段的值
```java
/**
 * 输出新字段的值
 *
 * @param inputRow 上游输入的inputRow。
 * @return
 */
protected abstract Object getOutputFieldValue(SeaTunnelRowAccessor inputRow);
```

## MultipleFieldOutputTransform

MultipleFieldOutputTransform是一个抽象的多字段更改操作符。

定义输出字段

```java
/**
 * 输出新字段
 *
 * @return
 */
protected abstract String[] getOutputFieldNames();
```
定义输出字段的数据类型
```java
/**
 * 输出新字段的数据类型
 *
 * @return
 */
protected abstract SeaTunnelDataType[] getOutputFieldDataTypes();
```
定义输出字段的值
```java
/**
 * 输出新字段的值
 *
 * @param inputRow 上游输入的inputRow。
 * @return
 */
protected abstract Object[] getOutputFieldValues(SeaTunnelRowAccessor inputRow);
```

## AbstractSeaTunnelTransform

AbstractSeaTunnelTransform是一个抽象的数据类型和字段更改操作符。

转换输入行类型并输出新行类型
```java
/**
 * 输出转换后的行类型。
 *
 * @param inputRowType 上游输入的行类型
 * @return
 */
protected abstract SeaTunnelRowType transformRowType(SeaTunnelRowType inputRowType);
```
转换输入行数据并输出新行数据
```java
/**
 * 输出转换后的行数据。
 * 
 * @param inputRow 上游输入的行数据
 * @return
 */
protected abstract SeaTunnelRow transformRow(SeaTunnelRow inputRow);
```

# 开发一个转换

必须实现以下API之一：

- SeaTunnelTransform
- AbstractSeaTunnelTransform
- SingleFieldOutputTransform
- MultipleFieldOutputTransform

将实现的子类添加到`seatunnel-transforms-v2`模块中。

例如：将字段复制到新字段

```java
@AutoService(SeaTunnelTransform.class)
public class CopyFieldTransform extends SingleFieldOutputTransform {

    private String srcField;
    private int srcFieldIndex;
    private SeaTunnelDataType srcFieldDataType;
    private String destField;

    @Override
    public String getPluginName() {
        return "Copy";
    }

    @Override
    protected void setConfig(Config pluginConfig) {
        this.srcField = pluginConfig.getString("src_field");
        this.destField = pluginConfig.getString("dest_fields");
    }

    @Override
    protected void setInputRowType(SeaTunnelRowType inputRowType) {
        srcFieldIndex = inputRowType.indexOf(srcField);
        srcFieldDataType = inputRowType.getFieldType(srcFieldIndex);
    }

    @Override
    protected String getOutputFieldName() {
        return destField;
    }

    @Override
    protected SeaTunnelDataType getOutputFieldDataType() {
        return srcFieldDataType;
    }

    @Override
    protected Object getOutputFieldValue(SeaTunnelRowAccessor inputRow) {
        return inputRow.getField(srcFieldIndex);
    }
}
```

- `getPluginName`方法用于标识转换名称。
- `@AutoService`用于自动生成`META-INF/services/org.apache.seatunnel.api.transform.SeaTunnelTransform`文件。
- `setConfig`方法用于注入用户配置。

# 转换测试工具

一旦添加了新的插件，建议为其添加端到端测试。我们有一个`seatunnel-e2e/seatunnel-transforms-v2-e2e`模块来帮助您执行这项任务。

例如，如果您想为`CopyFieldTransform`添加一个端到端测试，可以在`seatunnel-e2e/seatunnel-transforms-v2-e2e`模块中创建一个新的测试，并在测试中扩展`TestSuiteBase`类。

```java
public class TestCopyFieldTransformIT extends TestSuiteBase {

    @TestTemplate
    public void testCopyFieldTransform(TestContainer container) {
        Container.ExecResult execResult = container.executeJob("/copy_transform.conf");
        Assertions.assertEquals(0, execResult.getExitCode());
    }
}
```

一旦您的测试用例实现了`TestSuiteBase`接口并使用`@TestTemplate`注解启动，它将在所有引擎上运行作业，您只需要使用SeaTunnel配置文件执行`executeJob`方法，它将提交SeaTunnel作业。


# 参考资料

https://seatunnel.apache.org/docs/2.3.3/contribution/contribute-transform-v2-guide

* any list
{:toc}