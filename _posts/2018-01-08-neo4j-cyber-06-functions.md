---
layout: post
title:  Neo4j-Cypher-06-functions
date:  2018-1-8 14:18:33 +0800
categories: [SQL]
tags: [nosql, neo4j]
published: true
---

# 函数

本节包含了Cypher®查询语言中的所有函数信息。

- 谓词函数 [概要|详细]
- 标量函数 [概要|详细]
- 聚合函数 [概要|详细]
- 列表函数 [概要|详细]
- 数学函数 - 数值 [概要|详细]
- 数学函数 - 对数 [概要|详细]
- 数学函数 - 三角 [概要|详细]
- 字符串函数 [概要|详细]
- 时间函数 - 瞬时类型 [概要|详细]
- 时间函数 - 时长 [概要|详细]
- 空间函数 [概要|详细]
- LOAD CSV函数 [概要|详细]
- 图函数 [概要|详细]
- 数据库函数 [概要|详细]（自5.12版起引入）
- 用户定义函数 [概要|详细]

相关信息可以在运算符中找到。

在Cypher中，如果输入参数为null，函数将返回null。

接受字符串作为输入的函数都是在Unicode字符上操作，而不是在标准char[]上操作。

例如，对任何Unicode字符应用的size()函数将返回1，即使该字符不适合一个char的16位。 

# 谓词函数

当然可以，请看下面的表格：

| 函数      | 签名                                                        | 描述                                                             |
| --------- | ----------------------------------------------------------- | ---------------------------------------------------------------- |
| **all()** | `all(variable :: VARIABLE IN list :: LIST<ANY> WHERE predicate :: ANY) :: BOOLEAN` | 如果给定的LIST<ANY>中的所有元素都满足predicate条件，则返回true。           |
| **any()** | `any(variable :: VARIABLE IN list :: LIST<ANY> WHERE predicate :: ANY) :: BOOLEAN` | 如果给定的LIST<ANY>中至少有一个元素满足predicate条件，则返回true。         |
| **exists()** | `exists(input :: ANY) :: BOOLEAN`                           | 如果图中存在与模式匹配的项，则返回true。                                   |
| **isEmpty()** | `isEmpty(input :: LIST<ANY>) :: BOOLEAN`                    | 检查LIST<ANY>是否为空。                                                |
|            | `isEmpty(input :: MAP) :: BOOLEAN`                         | 检查MAP是否为空。                                                     |
|            | `isEmpty(input :: STRING) :: BOOLEAN`                      | 检查STRING是否为空。                                                  |
| **none()** | `none(variable :: VARIABLE IN list :: LIST<ANY> WHERE predicate :: ANY) :: BOOLEAN` | 如果给定的LIST<ANY>中没有元素满足predicate条件，则返回true。           |
| **single()** | `single(variable :: VARIABLE IN list :: LIST<ANY> WHERE predicate :: ANY) :: BOOLEAN` | 如果给定的LIST<ANY>中恰好有一个元素满足predicate条件，则返回true。      |

请注意，这里的签名和描述仅供参考，具体用法和语法还需要查阅官方文档以确保准确性。

# Scalar函数

以下是Scalar函数的一些常用函数，包括它们的签名和描述：

| 函数                | 签名                                                         | 描述                                                         |
| ------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| **char_length()**   | `char_length(input :: STRING) :: INTEGER`                     | 返回字符串中的Unicode字符数。                                 |
| **coalesce()**      | `coalesce(input :: ANY) :: ANY`                               | 返回表达式列表中第一个非空值。                                 |
| **endNode()**       | `endNode(input :: RELATIONSHIP) :: NODE`                      | 返回关系的结束节点。                                          |
| **head()**          | `head(list :: LIST<ANY>) :: ANY`                              | 返回LIST<ANY>中的第一个元素。                                 |
| **id()**            | `id(input :: RELATIONSHIP) :: INTEGER` (已弃用，替代为elementId()) | 返回关系的ID。                                                |
| **length()**        | `length(input :: PATH) :: INTEGER`                            | 返回路径的长度。                                               |
| **properties()**    | `properties(input :: NODE) :: MAP`                            | 返回节点的所有属性。                                         |
| **randomUUID()**    | `randomUUID() :: STRING`                                      | 生成一个随机UUID。                                            |
| **size()**          | `size(input :: LIST<ANY>) :: INTEGER`                         | 返回LIST<ANY>中的项目数。                                     |
| **startNode()**     | `startNode(input :: RELATIONSHIP) :: NODE`                   | 返回关系的起始节点。                                          |
| **toBoolean()**     | `toBoolean(input :: STRING) :: BOOLEAN`                       | 将字符串值转换为布尔值。                                      |
| **toFloat()**       | `toFloat(input :: INTEGER | FLOAT) :: FLOAT`                  | 将整数值转换为浮点数值。                                      |
| **toInteger()**     | `toInteger(input :: INTEGER | FLOAT) :: INTEGER`              | 将浮点数值转换为整数值。                                      |
| **type()**          | `type(input :: RELATIONSHIP) :: STRING`                       | 返回RELATIONSHIP的类型。                                       |
| **valueType()**     | `valueType(input :: ANY?) :: (STRING?)`                       | 返回给定表达式的最精确值类型的字符串表示。                     |

请注意，这里的签名和描述仅供参考，具体用法和语法还需要查阅官方文档以确保准确性。

# 聚合函数

以下是聚合函数的一些常用函数，包括它们的签名和描述：

