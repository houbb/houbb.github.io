---
layout: post
title: config HCL（HashiCorp Configuration Language） 官方文档翻译
date:  2017-06-21 13:59:45 +0800
categories: [Config]
tags: [config, overview]
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

# 组件

XML

json

yaml

properties

ini

csv

TOML

HCL

CFG

INI

converter

# HCL 原生语法规范

#### 简介

这是 HCL 原生语法的语法和语义规范。

HCL 是一个用于定义应用程序配置语言的系统。

HCL 信息模型设计支持多种具体的配置语法，但这种原生语法被认为是主要格式，并针对人工编写和维护进行了优化，而不是机器生成的配置。

#### 语言结构

该语言由三个集成的子语言组成：

1. **结构语言**：定义了整体的层次配置结构，是 HCL 体、块和属性的序列化。
2. **表达式语言**：用于表达属性值，可以是文字值或其他值的派生。
3. **模板语言**：用于将值组合成字符串，是表达式语言中的几种表达式之一。

在正常使用中，这三种子语言一起使用于配置文件中，以描述整体配置，其中结构语言用于顶层。表达式语言和模板语言也可以单独使用，以实现 REPLs（交互式解释器）、调试器以及集成到更有限的 HCL 语法中，例如 JSON 配置文件。

#### 语法符号 Syntax Notation

在本规范中，使用一种半正式的符号来说明语法细节。

这种符号是为人类阅读而设计的，而不是供机器读取，具体约定如下：

- 以大写字母开头的裸名是全局生成规则，适用于本文档中的所有语法规范。
- 以小写字母开头的裸名是局部生成规则，仅在定义它们的规范中有意义。
- 双引号（"）和单引号（'）用于标记文字字符序列，这些字符序列可以是标点符号或关键字。
- 组合项的默认操作符，没有标点符号，是连接操作。
- 符号“|”表示其左右操作数中的任意一个都可以出现。
- 符号“*”表示其左边的项可以重复零次或多次。
- 符号“?”表示其左边的项可以出现零次或一次。
- 括号“(”和“)”用于将项组合在一起，以便将“|”、“*”和“?”操作符一起应用于它们。
- 语法符号并不能完全描述语言。说明文本可以补充或与示例语法冲突。在冲突的情况下，以说明文本为准。

### 源代码表示

源代码是以 UTF-8 编码表示的 Unicode 文本。该语言本身不执行 Unicode 规范化，因此语法特性如标识符是 Unicode 代码点的序列。

例如，预组合重音字符与带有组合重音的字母是不同的。

（字符串文字在 Unicode 规范化方面有一些特殊处理，这将在相关部分中详细介绍。）

不允许使用 UTF-8 编码的 Unicode 字节顺序标记。无效或非规范化的 UTF-8 编码总是解析错误。

### 词法元素

#### 注释和空白

注释和空白被识别为词法元素，但除以下描述外，它们被忽略。

空白定义为零个或多个空格字符（U+0020）的序列。

换行序列（U+000A 或 U+000D 后跟 U+000A）不被视为空白，但在某些上下文中被忽略。

水平制表符（U+0009）也被视为空白，但在报告源位置时仅计为一个“列”。

注释用于程序文档，有两种形式：

- 行注释以 // 或 # 开头，并在下一个换行序列结束。行注释等同于换行序列。
- 内联注释以 /* 开头，并在 */ 序列结束，可以包含除结束序列外的任何字符。内联注释等同于空白序列。

注释和空白不能在其他注释或模板文字中开始，除非在插值序列或模板指令内。

#### 标识符
标识符命名诸如块、属性和表达式变量等实体。标识符按照 UAX #31 第 2 节进行解释。具体而言，它们的语法根据 ID_Start 和 ID_Continue 字符属性定义如下：

```
Identifier = ID_Start (ID_Continue | '-')*;
```

Unicode 规范提供了标识符解析的规范要求。非规范地说，本规范的精神是 ID_Start 由 Unicode 字母和某些明确的标点符号组成，而 ID_Continue 在该集合基础上增加了 Unicode 数字、组合符号等。

短横线字符 - 也允许出现在标识符中，尽管它不属于 Unicode 的 ID_Continue 定义。这是为了允许属性名和块类型名包含短横线，尽管下划线作为词分隔符被认为是惯用用法。

#### 关键字
没有全局保留字，但在某些上下文中，某些标识符被保留为关键字。这些将在后续的相关文档部分中进一步讨论。

在这种情况下，标识符作为关键字的角色优先于其他可能的有效解释。在这些特定情况下之外，关键字没有特殊含义，并被解释为常规标识符。

#### 操作符和分隔符
以下字符序列表示操作符、分隔符和其他特殊标记：

