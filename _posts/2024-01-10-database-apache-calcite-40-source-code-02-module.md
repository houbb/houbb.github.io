---
layout: post
title: Apache Calcite 源码分析-02-module 模块介绍
date: 2024-01-10 21:01:55 +0800
categories: [Database]
tags: [database, sql, apache, calcite, sh]
published: true
---

# 源码模块

下面是Apache Calcite源码中各个模块的简要介绍：

1. babel：提供将SQL转换为不同数据库方言的功能，使得Calcite可以支持多种数据库的查询。

2. bom：这个模块定义了一个“Bill of Materials”，用于管理Calcite项目中使用的依赖库的版本。

3. buildSrc：包含构建工具和脚本，用于构建Calcite项目。

4. cassandra：提供与Apache Cassandra数据库的集成支持。

5. core：这是Apache Calcite的核心模块，包含了SQL解析、优化和执行的主要功能。

6. druid：提供与Apache Druid数据库的集成支持。

7. elasticsearch：提供与Elasticsearch的集成支持。

8. example：包含一些使用Calcite的示例代码。

9. file：提供对文件系统的查询支持。

10. geode：提供与Apache Geode数据库的集成支持。

11. gradle：包含Gradle构建脚本，用于构建整个Calcite项目。

12. innodb：提供对InnoDB存储引擎的支持。

13. kafka：提供与Apache Kafka的集成支持。

14. linq4j：提供了用于编写类似LINQ的查询的库。

15. mongodb：提供与MongoDB的集成支持。

16. pig：提供与Apache Pig的集成支持。

17. piglet：提供了一个Pig Latin查询语言的解析器。

18. plus：包含一些额外的功能和扩展，用于增强Calcite的功能。

19. redis：提供与Redis数据库的集成支持。

20. release：包含发布相关的脚本和文档。

21. server：提供了一个Calcite服务器，可以通过网络接口执行查询。

22. site：包含了Calcite项目的网站文档。

23. spark：提供与Apache Spark的集成支持。

24. splunk：提供与Splunk的集成支持。

25. src：包含Calcite项目的源代码。

26. testkit：包含用于测试的工具和实用程序。

27. ubenchmark：包含性能基准测试的代码和工具。

## 简化一下项目？

只保留需要的信息，把其他的东西全部删除掉。






# 源码应该怎么阅读？

直接根据例子，找到核心的类。

## 回归入门回顾

我们看一下 csv 的入门例子：

```java
    public static void main(String[] args) throws Exception {
        // 0.获取csv文件的路径，注意获取到文件所在上层路径就可以了
        String path = "D:\\github\\calcite-learn\\calcite-learn-basic\\src\\main\\resources\\csv\\";

        // 1.构建CsvSchema对象，在Calcite中，不同数据源对应不同Schema，比如CsvSchema、DruidSchema、ElasticsearchSchema等
        CsvSchema csvSchema = new CsvSchema(new File(path), CsvTable.Flavor.SCANNABLE);

        // 2.构建Connection
        // 2.1 设置连接参数
        Properties info = new Properties();
        // 不区分sql大小写
        info.setProperty("caseSensitive", "false");

        // 2.2 获取标准的JDBC Connection
        Connection connection = DriverManager.getConnection("jdbc:calcite:", info);
        // 2.3 获取Calcite封装的Connection
        CalciteConnection calciteConnection = connection.unwrap(CalciteConnection.class);

        // 3.构建RootSchema，在Calcite中，RootSchema是所有数据源schema的parent，多个不同数据源schema可以挂在同一个RootSchema下
        // 以实现查询不同数据源的目的
        SchemaPlus rootSchema = calciteConnection.getRootSchema();

        // 4.将不同数据源schema挂载到RootSchema，这里添加CsvSchema
        rootSchema.add("csv", csvSchema);

        // 5.执行SQL查询，通过SQL方式访问csv文件
        String sql = "select * from csv.depts";
        Statement statement = calciteConnection.createStatement();
        ResultSet resultSet = statement.executeQuery(sql);

        // 6.遍历打印查询结果集
        printResultSet(resultSet);
    }
```

这里面除却属性配置，最主要的就是 CsvSchema/DriverManager


# CsvSchema 源码

## 基本属性

```java
public class CsvSchema extends AbstractSchema {
    private final File directoryFile;
    private final CsvTable.Flavor flavor;
    private Map<String, Table> tableMap;
```