| 函数                | 签名                                                         | 描述                                                         |
| ------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| **avg()**           | `avg(input :: DURATION) :: DURATION`                          | 返回一组DURATION值的平均值。                                   |
| **avg()**           | `avg(input :: FLOAT) :: FLOAT`                                | 返回一组FLOAT值的平均值。                                      |
| **avg()**           | `avg(input :: INTEGER) :: INTEGER`                            | 返回一组INTEGER值的平均值。                                    |
| **collect()**       | `collect(input :: ANY) :: LIST<ANY>`                          | 返回包含由表达式返回的值的列表。                               |
| **count()**         | `count(input :: ANY) :: INTEGER`                              | 返回值或行的数量。                                             |
| **max()**           | `max(input :: ANY) :: ANY`                                    | 返回一组值中的最大值。                                         |
| **min()**           | `min(input :: ANY) :: ANY`                                    | 返回一组值中的最小值。                                         |
| **percentileCont()**| `percentileCont(input :: FLOAT, percentile :: FLOAT) :: FLOAT` | 使用线性插值，返回一组值中给定百分位数的百分位数。              |
| **percentileDisc()**| `percentileDisc(input :: FLOAT, percentile :: FLOAT) :: FLOAT` | 使用四舍五入法，返回一组值中最接近给定百分位数的FLOAT值。         |
| **percentileDisc()**| `percentileDisc(input :: INTEGER, percentile :: FLOAT) :: INTEGER` | 使用四舍五入法，返回一组值中最接近给定百分位数的INTEGER值。       |
| **stdev()**         | `stdev(input :: FLOAT) :: FLOAT`                              | 返回样本总体的给定值在组内的标准差。                           |
| **stdevp()**        | `stdevp(input :: FLOAT) :: FLOAT`                             | 返回整个总体的给定值在组内的标准差。                           |
| **sum()**           | `sum(input :: DURATION) :: DURATION`                          | 返回一组DURATION值的总和。                                     |
| **sum()**           | `sum(input :: FLOAT) :: FLOAT`                                | 返回一组FLOAT值的总和。                                        |
| **sum()**           | `sum(input :: INTEGER) :: INTEGER`                            | 返回一组INTEGER值的总和。                                      |

请注意，这里的签名和描述仅供参考，具体用法和语法还需要查阅官方文档以确保准确性。

# 列表函数

以下是一些常用的列表函数，包括它们的签名和描述：

| 函数                | 签名                                                     | 描述                                                         |
| ------------------- | -------------------------------------------------------- | ------------------------------------------------------------ |
| **keys()**          | `keys(input :: MAP) :: LIST<STRING>`                      | 返回MAP中所有属性名称的STRING表示形式的LIST。                 |
| **keys()**          | `keys(input :: NODE) :: LIST<STRING>`                     | 返回NODE中所有属性名称的STRING表示形式的LIST。                |
| **keys()**          | `keys(input :: RELATIONSHIP) :: LIST<STRING>`             | 返回RELATIONSHIP中所有属性名称的STRING表示形式的LIST。        |
| **labels()**        | `labels(input :: NODE) :: LIST<STRING>`                   | 返回NODE的所有标签的STRING表示形式的LIST。                    |
| **nodes()**         | `nodes(input :: PATH) :: LIST<NODE>`                      | 返回PATH中所有NODE值的LIST。                                   |
| **range()**         | `range(start :: INTEGER, end :: INTEGER) :: LIST<INTEGER>`| 返回指定范围内所有INTEGER值的LIST。                            |
| **range()**         | `range(start :: INTEGER, end :: INTEGER, step :: INTEGER) :: LIST<INTEGER>` | 返回指定范围内以指定步长创建的所有INTEGER值的LIST。 |
| **reduce()**        | `reduce(accumulator :: VARIABLE = initial :: ANY, variable :: VARIABLE IN list :: LIST<ANY> | expression :: ANY) :: ANY` | 对LIST<ANY>的各个元素运行一个表达式，将表达式的结果存储在累加器中。 |
| **relationships()** | `relationships(input :: PATH) :: LIST<RELATIONSHIP>`      | 返回PATH中所有RELATIONSHIP值的LIST。                         |
| **reverse()**       | `reverse(input :: LIST<ANY>) :: LIST<ANY>`                | 返回将给定LIST<ANY>中所有元素顺序反转的LIST<ANY>。           |
| **tail()**          | `tail(input :: LIST<ANY>) :: LIST<ANY>`                   | 返回LIST<ANY>中除了第一个元素之外的所有元素。                 |
| **toBooleanList()** | `toBooleanList(input :: LIST<ANY>) :: LIST<BOOLEAN>`       | 将值的LIST<ANY>转换为BOOLEAN值的LIST<BOOLEAN>。如果任何值无法转换为BOOLEAN，则在返回的LIST<BOOLEAN>中它们将为null。 |
| **toFloatList()**   | `toFloatList(input :: LIST<ANY>) :: LIST<FLOAT>`          | 将LIST<ANY>转换为FLOAT值的LIST<FLOAT>。如果任何值无法转换为FLOAT，则在返回的LIST<FLOAT>中它们将为null。 |
| **toIntegerList()** | `toIntegerList(input :: LIST<ANY>) :: LIST<INTEGER>`       | 将LIST<ANY>转换为INTEGER值的LIST<INTEGER>。如果任何值无法转换为INTEGER，则在返回的LIST<INTEGER>中它们将为null。 |
| **toStringList()**  | `toStringList(input :: LIST<ANY>) :: LIST<STRING>`        | 将LIST<ANY>转换为STRING值的LIST<STRING>。如果任何值无法转换为STRING，则在返回的LIST<STRING>中它们将为null。 |

请注意，这里的签名和描述仅供参考，具体用法和语法还需要查阅官方文档以确保准确性。

# 数值函数

以下是一些常用的数值函数，包括它们的签名和描述：