```
+    &&   ==   <    :    {    [    (    ${
-    ||   !=   >    ?    }    ]    )    %{
*    !         <=        =         .
/              >=        =>        ,
%                                  ...
```

#### 数字字面量
数字字面量是实数的十进制表示。它包含整数部分、小数部分和指数部分。

```
NumericLit = decimal+ ("." decimal+)? (expmark decimal+)?;
decimal    = '0' .. '9';
expmark    = ('e' | 'E') ("+" | "-")?;
```

### 结构元素

结构语言由以下构造的语法组成：

- **属性**：为指定的名称分配一个值。
- **块**：创建一个由类型和可选标签注释的子体。
- **主体内容**：由属性和块的集合组成。

这些构造对应于语言无关的 HCL 信息模型中的类似概念。

#### 语法定义
```
ConfigFile   = Body;
Body         = (Attribute | Block | OneLineBlock)*;
Attribute    = Identifier "=" Expression Newline;
Block        = Identifier (StringLit|Identifier)* "{" Newline Body "}" Newline;
OneLineBlock = Identifier (StringLit|Identifier)* "{" (Identifier "=" Expression)? "}" Newline;
```

#### 配置文件
配置文件是一个字符序列，其顶层解释为一个主体（Body）。

#### 主体
主体是关联的属性和块的集合。此关联的含义由调用应用程序定义。

#### 属性定义
属性定义为主体内的特定属性名称分配一个值。每个不同的属性名称在一个主体内最多只能定义一次。

属性值以表达式形式给出，调用应用程序会保留该表达式以供稍后评估。

#### 块

块创建一个带有块类型和零个或多个块标签的子体。块创建一个结构层次，调用应用程序可以解释该层次。

块标签可以是带引号的文字字符串或裸标识符。

### 表达式

表达式子语言用于属性定义中指定值。

```
Expression = (
    ExprTerm |
    Operation |
    Conditional
);
```

#### 类型
表达式语言中使用的值类型是由语法无关的 HCL 信息模型定义的。表达式可以返回任何有效类型，但只有一部分可用类型具有一等语法。调用应用程序可以通过变量和函数提供其他类型。

#### 表达式项
表达式项是单目和双目表达式的操作数，也可以作为独立的表达式。

```
ExprTerm = (
    LiteralValue |
    CollectionValue |
    TemplateExpr |
    VariableExpr |
    FunctionCall |
    ForExpr |
    ExprTerm Index |
    ExprTerm GetAttr |
    ExprTerm Splat |
    "(" Expression ")"
);
```
这些不同项类型的生成规则在其相应部分中给出。

在表示子表达式的括号（和）字符之间，换行符被忽略为空白字符。

#### 文字值
文字值直接表示特定原始类型的值。

```
LiteralValue = (
  NumericLit |
  "true" |
  "false" |
  "null"
);
```
- 数字字面量表示类型为 number 的值。
- 关键字 true 和 false 表示类型为 bool 的值。
- 关键字 null 表示动态伪类型的空值。

字符串文字在表达式子语言中不能直接使用，但可以通过模板子语言使用，这可以通过模板表达式结合。

#### 集合值
集合值组合零个或多个其他表达式以生成集合值。

```
CollectionValue = tuple | object;
tuple = "[" (
    (Expression (("," | Newline) Expression)* ","?)?
) "]";
object = "{" (
    (objectelem (( "," | Newline) objectelem)* ","?)?
) "}";
objectelem = (Identifier | Expression) ("=" | ":") Expression;
```
只有元组和对象值可以通过原生语法直接构造。元组和对象值可以通过其他操作转换为列表、集合和映射值，其行为由语法无关的 HCL 信息模型定义。

在指定对象元素时，标识符被解释为文字属性名称，而不是变量引用。要从变量填充项目键，请使用括号消除歧义：

```
{foo = "baz"} 被解释为一个名为 foo 的属性。
{(foo) = "baz"} 被解释为一个名称取自变量 foo 的属性。
```
在这些序列的开头和结尾分隔符之间，换行序列被忽略为空白字符。

在以标识符命名的 for 表达式和集合值的第一个元素之间存在语法歧义。for 表达式解释优先，因此要写一个字面名称为 for 的键或一个从变量 for 派生的表达式，必须使用括号或引号消除歧义：

```
[for, foo, baz] 是语法错误。
[(for), foo, baz] 是一个元组，其第一个元素是变量 for 的值。
{for = 1, baz = 2} 是语法错误。
{"for" = 1, baz = 2} 是一个具有字面名称为 for 的属性的对象。
{baz = 2, for = 1} 等同于前面的例子，并通过重新排序解决歧义。
{(for) = 1, baz = 2} 是一个键值与变量 for 相同的对象。
```

