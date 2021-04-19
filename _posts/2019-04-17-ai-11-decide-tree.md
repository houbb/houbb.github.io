---
layout: post
title: 老马学机器学习-11-决策树算法详解及 java 实现
date:  2018-11-14 08:38:35 +0800
categories: [ML]
tags: [ML, ai, math, sh]
published: true
---

# 决策树

在现实生活中，我们会遇到各种选择，不论是选择男女朋友，还是挑选水果，都是基于以往的经验来做判断。如果把判断背后的逻辑整理成一个结构图，你会发现它实际上是一个树状图，这就是我们今天要讲的决策树。

# 决策树的工作原理

决策树基本上就是把我们以前的经验总结出来。

如果我们要出门打篮球，一般会根据“天气”、“温度”、“湿度”、“刮风”这几个条件来判断，最后得到结果：去打篮球？还是不去？

![输入图片说明](https://images.gitee.com/uploads/images/2021/0418/205137_4f5af1d7_508704.png "屏幕截图.png")

上面这个图就是一棵典型的决策树。我们在做决策树的时候，会经历两个阶段：构造和剪枝。

## 构造

构造就是生成一棵完整的决策树。

简单来说，构造的过程就是选择什么属性作为节点的过程，那么在构造过程中，会存在三种节点：
 
1. 根节点：就是树的最顶端，最开始的那个节点。在上图中，“天气”就是一个根节点；

2. 内部节点：就是树中间的那些节点，比如说“温度”、“湿度”、“刮风”；

3. 叶节点：就是树最底部的节点，也就是决策结果。

节点之间存在父子关系。比如根节点会有子节点，子节点会有子子节点，但是到了叶节点就停止了，叶节点不存在子节点。那么在构造过程中，你要解决三个重要的问题：

1. 选择哪个属性作为根节点；

2. 选择哪些属性作为子节点；

3. 什么时候停止并得到目标状态，即叶节点。

## 剪枝

剪枝就是给决策树瘦身，这一步想实现的目标就是，不需要太多的判断，同样可以得到不错的结果。

之所以这么做，是为了防止“过拟合”（Overfitting）现象的发生。

过拟合：指的是模型的训练结果“太好了”，以至于在实际应用的过程中，会存在“死板”的情况，导致分类错误。

欠拟合：指的是模型的训练结果不理想。

![输入图片说明](https://images.gitee.com/uploads/images/2021/0418/205257_f9ab8584_508704.png "屏幕截图.png")

造成过拟合的原因：

一是因为训练集中样本量较小。如果决策树选择的属性过多，构造出来的决策树一定能够“完美”地把训练集中的样本分类，但是这样就会把训练集中一些数据的特点当成所有数据的特点，但这个特点不一定是全部数据的特点，这就使得这个决策树在真实的数据分类中出现错误，也就是模型的“泛化能力”差。

泛化能力：指的分类器是通过训练集抽象出来的分类能力，你也可以理解是举一反三的能力。如果我们太依赖于训练集的数据，那么得到的决策树容错率就会比较低，泛化能力差。因为训练集只是全部数据的抽样，并不能体现全部数据的特点。

剪枝的方法：

预剪枝：在决策树构造时就进行剪枝。方法是，在构造的过程中对节点进行评估，如果对某个节点进行划分，在验证集中不能带来准确性的提升，那么对这个节点进行划分就没有意义，这时就会把当前节点作为叶节点，不对其进行划分。

后剪枝：在生成决策树之后再进行剪枝。通常会从决策树的叶节点开始，逐层向上对每个节点进行评估。如果剪掉这个节点子树，与保留该节点子树在分类准确性上差别不大，或者剪掉该节点子树，能在验证集中带来准确性的提升，那么就可以把该节点子树进行剪枝。
方法是用这个节点子树的叶子节点来替代该节点，类标记为这个节点子树中最频繁的那个类。

# 如何判断要不要去打篮球？

![输入图片说明](https://images.gitee.com/uploads/images/2021/0418/205749_958eef20_508704.png "屏幕截图.png")

我们该如何构造一个判断是否去打篮球的决策树呢？

再回顾一下决策树的构造原理，在决策过程中有三个重要的问题：将哪个属性作为根节点？选择哪些属性作为后继节点？什么时候停止并得到目标值？

显然将哪个属性（天气、温度、湿度、刮风）作为根节点是个关键问题，在这里我们先介绍两个指标：纯度和信息熵。

## 纯度：

你可以把决策树的构造过程理解成为寻找纯净划分的过程。数学上，我们可以用纯度来表示，纯度换一种方式来解释就是让目标变量的分歧最小。

举个例子，假设有 3 个集合：

集合 1：6 次都去打篮球；

集合 2：4 次去打篮球，2 次不去打篮球；

集合 3：3 次去打篮球，3 次不去打篮球。

按照纯度指标来说，集合 1> 集合 2> 集合 3。因为集合1 的分歧最小，集合 3 的分歧最大。

## 信息熵：表示信息的不确定度

在信息论中，随机离散事件出现的概率存在着不确定性。

为了衡量这种信息的不确定性，信息学之父香农引入了信息熵的概念，并给出了计算信息熵的数学公式：

![输入图片说明](https://images.gitee.com/uploads/images/2021/0418/205850_a791e32e_508704.png "屏幕截图.png")

p(i|t) 代表了节点 t 为分类 i 的概率，其中 log2 为取以 2 为底的对数。这里我们不是来介绍公式的，而是说存在一种度量，它能帮我们反映出来这个信息的不确定度。

**当不确定性越大时，它所包含的信息量也就越大，信息熵也就越高。**

举个例子，假设有 2 个集合：

集合 1：5 次去打篮球，1 次不去打篮球；

集合 2：3 次去打篮球，3 次不去打篮球。

在集合 1 中，有 6 次决策，其中打篮球是 5 次，不打篮球是 1 次。

那么假设：类别 1 为“打篮球”，即次数为 5；类别 2 为“不打篮球”，即次数为 1。那么节点划分为类别1的概率是 5/6，为类别2的概率是1/6，带入上述信息熵公式可以计算得出：

![输入图片说明](https://images.gitee.com/uploads/images/2021/0418/205928_0973beda_508704.png "屏幕截图.png")

同样，集合 2 中，也是一共 6 次决策，其中类别 1 中“打篮球”的次数是 3，类别 2“不打篮球”的次数也是 3，那么信息熵为多少呢？

我们可以计算得出：

![输入图片说明](https://images.gitee.com/uploads/images/2021/0418/205948_92526ed9_508704.png "屏幕截图.png")

从上面的计算结果中可以看出，信息熵越大，纯度越低。

当集合中的所有样本均匀混合时，信息熵最大，纯度最低。

我们在构造决策树的时候，会基于纯度来构建。

而经典的 “不纯度”的指标有三种，分别是信息增益（ID3 算法）、信息增益率（C4.5 算法）以及基尼指数（Cart 算法）。

## 信息增益：

信息增益指的就是划分可以带来纯度的提高，信息熵的下降。

它的计算公式，是父亲节点的信息熵减去所有子节点的信息熵。

在计算的过程中，我们会计算每个子节点的归一化信息熵，即按照每个子节点在父节点中出现的概率，来计算这些子节点的信息熵。

所以信息增益的公式可以表示为：

![输入图片说明](https://images.gitee.com/uploads/images/2021/0418/210059_1a894ce0_508704.png "屏幕截图.png")

公式中 D 是父亲节点，Di 是子节点，Gain(D,a)中的 a 作为 D 节点的属性选择。

假设D 天气 = 晴的时候，会有 5 次去打篮球，5 次不打篮球。其中 D1 刮风 = 是，有 2 次打篮球，1 次不打篮球。D2 刮风 = 否，有 3 次打篮球，4 次不打篮球。

那么a 代表节点的属性，即天气 = 晴。

![输入图片说明](https://images.gitee.com/uploads/images/2021/0418/210121_4fa369db_508704.png "屏幕截图.png")

针对图上这个例子，D 作为节点的信息增益为：

![输入图片说明](https://images.gitee.com/uploads/images/2021/0418/210136_e24cab00_508704.png "屏幕截图.png")

也就是 D 节点的信息熵 -2 个子节点的归一化信息熵。2个子节点归一化信息熵 =3/10 的 D1 信息熵 +7/10 的 D2 信息熵。

我们基于 ID3 的算法规则，完整地计算下我们的训练集，训练集中一共有 7 条数据，3 个打篮球，4 个不打篮球，所以根节点的信息熵是：

![输入图片说明](https://images.gitee.com/uploads/images/2021/0418/210158_30824a21_508704.png "屏幕截图.png")

如果你将天气作为属性的划分，会有三个叶子节点 D1、D2 和D3，分别对应的是晴天、阴天和小雨。

我们用 + 代表去打篮球，- 代表不去打篮球。

那么第一条记录，晴天不去打篮球，可以记为 1-，于是我们可以用下面的方式来记录 D1，D2，D3：

D1(天气 = 晴天)={1-,2-,6+}

D2(天气 = 阴天)={3+,7-}

D3(天气 = 小雨)={4+,5-}

我们先分别计算三个叶子节点的信息熵：

![输入图片说明](https://images.gitee.com/uploads/images/2021/0418/210220_3b3acec8_508704.png "屏幕截图.png")

因为 D1 有 3 个记录，D2 有 2 个记录，D3 有2 个记录，所以 D 中的记录一共是 3+2+2=7，即总数为 7。

所以 D1 在 D（父节点）中的概率是 3/7，D2在父节点的概率是 2/7，D3 在父节点的概率是 2/7。

那么作为子节点的归一化 `信息熵 = 3/7*0.918+2/7*1.0=0.965`。

因为我们用 ID3 中的信息增益来构造决策树，所以要计算每个节点的信息增益。

天气作为属性节点的信息增益为，Gain(D , 天气)=0.985-0.965=0.020。

同理我们可以计算出其他属性作为根节点的信息增益，它们分别为：

Gain(D , 温度)=0.128

Gain(D , 湿度)=0.020

Gain(D , 刮风)=0.020

我们能看出来温度作为属性的信息增益最大。因为 ID3 就是要将信息增益最大的节点作为父节点，这样可以得到纯度高的决策树，所以我们将温度作为根节点。

其决策树状图分裂为下图所示：

![输入图片说明](https://images.gitee.com/uploads/images/2021/0418/210303_49c42a48_508704.png "屏幕截图.png")

然后我们要将上图中第一个叶节点，也就是 D1={1-,2-,3+,4+}进一步进行分裂，往下划分，计算其不同属性（天气、湿度、刮风）作为节点的信息增益，可以得到：

Gain(D , 天气)=0

Gain(D , 湿度)=0

Gain(D , 刮风)=0.0615

我们能看到刮风为 D1 的节点都可以得到最大的信息增益，这里我们选取刮风作为节点。

同理，我们可以按照上面的计算步骤得到完整的决策树，结果如下：

![输入图片说明](https://images.gitee.com/uploads/images/2021/0418/210326_94c816dd_508704.png "屏幕截图.png")

于是我们通过 ID3 算法得到了一棵决策树。

ID3 的算法规则相对简单，可解释性强。

同样也存在缺陷，比如我们会发现 ID3 算法倾向于选择取值比较多的属性。这样，如果我们把“编号”作为一个属性（一般情况下不会这么做，这里只是举个例子），那么“编号”将会被选为最优属性 。但实际上“编号”是无关属性的，它对“打篮球”的分类并没有太大作用。

所以 ID3 有一个缺陷就是，有些属性可能对分类任务没有太大作用，但是他们仍然可能会被选为最优属性。

这种缺陷不是每次都会发生，只是存在一定的概率。

在大部分情况下，ID3 都能生成不错的决策树分类。

针对可能发生的缺陷，后人提出了新的算法进行改进。

# 在 ID3 算法上进行改进的 C4.5 算法

## 1. 采用信息增益率

因为 ID3 在计算的时候，倾向于选择取值多的属性。为了避免这个问题，C4.5 采用信息增益率的方式来选择属性。

```
信息增益率 = 信息增益 / 属性熵
```

当属性有很多值的时候，相当于被划分成了许多份，虽然信息增益变大了，但是对于 C4.5 来说，属性熵也会变大，所以整体的信息增益率并不大。

## 2. 采用悲观剪枝

ID3 构造决策树的时候，容易产生过拟合的情况。在 C4.5中，会在决策树构造之后采用悲观剪枝（PEP），这样可以提升决策树的泛化能力。

悲观剪枝是后剪枝技术中的一种，通过递归估算每个内部节点的分类错误率，比较剪枝前后这个节点的分类错误率来决定是否对其进行剪枝。这种剪枝方法不再需要一个单独的测试数据集。

## 3. 离散化处理连续属性

C4.5 可以处理连续属性的情况，对连续的属性进行离散化的处理。

比如打篮球存在的“湿度”属性，不按照“高、中”划分，而是按照湿度值进行计算，那么湿度取什么值都有可能。该怎么选择这个阈值呢，C4.5 选择具有最高信息增益的划分所对应的阈值。

## 4. 处理缺失值

针对数据集不完整的情况，C4.5 也可以进行处理。

假如我们得到的是如下的数据，你会发现这个数据中存在两点问题。

第一个问题是，数据集中存在数值缺失的情况，如何进行属性选择？第二个问题是，假设已经做了属性划分，但是样本在这个属性上有缺失值，该如何对样本进行划分？

![输入图片说明](https://images.gitee.com/uploads/images/2021/0418/210447_37d8bc4a_508704.png "屏幕截图.png")

我们不考虑缺失的数值，可以得到温度 D={2-,3+,4+,5-,6+,7-}。温度 = 高：D1={2-,3+,4+}；温度 = 中：D2={6+,7-}；温度 = 低：D3={5-} 。

这里 + 号代表打篮球，- 号代表不打篮球。比如ID=2 时，决策是不打篮球，我们可以记录为 2-。

所以三个叶节点的信息熵可以结算为：

![输入图片说明](https://images.gitee.com/uploads/images/2021/0418/210518_4556b8bb_508704.png "屏幕截图.png")

这三个节点的归一化信息熵为 3/6*0.918+2/6*1.0+1/6*0=0.792。

针对将属性选择为温度的信息增益率为：

Gain(D′, 温度)=Ent(D′)-0.792=1.0-0.792=0.208

D′的样本个数为 6，而 D 的样本个数为 7，所以所占权重比例为 6/7，所以 Gain(D′，温度) 所占权重比例为6/7，所以：

Gain(D, 温度)=6/7*0.208=0.178

这样即使在温度属性的数值有缺失的情况下，我们依然可以计算信息增益，并对属性进行选择。

## 优缺点

首先 ID3 算法的优点是方法简单，缺点是对噪声敏感。

训练数据如果有少量错误，可能会产生决策树分类错误。

C4.5 在 IID3 的基础上，用信息增益率代替了信息增益，解决了噪声敏感的问题，并且可以对构造树进行剪枝、处理连续数值以及数值缺失等情况，但是由于 C4.5 需要对数据集进行多次扫描，算法效率相对较低。

# ID3 java 实现

首先来看下本次案例创建得到的决策树长什么样

![输入图片说明](https://images.gitee.com/uploads/images/2021/0418/214115_7473fd6c_508704.png "屏幕截图.png")

数据：

```
色泽,根蒂,敲声,纹理,脐部,触感,好瓜
青绿,蜷缩,浊响,清晰,凹陷,硬滑,好瓜
乌黑,蜷缩,沉闷,清晰,凹陷,硬滑,好瓜
乌黑,蜷缩,浊响,清晰,凹陷,硬滑,好瓜
青绿,蜷缩,沉闷,清晰,凹陷,硬滑,好瓜
浅白,蜷缩,浊响,清晰,凹陷,硬滑,好瓜
青绿,稍蜷,浊响,清晰,稍凹,软粘,好瓜
乌黑,稍蜷,浊响,稍糊,稍凹,软粘,好瓜
乌黑,稍蜷,浊响,清晰,稍凹,硬滑,好瓜
乌黑,稍蜷,沉闷,稍糊,稍凹,硬滑,坏瓜
青绿,硬挺,清脆,清晰,平坦,软粘,坏瓜
浅白,硬挺,清脆,模糊,平坦,硬滑,坏瓜
浅白,蜷缩,浊响,模糊,平坦,软粘,坏瓜
青绿,稍蜷,浊响,稍糊,凹陷,硬滑,坏瓜
浅白,稍蜷,沉闷,稍糊,凹陷,硬滑,坏瓜
乌黑,稍蜷,浊响,清晰,稍凹,软粘,坏瓜
浅白,蜷缩,浊响,模糊,平坦,硬滑,坏瓜
青绿,蜷缩,沉闷,稍糊,稍凹,硬滑,坏瓜
```

## java 实现

```java
import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.ArrayList;
class treeNode{//树节点
	private String sname;//节点名
	public treeNode(String str) {
		sname=str;
	}
	public String getsname() {
		return sname;
	}
	ArrayList<String> label=new ArrayList<String>();//和子节点间的边标签
	ArrayList<treeNode> node=new ArrayList<treeNode>();//对应子节点
}
public class ID3 {
	private ArrayList<String> label=new ArrayList<String>();//特征标签
	private ArrayList<ArrayList<String>> date=new ArrayList<ArrayList<String>>();//数据集
	private ArrayList<ArrayList<String>> test=new ArrayList<ArrayList<String>>();//测试数据集
	private ArrayList<String> sum=new ArrayList<String>();//分类种类数
	private String kind;
	public ID3(String path,String path0) throws FileNotFoundException {
		//初始化训练数据并得到分类种数
		getDate(path);
		//获取测试数据集
		gettestDate(path0);
		init(date);
	}
	public void init(ArrayList<ArrayList<String>> date) {
		//得到种类数
		sum.add(date.get(0).get(date.get(0).size()-1));
        for(int i=0;i<date.size();i++) {
        	if(sum.contains(date.get(i).get(date.get(0).size()-1))==false) {
        		sum.add(date.get(i).get(date.get(0).size()-1));       	    
        	}
		}
	}
	//获取测试数据集
	public void gettestDate(String path) throws FileNotFoundException {
		String str;
		int i=0;
		try {
		//BufferedReader in=new BufferedReader(new FileReader(path));
			FileInputStream fis = new FileInputStream(path); 
	        InputStreamReader isr = new InputStreamReader(fis, "UTF-8"); 
	        BufferedReader in = new BufferedReader(isr); 
			while((str=in.readLine())!=null) {
			String[] strs=str.split(",");
			ArrayList<String> line =new ArrayList<String>();
			for(int j=0;j<strs.length;j++) {
				line.add(strs[j]);
				//System.out.print(strs[j]+" ");
			}
			test.add(line);
			//System.out.println();
			i++;
		}
			in.close();
		}catch(Exception e) {
			e.printStackTrace();
		}
	}
	//获取训练数据集
	public void getDate(String path) throws FileNotFoundException {
		String str;
		int i=0;
		try {
		//BufferedReader in=new BufferedReader(new FileReader(path));
			FileInputStream fis = new FileInputStream(path); 
	        InputStreamReader isr = new InputStreamReader(fis, "UTF-8"); 
	        BufferedReader in = new BufferedReader(isr); 
			while((str=in.readLine())!=null) {
			if(i==0) {
				String[] strs=str.split(",");
				for(int j=0;j<strs.length;j++) {
					label.add(strs[j]);
					//System.out.print(strs[j]+" ");	
				}
				i++;
				//System.out.println();
				continue;
			}
			String[] strs=str.split(",");
			ArrayList<String> line =new ArrayList<String>();
			for(int j=0;j<strs.length;j++) {
				line.add(strs[j]);
				//System.out.print(strs[j]+" ");
			}
			date.add(line);
			//System.out.println();
			i++;
		}
			in.close();
		}catch(Exception e) {
			e.printStackTrace();
		}
	}
	public double Ent(ArrayList<ArrayList<String>> dat) {
		//计算总的信息熵
		int all=0;
		double amount=0.0;
		for(int i=0;i<sum.size();i++) {
			for(int j=0;j<dat.size();j++) {
				if(sum.get(i).equals(dat.get(j).get(dat.get(0).size()-1))) {
					all++;
				}
			}
			if((double)all/dat.size()==0.0) {
				continue;
			}
			amount+=((double)all/dat.size())*(Math.log(((double)all/dat.size()))/Math.log(2.0));
			all=0;
		}
		if(amount==0.0) {
			return 0.0;
		}
		return -amount;//计算信息熵
	}
	//计算条件熵并返回信息增益值
	public double condtion(int a,ArrayList<ArrayList<String>> dat) {
		ArrayList<String> all=new ArrayList<String>();
		double c=0.0;
		all.add(dat.get(0).get(a));
		//得到属性种类
		for(int i=0;i<dat.size();i++) {
			if(all.contains(dat.get(i).get(a))==false) {
				all.add(dat.get(i).get(a));
			}
		}
		ArrayList<ArrayList<String>> plus=new ArrayList<ArrayList<String>>();
		//部分分组
		ArrayList<ArrayList<ArrayList<String>>> count=new ArrayList<ArrayList<ArrayList<String>>>();
		//分组总和
		for(int i=0;i<all.size();i++) {
			for(int j=0;j<dat.size();j++) {
				if(true==all.get(i).equals(dat.get(j).get(a))) {
					plus.add(dat.get(j));
				}
			}
			count.add(plus);
			c+=((double)count.get(i).size()/dat.size())*Ent(count.get(i));
			plus.removeAll(plus);
		}
		return (Ent(dat)-c);
		//返回条件熵
	}
	//计算信息增益最大属性
	public int Gain(ArrayList<ArrayList<String>> dat) {
		ArrayList<Double> num=new ArrayList<Double>();
		//保存各信息增益值
		for(int i=0;i<dat.get(0).size()-1;i++) {
			num.add(condtion(i,dat));
		}
		int index=0;
		double max=num.get(0);
		for(int i=1;i<num.size();i++) {
			if(max<num.get(i)) {
				max=num.get(i);
				index=i;
			}
		}
		//System.out.println("<"+label.get(index)+">");
		return index;
	}
	//构建决策树
	public treeNode creattree(ArrayList<ArrayList<String>> dat) {
		int index=Gain(dat);
		treeNode node=new treeNode(label.get(index));
		ArrayList<String> s=new ArrayList<String>();//属性种类
		s.add(dat.get(0).get(index));
		//System.out.println(dat.get(0).get(index));
		for(int i=1;i<dat.size();i++) {
			if(s.contains(dat.get(i).get(index))==false) {
				s.add(dat.get(i).get(index));
				//System.out.println(dat.get(i).get(index));
			}
		}
		ArrayList<ArrayList<String>> plus=new ArrayList<ArrayList<String>>();
		//部分分组
		ArrayList<ArrayList<ArrayList<String>>> count=new ArrayList<ArrayList<ArrayList<String>>>();
		//分组总和
		//得到节点下的边标签并分组
		for(int i=0;i<s.size();i++) {
			node.label.add(s.get(i));//添加边标签
			//System.out.print("添加边标签:"+s.get(i)+"  ");
			for(int j=0;j<dat.size();j++) {
				if(true==s.get(i).equals(dat.get(j).get(index))) {
					plus.add(dat.get(j));
				}
			}
			count.add(plus);
			//System.out.println();
			//以下添加结点
			int k;
			String str=count.get(i).get(0).get(count.get(i).get(0).size()-1);
			for(k=1;k<count.get(i).size();k++) {
				if(false==str.equals(count.get(i).get(k).get(count.get(i).get(k).size()-1))) {
					break;
				}
			}
			if(k==count.get(i).size()) {
				treeNode dd=new treeNode(str);
				node.node.add(dd);
				//System.out.println("这是末端:"+str);
			}
			else {
				//System.out.print("寻找新节点:");
				node.node.add(creattree(count.get(i)));
			}
			plus.removeAll(plus);				
		}	
		return node;
	}	
	//输出决策树
	public void print(ArrayList<ArrayList<String>> dat) {
		System.out.println("构建的决策树如下：");
		treeNode node=null;
		node=creattree(dat);//类
		put(node);//递归调用	
	}
	//用于递归的函数
	public void put(treeNode node) {
		System.out.println("结点："+node.getsname()+"\n");
		for(int i=0;i<node.label.size();i++) {
				System.out.println(node.getsname()+"的标签属性:"+node.label.get(i));
			if(node.node.get(i).node.isEmpty()==true) {
				System.out.println("叶子结点："+node.node.get(i).getsname());
			}
			else {
				put(node.node.get(i));
			}
		}	
	}
	//用于对待决策数据进行预测并将结果保存在指定路径
	public void testdate(ArrayList<ArrayList<String>> test,String path) throws IOException {
		treeNode node=null;
		int count=0;
		node=creattree(this.date);//类
		try {
		BufferedWriter out=new BufferedWriter(new FileWriter(path));
		for(int i=0;i<test.size();i++) {
			testput(node,test.get(i));//递归调用
			//System.out.println(kind);
			for(int j=0;j<test.get(i).size();j++) {
				out.write(test.get(i).get(j)+",");
			}
			if(kind.equals(date.get(i).get(date.get(i).size()-1))==true) {
				count++;
			}
			out.write(kind);
			out.newLine();
		}
		System.out.println("该次分类结果正确率为："+(double)count/test.size()*100+"%");
		out.flush();
		out.close();
		}catch(IOException e) {
			e.printStackTrace();
		}
	}
	//用于测试的递归调用
	public void testput(treeNode node,ArrayList<String> t) {
		int index=0;
		for(int i=0;i<this.label.size();i++) {
			if(this.label.get(i).equals(node.getsname())==true) {
				index=i;
				break;
			}
		}
		for(int i=0;i<node.label.size();i++) {
			if(t.get(index).equals(node.label.get(i))==false) {
				continue;
			}
			if(node.node.get(i).node.isEmpty()==true) {
				//System.out.println("分类结果为："+node.node.get(i).getsname());
				this.kind=node.node.get(i).getsname();//取出分类结果
			}
			else {
				testput(node.node.get(i),t);
			}
		}	
	}
    
	public static void main(String[] args) throws IOException {
		String data="C:\\Users\\zfw\\Desktop\\data1.txt";//训练数据集
		String test="C:\\Users\\zfw\\Desktop\\test.txt";//测试数据集
		String result="C:\\Users\\zfw\\Desktop\\result.txt";//预测结果集
		ID3 id=new ID3(data,test);//初始化数据
		id.print(id.date);//构建并输出决策树
		//id.testdate(id.test,result);//预测数据并输出结果
	}
}
```

# 拓展阅读

ID3 实现

C4.5 实现 

CART 实现

# 小结

希望本文对你有所帮助，如果喜欢，欢迎点赞收藏转发一波。

我是老马，期待与你的下次相遇。

# 参考资料

[决策树](https://www.cnblogs.com/molieren/articles/10664954.html#commentform)

[一看就懂的决策树算法（java实现）](https://blog.csdn.net/qq_38773180/article/details/79188510)

[决策树ID3算法的java实现(基本适用所有的ID3)](https://www.cnblogs.com/tk55/p/6231206.html)

[机器学习算法——决策树ID3算法介绍以及Java实现](https://blog.csdn.net/XiaoXiao_Yang77/article/details/79262704)

[Java实现的决策树算法完整实例](https://www.jb51.net/article/128886.htm)

[【Java】决策树介绍和使用](https://zhuanlan.zhihu.com/p/28944146)

https://www.cnblogs.com/jamesf/p/4751553.html

* any list
{:toc}