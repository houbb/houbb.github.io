---
layout: post
title: YAML-03-yml 配置文件介绍官方文档翻译
date:  2017-06-21 13:59:45 +0800
categories: [Config]
tags: [yaml, config]
published: true
---

# 拓展阅读

[config 配置方式概览-8 种配置文件介绍对比 xml/json/proeprties/ini/yaml/TOML/hcl/hocon](https://houbb.github.io/2017/06/21/config-00-overivew)

[config HCL（HashiCorp Configuration Language） 配置文件介绍](https://houbb.github.io/2017/06/21/config-hcl-01-intro)

[config HCL（HashiCorp Configuration Language） 官方文档翻译](https://houbb.github.io/2017/06/21/config-hcl-02-doc)

[config HOCON（Human-Optimized Config Object Notation）配置文件介绍](https://houbb.github.io/2017/06/21/config-hocon-01-intro)

[config ini 配置文件介绍](https://houbb.github.io/2017/06/21/config-ini-01-intro)

[config properties 配置文件介绍](https://houbb.github.io/2017/06/21/config-properties-01-intro)

[toml-01-toml 配置文件介绍](https://houbb.github.io/2017/06/21/config-toml-01-overview)

[XStream java 实现 xml 与对象 pojo 之间的转换](https://houbb.github.io/2017/06/21/config-xml-XStream-intro)

[java 实现 xml 与对象 pojo 之间的转换的几种方式 dom4j/xstream/jackson](https://houbb.github.io/2017/06/21/config-xml-to-pojo)

[YAML-01-yml 配置文件介绍](https://houbb.github.io/2017/06/21/config-yaml-01-intro)

[YAML-02-yml 配置文件 java 整合使用 yamlbeans + snakeyaml + jackson-dataformat-yaml](https://houbb.github.io/2017/06/21/config-yaml-02-java-integration)

[YAML-03-yml 配置文件介绍官方文档翻译](https://houbb.github.io/2017/06/21/config-yaml-03-doc)

[json 专题系列](https://houbb.github.io/2018/07/20/json-00-overview)

# YAML

[YAML](http://www.yaml.org/) 是一种面向所有编程语言的人类友好的数据序列化标准。

> [zh_cn](http://www.ruanyifeng.com/blog/2016/07/yaml.html)

## 特性

- 大小写敏感

- 使用缩进表示层级关系

- 缩进时不允许使用Tab键，只允许使用空格。

- 缩进的空格数目不重要，只要相同层级的元素左侧对齐即可

- ```#``` 表示注释，从这个字符一直到行尾，都会被解析器忽略

[Test](http://nodeca.github.io/js-yaml/)

# 对象

- 使用 `:` 分隔，右侧必须有空格。

```yaml
name: ryo
```

在 JavaScript 中：

```js
{ name: 'ryo' }
```

- 或者像这样

```yaml
person: {name: ryo, age: 21}
```

在 JavaScript 中：

```js
{ person: { name: 'ryo', age: 21 } }
```

# 数组

以 `-` 开始，例如：

```yaml
- apple
- box
- cat
- dog
```

在 JavaScript 中：

```js
[ 'apple', 'box', 'cat', 'dog' ]
```

- 数组的子元素可以这样表示

```yaml
-
  - apple
  - box
  - cat
```

在 JavaScript 中：

```js
[ [ 'apple', 'box', 'cat' ] ]
```

- 内联数组

```yaml
array: [apple, box]
```

在 JavaScript 中：

```js
{ array: [ 'apple', 'box' ] }
```

> 多种类型的数组和对象：

```yaml
names:
 - Ryo
 - Kyo
 - May
animations:
 - Key: Kanon
 - Key: ReWrite
 - Key: CLANNAD
```

在 JavaScript 中：

```js
{ names: [ 'Ryo', 'Kyo', 'May' ],
  animations: [ { Key: 'Kanon' }, { Key: 'ReWrite' }, { Key: 'CLANNAD' } ] }
```

# 基本类型

- 数字

```yaml
age: 12
```

在 JavaScript 中：

```js
{ age: 12 }
```

- 布尔值

使用 `true` 或 `false`

```yaml
isTrue: false
```

在 JavaScript 中：

```js
{ isTrue: false }
```

- 空值

使用 `~` 表示 null

```yaml
memory: ~
```

在 JavaScript 中：

```js
{ memory: null }
```

- 时间

时间使用 **ISO8601** 类型：

```yaml
time: 2016-10-26t21:59:43.10-05:00
```

在 JavaScript 中：

```js
{ time: Thu Oct 27 2016 10:59:43 GMT+0800 (CST) }
```

- 日期

日期使用多种 **ISO8601** 年、月、日表示

```yaml
date: 1970-01-01
```

在 JavaScript 中：

```js
{ date: Thu Jan 01 1970 08:00:00 GMT+0800 (CST) }
```

- YAML 可以使用 `!!` 强制类型

```yaml
name: !!str ryo
age: !!int '56'
```

在 JavaScript 中：

```js
{ name: 'ryo', age: 56 }
```

# 字符串

字符串默认不需要使用 ` `` `

```yaml
str: this is a string demo
```

在 JavaScript 中：

```js
{ str: 'this is a string demo' }
```

如果字符串中有空格或特殊字符，使用 **''** 或 **""**

```yaml
name: "hou: ryo"
```

在 JavaScript 中：

```js
{ name: 'hou: ryo' }
```

**''** 和 **""** 的区别是：

- **''** 中的特殊字符会被转义，而 **""** 中不会

```yaml
double quote: "long \n long story"
single quote: 'long \n long story'
```

在 JavaScript 中：

```js
{ 'double quote': 'long \n long story',
  'single quote': 'long \\n long story' }
```

单引号中如果还有单引号，必须连续使用两个单引号转义。

```yaml
name: 'mary''s song'
```

在 JavaScript 中：

```js
{ name: 'mary\'s song' }
```

字符串可以写成多行，从第二行开始，必须有一个空格缩进。换行符会被转为空格。

```yaml
long string
 a
 ha
 ha
```

在 JavaScript 中：

```
'long string a ha ha'
```

多行字符串可以使用 `|` 保留换行符，也可以使用 `>` 折叠换行。

```yaml
this: |
 angle
 beats
that: >
 little
 busters
```

在 JavaScript 中：

```js
{ this: 'angle\nbeats\n', that: 'little busters\n' }
```

- `+` 表示保留文字块末尾的换行，`-` 表示删除字符串末尾的换行。

```yaml
one: |
 Spring

two: |+
 Summer


three: |-
 Autumn
```

在 JavaScript 中：

```js
{ one: 'Spring\n', two: 'Summer\n\n\n', three: 'Autumn' }
```

字符串可以插入 **HTML**。

```yaml
string with html: |

 <p class="red">
     red
 </p>
```

在 JavaScript 中：

```js
{ 'string with html': '\n<p class="red">\n    red\n</p>\n' }
```

# 引用

你可以像这样使用：

```yaml
Author: &author
  name: ryo
  age: 11

Blog:
  info: learn note
  <<: *author

Artile:
  info: sth just like
  <<: *author
```

在 JavaScript 中：

```js
{ Author: { name: 'ryo', age: 11 },
  Blog: { info: 'learn note', name: 'ryo', age: 11 },
  Artile: { info: 'sth just like', name: 'ryo', age: 11 } }
```

* any list
{:toc}