#### 模板表达式
模板表达式将模板子语言编写的程序嵌入为表达式。模板表达式有两种形式：

- 引用模板表达式由引号字符（"）界定，并定义为具有转义字符的单行表达式。
- Heredoc 模板表达式由 << 序列引入，并通过用户选择的分隔符终止的多行序列定义模板。

在这两种情况下，模板插值和指令语法都可以在分隔符内使用，分隔符外的任何文本都被解释为文字字符串。

在引用模板表达式中，模板内的任何文字字符串序列都有特殊行为：不允许文字换行序列，而是可以包含以反斜杠 \ 开头的转义序列：

```
\n         Unicode 换行控制字符
\r         Unicode 回车控制字符
\t         Unicode 制表控制字符
\"         文字引号，用于防止解释为字符串结束
\\         文字反斜杠，用于防止解释为转义序列
\uNNNN     来自基本多语言平面的 Unicode 字符（NNNN 是四个十六进制数字）
\UNNNNNNNN 来自补充平面的 Unicode 字符（NNNNNNNN 是八个十六进制数字）
```
Heredoc 模板表达式类型由 << 或 <<- 引入，后跟一个标识符。模板表达式在给定标识符再次出现在单独一行时结束。

如果 Heredoc 模板由 <<- 符号引入，每行开头的任何文字字符串都将被分析以找到最少的前导空格数，然后从所有行首文字字符串中删除该数量的前导空格。最终的关闭标记行前可以有任意数量的空格。

```java
TemplateExpr = quotedTemplate | heredocTemplate;
quotedTemplate = (如上面的说明中定义);
heredocTemplate = (
    ("<<" | "<<-") Identifier Newline
    (内容如上面的说明中定义)
    Identifier Newline
);
```
包含仅一个文字字符串的引用模板表达式作为定义文字字符串表达式的语法。在某些情况下，模板语法以这种方式受限：

```java
StringLit = '"' (如上所述定义的引用文字) '"';
```

StringLit 生成规则允许上述引用模板表达式的转义序列，但不允许模板插值或指令序列。


### 变量和变量表达式

变量是赋予符号名称的值。变量通过调用应用程序提供，在表达式求值时填充全局作用域。

表达式本身也可以创建变量，始终创建一个包含其父作用域中变量但重新定义零个或多个名称的新值的子作用域。

通过变量表达式访问变量的值，即一个独立的标识符，其名称对应于定义的变量：

```
VariableExpr = Identifier;
```

特定作用域中的变量是不可变的，但子作用域可以通过定义同名的新变量来隐藏祖先作用域中的变量。在查找变量时，使用给定名称的最本地定义的变量，无法访问同名的祖先作用域变量。

没有直接的语法用于声明或分配变量，但其他表达式构造在其求值过程中隐式创建子作用域并定义变量。

### 函数和函数调用

函数是赋予符号名称的操作。函数通过调用应用程序提供，在表达式求值时填充函数表。

函数的命名空间与变量的命名空间不同。函数和变量可以共享相同的名称，而不会暗示它们之间有任何关系。

可以通过函数调用表达式执行函数：

```
FunctionCall = Identifier "(" arguments ")";
Arguments = (
    () ||
    (Expression ("," Expression)* ("," | "...")?)
);
```

函数的定义和调用它们的语义由语法无关的 HCL 信息模型定义。给定的参数映射到函数的参数上，函数调用表达式的结果是给定这些参数时命名函数的返回值。

如果最后一个参数表达式后跟省略号符号（...），则最后一个参数表达式必须求值为列表或元组值。该值的元素从映射所有其他参数表达式后剩下的第一个参数开始，分别映射到命名函数的每个参数上。

在括号中分隔的函数参数之间，换行序列被忽略为空白字符。

### for 表达式

for 表达式是通过投影来自另一个集合的项目来构造集合的构造。

```
ForExpr = forTupleExpr | forObjectExpr;
forTupleExpr = "[" forIntro Expression forCond? "]";
forObjectExpr = "{" forIntro Expression "=>" Expression "..."? forCond? "}";
forIntro = "for" Identifier ("," Identifier)? "in" Expression ":";
forCond = "if" Expression;
```

用于分隔 for 表达式的标点符号决定了它将生成元组值（[ 和 ]）或对象值（{ 和 }）。

“引入”在两种情况下都是相同的：关键字 for 后跟一个或两个用逗号分隔的标识符，这些标识符定义用于迭代的临时变量名称，然后是关键字 in，然后是一个表达式，该表达式必须求值为一个可以迭代的值。引入以冒号（:）符号终止。

如果只提供一个标识符，它是一个变量的名称，在迭代期间将暂时赋值为每个元素的值。如果提供两个标识符，第一个是键，第二个是值。

