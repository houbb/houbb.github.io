---
layout: post
title: 编译原理系列-05-Predictive analysis 预测分析
date:  2020-6-4 13:34:28 +0800
categories: [Java]
tags: [java, compiling-principle, sf]
published: true
---

# 3.2 预测分析

有些文法使用了像递归下降这样的简单算法来简化分析。

实际上，就是把每个文法产生式转换成一个递归函数的子句。

如文法3.11所示。

- 文法3.11

```
S→if E then S else S    L→end
S→beginS L              L→；SL
S→print E
                        E→num=num
```

这种语言的一个递归下降分析器对应每个非终结符都有一个函数，对应每个产生式都有一个子句：

```
    finalint IF=l， THEN=2， ELSE=3， BEGIN=4， END=5， PRINT=6，
    SEMI=7， NUM=8， EQ=9；
int to k=get Token() ；
void advance()(to k=get Token() ； )
void eat(in tt)(if(to k=mt) advance() ； else error() ； )
void S()(switch(to k)(
case IF：eat(IF) ； E() ； eat(THEN) ； S() ；
    eat(ELSE) ； S() ； break；
case BEGIN：eat(BEGIN) ； S() ； L() ； break；
case PRINT：eat(PRINT) ； E() ； break；
default：error() ；
    ))
void L()(switch(tok) (
    case END：eat(END) ； 
    break；case SEMI：eat(SEMI) ； 
    S() ； L() ； 
    break；default：error() ；
}}

void E()eat(NUM) ； eat(EQ) ； eat(NUM) ；)
```

若有 error 和 get Token 的恰当定义， 程序分析会进行得很顺利。

上例成功地使用了这种简单方法，下面考虑

- 文法 3.10：

```
voidS() {E() ； eat(E OF)}； 
void E(){switch(to k)(case?：E() ； eat(PLUS) ； T() ； break；case?； E() ； eat(MINUS) ； T() ； break；case?：T() ； break；default：error()；}}
void T(){switch(tok)(
    case?：T() ； eat(TIMES) ； F() ； break；
    case?：T() ； eat(DIV) ； F() ； break；
    case?：F() ； break；
    default：error() ；
}}
```

这里存在一个冲突：函数E不知道该使用哪个子句。考虑字符串`(1*2-3)+4`和`(1*2-3)`。

对于前者，最先对E的调用应使用E→E+T产生式；对于后者，应该使用E→T。

- 文法3.12

```
Z→d
    Y→ X→Y
Z→XYZ Y→c X→a
```

递归下降、预测或者分析仅限于如下的文法中：每个子表达式的第一个终结符号为选择产生式提供了足够多的信息。为了便于理解， 需要引人一个FIRST集的概念， 然后使用一个简单算法推导一个无冲突递归下降分析器。

就像正则表达式可以构造词法分析器一样，也存在构造预测分析器的分析器生成工具、如果可以使用工具、也可能用到基于强大的LR(1)分析算法的工具，这在3.3节中会加以描述。
    
有时使用分析器生成工具并不方便，或者说是不现实。

预测分析器的优点是**算法简单，甚至可以自己构造分析器，而无需自动构造工具**。

# 3.2.1 FIRST和FOLLOW集

假设y是任意的文法符号串。FIRST(y) 是所有以y开始推导的终结符号集合。

例如、设 y=T * F，任何以 y 推导的终结符号串都是以id， num或 `(` 开始的。所以， `FIRST(T*F) = { id, num, ( };`

若两个不同的产生式X-yi和X→y 2左边有相同的符号(X) ， 而且右边有重叠的FIRST集，那么， 这个文法不能使用预测分析法进行分析。

若存在终结符I，既在FIRST(yi) 中，又在FIRST(Y) 中、那么， 在输人字符为 I 时，递归下降分析器中的X函数将不知怎样工作、FIRST集的计算很简单：

若y=XYZ，仅从表面上看，这里只关心FIRST(X)，Y和乙可以忽略、下面以文法3.12为例。

因为Y可能产生空串(X 也可能产生空串) ， 所以 FIRST(XYZ) 必须包括FIRST(Z) 。

因此，在计算FIRST集时， 必须跟踪可能产生空串的字符；可以将这样的字符看做是可空的nullable字符。

所以必须跟踪在空字符之后可能出现的字符。