| 函数         | 签名                                                   | 描述                                                                                           |
| ------------ | ------------------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| **abs()**    | `abs(input :: FLOAT) :: FLOAT`                         | 返回一个FLOAT的绝对值。                                                                         |
| **abs()**    | `abs(input :: INTEGER) :: INTEGER`                     | 返回一个INTEGER的绝对值。                                                                       |
| **ceil()**   | `ceil(input :: FLOAT) :: FLOAT`                        | 返回大于或等于给定数字的最小FLOAT且为INTEGER。                                                    |
| **floor()**  | `floor(input :: FLOAT) :: FLOAT`                       | 返回小于或等于给定数字的最大FLOAT且为INTEGER。                                                    |
| **isNaN()**  | `isNaN(input :: FLOAT) :: BOOLEAN`                     | 如果浮点数是NaN则返回true。                                                                      |
| **isNaN()**  | `isNaN(input :: INTEGER) :: BOOLEAN`                   | 如果整数是NaN则返回true。                                                                      |
| **rand()**   | `rand() :: FLOAT`                                      | 返回范围从0（包含）到1（不包含）的随机FLOAT。                                                     |
| **round()**  | `round(input :: FLOAT) :: FLOAT`                       | 返回一个数四舍五入到最近的整数。                                                               |
| **round()**  | `round(value :: FLOAT, precision :: INTEGER | FLOAT) :: FLOAT` | 返回一个数根据指定的精度使用HALF_UP舍入模式四舍五入到指定的精度。 |
| **round()**  | `round(value :: FLOAT, precision :: INTEGER | FLOAT, mode :: STRING) :: FLOAT` | 返回一个数根据指定的精度和指定的舍入模式四舍五入到指定的精度。 |
| **sign()**   | `sign(input :: FLOAT) :: INTEGER`                     | 返回FLOAT的符号：如果数字是0，则为0；如果是负数，则为-1；如果是正数，则为1。                  |
| **sign()**   | `sign(input :: INTEGER) :: INTEGER`                   | 返回INTEGER的符号：如果数字是0，则为0；如果是负数，则为-1；如果是正数，则为1。                |

请注意，这里的签名和描述仅供参考，具体用法和语法还需要查阅官方文档以确保准确性。

# Logarithmic functions

以下是一些常用的对数函数，包括它们的签名和描述：

| 函数           | 签名                         | 描述                                             |
| -------------- | ---------------------------- | ------------------------------------------------ |
| **e()**        | `e() :: FLOAT`               | 返回自然对数的底数e。                             |
| **exp()**      | `exp(input :: FLOAT) :: FLOAT` | 返回en，其中e是自然对数的底数，n是参数表达式的值。 |
| **log()**      | `log(input :: FLOAT) :: FLOAT` | 返回一个FLOAT的自然对数。                         |
| **log10()**    | `log10(input :: FLOAT) :: FLOAT` | 返回一个FLOAT的常用对数（以10为底）。             |
| **sqrt()**     | `sqrt(input :: FLOAT) :: FLOAT` | 返回一个FLOAT的平方根。                           |

请注意，这些函数仅适用于数值表达式，并且如果用于其他值将返回错误。 具体用法和语法还需要查阅官方文档以确保准确性。

# Trigonometric functions 三角函数

以下是一些常用的三角函数，包括它们的签名和描述：

| 函数           | 签名                              | 描述                                          |
| -------------- | --------------------------------- | --------------------------------------------- |
| **acos()**     | `acos(input :: FLOAT) :: FLOAT`    | 返回FLOAT的反余弦值（弧度制）。               |
| **asin()**     | `asin(input :: FLOAT) :: FLOAT`    | 返回FLOAT的反正弦值（弧度制）。               |
| **atan()**     | `atan(input :: FLOAT) :: FLOAT`    | 返回FLOAT的反正切值（弧度制）。               |
| **atan2()**    | `atan2(y :: FLOAT, x :: FLOAT) :: FLOAT` | 返回一组坐标的反正切值（弧度制）。       |
| **cos()**      | `cos(input :: FLOAT) :: FLOAT`     | 返回FLOAT的余弦值。                           |
| **cot()**      | `cot(input :: FLOAT) :: FLOAT`     | 返回FLOAT的余切值。                           |
| **degrees()**  | `degrees(input :: FLOAT) :: FLOAT` | 将弧度转换为度。                             |
| **haversin()** | `haversin(input :: FLOAT) :: FLOAT`| 返回数字的一半的versine值。                   |
| **pi()**       | `pi() :: FLOAT`                    | 返回数学常数π。                              |
| **radians()**  | `radians(input :: FLOAT) :: FLOAT` | 将度数转换为弧度。                           |
| **sin()**      | `sin(input :: FLOAT) :: FLOAT`     | 返回FLOAT的正弦值。                           |
| **tan()**      | `tan(input :: FLOAT) :: FLOAT`     | 返回FLOAT的正切值。                           |

请注意，这些函数仅适用于数值表达式，并且如果用于其他值将返回错误。 所有的三角函数都是基于弧度制进行计算的，除非另有指定。


# 字符串函数

以下是一些常用的字符串函数，包括它们的签名和描述：

| 函数               | 签名                                                        | 描述                                                                         |
| ------------------ | ----------------------------------------------------------- | ---------------------------------------------------------------------------- |
| **left()**         | `left(original :: STRING, length :: INTEGER) :: STRING`     | 返回给定STRING中指定数量（INTEGER）的左侧字符组成的STRING。                  |
| **ltrim()**        | `ltrim(input :: STRING) :: STRING`                          | 返回去除了前导空格的给定STRING。                                              |
| **replace()**      | `replace(original :: STRING, search :: STRING, replace :: STRING) :: STRING` | 返回一个STRING，其中给定STRING中所有出现的指定search STRING已被另一个（指定的）replace STRING替换。 |
| **reverse()**      | `reverse(input :: STRING) :: STRING`                        | 返回一个STRING，其中给定STRING中所有字符的顺序已被颠倒。                     |
| **right()**        | `right(original :: STRING, length :: INTEGER) :: STRING`    | 返回给定STRING中指定数量的右侧字符组成的STRING。                             |
| **rtrim()**        | `rtrim(input :: STRING) :: STRING`                          | 返回去除了尾随空格的给定STRING。                                              |
| **split()**        | `split(original :: STRING, splitDelimiter :: STRING) :: LIST<STRING>` | 返回一个由给定STRING在指定分隔符的匹配项周围分割而成的LIST<STRING>。 |
| **substring()**    | `substring(original :: STRING, start :: INTEGER) :: STRING` | 返回给定STRING的一个子字符串，从基于0的索引start开始。                       |
| **toLower()**      | `toLower(input :: STRING) :: STRING`                        | 返回给定STRING的小写形式。                                                   |
| **toString()**     | `toString(input :: ANY) :: STRING`                           | 将INTEGER、FLOAT、BOOLEAN、POINT或时间类型（即DATE、ZONED TIME、LOCAL TIME、ZONED DATETIME、LOCAL DATETIME或DURATION）值转换为STRING。 |
| **toUpper()**      | `toUpper(input :: STRING) :: STRING`                        | 返回给定STRING的大写形式。                                                   |
| **trim()**         | `trim(input :: STRING) :: STRING`                           | 返回去除了前导和尾随空格的给定STRING。                                        |