元组、对象、列表、映射和集合类型是可迭代的。使用的集合类型定义了键和值变量的填充方式：

- 对于元组和列表类型，键是每个元素的序列的零基索引，值是元素值。元素按索引顺序访问。
- 对于对象和映射类型，键是字符串属性名或元素键，值是属性或元素值。元素按属性名或键的字典排序顺序访问。
- 对于集合类型，键和值都是元素值。元素按未定义但一致的顺序访问。

冒号后的表达式和（在对象 for 的情况下）=> 后的表达式在源集合的每个元素中各求值一次，在定义了指定键和值变量名称的局部作用域中。

对这些表达式的每个输入元素求值的结果用于填充新集合中的元素。在元组 for 的情况下，单个表达式成为一个元素，将值按访问顺序附加到元组中。在对象 for 的情况下，表达式对分别用作属性名和值，在结果对象中创建一个元素。

在对象 for 的情况下，如果两个输入元素从属性名表达式产生相同的结果，则会发生错误，因为不能存在重复属性。如果省略号符号（...）紧跟在值表达式之后，则会激活分组模式，其中结果对象中的每个值都是针对每个不同键生成的所有值的元组。

```
[for v in ["a", "b"]: v] 返回 ["a", "b"]。
[for i, v in ["a", "b"]: i] 返回 [0, 1]。
{for i, v in ["a", "b"]: v => i} 返回 {a = 0, b = 1}。
{for i, v in ["a", "a", "b"]: v => i} 产生错误，因为属性 a 被定义了两次。
{for i, v in ["a", "a", "b"]: v => i...} 返回 {a = [0, 1], b = [2]}。
```

如果在元素表达式之后使用关键字 if，它会应用一个附加的谓词，可以用来有条件地过滤源集合中的元素。if 之后的表达式在每个源元素中求值一次，在用于元素表达式的相同作用域中。它必须求值为布尔值；如果为 true，则正常求值元素，而如果为 false，则跳过元素。

```
[for i, v in ["a", "b", "c"]: v if i < 2] 返回 ["a", "b"]。
```

如果集合值、元素表达式或条件表达式返回类型有效但未知的值，则结果为动态伪类型的值。

### 运算符

运算符将特定操作应用于一个或两个表达式项。

#### 语法：
```
Operation = unaryOp | binaryOp;
unaryOp = ("-" | "!") ExprTerm;
binaryOp = ExprTerm binaryOperator ExprTerm;
binaryOperator = compareOperator | arithmeticOperator | logicOperator;
compareOperator = "==" | "!=" | "<" | ">" | "<=" | ">=";
arithmeticOperator = "+" | "-" | "*" | "/" | "%";
logicOperator = "&&" | "||";
```
一元运算符具有最高的优先级。

二元运算符分为以下优先级级别：

- 6级：* / %
- 5级：+ -
- 4级：> >= < <=
- 3级：== !=
- 2级：&&
- 1级：||

"level"的值越高，绑定越紧密。相同优先级内的运算符具有从左到右的结合性。例如，x / y * z 等同于 (x / y) * z。

#### 比较运算符

比较运算符始终产生布尔值，用于测试两个值之间的关系。

两个相等运算符适用于任何类型的值：

- a == b：相等
- a != b：不相等

如果两个值的类型相同且根据HCL语法无关的信息模型定义它们的值相等，则它们相等。相等运算符是对称的和相反的，即 (a == b) == !(a != b) 和 (a == b) == (b == a) 对所有值 a 和 b 成立。

四个数值比较运算符仅适用于数字：

- a < b：小于
- a <= b：小于等于
- a > b：大于
- a >= b：大于等于

如果比较运算符的任一操作数是正确类型的未知值或动态伪类型的值，则结果是未知布尔值。

#### 算术运算符

算术运算符仅适用于数字值，并始终产生数字值作为结果。

- a + b：和（加法）
- a - b：差（减法）
- a * b：积（乘法）
- a / b：商（除法）
- a % b：余数（取模）
- -a：取反

算术运算被认为是在任意精度的数字空间中执行的。

如果算术运算符的任一操作数是未知数字或动态伪类型的值，则结果是未知数字。

#### 逻辑运算符

逻辑运算符仅适用于布尔值，并始终产生布尔值作为结果。

- a && b：逻辑与
- a || b：逻辑或
- !a：逻辑非

如果逻辑运算符的任一操作数是未知布尔值或动态伪类型的值，则结果是未知布尔值。

### 条件运算符

条件运算符允许根据布尔表达式的结果选择两个表达式中的一个。