## AbstractSchema 父类

```java
//
// Source code recreated from a .class file by IntelliJ IDEA
// (powered by FernFlower decompiler)
//

package org.apache.calcite.schema.impl;

import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableMultimap;
import com.google.common.collect.Multimap;
import java.util.Collection;
import java.util.Map;
import java.util.Set;
import org.apache.calcite.linq4j.tree.Expression;
import org.apache.calcite.rel.type.RelProtoDataType;
import org.apache.calcite.schema.Function;
import org.apache.calcite.schema.Schema;
import org.apache.calcite.schema.SchemaFactory;
import org.apache.calcite.schema.SchemaPlus;
import org.apache.calcite.schema.SchemaVersion;
import org.apache.calcite.schema.Schemas;
import org.apache.calcite.schema.Table;

public class AbstractSchema implements Schema {
    public AbstractSchema() {
    }

    public boolean isMutable() {
        return true;
    }

    public Schema snapshot(SchemaVersion version) {
        return this;
    }

    public Expression getExpression(SchemaPlus parentSchema, String name) {
        return Schemas.subSchemaExpression(parentSchema, name, this.getClass());
    }

    protected Map<String, Table> getTableMap() {
        return ImmutableMap.of();
    }

    public final Set<String> getTableNames() {
        return this.getTableMap().keySet();
    }

    public final Table getTable(String name) {
        return (Table)this.getTableMap().get(name);
    }

    protected Map<String, RelProtoDataType> getTypeMap() {
        return ImmutableMap.of();
    }

    public RelProtoDataType getType(String name) {
        return (RelProtoDataType)this.getTypeMap().get(name);
    }

    public Set<String> getTypeNames() {
        return this.getTypeMap().keySet();
    }

    protected Multimap<String, Function> getFunctionMultimap() {
        return ImmutableMultimap.of();
    }

    public final Collection<Function> getFunctions(String name) {
        return this.getFunctionMultimap().get(name);
    }

    public final Set<String> getFunctionNames() {
        return this.getFunctionMultimap().keySet();
    }

    protected Map<String, Schema> getSubSchemaMap() {
        return ImmutableMap.of();
    }

    public final Set<String> getSubSchemaNames() {
        return this.getSubSchemaMap().keySet();
    }

    public final Schema getSubSchema(String name) {
        return (Schema)this.getSubSchemaMap().get(name);
    }

    public static class Factory implements SchemaFactory {
        public static final Factory INSTANCE = new Factory();

        private Factory() {
        }

        public Schema create(SchemaPlus parentSchema, String name, Map<String, Object> operand) {
            return new AbstractSchema();
        }
    }
}
```


## 构造器

```java
    public CsvSchema(File directoryFile, CsvTable.Flavor flavor) {
        this.directoryFile = directoryFile;
        this.flavor = flavor;
    }
```

## 简单方法

```java
    private static String trim(String s, String suffix) {
        String trimmed = trimOrNull(s, suffix);
        return trimmed != null ? trimmed : s;
    }

    private static String trimOrNull(String s, String suffix) {
        return s.endsWith(suffix) ? s.substring(0, s.length() - suffix.length()) : null;
    }

    protected Map<String, Table> getTableMap() {
        if (this.tableMap == null) {
            this.tableMap = this.createTableMap();
        }

        return this.tableMap;
    }
```

## 核心方法

```java
    private Map<String, Table> createTableMap() {
        // 文件
        Source baseSource = Sources.of(this.directoryFile);
        File[] files = this.directoryFile.listFiles((dir, name) -> {
            String nameSansGz = trim(name, ".gz");
            return nameSansGz.endsWith(".csv") || nameSansGz.endsWith(".json");
        });
        if (files == null) {
            System.out.println("directory " + this.directoryFile + " not found");
            files = new File[0];
        }


        ImmutableMap.Builder<String, Table> builder = ImmutableMap.builder();
        File[] var4 = files;
        int var5 = files.length;

        for(int var6 = 0; var6 < var5; ++var6) {
            File file = var4[var6];
            Source source = Sources.of(file);
            Source sourceSansGz = source.trim(".gz");
            Source sourceSansJson = sourceSansGz.trimOrNull(".json");
            if (sourceSansJson != null) {
                JsonTable table = new JsonTable(source);
                builder.put(sourceSansJson.relative(baseSource).path(), table);
            } else {
                Source sourceSansCsv = sourceSansGz.trim(".csv");
                Table table = this.createTable(source);
                builder.put(sourceSansCsv.relative(baseSource).path(), table);
            }
        }

        return builder.build();
    }
```