请注意，这些函数用于操作字符串或将其他值转换为字符串表示。

# 时间函数

当然可以，以下是与时间相关的函数列表，使用表格的方式呈现：

| 函数                  | 签名                                                     | 描述                                                         |
| --------------------- | -------------------------------------------------------- | ------------------------------------------------------------ |
| **date()**            | `date(input = DEFAULT_TEMPORAL_ARGUMENT :: ANY) :: DATE` | 创建一个 DATE 实例。                                        |
| **date.realtime()**   | `date.realtime(timezone = DEFAULT_TEMPORAL_ARGUMENT :: ANY) :: DATE` | 使用实时时钟返回当前 DATE 实例。                         |
| **date.statement()**  | `date.statement(timezone = DEFAULT_TEMPORAL_ARGUMENT :: ANY) :: DATE` | 使用语句时钟返回当前 DATE 实例。                         |
| **date.transaction()**| `date.transaction(timezone = DEFAULT_TEMPORAL_ARGUMENT :: ANY) :: DATE` | 使用事务时钟返回当前 DATE 实例。                         |
| **date.truncate()**   | `date.truncate(unit :: STRING, input = DEFAULT_TEMPORAL_ARGUMENT :: ANY, fields = null :: MAP) :: DATE` | 使用指定单位将给定的时间值截断为 DATE 实例。 |
| **datetime()**        | `datetime(input = DEFAULT_TEMPORAL_ARGUMENT :: ANY) :: ZONED DATETIME` | 创建一个 ZONED DATETIME 实例。                             |
| **datetime.fromepoch()** | `datetime.fromepoch(seconds :: INTEGER | FLOAT, nanoseconds :: INTEGER | FLOAT) :: ZONED DATETIME` | 给定自纪元开始的秒数和纳秒数，创建一个 ZONED DATETIME。 |
| **datetime.fromepochmillis()** | `datetime.fromepochmillis(milliseconds :: INTEGER | FLOAT) :: ZONED DATETIME` | 给定自纪元开始的毫秒数，创建一个 ZONED DATETIME。 |
| **datetime.realtime()**| `datetime.realtime(timezone = DEFAULT_TEMPORAL_ARGUMENT :: ANY) :: ZONED DATETIME` | 使用实时时钟返回当前 ZONED DATETIME 实例。             |
| **datetime.statement()** | `datetime.statement(timezone = DEFAULT_TEMPORAL_ARGUMENT :: ANY) :: ZONED DATETIME` | 使用语句时钟返回当前 ZONED DATETIME 实例。             |
| **datetime.transaction()**| `datetime.transaction(timezone = DEFAULT_TEMPORAL_ARGUMENT :: ANY) :: ZONED DATETIME` | 使用事务时钟返回当前 ZONED DATETIME 实例。             |
| **datetime.truncate()**| `datetime.truncate(unit :: STRING, input = DEFAULT_TEMPORAL_ARGUMENT :: ANY, fields = null :: MAP) :: ZONED DATETIME` | 使用指定单位将给定的时间值截断为 ZONED DATETIME 实例。 |
| **localdatetime()**   | `localdatetime(input = DEFAULT_TEMPORAL_ARGUMENT :: ANY) :: LOCAL DATETIME` | 创建一个 LOCAL DATETIME 实例。                             |
| **localdatetime.realtime()**| `localdatetime.realtime(timezone = DEFAULT_TEMPORAL_ARGUMENT :: ANY) :: LOCAL DATETIME` | 使用实时时钟返回当前 LOCAL DATETIME 实例。             |
| **localdatetime.statement()**| `localdatetime.statement(timezone = DEFAULT_TEMPORAL_ARGUMENT :: ANY) :: LOCAL DATETIME` | 使用语句时钟返回当前 LOCAL DATETIME 实例。             |
| **localdatetime.transaction()**| `localdatetime.transaction(timezone = DEFAULT_TEMPORAL_ARGUMENT :: ANY) :: LOCAL DATETIME` | 使用事务时钟返回当前 LOCAL DATETIME 实例。             |
| **localdatetime.truncate()**| `localdatetime.truncate(unit :: STRING, input = DEFAULT_TEMPORAL_ARGUMENT :: ANY, fields = null :: MAP) :: LOCAL DATETIME` | 使用指定单位将给定的时间值截断为 LOCAL DATETIME 实例。 |
| **localtime()**       | `localtime(input = DEFAULT_TEMPORAL_ARGUMENT :: ANY) :: LOCAL TIME` | 创建一个 LOCAL TIME 实例。                                 |
| **localtime.realtime()**| `localtime.realtime(timezone = DEFAULT_TEMPORAL_ARGUMENT :: ANY) :: LOCAL TIME` | 使用实时时钟返回当前 LOCAL TIME 实例。                 |
| **localtime.statement()**| `localtime.statement(timezone = DEFAULT_TEMPORAL_ARGUMENT :: ANY) :: LOCAL TIME` | 使用语句时钟返回当前 LOCAL TIME 实例。                 |
| **localtime.transaction()**| `localtime.transaction(timezone = DEFAULT_TEMPORAL_ARGUMENT :: ANY) :: LOCAL TIME` | 使用事务时钟返回当前 LOCAL TIME 实例。                 |
| **localtime.truncate()**| `localtime.truncate(unit :: STRING, input = DEFAULT_TEMPORAL_ARGUMENT :: ANY, fields = null :: MAP) :: LOCAL TIME` | 使用指定单位将给定的时间值截断为 LOCAL TIME 实例。 |
| **time()**            | `time(input = DEFAULT_TEMPORAL_ARGUMENT :: ANY) :: ZONED TIME` | 创建一个 ZONED TIME 实例。                               |
| **time.realtime()**   | `time.realtime(timezone = DEFAULT_TEMPORAL_ARGUMENT :: ANY) :: ZONED TIME` | 使用实时时钟返回当前 ZONED TIME 实例。                  |
| **time.statement()**  | `time.statement(timezone = DEFAULT_TEMPORAL_ARGUMENT :: ANY) :: ZONED TIME` | 使用语句时钟返回当前 ZONED TIME 实例。                  |
| **time.transaction()**| `time.transaction(timezone = DEFAULT_TEMPORAL_ARGUMENT :: ANY) :: ZONED TIME` | 使用事务时钟返回当前 ZONED TIME 实例。                  |
| **time.truncate()**   | `time.truncate(unit :: STRING, input = DEFAULT_TEMPORAL_ARGUMENT :: ANY, fields = null :: MAP) :: ZONED TIME` | 使用指定单位将给定的时间值截断为 ZONED TIME 实例。 |