#### 语法：
```
Conditional = Expression "?" Expression ":" Expression;
```
第一个表达式是谓词，它被评估并必须产生一个布尔结果。如果谓词值为true，则第二个表达式的结果是条件运算符的结果。如果谓词值为false，则第三个表达式的结果是条件运算符的结果。

第二个和第三个表达式必须是相同类型，或者可以使用HCL语法无关的信息模型中定义的类型统一规则统一成一个公共类型。这个统一的类型是条件运算符的结果类型，第二个和第三个表达式必要时转换为统一的类型。

如果谓词是未知布尔值或动态伪类型的值，则结果是另外两个表达式的统一类型的未知值。

如果第二个或第三个表达式在评估时产生错误，那么只有在选择了错误的表达式时才会传递这些错误。

这使得可以在谓词为false时不产生错误地使用类似 `length(some_list) > 0 ? some_list[0] : default` 的表达式（假设有适当的长度函数）。

### 模板

模板子语言用于在模板表达式中简洁地组合字符串和其他值以生成其他字符串。它也可以独立使用作为独立的模板语言。

#### 语法：
```
Template = (
    TemplateLiteral |
    TemplateInterpolation |
    TemplateDirective
)*
TemplateDirective = TemplateIf | TemplateFor;
```

模板类似于一个始终返回字符串值的表达式。模板的不同元素被评估并组合成一个单一的字符串返回。如果任何元素产生未知字符串或动态伪类型的值，则结果是未知字符串。

一个重要的独立模板的用例是在替代HCL语法中使用表达式，其中没有原生的表达式语法。例如，HCL JSON配置文件在表达式模式下评估属性时将JSON字符串的值视为独立的模板。

#### 模板文本

模板文本是要包含在结果字符串中的字符序列。当模板子语言作为独立语言使用时，模板文本可以包含任何Unicode字符，除了引入插值和指令的序列和用于转义这些引入的序列。

