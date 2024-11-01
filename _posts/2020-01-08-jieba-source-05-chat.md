---
layout: post
title: jieba-fenci 05 结巴分词之简单聊一聊
date:  2020-1-8 10:09:32 +0800
categories: [NLP]
tags: [java, nlp, speech-tagging, sh]
published: true
---

# 拓展阅读

[DFA 算法详解](https://houbb.github.io/2020/01/07/sensitive-word-dfa)

为了便于大家学习，项目开源地址如下，欢迎 fork+star 鼓励一下老马~

> [敏感词 sensitive-word](https://github.com/houbb/sensitive-word)

> [分词 segment](https://github.com/houbb/segment)

## 分词系列专题

[jieba-fenci 01 结巴分词原理讲解 segment](https://houbb.github.io/2020/01/08/jieba-source-01-overview)

[jieba-fenci 02 结巴分词原理讲解之数据归一化 segment](https://houbb.github.io/2020/01/08/jieba-source-02-normalize)

[jieba-fenci 03 结巴分词与繁简体转换 segment](https://houbb.github.io/2020/01/08/jieba-source-03-chinese-format)

[jieba-fenci 04 结巴分词之词性标注实现思路 speechTagging segment](https://houbb.github.io/2020/01/08/jieba-source-04-pos-tagging)

[jieba-fenci 05 结巴分词之简单聊一聊](https://houbb.github.io/2020/01/08/jieba-source-05-chat)

# chat

## 结巴分词

结巴分词（Jieba）是一个广泛使用的中文文本分词工具，因其高效和易用而受到欢迎。以下是结巴分词的一些关键特性和使用方法：

### 特性

1. **三种分词模式**：
   - **精确模式**：试图将句子最精确地切开，适合文本分析。
   - **全模式**：把句子中所有的可能分词都找出来，速度较快，但不适合文本分析。
   - **搜索引擎模式**：在精确模式的基础上，对长词再次切分，适合用于搜索引擎构建倒排索引。

2. **自定义词典**：用户可以添加自己的词典，以提高分词的准确性。通过自定义词典，可以为一些特定领域的词汇提供更好的支持。

3. **词性标注**：结巴分词不仅可以进行分词，还可以为每个词语进行词性标注，方便进一步的自然语言处理。

4. **支持多种编码**：可以处理 UTF-8 和 GBK 编码的文本，适用于多种场景。

### 自定义词典

可以使用自定义词典来提升特定领域词汇的识别度。自定义词典的格式为每行一个词，格式为“词语 词频 词性”。

### 应用场景

- **文本分析**：如情感分析、主题建模等。
- **搜索引擎**：为搜索引擎提供分词支持，构建倒排索引。
- **推荐系统**：通过对用户输入的文本进行分词，分析用户兴趣。

结巴分词因其灵活性和高效性，广泛应用于各种中文自然语言处理任务中。

## java 结巴分词入门例子

要在 Java 中使用结巴分词（Jieba），可以通过引入结巴分词的 Java 实现库（如 `jieba-analysis`）来实现。

以下是一个简单的入门示例，包括 Maven 的依赖配置和代码示例。

### 1. Maven 依赖

在你的 Maven 项目的 `pom.xml` 文件中，添加以下依赖：

```xml
<dependencies>
    <dependency>
        <groupId>com.github.hankcs</groupId>
        <artifactId>jieba-analysis</artifactId>
        <version>7.0.0</version> <!-- 请检查最新版本 -->
    </dependency>
</dependencies>
```

### 2. Java 代码示例

以下是一个简单的 Java 程序，演示如何使用结巴分词进行分词处理：

```java
import com.hankcs.jieba.JiebaSegmenter;
import com.hankcs.jieba.WordDictionary;

import java.util.List;

public class JiebaExample {
    public static void main(String[] args) {
        // 初始化 Jieba 分词器
        JiebaSegmenter segmenter = new JiebaSegmenter();

        // 要分词的文本
        String text = "我爱自然语言处理";

        // 精确模式分词
        List<String> words = segmenter.sentenceProcess(text);
        System.out.println("精确模式分词: " + words);

        // 全模式分词
        List<String> allWords = segmenter.process(text, JiebaSegmenter.SegMode.SEARCH);
        System.out.println("全模式分词: " + allWords);

        // 添加自定义词典（可选）
        // WordDictionary.getInstance().add("自然语言处理");
        // List<String> customWords = segmenter.sentenceProcess(text);
        // System.out.println("自定义词典分词: " + customWords);
    }
}
```

## 结巴分词词性标注 HMM 示意代码

下面是一个基于动态规划和隐马尔可夫模型（HMM）进行词性标注的简化实现。

这个示例展示了基本的动态规划算法如何与 HMM 结合使用。

### 完整代码实现

```java
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class HMMPOSTagger {
    // 状态转移概率
    private static final Map<String, Map<String, Double>> transitionProbabilities = new HashMap<>();
    // 发射概率
    private static final Map<String, Map<String, Double>> emissionProbabilities = new HashMap<>();
    // 词典
    private static final String[] states = {"名词", "动词", "形容词", "代词", "副词"};

    static {
        // 状态转移概率（简化示例）
        transitionProbabilities.put("名词", Map.of("名词", 0.3, "动词", 0.2, "形容词", 0.1, "代词", 0.1, "副词", 0.1));
        transitionProbabilities.put("动词", Map.of("名词", 0.2, "动词", 0.3, "形容词", 0.1, "代词", 0.1, "副词", 0.2));
        // ... 更多状态转移概率

        // 发射概率（简化示例）
        emissionProbabilities.put("名词", Map.of("自然语言处理", 0.8, "计算机", 0.2));
        emissionProbabilities.put("动词", Map.of("爱", 1.0));
        emissionProbabilities.put("形容词", Map.of("好", 1.0));
        // ... 更多发射概率
    }

    public static String[] viterbi(List<String> words) {
        int n = words.size();
        int m = states.length;
        double[][] dp = new double[n][m];
        int[][] backpointer = new int[n][m];

        // 初始化
        for (int j = 0; j < m; j++) {
            String state = states[j];
            dp[0][j] = emissionProbabilities.getOrDefault(state, new HashMap<>()).getOrDefault(words.get(0), 0.0);
        }

        // 动态规划
        for (int i = 1; i < n; i++) {
            for (int j = 0; j < m; j++) {
                String state = states[j];
                double maxProb = 0.0;
                int bestState = 0;
                for (int k = 0; k < m; k++) {
                    String prevState = states[k];
                    double prob = dp[i - 1][k] * transitionProbabilities.getOrDefault(prevState, new HashMap<>()).getOrDefault(state, 0.0);
                    if (prob > maxProb) {
                        maxProb = prob;
                        bestState = k;
                    }
                }
                dp[i][j] = maxProb * emissionProbabilities.getOrDefault(state, new HashMap<>()).getOrDefault(words.get(i), 0.0);
                backpointer[i][j] = bestState;
            }
        }

        // 回溯找到最优路径
        double maxProb = 0.0;
        int bestLastState = 0;
        for (int j = 0; j < m; j++) {
            if (dp[n - 1][j] > maxProb) {
                maxProb = dp[n - 1][j];
                bestLastState = j;
            }
        }

        // 构建最优状态序列
        String[] result = new String[n];
        int currentState = bestLastState;
        for (int i = n - 1; i >= 0; i--) {
            result[i] = states[currentState];
            currentState = backpointer[i][currentState];
        }

        return result;
    }

    public static void main(String[] args) {
        List<String> words = List.of("我", "爱", "自然语言处理");
        String[] posTags = viterbi(words);

        // 输出结果
        for (int i = 0; i < words.size(); i++) {
            System.out.println(words.get(i) + ": " + posTags[i]);
        }
    }
}
```

### 实现细节

1. **状态转移概率（Transition Probabilities）**：用于描述从一个状态（词性）转移到另一个状态的概率。
2. **发射概率（Emission Probabilities）**：描述给定状态（词性）时，生成特定观察（词）的概率。
3. **动态规划（Viterbi Algorithm）**：
   - 初始化 DP 表格。
   - 填充 DP 表，计算每个状态的最大概率。
   - 使用回溯表找到最优路径。
4. **词典**：在实际应用中，应该加载更完整的状态转移和发射概率数据。

### 注意事项

- 这个示例中的概率数据是简化的，实际使用时应基于真实的训练数据进行统计。
- 代码为简化版本，未处理所有边界情况，实际应用中需进行完善。
- 可以考虑使用现成的 HMM 库，减少实现复杂度和错误。

# 参考资料


* any list
{:toc}