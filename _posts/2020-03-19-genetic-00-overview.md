---
layout: post
title: 遗传算法-00-java 入门实现概览
date:  2020-3-19 19:39:08 +0800
categories: [Java]
tags: [genetic, java, sh]
published: true
---

# 前言

遗传算法的相关思想已经看过一些，不过没有自己实现过，还是觉得比较抽象。

所以准备实现最简单的版本。

# 简介

基因遗传算法是一种灵感源于达尔文自然进化理论的启发式搜索算法。该算法反映了自然选择的过程，即最适者被选定繁殖，并产生下一代。

本文简要地介绍了遗传算法的基本概念和实现，希望能为读者展示启发式搜索的魅力。

# 自然选择的概念

自然选择的过程从选择群体中最适应环境的个体开始。后代继承了父母的特性，并且这些特性将添加到下一代中。

如果父母具有更好的适应性，那么它们的后代将更易于存活。

迭代地进行该自然选择的过程，最终，我们将得到由最适应环境的个体组成的一代。

这一概念可以被应用于搜索问题中。我们考虑一个问题的诸多解决方案，并从中搜寻出最佳方案。

## 核心步骤

遗传算法含以下五步：

1. 初始化

2. 个体评价（计算适应度函数）

3. 选择运算

4. 交叉运算

5. 变异运算

# 基本概念

## 初始化

该过程从种群的一组个体开始，且每一个体都是待解决问题的一个候选解。

个体以一组参数（变量）为特征，这些特征被称为基因，串联这些基因就可以组成染色体（问题的解）。

在遗传算法中，单个个体的基因组以字符串的方式呈现，通常我们可以使用二进制（1和0的字符串）编码，即一个二进制串代表一条染色体串。

因此可以说我们将基因串或候选解的特征编码在染色体中。

## 种群、染色体和基因

个体评价利用适应度函数评估了该个体对环境的适应度（与其它个体竞争的能力）。

每一个体都有适应度评分，个体被选中进行繁殖的可能性取决于其适应度评分。

适应度函数值越大，解的质量就越高。适应度函数是遗传算法进化的驱动力，也是进行自然选择的唯一标准，它的设计应结合求解问题本身的要求而定。

## 选择运算

选择运算的目的是选出适应性最好的个体，并使它们将基因传到下一代中。

基于其适应度评分，我们选择多对较优个体（父母）。适应度高的个体更易被选中繁殖，即将较优父母的基因传递到下一代。

## 交叉运算

交叉运算是遗传算法中最重要的阶段。对每一对配对的父母，基因都存在随机选中的交叉点。

举个例子，下图的交叉点为3。

