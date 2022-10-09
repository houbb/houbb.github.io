---
layout: post
title: Regex 正则表达式原理-03-NFA 转 DFA
date:  2020-1-7 10:09:32 +0800
categories: [Java]
tags: [java, github, regex, sf]
published: true
---

# 绕不过去的坎

原来尝试学习写 [Regex](https://github.com/houbb/regex)，写了一半都来放弃了。

最近在看《编译原理》，发现书中提到了正则表达式。

最近在刷 leetcode，刚好到 [regular-expression-matching](https://leetcode.com/problems/regular-expression-matching/)。

可见困难是必须要面对的。

本篇文章转载自 CSDN，感觉写的很好，此处仅作为记录。

# 为什么需要 NFA 转 DFA

[Regex 正则表达式原理及如何从零实现](https://houbb.github.io/2020/01/07/regex-and-dfa-02) 中我们已经构建了一个可用的正则表达式引擎。

但上文中只是用到了NFA，NFA的引擎建图时间复杂度是O(n)，但匹配一个长度为m的字符串时因为涉及到大量的递归和回溯，最坏时间复杂度是O(mn)。

与之对比DFA引擎的建图时间复杂度O(n^2)，但匹配时没有回溯，所以匹配复杂度只有O(m)，性能差距还是挺大的。

# DFA和NFA

我们已经多次提到了NFA和DFA，它俩究竟是啥？有啥区别？

首先，NFA和DFA都是有限状态机，都是有向图，用来描述状态和状态之间的关系。

其中NFA全称是非确定性有限状态自动机(Nondeterministic finite automaton)，DFA全称是确定性有限状态自动机(Deterministic finite automaton)。

## 确定性

二者的差异主要在于确定性和非确定性，何为确定性？ 

确定性是指面对同一输入，不会出现有多条可行的路径执行下一个节点。有点绕，看完图你就理解了。

![image](https://user-images.githubusercontent.com/18375710/84268338-13740b80-ab5a-11ea-8b83-b7a60b349ab6.png)

图示分别是一个NFA和DFA，上图之所以是NFA是因为它有节点具备不确定性，比如0节点，在输入"a"之后它分别可以到0 1 2 节点。

还有，上图有 epsilone 边，它可以在没有输入的情况下跳到下一个节点，这也带来了不确定性。相反，下图DFA中，每个节点对某一特定的输入都只有最多一条边。

总结下NFA和DFA的区别就是，**有ε边或者某个节点对同一输入对应多个状态的一定是NFA**。

## 等价性

DFA和NFA存在等价性，也就是说任何NFA都可以转化为等价的DFA。

由于NFA的非确定性，在面对一个输入的时候可能有多条可选的路径，所以在一条路径走不通的情况下，需要回溯到选择点去走另外一条路径。

但DFA不同，在每个状态下，对每个输入不会存在多条路径，就不需要递归和回溯了，可以一条路走到黑。

DFA的匹复杂度只有O(n)，但因为要递归和回溯NFA的匹配复杂度达到了O(n^2)。

这也是为什么我们要将引擎中的NFA转化为DFA的主要原因。


# NFA转DFA算法

NFA转DFA的算法叫做子集构造法，其具体流程如下。

步骤1: NFA的初始节点和初始节点所有ε可达的节点共同构成DFA的初始节点，然后对初始DFA节点执行步骤2。

步骤2: 对当前DFA节点，找到其中所有NFA节点对输入符号X所有可达的NFA节点，这些节点沟通构成的DFA节点作为当前DFA节点对输入X可达的DFA节点。

步骤3: 如果步骤2中找到了新节点，就对新节点重复执行步骤2。

步骤4: 重复步骤2和步骤3直到找不DFA新节点为止。

步骤5: 把所有包含NFA终止节点的DFA节点标记为DFA的终止节点。

## 例子

语言描述比较难理解，我们直接上例子。 

我们已经拿上一篇网站中的正则表达式 `a(b|c)*` 为例，NFA输出如下。

```
from to input
 0-> 1  a
 1-> 8  Epsilon
 8-> 9  Epsilon
 8-> 6  Epsilon
 6-> 2  Epsilon
 6-> 4  Epsilon
 2-> 3  b
 4-> 5  c
 3-> 7  Epsilon
 5-> 7  Epsilon
 7-> 9  Epsilon
 7-> 6  Epsilon
```

绘图如下：

![image](https://user-images.githubusercontent.com/18375710/84268718-af9e1280-ab5a-11ea-9281-d0bed586c791.png)

我们在上图的基础上执行步骤1 得到了节点0作为DFA的开始节点。

![image](https://user-images.githubusercontent.com/18375710/84268777-c9d7f080-ab5a-11ea-8b40-7e7a5a5c7f9c.png)

然后对DFA的节点0执行步骤1，找到NFA中所有a可达的NFA节点(1#2#4#6#8#9)构成NFA中的节点1，如下图。

![image](https://user-images.githubusercontent.com/18375710/84268820-dfe5b100-ab5a-11ea-983b-7cde7d5e5b4e.png)

我以dfa1为出发点，发现了a可达的所有NFA节点(2#3#4#6#7#9)和b可达的所有节点(2#4#5#6#7#9)，分别构成了DFA中的dfa2和dfa3，如下图。

![image](https://user-images.githubusercontent.com/18375710/84268854-eecc6380-ab5a-11ea-8fce-fe0292756ff6.png)

![image](https://user-images.githubusercontent.com/18375710/84268865-f68c0800-ab5a-11ea-8607-095583d1efc0.png)

然后我们分别在dfa2 dfa3上执行步骤三，找不到新节点，但会找到几条新的边，补充如下，至此我们就完成了对 `a(b|c)*` 对应NFA到DFA的转化。

![image](https://user-images.githubusercontent.com/18375710/84268969-1e7b6b80-ab5b-11ea-8787-726eaebfb544.png)

可以看出DFA图节点明显少于NFA，但NFA更容易看出其对应的正则表达式。

# 代码实现

代码其实就是对上文流程的表述，更多细节见

```java
 private static DFAGraph convertNfa2Dfa(NFAGraph nfaGraph) {
        DFAGraph dfaGraph = new DFAGraph();
        Set<State> startStates = new HashSet<>();
        // 用NFA图的起始节点构造DFA的起始节点 步骤1 
        startStates.addAll(getNextEStates(nfaGraph.start, new HashSet<>()));
        if (startStates.size() == 0) {
            startStates.add(nfaGraph.start);
        }
        dfaGraph.start = dfaGraph.getOrBuild(startStates);
        Queue<DFAState> queue = new LinkedList<>();
        Set<State> finishedStates = new HashSet<>();
        // 如果BFS的方式从已找到的起始节点遍历并构建DFA
        queue.add(dfaGraph.start);
        while (!queue.isEmpty()) {  // 步骤2 
            DFAState curState = queue.poll();
            for (State nfaState : curState.nfaStates) {
                Set<State> nextStates = new HashSet<>();
                Set<String> finishedEdges = new HashSet<>();
                finishedEdges.add(Constant.EPSILON);
                for (String edge : nfaState.next.keySet()) {
                    if (finishedEdges.contains(edge)) {
                        continue;
                    }
                    finishedEdges.add(edge);
                    Set<State> efinishedState = new HashSet<>();
                    for (State state : curState.nfaStates) {
                        Set<State> edgeStates = state.next.getOrDefault(edge, Collections.emptySet());
                        nextStates.addAll(edgeStates);
                        for (State eState : edgeStates) {
                            // 添加E可达节点
                            if (efinishedState.contains(eState)) {
                                continue;
                            }
                            nextStates.addAll(getNextEStates(eState, efinishedState));
                            efinishedState.add(eState);
                        }
                    }
                    // 将NFA节点列表转化为DFA节点，如果已经有对应的DFA节点就返回，否则创建一个新的DFA节点
                    DFAState nextDFAstate = dfaGraph.getOrBuild(nextStates);
                    if (!finishedStates.contains(nextDFAstate)) {
                        queue.add(nextDFAstate);
                    }
                    curState.addNext(edge, nextDFAstate);
                }
            }
            finishedStates.add(curState);
        }
        return dfaGraph;
    }
```

- DFAState

```java
public class DFAState extends State {
    public Set<State> nfaStates = new HashSet<>();
    // 保存对应NFAState的id,一个DFAState可能是多个NFAState的集合,所以拼接成String
    private String allStateIds;
    public DFAState() {
        this.stateType = 2;
    }

    public DFAState(String allStateIds, Set<State> states) {
        this.allStateIds = allStateIds;
        this.nfaStates.addAll(states);
         //这里我将步骤五直接集成在创建DFA节点的过程中了
        for (State state : states) {
            if (state.isEndState()) {
                this.stateType = 1;
            }
        }
    }

    public String getAllStateIds() {
        return allStateIds;
    }
}
```

另外我在DFAGraph中封装了有些NFA节点列表到DFA节点的转化和查找，具体如下。

```java
public class DFAGraph {

    private Map<String, DFAState> nfaStates2dfaState = new HashMap<>();
    public DFAState start = new DFAState();

    // 这里用map保存NFAState结合是已有对应的DFAState, 有就直接拿出来用
    public DFAState getOrBuild(Set<State> states) {
        String allStateIds = "";
        int[] ids = states.stream()
                          .mapToInt(state -> state.getId())
                          .sorted()
                          .toArray();
        for (int id : ids) {
            allStateIds += "#";
            allStateIds += id;
        }
        if (!nfaStates2dfaState.containsKey(allStateIds)) {
            DFAState dfaState = new DFAState(allStateIds, states);
            nfaStates2dfaState.put(allStateIds, dfaState);
        }
        return nfaStates2dfaState.get(allStateIds);
    }
}
```

# DFA引擎匹配过程

dfa引擎的匹配也可以完全复用NFA的匹配过程，所以对之前NFA的匹配代码，可以针对DFA模式取消回溯即可(不取消也没问题，但会有性能影响)。

```java
private boolean isMatch(String text, int pos, State curState) {
    if (pos == text.length()) {
        if (curState.isEndState()) {
            return true;
        }
        for (State nextState : curState.next.getOrDefault(Constant.EPSILON, Collections.emptySet())) {
            if (isMatch(text, pos, nextState)) {
                return true;
            }
        }
        return false;
    }
    for (Map.Entry<String, Set<State>> entry : curState.next.entrySet()) {
        String edge = entry.getKey();
        // 如果是DFA模式,不会有EPSILON边
        if (Constant.EPSILON.equals(edge)) {
            for (State nextState : entry.getValue()) {
                if (isMatch(text, pos, nextState)) {
                    return true;
                }
            }
        } else {
            MatchStrategy matchStrategy = MatchStrategyManager.getStrategy(edge);
            if (!matchStrategy.isMatch(text.charAt(pos), edge)) {
                continue;
            }
            // 遍历匹配策略
            for (State nextState : entry.getValue()) {
                // 如果是DFA匹配模式,entry.getValue()虽然是set,但里面只会有一个元素,所以不需要回溯
                if (nextState instanceof DFAState) {
                    return isMatch(text, pos + 1, nextState);
                }
                if (isMatch(text, pos + 1, nextState)) {
                    return true;
                }
            }
        }
    }
    return false;
}
```

因为DFA的匹配不需要回溯，所以可以完全改成非递归代码。

```java
private boolean isDfaMatch(String text, int pos, State startState) {
    State curState = startState;
    while (pos < text.length()) {
        boolean canContinue = false;
        for (Map.Entry<String, Set<State>> entry : curState.next.entrySet()) {
            String edge = entry.getKey();
            MatchStrategy matchStrategy = MatchStrategyManager.getStrategy(edge);
            if (matchStrategy.isMatch(text.charAt(pos), edge)) {
                curState = entry.getValue().stream().findFirst().orElse(null);
                pos++;
                canContinue = true;
                break;
            }
        }
        if (!canContinue) {
            return false;
        }
    }
    return curState.isEndState();
}
```

# 个人收获

还是要多读几篇 paper，里面肯定有很多转换的算法，等价性的证明。以及相关的优化研究。

实践出真知，有时候理论还是过于空洞，写一遍实现可能会好很多。

## paper

[基于多字符dfa的高速正则表达式匹配算法](https://www.oalib.com/paper/5205975#.XuDniFUzaUk)

[一种基于智能有限自动机的正则表达式匹配算法](https://www.oalib.com/paper/4910085#.XuDnl1UzaUk)

[Efficient Regular Expression Matching Algorithm Based on DoLFA 基于DoLFA的高效正则表达式匹配算法](https://www.oalib.com/paper/1657334#.XuDnpVUzaUk)

[基于dolfa的高效正则表达式匹配算法](https://www.oalib.com/paper/5221834#.XuDneVUzaUk)

[Regular Expression Optimization in Java Java正则表达式优化](https://www.oalib.com/paper/1644382#.XuDnWlUzaUk)

# 拓展阅读

[01-Regex 正则表达式入门](https://houbb.github.io/2017/07/24/regex)

[02-Regex 正则表达式与 DFA](https://houbb.github.io/2020/01/07/regex-and-dfa)

[03-Regex 正则表达式原理及如何从零实现](https://houbb.github.io/2020/01/07/regex-and-dfa-02)

[正则表达式实现](https://github.com/xindoo/regex)

# 参考资料

[从0到1打造正则表达式执行引擎(二)](https://xindoo.blog.csdn.net/article/details/106458165)

[automata-conversion-from-nfa-with-null-to-dfa](https://www.javatpoint.com/automata-conversion-from-nfa-with-null-to-dfa)

* any list
{:toc}