# DURATION 类型函数

以下是与持续时间相关的函数列表，使用表格的方式呈现：

| 函数                  | 签名                                                     | 描述                                                         |
| --------------------- | -------------------------------------------------------- | ------------------------------------------------------------ |
| **duration()**        | `duration(input :: ANY) :: DURATION`                     | 构造一个 DURATION 值。                                       |
| **duration.between()**| `duration.between(from :: ANY, to :: ANY) :: DURATION`    | 计算从起始时刻（包含）到结束时刻（不包含）的 DURATION。        |
| **duration.inDays()** | `duration.inDays(from :: ANY, to :: ANY) :: DURATION`     | 计算从起始时刻（包含）到结束时刻（不包含）的 DURATION，单位为天。 |
| **duration.inMonths()**| `duration.inMonths(from :: ANY, to :: ANY) :: DURATION`   | 计算从起始时刻（包含）到结束时刻（不包含）的 DURATION，单位为月。 |
| **duration.inSeconds()**| `duration.inSeconds(from :: ANY, to :: ANY) :: DURATION` | 计算从起始时刻（包含）到结束时刻（不包含）的 DURATION，单位为秒。 |


# 空间函数

以下是与空间函数相关的函数列表，使用表格的方式呈现：

| 函数                          | 签名                                                                | 描述                                                             |
| ----------------------------- | ------------------------------------------------------------------- | ---------------------------------------------------------------- |
| **point.distance()**          | `point.distance(from :: POINT, to :: POINT) :: FLOAT`                | 返回两个在相同坐标参考系统（CRS）中的点之间的大地测地距离，结果为 FLOAT。 |
| **point() - Cartesian 2D**    | `point(input :: MAP) :: POINT`                                       | 给定笛卡尔坐标系中的两个坐标值，返回一个二维点对象。                        |
| **point() - Cartesian 3D**    | `point(input :: MAP) :: POINT`                                       | 给定笛卡尔坐标系中的三个坐标值，返回一个三维点对象。                        |
| **point() - WGS 84 2D**       | `point(input :: MAP) :: POINT`                                       | 给定 WGS 84 地理坐标系中的两个坐标值，返回一个二维点对象。                   |
| **point() - WGS 84 3D**       | `point(input :: MAP) :: POINT`                                       | 给定 WGS 84 地理坐标系中的三个坐标值，返回一个三维点对象。                   |
| **point.withinBBox()**        | `point.withinBBox(point :: POINT, lowerLeft :: POINT, upperRight :: POINT) :: BOOLEAN` | 如果提供的点在由两个给定点（lowerLeft 和 upperRight）定义的边界框内，返回 true。 |

# other

以下是LOAD CSV函数、图函数、数据库函数和用户自定义函数的函数列表，使用表格的方式呈现：

| **函数**                       | **签名**                                                         | **描述**                                                     |
| ------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------ |
| **LOAD CSV 函数**               |                                                                 |                                                              |
| `file()`                        | `file() :: STRING`                                                | 返回LOAD CSV正在使用的文件的绝对路径。                       |
| `linenumber()`                  | `linenumber() :: INTEGER`                                         | 返回LOAD CSV当前使用的行号。                                 |
| **图函数**                     |                                                                 |                                                              |
| `graph.byElementId()`           | `USE graph.byElementId(elementId :: STRING)`                     | 解析给定元素ID所属的组成图。（Neo4j 5.13引入）               |
| `graph.byName()`                | `USE graph.byName(name :: STRING)`                               | 通过名称解析组成图。                                         |
| `graph.names()`                 | `graph.names() :: LIST<STRING>`                                   | 返回当前组合数据库中所有图的名称列表。                       |
| `graph.propertiesByName()`      | `graph.propertiesByName(name :: STRING) :: MAP`                   | 返回包含给定图关联属性的映射。                               |
| **数据库函数**                 |                                                                 |                                                              |
| `db.nameFromElementId()`        | `db.nameFromElementId(name :: STRING) :: STRING`                 | 从给定的元素ID解析数据库名称。（Neo4j 5.12引入）            |
| **用户自定义函数**             |                                                                 |                                                              |
| **标量函数**                   |                                                                 |                                                              |
| **聚合函数**                   |                                                                 |                                                              |


