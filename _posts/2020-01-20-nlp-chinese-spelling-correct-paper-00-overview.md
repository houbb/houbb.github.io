---
layout: post
title: NLP 中文拼写检测纠正论文-00-chinese spell checking 中文拼写纠正 CSC  论文
date:  2020-1-20 10:09:32 +0800
categories: [Data-Struct]
tags: [chinese, nlp, algorithm, paper, sh]
published: true
---

# 拼写纠正系列

[NLP 中文拼写检测实现思路](https://houbb.github.io/2020/01/20/nlp-chinese-spelling-correct-01-intro)

[NLP 中文拼写检测纠正算法整理](https://houbb.github.io/2020/01/20/nlp-chinese-spelling-correct-02)

[NLP 英文拼写算法，如果提升 100W 倍的性能？](https://houbb.github.io/2020/01/20/nlp-chinese-spelling-correct-03-100w-faster)

[NLP 中文拼写检测纠正 Paper](https://houbb.github.io/2020/01/20/nlp-chinese-spelling-correct-paper)

[java 实现中英文拼写检查和错误纠正？可我只会写 CRUD 啊！](https://houbb.github.io/2020/01/20/nlp-chinese-word-checker-01-intro)

[一个提升英文单词拼写检测性能 1000 倍的算法？](https://houbb.github.io/2020/01/20/nlp-chinese-word-checker-02-1000x)

[单词拼写纠正-03-leetcode edit-distance 72.力扣编辑距离](https://houbb.github.io/2020/01/20/nlp-chinese-word-checker-03-edit-distance-intro)

# NLP 开源项目

[nlp-hanzi-similar 汉字相似度](https://github.com/houbb/nlp-hanzi-similar)

[word-checker 拼写检测](https://github.com/houbb/word-checker)

[pinyin 汉字转拼音](https://github.com/houbb/pinyin)

[opencc4j 繁简体转换](https://github.com/houbb/opencc4j)

[sensitive-word 敏感词](https://github.com/houbb/sensitive-word)

# 论文地址

可以参考：https://paperswithcode.com/task/chinese-spell-checking

# 论文梳理

# Chinese Text Correction Papers

This repo aims to keep tracking related work in Chinese text correction, including Chinese Spell Checking (CSC) and Chinese Grammatical Error Correction (CGEC).

该仓库旨在跟踪与中文文本修正相关的工作，包括中文拼写检查（CSC）和中文语法错误修正（CGEC）。

## 2024
|paper|conference|resource|citation|labels|
|:---:|:---:|:---:|:---:|:---:|
|Chinese Spelling Correction as Rephrasing Language Model|AAAI2024|[[pdf](https://arxiv.org/pdf/2308.08796.pdf) [[code](https://github.com/Claude-Liu/ReLM)] |![citation](https://img.shields.io/badge/dynamic/json?label=citation&query=citationCount&url=https%3A%2F%2Fapi.semanticscholar.org%2Fgraph%2Fv1%2Fpaper%2Fc1b9d7dea2e96340997aa541250868e62080f0b5%3Ffields%3DcitationCount)|![](https://img.shields.io/badge/CSC-green)|



## 2023
|paper|conference|resource|citation|labels|
|:---:|:---:|:---:|:---:|:---:|
|A Frustratingly Easy Plug-and-Play Detection-and-Reasoning Module for Chinese Spelling Check|EMNLP2023|[[pdf](https://aclanthology.org/2023.findings-emnlp.771.pdf)] [[code](https://github.com/THUKElab/DR-CSC)] |![citation](https://img.shields.io/badge/dynamic/json?label=citation&query=citationCount&url=https%3A%2F%2Fapi.semanticscholar.org%2Fgraph%2Fv1%2Fpaper%2F1f102b041a4fea907123ddea6d0de66b8d380c2b%3Ffields%3DcitationCount)|![](https://img.shields.io/badge/CSC-green)|
|Disentangled Phonetic Representation for Chinese Spelling Correction|ACL2023|[[pdf](https://arxiv.org/abs/2305.14783)] [[code](https://github.com/liangzh63/DORM-CSC)] |![citation](https://img.shields.io/badge/dynamic/json?label=citation&query=citationCount&url=https%3A%2F%2Fapi.semanticscholar.org%2Fgraph%2Fv1%2Fpaper%2F4d5f2b43c96b9d06001b68ed8984b7b4e93b76bb%3Ffields%3DcitationCount)|![](https://img.shields.io/badge/CSC-green)|
|Rethinking Masked Language Modeling for Chinese Spelling Correction|ACL2023|[[pdf](https://arxiv.org/abs/2305.17721)] [[code](https://github.com/gingasan/lemon)] |![citation](https://img.shields.io/badge/dynamic/json?label=citation&query=citationCount&url=https%3A%2F%2Fapi.semanticscholar.org%2Fgraph%2Fv1%2Fpaper%2F59fa0a3ac7663ec6d508ceb497d89790a18c2c00%3Ffields%3DcitationCount)|![](https://img.shields.io/badge/CSC-green)![](https://img.shields.io/badge/dataset-yellowgreen)|
|PTCSpell: Pre-trained Corrector Based on Character Shape and Pinyin for Chinese Spelling Correction|ACL2023|[[pdf](https://aclanthology.org/2023.findings-acl.394/)]|![citation](https://img.shields.io/badge/dynamic/json?label=citation&query=citationCount&url=https%3A%2F%2Fapi.semanticscholar.org%2Fgraph%2Fv1%2Fpaper%2F1bdc4010dd68c7f2260ceae2459b2af3543ea717%3Ffields%3DcitationCount)|![](https://img.shields.io/badge/CSC-green)|
|Investigating Glyph-Phonetic Information for Chinese Spell Checking: What Works and What’s Next?|ACL2023|[[pdf](https://arxiv.org/abs/2212.04068)] [[code](https://github.com/piglaker/ConfusionCluster)] |-|![](https://img.shields.io/badge/CSC-green)|
|Are Pre-trained Language Models Useful for Model Ensemble in Chinese Grammatical Error Correction?|ACL2023|[[pdf](https://arxiv.org/abs/2305.15183)] [[code](https://github.com/JamyDon/PLM-based-CGEC-Model-Ensemble)] |-|![](https://img.shields.io/badge/CGEC-blue)|
|NaSGEC: a Multi-Domain Chinese Grammatical Error Correction Dataset from Native Speaker Texts|ACL2023|[[pdf](https://aclanthology.org/2023.findings-acl.630/)] [[code](https://github.com/HillZhang1999/NaSGEC)] |![citation](https://img.shields.io/badge/dynamic/json?label=citation&query=citationCount&url=https%3A%2F%2Fapi.semanticscholar.org%2Fgraph%2Fv1%2Fpaper%2Fdd521a5f10275efbb2346e1265f7977f24880161%3Ffields%3DcitationCount)|![](https://img.shields.io/badge/CGEC-blue)![](https://img.shields.io/badge/dataset-yellowgreen)|


## 2022

|paper|conference|resource|citation|labels|
|:---:|:---:|:---:|:---:|:---:|
|Linguistic Rules-Based Corpus Generation for Native Chinese Grammatical Error Correction|EMNLP2022|[[pdf](https://arxiv.org/pdf/2210.10442.pdf)][[code](https://github.com/masr2000/CLG-CGEC)]|![citation](https://img.shields.io/badge/dynamic/json?label=citation&query=citationCount&url=https%3A%2F%2Fapi.semanticscholar.org%2Fgraph%2Fv1%2Fpaper%2F090f0d79c35047881aab87d1b6ea313a3146ec33%3Ffields%3DcitationCount)|![](https://img.shields.io/badge/CGEC-blue)![](https://img.shields.io/badge/dataset-yellowgreen)|
|FCGEC: Fine-Grained Corpus for Chinese Grammatical Error Correction|EMNLP2022|[[pdf](https://arxiv.org/pdf/2210.12364.pdf)][[code](https://github.com/xlxwalex/FCGEC)]|![citation](https://img.shields.io/badge/dynamic/json?label=citation&query=citationCount&url=https%3A%2F%2Fapi.semanticscholar.org%2Fgraph%2Fv1%2Fpaper%2Fc080f022c6f57d10dc8e8e44231c8995480b884d%3Ffields%3DcitationCount)|![](https://img.shields.io/badge/CGEC-blue)![](https://img.shields.io/badge/dataset-yellowgreen)|
|SynGEC: Syntax-Enhanced Grammatical Error Correction with a Tailored GEC-Oriented Parser|EMNLP2022|[[pdf](https://arxiv.org/pdf/2210.12484.pdf)][[code](https://github.com/HillZhang1999/SynGEC)]|![citation](https://img.shields.io/badge/dynamic/json?label=citation&query=citationCount&url=https%3A%2F%2Fapi.semanticscholar.org%2Fgraph%2Fv1%2Fpaper%2F4cc73edaca5fc7e6e777525e030e1537f0292449%3Ffields%3DcitationCount)|![](https://img.shields.io/badge/CGEC-blue)|
|Revisiting Grammatical Error Correction Evaluation and Beyond|EMNLP2022|[[pdf](https://arxiv.org/pdf/2211.01635.pdf)][[code](https://github.com/pygongnlp/PT-M2)]|![citation](https://img.shields.io/badge/dynamic/json?label=citation&query=citationCount&url=https%3A%2F%2Fapi.semanticscholar.org%2Fgraph%2Fv1%2Fpaper%2Fc84165f7601871997f795357c55d12523b31f3e4%3Ffields%3DcitationCount)|![](https://img.shields.io/badge/CGEC-blue)|
|From Spelling to Grammar: A New Framework for Chinese Grammatical Error Correction|EMNLP2022|[[pdf](https://arxiv.org/abs/2211.01625)]|![citation](https://img.shields.io/badge/dynamic/json?label=citation&query=citationCount&url=https%3A%2F%2Fapi.semanticscholar.org%2Fgraph%2Fv1%2Fpaper%2F4cc73edaca5fc7e6e777525e030e1537f0292449%3Ffields%3DcitationCount)|![](https://img.shields.io/badge/CGEC-blue)|
|Improving Chinese Spelling Check by Character Pronunciation Prediction: The Effects of Adaptivity and Granularity|EMNLP2022|[[pdf](https://arxiv.org/pdf/2210.10996.pdf)][[code](https://github.com/jiahaozhenbang/SCOPE)]|![citation](https://img.shields.io/badge/dynamic/json?label=citation&query=citationCount&url=https%3A%2F%2Fapi.semanticscholar.org%2Fgraph%2Fv1%2Fpaper%2F5699d5050cc5495ad3bf4d299c0285f8239224f1%3Ffields%3DcitationCount)|![](https://img.shields.io/badge/CSC-green)|
|Sequence-to-Action: Grammatical Error Correction with Action Guided Sequence Generation|AAAI2022|[[pdf](https://arxiv.org/abs/2205.10884)]|![citation](https://img.shields.io/badge/dynamic/json?label=citation&query=citationCount&url=https%3A%2F%2Fapi.semanticscholar.org%2Fgraph%2Fv1%2Fpaper%2Ffd39b8c41ef56a25b38acec3f5372671cfa18b47%3Ffields%3DcitationCount)|![](https://img.shields.io/badge/CGEC-blue)|
|Non-Autoregressive Chinese ASR Error Correction with Phonological Training|NAACL2022|[[pdf](https://aclanthology.org/2022.naacl-main.432.pdf)]|![citation](https://img.shields.io/badge/dynamic/json?label=citation&query=citationCount&url=https%3A%2F%2Fapi.semanticscholar.org%2Fgraph%2Fv1%2Fpaper%2Fa55a3e5ef5ae5004d9f03bb67e1a577d95274272%3Ffields%3DcitationCount)|![](https://img.shields.io/badge/CSC-green)|
|MuCGEC: a Multi-Reference Multi-Source Evaluation Dataset for Chinese Grammatical Error Correction|NAACL2022|[[pdf](https://aclanthology.org/2022.naacl-main.227.pdf)] [[code](https://github.com/HillZhang1999/MuCGEC)]|![citation](https://img.shields.io/badge/dynamic/json?label=citation&query=citationCount&url=https%3A%2F%2Fapi.semanticscholar.org%2Fgraph%2Fv1%2Fpaper%2F7733c1117fa243c92007b2a6d45137d94d7dce77%3Ffields%3DcitationCount)|![](https://img.shields.io/badge/CGEC-blue) ![](https://img.shields.io/badge/dataset-yellowgreen) |
|Improving Chinese Grammatical Error Detection via Data augmentation by Conditional Error Generation|ACL2022|[[pdf](https://aclanthology.org/2022.findings-acl.233.pdf)]|![citation](https://img.shields.io/badge/dynamic/json?label=citation&query=citationCount&url=https%3A%2F%2Fapi.semanticscholar.org%2Fgraph%2Fv1%2Fpaper%2F777c3440e8eff82f26250713290b664869db5de0%3Ffields%3DcitationCount)|![](https://img.shields.io/badge/CGEC-blue)|
|CRASpell: A Contextual Typo Robust Approach to Improve Chinese Spelling Correction|ACL2022|[[pdf](https://aclanthology.org/2022.findings-acl.237.pdf)] [[code](https://github.com/liushulinle/CRASpell)]|![citation](https://img.shields.io/badge/dynamic/json?label=citation&query=citationCount&url=https%3A%2F%2Fapi.semanticscholar.org%2Fgraph%2Fv1%2Fpaper%2Fa77d34655475fd6eac0ae6ab724a3bd4b36102a6%3Ffields%3DcitationCount)|![](https://img.shields.io/badge/CSC-green)|
|MDCSpell: A Multi-task Detector-Corrector Framework for Chinese Spelling Correction|ACL2022|[[pdf](https://aclanthology.org/2022.findings-acl.98.pdf)]|![citation](https://img.shields.io/badge/dynamic/json?label=citation&query=citationCount&url=https%3A%2F%2Fapi.semanticscholar.org%2Fgraph%2Fv1%2Fpaper%2Fa27df49d3c8b1d96923e2e2eaa9bbfbe3ae732e7%3Ffields%3DcitationCount)|![](https://img.shields.io/badge/CSC-green)|
|The Past Mistake is the Future Wisdom: Error-driven Contrastive Probability Optimization for Chinese Spell Checking|ACL2022|[[pdf](https://arxiv.org/pdf/2203.00991.pdf)] |![citation](https://img.shields.io/badge/dynamic/json?label=citation&query=citationCount&url=https%3A%2F%2Fapi.semanticscholar.org%2Fgraph%2Fv1%2Fpaper%2Fb1cf76df5f21000c2c3433805deeba2e5a27173c%3Ffields%3DcitationCount)|![](https://img.shields.io/badge/CSC-green)|

## 2021
|paper|conference|resource|citation|labels|
|:---:|:---:|:---:|:---:|:---:|
|Correcting Chinese Spelling Errors with Phonetic Pre-training|ACL2021|[[pdf](https://aclanthology.org/2021.findings-acl.198)] [[code](https://github.com/PaddlePaddle/PaddleNLP/blob/develop/paddlenlp/taskflow/models/text_correction_model.py)] |![citation](https://img.shields.io/badge/dynamic/json?label=citation&query=citationCount&url=https%3A%2F%2Fapi.semanticscholar.org%2Fgraph%2Fv1%2Fpaper%2Fc70b9276d4e4a27f2218bc3e921e9fc3ffd18f14%3Ffields%3DcitationCount)|![](https://img.shields.io/badge/CSC-green)|
|Read, Listen, and See: Leveraging Multimodal Information Helps Chinese Spell Checking|ACL2021|[[pdf](https://arxiv.org/pdf/2105.12306.pdf)] [[code](https://github.com/DaDaMrX/ReaLiSe)] |![citation](https://img.shields.io/badge/dynamic/json?label=citation&query=citationCount&url=https%3A%2F%2Fapi.semanticscholar.org%2Fgraph%2Fv1%2Fpaper%2Fb92abf442f5cc4971556b157b8e14d17fd600f4b%3Ffields%3DcitationCount)|![](https://img.shields.io/badge/CSC-green)|
|PLOME: Pre-training with Misspelled Knowledge for Chinese Spelling Correction|ACL2021|[[pdf](https://aclanthology.org/2021.acl-long.233)] [[code](https://github.com/liushulinle/PLOME)] |![citation](https://img.shields.io/badge/dynamic/json?label=citation&query=citationCount&url=https%3A%2F%2Fapi.semanticscholar.org%2Fgraph%2Fv1%2Fpaper%2Fcf6be786c307a8c4e523daa455019a6b7650537c%3Ffields%3DcitationCount)|![](https://img.shields.io/badge/CSC-green)|
|Exploration and Exploitation: Two Ways to Improve Chinese Spelling Correction Models|ACL2021|[[pdf](https://aclanthology.org/2021.acl-short.56)] [[code](https://github.com/FDChongli/TwoWaysToImproveCSC)] |![citation](https://img.shields.io/badge/dynamic/json?label=citation&query=citationCount&url=https%3A%2F%2Fapi.semanticscholar.org%2Fgraph%2Fv1%2Fpaper%2F755038a42abf9a9fa6d40ac7c0eb9fbe6298d3f0%3Ffields%3DcitationCount)|![](https://img.shields.io/badge/CSC-green)|
|PHMOSpell: Phonological and Morphological Knowledge Guided Chinese Spelling Check|ACL2021|[[pdf](https://aclanthology.org/2021.acl-long.464.pdf)]  |![citation](https://img.shields.io/badge/dynamic/json?label=citation&query=citationCount&url=https%3A%2F%2Fapi.semanticscholar.org%2Fgraph%2Fv1%2Fpaper%2F9998875164c1d46c8c41be6f22171e90abf0ccbe%3Ffields%3DcitationCount)|![](https://img.shields.io/badge/CSC-green)|
|Global Attention Decoder for Chinese Spelling Error Correction|ACL2021|[[pdf](https://aclanthology.org/2021.findings-acl.122.pdf)] |![citation](https://img.shields.io/badge/dynamic/json?label=citation&query=citationCount&url=https%3A%2F%2Fapi.semanticscholar.org%2Fgraph%2Fv1%2Fpaper%2F74512e17ba6e9617260bf9a65503ffa22bc66e3a%3Ffields%3DcitationCount)|![](https://img.shields.io/badge/CSC-green)|
|Dynamic Connected Networks for Chinese Spelling Check|ACL2021|[[pdf](https://aclanthology.org/2021.findings-acl.216.pdf)] |![citation](https://img.shields.io/badge/dynamic/json?label=citation&query=citationCount&url=https%3A%2F%2Fapi.semanticscholar.org%2Fgraph%2Fv1%2Fpaper%2Faec8c31d3b8cf37b106fb52d07b74fe8bb23c863%3Ffields%3DcitationCount)|![](https://img.shields.io/badge/CSC-green)|
|Tail-to-Tail Non-Autoregressive Sequence Prediction for Chinese Grammatical Error Correction|ACL2021|[[pdf](https://aclanthology.org/2021.acl-long.385.pdf)] [[code](https://github.com/lipiji/TtT)] |![citation](https://img.shields.io/badge/dynamic/json?label=citation&query=citationCount&url=https%3A%2F%2Fapi.semanticscholar.org%2Fgraph%2Fv1%2Fpaper%2F133a5c9a15b734195d4ecb41c9f3fee01a8e8fd9%3Ffields%3DcitationCount)|![](https://img.shields.io/badge/CGEC-blue)|
|SpellBERT: A Lightweight Pretrained Model for Chinese Spelling Check|EMNLP2021|[[pdf](https://aclanthology.org/2021.emnlp-main.287)] [[code](https://github.com/benbijituo/SpellBERT/)] |![citation](https://img.shields.io/badge/dynamic/json?label=citation&query=citationCount&url=https%3A%2F%2Fapi.semanticscholar.org%2Fgraph%2Fv1%2Fpaper%2Fc92f38290af09b09b609b1685ae69f672b8ce6f5%3Ffields%3DcitationCount)|![](https://img.shields.io/badge/CSC-green)|
|DCSpell: A Detector-Corrector Framework for Chinese Spelling Error Correction|SIGIR2021|[[pdf](https://dl.acm.org/doi/10.1145/3404835.3463050)] |![citation](https://img.shields.io/badge/dynamic/json?label=citation&query=citationCount&url=https%3A%2F%2Fapi.semanticscholar.org%2Fgraph%2Fv1%2Fpaper%2Fbce914a30371931915c0916c68eb621ef774dde2%3Ffields%3DcitationCount)|![](https://img.shields.io/badge/CSC-green)|
|Think Twice: A Post-Processing Approach for the Chinese Spelling Error Correction|AppliedScience|[[pdf](https://www.mdpi.com/2076-3417/11/13/5832)] |![citation](https://img.shields.io/badge/dynamic/json?label=citation&query=citationCount&url=https%3A%2F%2Fapi.semanticscholar.org%2Fgraph%2Fv1%2Fpaper%2Fa3cd1fe6e4b469c2608559bbaa9daf4c3d992d4a%3Ffields%3DcitationCount)|![](https://img.shields.io/badge/CSC-green)|

## 2020
|paper|conference|resource|citation|labels|
|:---:|:---:|:---:|:---:|:---:|
|Spelling Error Correction with Soft-Masked BERT|ACL2020|[[pdf](https://arxiv.org/pdf/2005.07421.pdf)] |![citation](https://img.shields.io/badge/dynamic/json?label=citation&query=citationCount&url=https%3A%2F%2Fapi.semanticscholar.org%2Fgraph%2Fv1%2Fpaper%2F93bf0b32b17297d94f6a2cc35bce7c396eb17b36%3Ffields%3DcitationCount)|![](https://img.shields.io/badge/CSC-green)|
|Spellgcn: Incorporating phonological and visual similarities into language models for chinese spelling check|ACL2020|[[pdf](https://arxiv.org/pdf/2004.14166.pdf)] [[code](https://github.com/ACL2020SpellGCN/SpellGCN)] |![citation](https://img.shields.io/badge/dynamic/json?label=citation&query=citationCount&url=https%3A%2F%2Fapi.semanticscholar.org%2Fgraph%2Fv1%2Fpaper%2Fbc4b6bc216a9748aa5a37e0bf7b4ca0876f57e4b%3Ffields%3DcitationCount)|![](https://img.shields.io/badge/CSC-green)|
|Chunk-based Chinese Spelling Check with Global Optimization|EMNLP2020|[[pdf](https://aclanthology.org/2020.findings-emnlp.184.pdf)] |![citation](https://img.shields.io/badge/dynamic/json?label=citation&query=citationCount&url=https%3A%2F%2Fapi.semanticscholar.org%2Fgraph%2Fv1%2Fpaper%2F6e1ed1a05ab12e931b8b2c5c08197a61d66b1a27%3Ffields%3DcitationCount)|![](https://img.shields.io/badge/CSC-green)|
|MaskGEC: Improving Neural Grammatical Error Correction via Dynamic Masking|AAAL2020|[[pdf](https://ojs.aaai.org/index.php/AAAI/article/view/5476)] |![citation](https://img.shields.io/badge/dynamic/json?label=citation&query=citationCount&url=https%3A%2F%2Fapi.semanticscholar.org%2Fgraph%2Fv1%2Fpaper%2Fa32e3f890f8a38f2064803ce92687e6228241fb9%3Ffields%3DcitationCount)|![](https://img.shields.io/badge/CGEC-blue)|
|Combining ResNet and Transformer for Chinese Grammatical Error Diagnosis|AACL2020|[[pdf](https://aclanthology.org/2020.nlptea-1.5.pdf)] |![citation](https://img.shields.io/badge/dynamic/json?label=citation&query=citationCount&url=https%3A%2F%2Fapi.semanticscholar.org%2Fgraph%2Fv1%2Fpaper%2Fe8fe671e2e04c1b45a5dddc51c1e60768a66b628%3Ffields%3DcitationCount)|![](https://img.shields.io/badge/CGEC-blue)|
|Overview of NLPTEA-2020 Shared Task for Chinese Grammatical Error Diagnosis|AACL2020|[[pdf](https://aclanthology.org/2020.nlptea-1.4)] |![citation](https://img.shields.io/badge/dynamic/json?label=citation&query=citationCount&url=https%3A%2F%2Fapi.semanticscholar.org%2Fgraph%2Fv1%2Fpaper%2F2119f2e7497cacebc43ea04d0d8df96df9d08e03%3Ffields%3DcitationCount)|![](https://img.shields.io/badge/CGEC-blue) ![](https://img.shields.io/badge/dataset-yellowgreen)|

## before
|paper|conference|resource|citation|labels|
|:---:|:---:|:---:|:---:|:---:|
|FASPell: A Fast, Adaptable, Simple, Powerful Chinese Spell Checker Based On DAE-Decoder Paradigm|EMNLP2019|[[pdf](https://aclanthology.org/D19-5522.pdf)] [[code](https://github.com/iqiyi/FASPell)] |![citation](https://img.shields.io/badge/dynamic/json?label=citation&query=citationCount&url=https%3A%2F%2Fapi.semanticscholar.org%2Fgraph%2Fv1%2Fpaper%2Fb8783d2fe5affed35dd62cad74a5f468359cc5cc%3Ffields%3DcitationCount)|![](https://img.shields.io/badge/CSC-green)|
|A Hybrid Approach to Automatic Corpus Generation for Chinese Spelling Checking|EMNLP2018|[[pdf](https://aclanthology.org/D18-1273.pdf)] [[code](https://github.com/wdimmy/Automatic-Corpus-Generation)] |![citation](https://img.shields.io/badge/dynamic/json?label=citation&query=citationCount&url=https%3A%2F%2Fapi.semanticscholar.org%2Fgraph%2Fv1%2Fpaper%2Fc12e270f347334ced34614e110b9319888522da8%3Ffields%3DcitationCount)|![](https://img.shields.io/badge/CSC-green) ![](https://img.shields.io/badge/dataset-yellowgreen)|

# 参考资料

https://github.com/nghuyong/Chinese-text-correction-papers/blob/main/Readme.md

* any list
{:toc}