`this.createTable(source)` 方法如下：

```java
    private Table createTable(Source source) {
        switch (this.flavor) {
            case TRANSLATABLE:
                return new CsvTranslatableTable(source, (RelProtoDataType)null);
            case SCANNABLE:
                return new CsvScannableTable(source, (RelProtoDataType)null);
            case FILTERABLE:
                return new CsvFilterableTable(source, (RelProtoDataType)null);
            default:
                throw new AssertionError("Unknown flavor " + this.flavor);
        }
    }
```

这里涉及到如何创建一张表，我们选择 SCANNABLE，对应的实现如下；

```java
public class CsvScannableTable extends CsvTable implements ScannableTable {
    CsvScannableTable(Source source, RelProtoDataType protoRowType) {
        super(source, protoRowType);
    }

    public String toString() {
        return "CsvScannableTable";
    }

    public Enumerable<Object[]> scan(DataContext root) {
        final int[] fields = CsvEnumerator.identityList(this.fieldTypes.size());
        final AtomicBoolean cancelFlag = (AtomicBoolean)Variable.CANCEL_FLAG.get(root);
        return new AbstractEnumerable<Object[]>() {
            public Enumerator<Object[]> enumerator() {
                return new CsvEnumerator(CsvScannableTable.this.source, cancelFlag, false, (String[])null, new CsvEnumerator.ArrayRowConverter(CsvScannableTable.this.fieldTypes, fields));
            }
        };
    }
}
```

## CsvEnumerator