![交叉运算](https://ss1.baidu.com/6ONXsjip0QIZ8tyhnq/it/u=581833144,1342997806&fm=173&s=5A863C62198EE8C8104005C90000B0B2&w=481&h=398&img.JPG)

父母间在交叉点之前交换基因，从而产生了后代。

父母间交换基因，然后产生的新后代被添加到种群中。

## 变异运算

在某些形成的新后代中，它们的某些基因可能受到低概率变异因子的作用。

这意味着二进制位串中的某些位可能会翻转。

![变异运算](https://ss1.baidu.com/6ONXsjip0QIZ8tyhnq/it/u=769739725,1864323716&fm=173&s=1EAA7C23C1864CEA46E161DF000050B2&w=478&h=286&img.JPG)

变异运算前后

变异运算可用于**保持种群内的多样性，并防止过早收敛**。

## 终止

在群体收敛的情况下（群体内不产生与前一代差异较大的后代）该算法终止。

也就是说遗传算法提供了一组问题的解。

# 案例实现

种群的规模恒定。新一代形成时，适应度最差的个体凋亡，为后代留出空间。

这些阶段的序列被不断重复，以产生优于先前的新一代。

## 迭代的伪代码

这一迭代过程的伪代码：

```
START

Generate the initial population

Compute fitness

REPEAT

Selection

Crossover

Mutation

Compute fitness

UNTIL population has converged

STOP
```

## 个人的理解

我下面说下我所理解的遗传算法，我所理解的遗传算法其实就是“广撒网多捞鱼”,怎么讲？

遗传算法一般是先确定初始的群体，群体的每个个体都有两部分组成：

1，染色体，也就是基因序列，2，适应性函数 也就是进化能力 ，其中基因序列指的是在实际问题中的一些起主要决定作用的一些特征的编码，

主要分为两种：二进制编码和浮点数编码，这种所谓的编码其实就是对应着该“个体”的特征值，而确定了特征编码之后，因为遗传算法还需要进行进化，那么就需要对个体的“适应环[size=medium]境的能力”进行考量，在实际问题中其实也就是距离真正最优解的度量。

我理解这个部分的内容为“广撒网阶段”

在确定初始群体之后，就需要进行选择和进化，其实是选择其中的优胜者得到下一代，选择是依据进化论的“物竞天择”理论，也就是适应度越好的个体越容易被选出来，在算法的实现过程中这一部分一般使用“转盘赌”算法实现，所谓“转盘赌”算法，比如现在有四个个体，适应度分别是3,6,9,12 ，那么选择下一代就相当于在一个四个区域的转盘上转指针，其中3的区域占3/(3+6+9+12)=10%，以此类推，当指针停在哪个区域上表示选中哪个个体，显然，适应度越高的个体越容易被选中，在编程中，一般使用这样的算法：

第一步：选择一个介于0（本文讨论的内容适应度大多为正，因为为负的话这种转盘赌方法不适用）和总适应度的适应度，也就是可以描述为：rand(0,1)乘以总的适应度，

第二步骤:将种群的所有个体的适应度进行累加，如果当加到某个个体的时候累加的适应度大于了第一步所得到的适应度，那么就将这个个体取出来

其实有人会质疑，这种算法实现的转盘赌是不是真的是有效的，我不太清除如何使用使用数学概率推导说明，但是这种方法实现的转盘赌还是有一定道理的，直观的理解就是，假设在前N-1步到了比步骤一的数字小的累加和，那么第N步能够超越步骤一的累加和的数字肯定是偏向适应度大的那个个体(没有数学上的证明，只是直观想像)

好了，选择出杂交的后代接下来就是进行产生后代了，产生后代的过程过程其实是染色体交换和基因变异的过程，对于二进制编码而言，染色体交换是交换父母的一部分序列，基因变异是其中几个序列由1变成0或者0变为1的过程；

对于浮点数编码的话，那么染色体交换是一样的（在下文的例子中间因为基因只有一个浮点数的编码，所以没有用到染色体交换），基因突变是指在原有的浮点数基础上加一点随机噪音（加一点变化步长）

# Java 中的示例实现

以下展示的是遗传算法在Java中的示例实现，我们可以随意调试和修改这些代码。

给定一组五个基因，每一个基因可以保存一个二进制值0或1。

这里的适应度是基因组中1的数量。如果基因组内共有五个1，则该个体适应度达到最大值。

如果基因组内没有1，那么个体的适应度达到最小值。

该遗传算法希望最大化适应度，并提供适应度达到最大的个体所组成的群体。

注意：本例中，在交叉运算与突变运算之后，适应度最低的个体被新的，适应度最高的后代所替代。

## 问题

求解二次函数 f(x,y)=x^2 + y^2 (x和y的取值范围为1到127的正整数)的最大值。

## 思路

阶梯思路是先随机在0-4之间选择一个种群，以横坐标作为其基因序列，以函数值作为其适应度，然后不断的选择-交叉重组-变异，去除适应度（函数值）低的留下适应度高的，然后不断迭代找到最优解

## 编码

由于遗传算法的运算对象是表示个体的符号串，所以必须把变量x,y编码为一种符号串。

在这里采用无符号二进制整数来表示。

因x,y的取值范围为1到127, 则可用两个7位二进制数来分别表示它们。

而一个基因就是一个14位二进制串。

例如，基因型00000001111111所对应的表现型是：x=0,y=127。

在代码中的具体体现为：设计类Chromosome，其具有私有整形字段x,y表示x,y的十进制值、String字段gene表示二进制串。

并使用常量定义其最大值或最大长度。

代码如下：

```java
public static final int GENG_LENGTH = 14;
public static final int MAX_X = 127;
public static final int MAX_Y = 127;
private int x,y;
private String gene;
```

## 初始群体的产生

遗传算法是对群体进行的进化操作，所以第一步要产生一个初始种群，再进行后续的交叉、变异、选择等操作。

在具体实现上，初始种群的产生较为简单。首先对类Chromosome进行构造函数的编写，主要写了以下两种构造函数：

```java
public Chromosome(String gene) //给定基因串构造染色体
public Chromosome(int x,int y) //给定表现型构造染色体
```

在这里用到了第二个构造函数，首先随机产生两个1到127之间的数作为X,Y，再调用构造函数生成新染色体并添加到初始种群中去。

如此重复，直到种群规模达到要求。

具体代码如下:

```java
public static ArrayList<Chromosome> initGroup(int size) {
    ArrayList<Chromosome> list = new ArrayList<Chromosome>();
    Random random = new Random();
    for(int i = 0; i < size; i++) {
        int x = random.nextInt() % 128;
        int y = random.nextInt() % 128;
        x = x < 0? (-x):x;
        y = y < 0? (-y):y;
        list.add(new Chromosome(x,y));
    }
    return list;
}
```

## 适应度计算

遗传算法中以个体适应度评价其优劣程度，其最终目的是选择出适应度较高的个体。

本文所求解问题，目标函数总取非负值，并且是以求函数最大值为优化目标，故可直接利用目标函数值作为个体的适应度。

ps: 如果是取最小值，可以取反之类的。（要考虑函数的结果符号）

具体求解代码如下：

```java
public int calcFitness() {
    return x*x+y*y;
}
```

## 选择运算

选择运算把当前的群体中适应度较高的个体按照某种规则或模型遗传到下一代个体中。

这里我们使用课堂上讲的“轮盘赌”的方式进行选择。

“轮盘赌”的思想这里不再赘述，只说一下JAVA代码的具体实现过程。

首先计算种群中每个个体的适应度保存到一个数组里。

在这基础上计算“累加适应度”，即第一个适应度为原第一个适应度，第二个为前两个的和，第三个为前三个的和，以此类推。

再将此数组每个元素除以总的适应度。

然后进行选择，选择次数和设定好的种群规模相同（这样便可以控制种群的规模不会无限的上涨）。

每次选择时，先产生一个0到1之间的随机数。

在上述数组中遍历找到第一个大于此随机数的元素，这个元素对应的个体被选择。

具体代码如下：

```java
public static ArrayList<Chromosome> selector(ArrayList<Chromosome> fatherGroup,int sonGroupSize) 
{
    ArrayList<Chromosome> sonGroup = new ArrayList<Chromosome>();
    int totalFitness = 0;
    double[] fitness = new double[fatherGroup.size()];
    for(Chromosome chrom : fatherGroup) {
        totalFitness += chrom.calcFitness();
    }
    int index = 0;
    //计算适应度
    for(Chromosome chrom : fatherGroup) {
        fitness[index] = chrom.calcFitness() / ((double)totalFitness);
        index++;
    }
    //计算累加适应度
    for(int i = 1; i < fitness.length; i++) {
        fitness[i] = fitness[i-1]+fitness[i];
    }
    //轮盘赌选择 
    for(int i = 0; i < sonGroupSize; i++) {
        Random random = new Random();
        double probability = random.nextDouble();
        int choose;
        for(choose = 1; choose < fitness.length - 1; choose++) {
            if(probability < fitness[choose])
                break;
            }
            sonGroup.add(new Chromosome(fatherGroup.get(choose).getGene()));
        }
        return sonGroup;
    }
```

## 交叉运算

交叉运算是遗传算法中产生新个体的主要操作过程，它以某一概率相互交换某两个个体之间的部分染色体。

本文采用单点交叉的方法，具体操作过程是：

**先对群体进行随机配对；其次随机设置交叉点位置；最后再相互交换配对染色体之间的部分基因。**

具体的算法流程按照老师课件上讲的，这里也不赘述了。

只说一下具体代码实现原理。

这个算法的要点在于随机配对个体进行交叉、字符串的拼接操作和生成新个体。

随机配对可以使用一个do while循环，选择两个不同的个体。

然后随机选取交叉点，进行两个基因字符串的交叉。

最后生成新的个体，采用以下构造函数生成新的个体：`public Chromosome(String gene)`。

具体代码如下：

```java
public static ArrayList<Chromosome> corssover(ArrayList<Chromosome> fatherGroup,double probability) {
    ArrayList<Chromosome> sonGroup = new ArrayList<Chromosome>();
    sonGroup.addAll(fatherGroup);
    Random random = new Random();
    for(int k = 0; k < fatherGroup.size() / 2; k++) {
        if(probability > random.nextDouble()) {
            int i = 0,j = 0;
            do {
                i = random.nextInt(fatherGroup.size());
                j = random.nextInt(fatherGroup.size());
            } while(i == j);
            int position = random.nextInt(Chromosome.GENG_LENGTH);
            String parent1 = fatherGroup.get(i).getGene();
            String parent2 = fatherGroup.get(j).getGene();
            String son1 = parent1.substring(0, position) + parent2.substring(position);
            String son2 = parent2.substring(0, position) + parent1.substring(position);
            sonGroup.add(new Chromosome(son1));
            sonGroup.add(new Chromosome(son2));
        }
    }
    return sonGroup;
}
```

ps: 这里是新增了两个子元素。

## 变异运算

变异运算是对个体的某一个或某一些基因按某一较小的概率进行改变，它也是产生新个体的一种操作方法。

本文中我们采用如下方式进行变异：遍历群体中所有个体的所有基因位，以一个较小的概率对每个基因位进行变异操作即1变成0,0变成1。

在Java代码中具体实现时，我们先编写一个函数对一个个体的基因进行改变，即用新基因串代替旧基因串。

该函数编写如下：

```java
public void selfMutation(String newGene) {
        if(newGene.length() != Chromosome.GENG_LENGTH)
            return;
        this.gene = newGene;
        String xStr = newGene.substring(0, Chromosome.GENG_LENGTH/2);
        String yStr = newGene.substring(Chromosome.GENG_LENGTH/2);
        this.x = Integer.parseInt(xStr,2);
        this.y = Integer.parseInt(yStr,2);
}
```

然后，按照上述说法对每一位基因进行遍历，按指定概率进行变异操作。

具体代码如下所示：

```java
public static void mutation(ArrayList<Chromosome> fatherGroup,double probability) {
    Random random = new Random();
    Chromosome bestOne = Chromosome.best(fatherGroup);
    fatherGroup.add(new Chromosome(bestOne.getGene()));
    for(Chromosome c : fatherGroup) {
        String newGene = c.getGene();
        for(int i = 0; i < newGene.length();i++){
            if(probability > random.nextDouble()) {
                String newChar = newGene.charAt(i) == '0'?"1":"0";
                newGene = newGene.substring(0, i) + newChar + newGene.substring(i+1);
            }
        }
        c.selfMutation(newGene);
    }
}
```

## 测试效果

以上实现了所有子模块。

下面使用上述模块进行实际的遗传算法求解操作。

首先产生初始种群，按照交叉、变异、选择的顺序进行循环，直到选出符合要求的个体，这里设置的条件为适应度大于等于32258时终止，这也是本题中能达到的最大适应度。

```java
final int GROUP_SIZE = 20;//种群规模
final double CORSSOVER_P = 0.6;//交叉概率
final double MUTATION_P = 0.01;//变异概率
ArrayList<Chromosome> group = Chromosome.initGroup(GROUP_SIZE);
Chromosome theBest;
do{
    group = Chromosome.corssover(group, CORSSOVER_P);
    Chromosome.mutation(group, MUTATION_P);
    group = Chromosome.selector(group, GROUP_SIZE);
    theBest = Chromosome.best(group);
    System.out.println(theBest.calcFitness());
}while(theBest.calcFitness() < 32258);
```

# 拓展题目

求解 `f=x*sin(10PI*x)+2` 在 `[0,4]` 之间的最大值

# 参考资料

《演化程序-遗传算法和数据编码的结合》

《遗传算法与工程优化》

《Java 遗传算法编程》

[遗传算法的基本概念和实现（附 Java 实现案例）](https://baijiahao.baidu.com/s?id=1572602118949729&wfr=spider&for=pc)

[遗传算法入门到掌握（一）](https://blog.csdn.net/emiyasstar__/article/details/6938608)

[遗传算法求解函数最大值Java实现](https://www.jianshu.com/p/bad61c799ca9)

[遗传算法Java实现以及TSP问题遗传算法求解](https://www.cnblogs.com/biaoyu/archive/2012/10/02/2710267.html)

* any list
{:toc}