# 示例1：列出可用函数

要列出可用函数，请运行以下Cypher查询：

```
SHOW FUNCTIONS
```

结果：

```
╒═══════════════════════════╤═══════════════╤══════════════════════════════════════════════════════════════════════╕
│name                       │category       │description                                                           │
╞═══════════════════════════╪═══════════════╪══════════════════════════════════════════════════════════════════════╡
│"abs"                      │"Numeric"      │"Returns the absolute value of an integer."                           │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"abs"                      │"Numeric"      │"Returns the absolute value of a floating point number."              │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"acos"                     │"Trigonometric"│"Returns the arccosine of a number in radians."                       │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"all"                      │"Predicate"    │"Returns true if the predicate holds for all elements in the given lis│
│                           │               │t."                                                                   │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"any"                      │"Predicate"    │"Returns true if the predicate holds for at least one element in the g│
│                           │               │iven list."                                                           │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"asin"                     │"Trigonometric"│"Returns the arcsine of a number in radians."                         │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"atan"                     │"Trigonometric"│"Returns the arctangent of a number in radians."                      │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"atan2"                    │"Trigonometric"│"Returns the arctangent2 of a set of coordinates in radians."         │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"avg"                      │"Aggregating"  │"Returns the average of a set of integer values."                     │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"avg"                      │"Aggregating"  │"Returns the average of a set of floating point values."              │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"avg"                      │"Aggregating"  │"Returns the average of a set of duration values."                    │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"ceil"                     │"Numeric"      │"Returns the smallest floating point number that is greater than or eq│
│                           │               │ual to a number and equal to a mathematical integer."                 │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"coalesce"                 │"Scalar"       │"Returns the first non-null value in a list of expressions."          │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"collect"                  │"Aggregating"  │"Returns a list containing the values returned by an expression."     │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"cos"                      │"Trigonometric"│"Returns the cosine  of a number."                                    │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"cot"                      │"Trigonometric"│"Returns the cotangent of a number."                                  │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"count"                    │"Aggregating"  │"Returns the number of values or rows."                               │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"date"                     │"Temporal"     │"Create a Date instant."                                              │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"date.realtime"            │"Temporal"     │"Get the current Date instant using the realtime clock."              │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"date.statement"           │"Temporal"     │"Get the current Date instant using the statement clock."             │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"date.transaction"         │"Temporal"     │"Get the current Date instant using the transaction clock."           │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"date.truncate"            │"Temporal"     │"Truncate the input temporal value to a Date instant using the specifi│
│                           │               │ed unit."                                                             │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"datetime"                 │"Temporal"     │"Create a DateTime instant."                                          │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"datetime.fromepoch"       │"Temporal"     │"Create a DateTime given the seconds and nanoseconds since the start o│
│                           │               │f the epoch."                                                         │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"datetime.fromepochmillis" │"Temporal"     │"Create a DateTime given the milliseconds since the start of the epoch│
│                           │               │."                                                                    │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"datetime.realtime"        │"Temporal"     │"Get the current DateTime instant using the realtime clock."          │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"datetime.statement"       │"Temporal"     │"Get the current DateTime instant using the statement clock."         │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"datetime.transaction"     │"Temporal"     │"Get the current DateTime instant using the transaction clock."       │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"datetime.truncate"        │"Temporal"     │"Truncate the input temporal value to a DateTime instant using the spe│
│                           │               │cified unit."                                                         │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"db.nameFromElementId"     │"Database"     │"Resolves the database name for the given element id"                 │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"degrees"                  │"Trigonometric"│"Converts radians to degrees."                                        │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"duration"                 │"Temporal"     │"Construct a Duration value."                                         │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"duration.between"         │"Temporal"     │"Compute the duration between the 'from' instant (inclusive) and the '│
│                           │               │to' instant (exclusive) in logical units."                            │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"duration.inDays"          │"Temporal"     │"Compute the duration between the 'from' instant (inclusive) and the '│
│                           │               │to' instant (exclusive) in days."                                     │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"duration.inMonths"        │"Temporal"     │"Compute the duration between the 'from' instant (inclusive) and the '│
│                           │               │to' instant (exclusive) in months."                                   │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"duration.inSeconds"       │"Temporal"     │"Compute the duration between the 'from' instant (inclusive) and the '│
│                           │               │to' instant (exclusive) in seconds."                                  │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"e"                        │"Logarithmic"  │"Returns the base of the natural logarithm, e."                       │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"elementId"                │"Scalar"       │"Returns the element id of a node."                                   │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"elementId"                │"Scalar"       │"Returns the element id of a relationship."                           │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"endNode"                  │"Scalar"       │"Returns the end node of a relationship."                             │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"exists"                   │"Predicate"    │"Returns true if a match for the pattern exists in the graph."        │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"exp"                      │"Logarithmic"  │"Returns e^n, where e is the base of the natural logarithm, and n is t│
│                           │               │he value of the argument expression."                                 │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"file"                     │"Scalar"       │"Returns the absolute path of the file that LOAD CSV is using."       │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"floor"                    │"Numeric"      │"Returns the largest floating point number that is less than or equal │
│                           │               │to a number and equal to a mathematical integer."                     │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"graph.names"              │"Graph"        │"Lists the names of graph in the current database"                    │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"graph.propertiesByName"   │"Graph"        │"Returns the map of properties associated with a graph"               │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"haversin"                 │"Trigonometric"│"Returns half the versine of a number."                               │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"head"                     │"Scalar"       │"Returns the first element in a list."                                │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"id"                       │"Scalar"       │"Returns the id of a node."                                           │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"id"                       │"Scalar"       │"Returns the id of a relationship."                                   │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"isEmpty"                  │"Predicate"    │"Checks whether a list is empty."                                     │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"isEmpty"                  │"Predicate"    │"Checks whether a map is empty."                                      │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"isEmpty"                  │"Predicate"    │"Checks whether a string is empty."                                   │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"isNaN"                    │"Numeric"      │"Returns whether the given integer is NaN."                           │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"isNaN"                    │"Numeric"      │"Returns whether the given floating point number is NaN."             │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"keys"                     │"List"         │"Returns a list containing the string representations for all the prop│
│                           │               │erty names of a node."                                                │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"keys"                     │"List"         │"Returns a list containing the string representations for all the prop│
│                           │               │erty names of a relationship"                                         │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"keys"                     │"List"         │"Returns a list containing the string representations for all the prop│
│                           │               │erty names of a map."                                                 │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"labels"                   │"List"         │"Returns a list containing the string representations for all the labe│
│                           │               │ls of a node."                                                        │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"last"                     │"Scalar"       │"Returns the last element in a list."                                 │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"left"                     │"String"       │"Returns a string containing the specified number of leftmost characte│
│                           │               │rs of the original string."                                           │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"length"                   │"Scalar"       │"Returns the length of a path."                                       │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"linenumber"               │"Scalar"       │"Returns the line number that LOAD CSV is currently using."           │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"localdatetime"            │"Temporal"     │"Create a LocalDateTime instant."                                     │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"localdatetime.realtime"   │"Temporal"     │"Get the current LocalDateTime instant using the realtime clock."     │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"localdatetime.statement"  │"Temporal"     │"Get the current LocalDateTime instant using the statement clock."    │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"localdatetime.transaction"│"Temporal"     │"Get the current LocalDateTime instant using the transaction clock."  │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"localdatetime.truncate"   │"Temporal"     │"Truncate the input temporal value to a LocalDateTime instant using th│
│                           │               │e specified unit."                                                    │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"localtime"                │"Temporal"     │"Create a LocalTime instant."                                         │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"localtime.realtime"       │"Temporal"     │"Get the current LocalTime instant using the realtime clock."         │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"localtime.statement"      │"Temporal"     │"Get the current LocalTime instant using the statement clock."        │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"localtime.transaction"    │"Temporal"     │"Get the current LocalTime instant using the transaction clock."      │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"localtime.truncate"       │"Temporal"     │"Truncate the input temporal value to a LocalTime instant using the sp│
│                           │               │ecified unit."                                                        │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"log"                      │"Logarithmic"  │"Returns the natural logarithm of a number."                          │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"log10"                    │"Logarithmic"  │"Returns the common logarithm (base 10) of a number."                 │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"ltrim"                    │"String"       │"Returns the original string with leading whitespace removed."        │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"max"                      │"Aggregating"  │"Returns the maximum value in a set of values."                       │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"min"                      │"Aggregating"  │"Returns the minimum value in a set of values."                       │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"nodes"                    │"List"         │"Returns a list containing all the nodes in a path."                  │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"none"                     │"Predicate"    │"Returns true if the predicate holds for no element in the given list.│
│                           │               │"                                                                     │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"percentileCont"           │"Aggregating"  │"Returns the percentile of a value over a group using linear interpola│
│                           │               │tion."                                                                │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"percentileDisc"           │"Aggregating"  │"Returns the nearest integer value to the given percentile over a grou│
│                           │               │p using a rounding method."                                           │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"percentileDisc"           │"Aggregating"  │"Returns the nearest floating point value to the given percentile over│
│                           │               │ a group using a rounding method."                                    │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"pi"                       │"Trigonometric"│"Returns the mathematical constant pi."                               │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"point"                    │"Spatial"      │"Returns a 2D or 3D point object, given two or respectively three coor│
│                           │               │dinate values in the Cartesian coordinate system or WGS 84 geographic │
│                           │               │coordinate system."                                                   │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"point.distance"           │"Spatial"      │"Returns a floating point number representing the geodesic distance be│
│                           │               │tween any two points in the same CRS."                                │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"point.withinBBox"         │"Spatial"      │"Returns true if the provided point is within the bounding box defined│
│                           │               │ by the two provided points."                                         │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"properties"               │"Scalar"       │"Returns a map containing all the properties of a node."              │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"properties"               │"Scalar"       │"Returns a map containing all the properties of a relationship."      │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"properties"               │"Scalar"       │"Returns a map containing all the properties of a map."               │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"radians"                  │"Trigonometric"│"Converts degrees to radians."                                        │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"rand"                     │"Numeric"      │"Returns a random floating point number in the range from 0 (inclusive│
│                           │               │) to 1 (exclusive); i.e. [0,1)."                                      │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"randomUUID"               │"Scalar"       │"Generates a random UUID."                                            │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"range"                    │"List"         │"Returns a list comprising all integer values within a specified range│
│                           │               │."                                                                    │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"range"                    │"List"         │"Returns a list comprising all integer values within a specified range│
│                           │               │ created with step length."                                           │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"reduce"                   │"List"         │"Runs an expression against individual elements of a list, storing the│
│                           │               │ result of the expression in an accumulator."                         │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"relationships"            │"List"         │"Returns a list containing all the relationships in a path."          │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"replace"                  │"String"       │"Returns a string in which all occurrences of a specified search strin│
│                           │               │g in the original string have been replaced by another (specified) rep│
│                           │               │lace string."                                                         │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"reverse"                  │"String"       │"Returns a string in which the order of all characters in the original│
│                           │               │ string have been reversed."                                          │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"reverse"                  │"List"         │"Returns a list in which the order of all elements in the original lis│
│                           │               │t have been reversed."                                                │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"right"                    │"String"       │"Returns a string containing the specified number of rightmost charact│
│                           │               │ers of the original string."                                          │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"round"                    │"Numeric"      │"Returns the value of a number rounded to the nearest integer."       │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"round"                    │"Numeric"      │"Returns the value of a number rounded to the specified precision usin│
│                           │               │g rounding mode HALF_UP."                                             │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"round"                    │"Numeric"      │"Returns the value of a number rounded to the specified precision with│
│                           │               │ the specified rounding mode."                                        │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"rtrim"                    │"String"       │"Returns the original string with trailing whitespace removed."       │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"sign"                     │"Numeric"      │"Returns the signum of an integer number: 0 if the number is 0, -1 for│
│                           │               │ any negative number, and 1 for any positive number."                 │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"sign"                     │"Numeric"      │"Returns the signum of a floating point number: 0 if the number is 0, │
│                           │               │-1 for any negative number, and 1 for any positive number."           │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"sin"                      │"Trigonometric"│"Returns the sine of a number."                                       │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"single"                   │"Predicate"    │"Returns true if the predicate holds for exactly one of the elements i│
│                           │               │n the given list."                                                    │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"size"                     │"Scalar"       │"Returns the number of items in a list."                              │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"size"                     │"Scalar"       │"Returns the number of Unicode characters in a string."               │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"split"                    │"String"       │"Returns a list of strings resulting from the splitting of the origina│
│                           │               │l string around matches of the given delimiter."                      │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"split"                    │"String"       │"Returns a list of strings resulting from the splitting of the origina│
│                           │               │l string around matches of any of the given delimiters."              │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"sqrt"                     │"Logarithmic"  │"Returns the square root of a number."                                │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"startNode"                │"Scalar"       │"Returns the start node of a relationship."                           │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"stdev"                    │"Aggregating"  │"Returns the standard deviation for the given value over a group for a│
│                           │               │ sample of a population."                                             │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"stdevp"                   │"Aggregating"  │"Returns the standard deviation for the given value over a group for a│
│                           │               │n entire population."                                                 │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"substring"                │"String"       │"Returns a substring of the original string, beginning with a 0-based │
│                           │               │index start."                                                         │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"substring"                │"String"       │"Returns a substring of length 'length' of the original string, beginn│
│                           │               │ing with a 0-based index start."                                      │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"sum"                      │"Aggregating"  │"Returns the sum of a set of integers"                                │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"sum"                      │"Aggregating"  │"Returns the sum of a set of floats"                                  │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"sum"                      │"Aggregating"  │"Returns the sum of a set of durations"                               │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"tail"                     │"List"         │"Returns all but the first element in a list."                        │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"tan"                      │"Trigonometric"│"Returns the tangent of a number."                                    │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"time"                     │"Temporal"     │"Create a Time instant."                                              │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"time.realtime"            │"Temporal"     │"Get the current Time instant using the realtime clock."              │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"time.statement"           │"Temporal"     │"Get the current Time instant using the statement clock."             │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"time.transaction"         │"Temporal"     │"Get the current Time instant using the transaction clock."           │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"time.truncate"            │"Temporal"     │"Truncate the input temporal value to a Time instant using the specifi│
│                           │               │ed unit."                                                             │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"toBoolean"                │"Scalar"       │"Converts a string value to a boolean value."                         │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"toBoolean"                │"Scalar"       │"Converts a boolean value to a boolean value."                        │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"toBoolean"                │"Scalar"       │"Converts a integer value to a boolean value. 0 is defined to be FALSE│
│                           │               │ and any other integer is defined to be TRUE."                        │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"toBooleanList"            │"List"         │"Converts a list of values to a list of boolean values. If any values │
│                           │               │are not convertible to boolean they will be null in the list returned.│
│                           │               │"                                                                     │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"toBooleanOrNull"          │"Scalar"       │"Converts a value to a boolean value, or null if the value cannot be c│
│                           │               │onverted."                                                            │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"toFloat"                  │"Scalar"       │"Converts a string value to a floating point value."                  │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"toFloat"                  │"Scalar"       │"Converts an integer value to a floating point value."                │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"toFloatList"              │"List"         │"Converts a list of values to a list of float values. If any values ar│
│                           │               │e not convertible to float they will be null in the list returned."   │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"toFloatOrNull"            │"Scalar"       │"Converts a value to a floating point value, or null if the value cann│
│                           │               │ot be converted."                                                     │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"toInteger"                │"Scalar"       │"Converts a string value to an integer value."                        │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"toInteger"                │"Scalar"       │"Converts a floating point value to an integer value."                │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"toInteger"                │"Scalar"       │"Converts a boolean to an integer value. TRUE is defined to be 1 and F│
│                           │               │ALSE is defined to be 0."                                             │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"toIntegerList"            │"List"         │"Converts a list of values to a list of integer values. If any values │
│                           │               │are not convertible to integer they will be null in the list returned.│
│                           │               │"                                                                     │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"toIntegerOrNull"          │"Scalar"       │"Converts a value to an integer value, or null if the value cannot be │
│                           │               │converted."                                                           │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"toLower"                  │"String"       │"Returns the original string in lowercase."                           │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"toString"                 │"String"       │"Converts an integer, float, boolean, point or temporal type (i.e. Dat│
│                           │               │e, Time, LocalTime, DateTime, LocalDateTime or Duration) value to a st│
│                           │               │ring."                                                                │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"toStringList"             │"List"         │"Converts a list of values to a list of string values. If any values a│
│                           │               │re not convertible to string they will be null in the list returned." │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"toStringOrNull"           │"String"       │"Converts an integer, float, boolean, point or temporal type (i.e. Dat│
│                           │               │e, Time, LocalTime, DateTime, LocalDateTime or Duration) value to a st│
│                           │               │ring, or null if the value cannot be converted."                      │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"toUpper"                  │"String"       │"Returns the original string in uppercase."                           │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"trim"                     │"String"       │"Returns the original string with leading and trailing whitespace remo│
│                           │               │ved."                                                                 │
├───────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
│"type"                     │"Scalar"       │"Returns the string representation of the relationship type."         │
└───────────────────────────┴───────────────┴──────────────────────────────────────────────────────────────────────┘
```



# 参考资料

chat

https://neo4j.com/docs/cypher-manual/5/functions/

* any list
{:toc}