考虑一个特殊的文法、y是一个任意的文法符号串。

- 若X可以导出空串、那么nullable(X) 值为真、

- FIRST(y) 是以y开始推导的终结符号集合。

- FOLLOW是出现在X之后的终结符的集合。也就是说，若推导中包含X_t，那么 t ∈ FOLLOW(X) ：若出现包含XYZ_t的推导， 且Y、Z均可导出 epolison，那么t也属于FOLLOW(X) 、

对FIRST， FOLLOW和nullable的一个精确的定义是：它们都是这些属性中的最小集合，对于每个终结符号Z、FIRST[Z] = {Z}。

![image](https://user-images.githubusercontent.com/18375710/84337158-72be3400-abcb-11ea-9934-aa7ca162fc06.png)

下面的赋值语句等做了简单的替换。

![image](https://user-images.githubusercontent.com/18375710/84337214-941f2000-abcb-11ea-8727-cf01ac1c58a3.png)

将集合的等式组转换为对集合计算， 这一算法已经讨论过了， 如e-closure的计算算法。以后还会用到这样的算法，如在编译器的最后部分，将会学习到将定点迭代技术应用于数据流分析的优化。

下面对文法3.12使用这一算法：

```
    nullable FIRST FOLLOW
    ------------------------
X   | no
Y   | no
Z   | no
```

下面是计算FIRST， FOLLOW和nullable的算法。

先对FIRST和FOLLOW初始化为空， 对nullable初始化为false。

在迭代中，发现 a ∈ FIRST[X] ， Y的nullable为真，c ∈ FIRST[Y] ， d ∈ FIRST[Z] ， d ∈ FOLLOW[X] ， c ∈ FOLLOW[X] ， d ∈ FOLLOW[Y] 。

因此得到：

    nullable FIRST FOLLOW
    ------------------------
X   | no      a      cd 
Y   | yes     c       d
Z   | no      d

![image](https://user-images.githubusercontent.com/18375710/84337613-959d1800-abcc-11ea-8c8a-945027a8c1f8.png)


# 3.2.2 构造一个预测分析器

下面来看一下递归下降分析器某非终结符X的分析函数中，对应每个X产生式都有一个子句，函数必须依据接收的下一个字符来选择其中的一个子句。

若为每一个(X，T)都选择了正确的产生式，那么就完成了递归下降分析器。

所有需要的信息都可以被编码为产生式的二维表，并用非终结符X和终结符T作为索引

为了构造该表， 在X行键入产生式X→y。FIRST(y) 中的元素构成表的T列。

如果y的nullable为真， 在X行、T列为每个T FOLLOW[X] 键人产生式。

图3.14所示为文法3.12的预测分析器：但是有些入口的产生式多于一个。

这些多重定义人口的出现意味着预测分析法对文法3.12是不可行的：

若仔细地检查这一文法，就能发现它是二义性的。

因为句子 d 有多棵分析树、如下所示：

```
Z
|
|
D
```

二义性文法通常会导致有多重定义人口的预测分析表。若要将文法3.12的语言作为编程语言，那么就需要找到一个无二义性的文法。

若一个文法的预测分析表不含多重定义人口，那么该文法称为LL(1)文法。它分别代表自左而右的分析、最左推导和一个lookahead符号。

显然， 递归下降(预测) 分析器每一边都会自左而右地扫描输人符号(某些分析算法不是这样工作的，但它们通常不用于编译器)。预测分析器将非终结符放到右边的顺序(即递归下降分析器调用相关非终结符的函数)恰好是最左推导的顺序。递归下降分析器仅需向前查看一个输人记号就能完成这项工作，不需要向前查看多个符号。

可以将FIRST集的概念推广到描述字符串的k个记号， 那么在LL(k) 分析表中， 可以以非终结符作为行，每个k终结符队列作为列。实际上很少这样做(因为该表太大了)，但有时在实现递归分析器时，需要查找多个记号。

利用LL(2)分析表分析的文法称为LL(2)文法，类似地，还有LL(3)文法，等等。

所有LL(1)文法都属于LL(2)文法，依次类推。无论k取何值，LL(k)都不是二义性文法。

# 3.2.3 消除左递归

为文法 3.10 建立一个预测分析器。

下例两个产生式：

```
E→E+T
E→T
```

会导出有多重定义入口的预测分析表，因为FIRST(T) 中的记号也在FIRST(E+T)中。

这里E作为第一个符号出现在E产生式的右边，这称为左递归。存在左弟归的文法不是LL(1)文法。

为了消除左递归，需要用右递归来重写文法。

下面引人一个新的非终结符E'：

- 文法 3.15

```
E→TE'
E'→+TE'
E'→→
S→E$
    T→FT'
E→TE'
    F→id
T'→>*FT' F→num
E'→+TE' T'→/FT F→(E)
E'→-TE' T'→
E'→>
```

现在得到的是与初始的两个产生式同样的字符串集，但是已经消除了左递归。

通常情况下，当有产生式X→Xy，X→α，且α不是以X为开始符号时，那么，就可以得到形如 αy*、α 后或者为空或者有多个y的字符串。

所以可以用右递归来重写正则表达式：

![image](https://user-images.githubusercontent.com/18375710/84343384-9b99f580-abda-11ea-8c79-197996c23eb7.png)

对文法3.10进行转换后可以得到文法3.15。

为实现预测分析器， 首先计算nullable， FIRST和FOLLOW集(参见表3.16) 。

文法3.15的预测分析器参见表3.17。

![image](https://user-images.githubusercontent.com/18375710/84344248-e0bf2700-abdc-11ea-8e3e-2029f00515fe.png)

# 左因子

前面介绍了左递归对预测分析的干扰，但可以消除左递归。

还有一个类似的问题，就是同一个非终结符的两个产生式的右端有相同的左因子。

例如：

```
S→if E the nS elseS
S→if E the nS
```

在这种情况下，可以对文法提取左因子，即去掉非公共的尾部(else S 和 e) ， 然后用一个新的非终结符X代替它们：

```
S→if E then S X
X→
X→else S
```

修改后的产生式将不会干扰预测分析器。

虽然文法仍然是二义性的(分析表中仍存在多重定义的人口) ， 但可以通过else S来解决二义性问题。

# 3.2.5 出错恢复

有了预测分析表，就很容易实现递归下降分析器了。

下面是文法3.15分析器中一个典型的程序段：

```
void T()(switch(tok)
    case ID：
    case NUM：
    case LPAREN：FQ； T prime() ； break；
    default：error!
    ))

void T prime()(switch(tok)
    case PLUS：pre ak；
    case TIMES：eat(TIMES) ； F.() ：T prime() ； break；
    case E OF： break；
    case RPAREN：break；
    default：error!
        ))
```

在LL(1)分析表的T行、X列存在一个空人口，这说明分析函数T()不接收记号x——这就是一处语义错误。


那么如何来处理这处错误呢?

可以作为一个异常事件退出分析，但这样对于用户来说是不友好的。

比较好的处理方式是，**输出一条错误信息，然后在错误处恢复分析过程，从而保证在同一编译过程中发现其他语义错误**。

当输人的字符不是语言中的句子时，就会产生语义错误。

错误恢复就是寻找和字符串相类似的句子，其中会出现删除、替代或插人记号等操作。

例如， T的出错恢复会插人一个num记号。没有必要对正确的输人进行调整， 假定num存在，打印出错信息，然后正常返回。

```
void T()(switch(to k) 《
    case ID：
    case NUM；
    case LPAREN：F() ； T prime() ； break；
    default：print(”expected id， num， or left-paren”) ；
    ))
```

用插入进行错误恢复是一种不太安全的做法，若该错误关联了其他错误，那么这一过程就会无限地循环下去。

用删除进行错误恢复相对更安全些，因为在文件结束时，循环最终会终止。

通过删除并进行简单的出错恢复可以采取如下方式：不断地跳过记号，直到记号与FOLLOW集元素吻合。

例如， T'的出错恢复为：

```
    int T prime_follow(] =(PLUS， RPAREN， E OF) ；
    void T prime() (switch(to k)(
    case PLUS：break；
    case TIMES：eat(TIMES) ； F() ； T prime() ； break；
    case RPAREN：break；
    case E OF：break；
    default：print(”expected+，*，right-paren，
    orend-of-file”) ；
        skip to(T prime_follow) ；
```

递归下降分析器的错误恢复机制必须不断调整(有时需要试验)，从而避免因一个单独记号错误而导致的大量错误修复信息。

# 参考资料

《现代编译原理 java》

* any list
{:toc}