插值和指令引入通过加倍其开头字符来进行转义。${ 序列转义为 $$${ ，而 %{ 序列转义为 %%{ 。

当模板子语言通过模板表达式嵌入到表达式语言中时，模板文本还会受到附加约束和转换的影响，如模板表达式的定义中所述。

模板文本的值可以通过相邻的插值或指令中的剥离标记进行修改。剥离标记是放置在模板序列的{之后或}之前的波浪号(~)：

```
hello ${~ "world" } 生成 "helloworld"。
%{ if true ~} hello %{~ endif } 生成 "hello"。
```

当存在剥离标记时，将从对应字符串文字（如果有）中立即删除与之相邻的任何空格，然后生成最终值。空格字符按照Unicode的定义进行解释。

剥离是在语法级别而不是值级别上进行的。由插值或指令返回的值不受剥离的影响：

```
${"hello" ~}${" world"} 生成 "hello world"，而不是 "helloworld"，因为空格不在直接相邻于剥离标记的模板文本中。
```

#### 模板插值

插值序列评估一个表达式（用表达式子语言编写），将结果转换为字符串值，并用生成的字符串替换自身。

```
TemplateInterpolation = ("${" | "${~") Expression ("}" | "~}";
```

如果表达式结果无法转换为字符串，则会产生错误。

#### 模板 If 指令

模板 if 指令是条件表达式的模板等效物，允许根据谓词表达式的值选择两个子模板中的一个。

```
TemplateIf = (
    ("%{" | "%{~") "if" Expression ("}" | "~}")
    Template
    (
        ("%{" | "%{~") "else" ("}" | "~}")
        Template
    )?
    ("%{" | "%{~") "endif" ("}" | "~}")
);
```

if 指令的评估等同于条件表达式，但有以下例外：

- 两个子模板始终产生字符串，因此结果值也始终为字符串。
- else 子句可以省略，在这种情况下，暗示条件的第三个表达式结果是空字符串。

#### 模板 For 指令

模板 for 指令是for表达式的模板等效物，基于集合的元素生成其子模板的零个或多个副本。

```
TemplateFor = (
    ("%{" | "%{~") "for" Identifier ("," Identifier) "in" Expression ("}" | "~}")
    Template
    ("%{" | "%{~") "endfor" ("}" | "~}")
);
```

for 指令的评估等同于生成元组的for表达式，但有以下例外：

- 子模板始终产生字符串。
- 在for表达式上没有 "if" 子句的等价物。
- 结果元组的元素都转换为字符串并连接以产生一个平坦的字符串结果。

#### 模板插值展开

作为一个特例，仅由单个插值组成且没有周围文字、指令或其他插值的模板被“展开”。在这种情况下，插值表达式的结果原样返回，不会转换为字符串。

此特殊情况主要是为了允许在缺乏一流模板或表达式语法的替代HCL语法中，使用本机模板语言内嵌在字符串中。展开允许在解释这些语言中的字符串作为模板时使用任意表达式填充属性。

```
${true} 生成布尔值 true。
${"${true}"} 生成布尔值 true，因为内部和外部插值都受到展开的影响。
hello ${true} 生成字符串 "hello true"。
${""}${true} 生成字符串 "true"，因为存在两个插值序列，即使其中一个产生空结果。
%{ for v in [true] }${v}%{ endfor } 生成字符串 true，因为for指令的存在绕过了展开，即使最终结果是单个值。
```

在某些情况下，调用应用程序可能会绕过此展开行为，将最终模板结果转换为字符串。

例如，如果独立模板用于生成文件的直接内容，则在这种情况下结果必须始终为字符串。

# chat

## Q: 详细介绍一下 hcl 配置文件方式

HCL（HashiCorp Configuration Language）是一种由 HashiCorp 公司开发的配置文件语言，用于编写配置文件。

HCL 的设计目标是提供一种简洁、易读、易写的配置语言，同时具有良好的可扩展性和表达能力。

HCL 主要用于 HashiCorp 公司的开源工具和产品，如 Terraform、Vault、Consul 等。

### 特点

1. **简洁性**：HCL 配置文件采用了简洁的语法结构，使得配置文件易于阅读和编写。

2. **可读性**：HCL 配置文件采用了人类可读的格式，以键值对的形式表示配置项，同时支持注释和分组，便于理解和维护。

3. **可扩展性**：HCL 支持模块化和引用机制，可以通过引用其他配置文件或模块来实现配置的复用和组合。

4. **表达能力**：HCL 支持复杂的数据结构，包括列表、字典、嵌套结构等，能够满足不同场景下的配置需求。

### 格式

HCL 配置文件采用了一种类似于 JSON 的语法结构，以键值对的形式表示配置项，具体格式如下：

```hcl
key = value
```

其中，`key` 表示配置项的名称，`value` 表示配置项的值。支持的值类型包括字符串、数字、布尔值、列表和字典等。

### 示例

下面是一个简单的 HCL 配置文件示例：

```hcl
// This is a sample HCL configuration file

server {
  hostname = "example.com"
  port = 8080
}

database {
  url = "jdbc:mysql://localhost:3306/mydb"
  username = "admin"
  password = "secret"
}
```

在这个示例中，定义了两个配置块 `server` 和 `database`，每个配置块包含了一组键值对配置项。

### 注释

HCL 配置文件支持单行注释和多行注释，单行注释以 `//` 开头，多行注释以 `/*` 开头，以 `*/` 结尾。

### 引用和变量

HCL 支持变量和引用机制，可以通过 `${}` 语法引用其他配置项或变量值，实现配置的复用和组合。

### 结语

总的来说，HCL 是一种简洁、易读、易写的配置文件语言，具有良好的可扩展性和表达能力，适用于各种不同类型的配置需求。它在 HashiCorp 公司的开源工具和产品中被广泛应用，成为了一种流行的配置文件格式。

## hcl 配置文件格式的官方标准文档有哪些？给出网址

HashiCorp Configuration Language（HCL）并没有官方标准文档，因为它是由 HashiCorp 公司开发的一种专有配置文件语言。

虽然没有官方标准文档，但 HashiCorp 提供了一些官方文档和示例，以帮助用户了解和使用 HCL。

你可以在 HashiCorp 公司的官方网站上找到一些关于 HCL 的文档和示例，具体包括：

1. **HashiCorp Configuration Language (HCL) Guide**：
   这是 HashiCorp 官方提供的关于 HCL 的指南，介绍了 HCL 的基本语法、配置块、引用和变量、函数等内容。
   [https://www.terraform.io/docs/language/syntax/configuration.html](https://www.terraform.io/docs/language/syntax/configuration.html)

2. **HCL 2 Language Specification**：
   这是 HCL 2 版本的语言规范文档，提供了关于 HCL 语言的详细说明，包括语法、语义、数据类型、函数等内容。
   [https://github.com/hashicorp/hcl/blob/main/hclsyntax/spec.md](https://github.com/hashicorp/hcl/blob/main/hclsyntax/spec.md)

3. **Terraform Configuration Language Documentation**：
   Terraform 是 HashiCorp 公司开发的基础设施即代码工具，它使用 HCL 作为配置文件语言。Terraform 的文档中包含了关于如何编写 Terraform 配置文件的说明和示例，其中也涵盖了 HCL 的使用。
   [https://www.terraform.io/docs/language/index.html](https://www.terraform.io/docs/language/index.html)

通过阅读这些官方文档和示例，可以更好地理解和使用 HCL 配置文件语言。

## hcl 作为配置文件有哪些优缺点？

HashiCorp Configuration Language (HCL) 作为配置文件格式具有一些优点和缺点，下面是它们的总结：

### 优点：

1. **易读易写**：
   HCL 采用了简洁、直观的语法，与人类自然语言类似，使得配置文件易于阅读和编写。它使用键值对的形式表示配置项，支持注释和分组，使得配置文件更加清晰和易于理解。

2. **可扩展性**：
   HCL 支持模块化和引用机制，可以通过引用其他配置文件或模块来实现配置的复用和组合。这种模块化的设计使得配置文件更加灵活和可维护。

3. **表达能力**：
   HCL 支持复杂的数据结构，包括列表、字典、嵌套结构等，能够满足各种不同类型的配置需求。它还支持变量和函数，可以实现更加灵活和强大的配置逻辑。

4. **与工具集成**：
   HCL 主要用于 HashiCorp 公司的开源工具和产品，如 Terraform、Vault、Consul 等。它与这些工具的集成良好，可以方便地与这些工具进行交互，实现自动化部署和管理。

### 缺点：

1. **学习曲线**：
   尽管 HCL 的语法相对简洁和直观，但对于新手来说仍然需要一定的学习成本。特别是对于复杂的配置文件和高级功能，可能需要更多的时间和精力来掌握。

2. **工具限制**：
   HCL 主要用于 HashiCorp 公司的工具集，对于其他场景可能存在一定的限制。虽然 HCL 可以用于其他用途，但不同的工具可能对 HCL 的支持程度不同，可能会导致一些兼容性和功能上的限制。

3. **错误处理**：
   HCL 的错误处理相对不够友好，特别是在语法错误和配置错误的情况下。有时候会出现错误提示不明确，不容易定位和修复问题的情况，给使用者带来一定的困扰。

4. **生态系统**：
   虽然 HCL 在 HashiCorp 工具集中得到了广泛应用，但在其他领域的生态系统相对较弱。相比之下，像 YAML、JSON 等通用的配置文件格式具有更加丰富和成熟的生态系统，包括各种工具、库和社区支持。

综上所述，虽然 HCL 作为配置文件格式具有一些优点，但也存在一些缺点。在选择使用时，需要根据具体的场景和需求进行权衡和取舍。

## java 如何读写 hcl 配置文件?

在 Java 中读写 HCL（HashiCorp Configuration Language）配置文件可以通过不同的方式实现，其中一种方法是使用第三方库来处理 HCL 格式的文件。目前并没有专门用于处理 HCL 格式的 Java 库，但可以使用 JSON 格式的库来处理类似的结构化数据。以下是使用 JSON 格式的库来读写 HCL 配置文件的示例：

### 读取 HCL 配置文件

假设有如下的 HCL 配置文件 `config.hcl`：

```hcl
server {
  hostname = "example.com"
  port = 8080
}

database {
  url = "jdbc:mysql://localhost:3306/mydb"
  username = "admin"
  password = "secret"
}
```

可以使用 JSON 格式的库读取 HCL 配置文件：

```java
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.dataformat.hocon.HoconFactory;
import com.typesafe.config.Config;

import java.io.File;
import java.io.IOException;

public class ReadHclFile {
    public static void main(String[] args) {
        try {
            ObjectMapper objectMapper = new ObjectMapper(new HoconFactory());
            Config config = objectMapper.readValue(new File("config.hcl"), Config.class);

            // 读取配置项
            String hostname = config.getString("server.hostname");
            int port = config.getInt("server.port");

            String url = config.getString("database.url");
            String username = config.getString("database.username");
            String password = config.getString("database.password");

            System.out.println("Hostname: " + hostname);
            System.out.println("Port: " + port);
            System.out.println("URL: " + url);
            System.out.println("Username: " + username);
            System.out.println("Password: " + password);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
```

### 写入 HCL 配置文件

可以使用 JSON 格式的库创建一个 Java 对象，然后将该对象转换为 HCL 格式的字符串，最后写入文件：

```java
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.dataformat.hocon.HoconFactory;
import com.typesafe.config.Config;
import com.typesafe.config.ConfigFactory;

import java.io.File;
import java.io.IOException;

public class WriteHclFile {
    public static void main(String[] args) {
        try {
            // 创建配置对象
            Config config = ConfigFactory.empty()
                    .withValue("server.hostname", ConfigFactory.parseString("example.com"))
                    .withValue("server.port", ConfigFactory.parseString("8080"))
                    .withValue("database.url", ConfigFactory.parseString("jdbc:mysql://localhost:3306/mydb"))
                    .withValue("database.username", ConfigFactory.parseString("admin"))
                    .withValue("database.password", ConfigFactory.parseString("secret"));

            // 转换为 HCL 格式的字符串
            ObjectMapper objectMapper = new ObjectMapper(new HoconFactory());
            String hclString = objectMapper.writeValueAsString(config);

            // 写入文件
            objectMapper.writeValue(new File("config.hcl"), config);
        } catch (JsonProcessingException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
```

以上代码示例使用了 Jackson 库来读写 JSON 格式的数据，并利用 Jackson 的 HOCON 格式支持来处理 HCL 配置文件。

需要通过 Maven 或其他方式将 Jackson 相关的库添加到项目中。

## java 有哪些可以解析 hcl 配置文件的开源工具？介绍一下如何使用

在 Java 中解析 HCL（HashiCorp Configuration Language）配置文件可以使用一些第三方库，虽然并没有专门用于解析 HCL 的 Java 库，但可以使用 JSON 格式的库来处理类似的结构化数据。以下是一些常用的 Java 库以及如何使用它们来解析 HCL 配置文件的示例：

### 1. Jackson + HOCON

Jackson 是一个流行的 Java 库，用于处理 JSON 格式的数据。

它提供了对 HOCON（Human-Optimized Config Object Notation）格式的支持，HOCON 是一种扩展了 JSON 格式的配置文件语言，与 HCL 有些类似。

#### 使用步骤：

1. **添加依赖**：
   首先需要在项目中添加 Jackson 相关的依赖项，以及支持 HOCON 格式的模块。

   ```xml
   <dependency>
       <groupId>com.fasterxml.jackson.core</groupId>
       <artifactId>jackson-databind</artifactId>
       <version>2.13.0</version>
   </dependency>
   <dependency>
       <groupId>com.fasterxml.jackson.dataformat</groupId>
       <artifactId>jackson-dataformat-hocon</artifactId>
       <version>2.13.0</version>
   </dependency>
   ```

2. **解析 HCL 文件**：
   以下是一个示例代码，演示如何使用 Jackson 来解析 HCL 格式的配置文件：

   ```java
   import com.fasterxml.jackson.databind.ObjectMapper;
   import com.fasterxml.jackson.dataformat.hocon.HoconFactory;
   import com.typesafe.config.Config;
   import java.io.File;
   import java.io.IOException;

   public class HclParser {
       public static void main(String[] args) {
           try {
               ObjectMapper objectMapper = new ObjectMapper(new HoconFactory());
               Config config = objectMapper.readValue(new File("config.hcl"), Config.class);

               // 读取配置项
               String value = config.getString("key");
               System.out.println("Value: " + value);
           } catch (IOException e) {
               e.printStackTrace();
           }
       }
   }
   ```

### 2. Hutool

Hutool 是一个 Java 工具库，提供了丰富的工具类和方法。它也支持解析 HOCON 格式的配置文件。

文件：

```java
import cn.hutool.setting.dialect.HoconSetting;

public class HclParser {
    public static void main(String[] args) {
        // 创建 HoconSetting 对象并加载配置文件
        HoconSetting setting = new HoconSetting("config.hcl");

        // 读取配置项
        String value = setting.getByGroup("group").getStr("key");
        System.out.println("Value: " + value);
    }
}
```

以上就是使用 Jackson 和 Hutool 这两个常用的 Java 库来解析 HCL 格式的配置文件的示例。

你可以根据自己的项目需求和偏好选择合适的库来处理 HCL 文件。

# 小结

## 给 hcl 格式配置文件做一个简单的总结

HCL（HashiCorp Configuration Language）文件是一种用于编写配置文件的格式，由 HashiCorp 公司开发。

它具有以下特点和结构：

1. **人类可读性强**：
   HCL 文件采用了简洁、直观的语法，易于阅读和编写。它使用键值对的形式表示配置项，支持注释和分组，使得配置文件更加清晰和易于理解。

2. **支持复杂数据结构**：
   HCL 支持复杂的数据结构，包括列表、字典、嵌套结构等，能够满足各种不同类型的配置需求。这使得配置文件可以更加灵活地表示复杂的配置信息。

3. **模块化和引用机制**：
   HCL 支持模块化和引用机制，可以通过引用其他配置文件或模块来实现配置的复用和组合。这种模块化的设计使得配置文件更加灵活和可维护。

4. **与工具集成**：
   HCL 主要用于 HashiCorp 公司的开源工具和产品，如 Terraform、Vault、Consul 等。它与这些工具的集成良好，可以方便地与这些工具进行交互，实现自动化部署和管理。

总的来说，HCL 文件是一种简洁、灵活且易于理解的配置文件格式，适用于各种不同类型的配置需求。

它在 HashiCorp 工具集中得到了广泛应用，成为了一种流行的配置文件格式。

# 参考资料

https://github.com/hashicorp/hcl/blob/main/hclsyntax/spec.md

* any list
{:toc}