```java
package org.apache.calcite.adapter.csv;

import au.com.bytecode.opencsv.CSVReader;
import java.io.IOException;
import java.io.Reader;
import java.text.ParseException;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.TimeZone;
import java.util.concurrent.atomic.AtomicBoolean;
import org.apache.calcite.adapter.java.JavaTypeFactory;
import org.apache.calcite.linq4j.Enumerator;
import org.apache.calcite.rel.type.RelDataType;
import org.apache.calcite.sql.type.SqlTypeName;
import org.apache.calcite.util.Pair;
import org.apache.calcite.util.Source;
import org.apache.commons.lang3.time.FastDateFormat;

class CsvEnumerator<E> implements Enumerator<E> {
    // 内部属性
    private final CSVReader reader;
    private final String[] filterValues;
    private final AtomicBoolean cancelFlag;
    private final RowConverter<E> rowConverter;
    private E current;
    private static final FastDateFormat TIME_FORMAT_DATE;
    private static final FastDateFormat TIME_FORMAT_TIME;
    private static final FastDateFormat TIME_FORMAT_TIMESTAMP;

    // 构造器
    CsvEnumerator(Source source, AtomicBoolean cancelFlag, List<CsvFieldType> fieldTypes) {
        this(source, cancelFlag, fieldTypes, identityList(fieldTypes.size()));
    }
    CsvEnumerator(Source source, AtomicBoolean cancelFlag, List<CsvFieldType> fieldTypes, int[] fields) {
        this(source, cancelFlag, false, (String[])null, converter(fieldTypes, fields));
    }
    CsvEnumerator(Source source, AtomicBoolean cancelFlag, boolean stream, String[] filterValues, RowConverter<E> rowConverter) {
        this.cancelFlag = cancelFlag;
        this.rowConverter = rowConverter;
        this.filterValues = filterValues;

        try {
            if (stream) {
                this.reader = new CsvStreamReader(source);
            } else {
                this.reader = openCsv(source);
            }

            this.reader.readNext();
        } catch (IOException var7) {
            throw new RuntimeException(var7);
        }
    }


    // 转换方法
    private static RowConverter<?> converter(List<CsvFieldType> fieldTypes, int[] fields) {
        if (fields.length == 1) {
            int field = fields[0];
            return new SingleColumnRowConverter((CsvFieldType)fieldTypes.get(field), field);
        } else {
            return new ArrayRowConverter(fieldTypes, fields);
        }
    }

    // 行类别推断---------------------------------------------------------------------------------------------------
    static RelDataType deduceRowType(JavaTypeFactory typeFactory, Source source, List<CsvFieldType> fieldTypes) {
        return deduceRowType(typeFactory, source, fieldTypes, false);
    }
    static RelDataType deduceRowType(JavaTypeFactory typeFactory, Source source, List<CsvFieldType> fieldTypes, Boolean stream) {
        List<RelDataType> types = new ArrayList();
        List<String> names = new ArrayList();
        if (stream) {
            names.add("ROWTIME");
            types.add(typeFactory.createSqlType(SqlTypeName.TIMESTAMP));
        }

        try {
            CSVReader reader = openCsv(source);
            Throwable var7 = null;

            try {
                String[] strings = reader.readNext();
                if (strings == null) {
                    strings = new String[]{"EmptyFileHasNoColumns:boolean"};
                }

                String[] var9 = strings;
                int var10 = strings.length;

                for(int var11 = 0; var11 < var10; ++var11) {
                    String string = var9[var11];
                    int colon = string.indexOf(58);
                    String name;
                    CsvFieldType fieldType;
                    if (colon >= 0) {
                        name = string.substring(0, colon);
                        String typeString = string.substring(colon + 1);
                        fieldType = CsvFieldType.of(typeString);
                        if (fieldType == null) {
                            System.out.println("WARNING: Found unknown type: " + typeString + " in file: " + source.path() + " for column: " + name + ". Will assume the type of column is string");
                        }
                    } else {
                        name = string;
                        fieldType = null;
                    }

                    RelDataType type;
                    if (fieldType == null) {
                        type = typeFactory.createSqlType(SqlTypeName.VARCHAR);
                    } else {
                        type = fieldType.toType(typeFactory);
                    }

                    names.add(name);
                    types.add(type);
                    if (fieldTypes != null) {
                        fieldTypes.add(fieldType);
                    }
                }
            } catch (Throwable var25) {
                var7 = var25;
                throw var25;
            } finally {
                if (reader != null) {
                    if (var7 != null) {
                        try {
                            reader.close();
                        } catch (Throwable var24) {
                            var7.addSuppressed(var24);
                        }
                    } else {
                        reader.close();
                    }
                }

            }
        } catch (IOException var27) {
        }

        if (names.isEmpty()) {
            names.add("line");
            types.add(typeFactory.createSqlType(SqlTypeName.VARCHAR));
        }

        return typeFactory.createStructType(Pair.zip(names, types));
    }

    public static CSVReader openCsv(Source source) throws IOException {
        Reader fileReader = source.reader();
        return new CSVReader(fileReader);
    }

    public E current() {
        return this.current;
    }

    public boolean moveNext() {
        try {
            label46:
            while(!this.cancelFlag.get()) {
                String[] strings = this.reader.readNext();
                if (strings == null) {
                    if (!(this.reader instanceof CsvStreamReader)) {
                        this.current = null;
                        this.reader.close();
                        return false;
                    }

                    try {
                        Thread.sleep(2000L);
                    } catch (InterruptedException var4) {
                        throw new RuntimeException(var4);
                    }
                } else {
                    if (this.filterValues != null) {
                        for(int i = 0; i < strings.length; ++i) {
                            String filterValue = this.filterValues[i];
                            if (filterValue != null && !filterValue.equals(strings[i])) {
                                continue label46;
                            }
                        }
                    }

                    this.current = this.rowConverter.convertRow(strings);
                    return true;
                }
            }

            return false;
        } catch (IOException var5) {
            throw new RuntimeException(var5);
        }
    }

    public void reset() {
        throw new UnsupportedOperationException();
    }

    public void close() {
        try {
            this.reader.close();
        } catch (IOException var2) {
            throw new RuntimeException("Error closing CSV reader", var2);
        }
    }

    static int[] identityList(int n) {
        int[] integers = new int[n];

        for(int i = 0; i < n; integers[i] = i++) {
        }

        return integers;
    }

    static {
        TimeZone gmt = TimeZone.getTimeZone("GMT");
        TIME_FORMAT_DATE = FastDateFormat.getInstance("yyyy-MM-dd", gmt);
        TIME_FORMAT_TIME = FastDateFormat.getInstance("HH:mm:ss", gmt);
        TIME_FORMAT_TIMESTAMP = FastDateFormat.getInstance("yyyy-MM-dd HH:mm:ss", gmt);
    }

    private static class SingleColumnRowConverter extends RowConverter {
        private final CsvFieldType fieldType;
        private final int fieldIndex;

        private SingleColumnRowConverter(CsvFieldType fieldType, int fieldIndex) {
            this.fieldType = fieldType;
            this.fieldIndex = fieldIndex;
        }

        public Object convertRow(String[] strings) {
            return this.convert(this.fieldType, strings[this.fieldIndex]);
        }
    }

    static class ArrayRowConverter extends RowConverter<Object[]> {
        private final CsvFieldType[] fieldTypes;
        private final int[] fields;
        private final boolean stream;

        ArrayRowConverter(List<CsvFieldType> fieldTypes, int[] fields) {
            this.fieldTypes = (CsvFieldType[])fieldTypes.toArray(new CsvFieldType[0]);
            this.fields = fields;
            this.stream = false;
        }

        ArrayRowConverter(List<CsvFieldType> fieldTypes, int[] fields, boolean stream) {
            this.fieldTypes = (CsvFieldType[])fieldTypes.toArray(new CsvFieldType[0]);
            this.fields = fields;
            this.stream = stream;
        }

        public Object[] convertRow(String[] strings) {
            return this.stream ? this.convertStreamRow(strings) : this.convertNormalRow(strings);
        }

        public Object[] convertNormalRow(String[] strings) {
            Object[] objects = new Object[this.fields.length];

            for(int i = 0; i < this.fields.length; ++i) {
                int field = this.fields[i];
                objects[i] = this.convert(this.fieldTypes[field], strings[field]);
            }

            return objects;
        }

        public Object[] convertStreamRow(String[] strings) {
            Object[] objects = new Object[this.fields.length + 1];
            objects[0] = System.currentTimeMillis();

            for(int i = 0; i < this.fields.length; ++i) {
                int field = this.fields[i];
                objects[i + 1] = this.convert(this.fieldTypes[field], strings[field]);
            }

            return objects;
        }
    }

    abstract static class RowConverter<E> {
        RowConverter() {
        }

        abstract E convertRow(String[] var1);

        // 类别转换
        protected Object convert(CsvFieldType fieldType, String string) {
            if (fieldType == null) {
                return string;
            } else {
                Date date;
                switch (fieldType) {
                    case BOOLEAN:
                        if (string.length() == 0) {
                            return null;
                        }

                        return Boolean.parseBoolean(string);
                    case BYTE:
                        if (string.length() == 0) {
                            return null;
                        }

                        return Byte.parseByte(string);
                    case SHORT:
                        if (string.length() == 0) {
                            return null;
                        }

                        return Short.parseShort(string);
                    case INT:
                        if (string.length() == 0) {
                            return null;
                        }

                        return Integer.parseInt(string);
                    case LONG:
                        if (string.length() == 0) {
                            return null;
                        }

                        return Long.parseLong(string);
                    case FLOAT:
                        if (string.length() == 0) {
                            return null;
                        }

                        return Float.parseFloat(string);
                    case DOUBLE:
                        if (string.length() == 0) {
                            return null;
                        }

                        return Double.parseDouble(string);
                    case DATE:
                        if (string.length() == 0) {
                            return null;
                        } else {
                            try {
                                date = CsvEnumerator.TIME_FORMAT_DATE.parse(string);
                                return (int)(date.getTime() / 86400000L);
                            } catch (ParseException var6) {
                                return null;
                            }
                        }
                    case TIME:
                        if (string.length() == 0) {
                            return null;
                        } else {
                            try {
                                date = CsvEnumerator.TIME_FORMAT_TIME.parse(string);
                                return (int)date.getTime();
                            } catch (ParseException var5) {
                                return null;
                            }
                        }
                    case TIMESTAMP:
                        if (string.length() == 0) {
                            return null;
                        } else {
                            try {
                                date = CsvEnumerator.TIME_FORMAT_TIMESTAMP.parse(string);
                                return date.getTime();
                            } catch (ParseException var4) {
                                return null;
                            }
                        }
                    case STRING:
                    default:
                        return string;
                }
            }
        }
    }
}
```


# 参考资料

https://www.lixin.help/2021/04/11/Calcite-Driver-Register.html

* any list
{:toc}