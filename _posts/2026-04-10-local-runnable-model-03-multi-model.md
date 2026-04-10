---
layout: post 
title:  本地可以运行的模型-03-多模态
date: 2026-04-10 21:01:55 +0800
categories: [AI]
tags: [ai, llm, edge]
published: true
---

# 多模态


没问题，那我们就继续。图像理解和语音对话是本地AI应用里很实用也很有趣的部分，它们能将你电脑的“大脑”拓展出“眼睛”和“耳朵”。

对于图像理解任务，我们直接利用你电脑上的**Gemma 3 12B**模型就能实现，无需额外下载。你只需要在代码中将它的功能稍作切换，并传入图片路径即可，它就能“看懂”图片并回答你的问题。

### 📸 图像理解能力

Gemma 3 12B 本身是一个多模态模型，理解图像是它的核心能力之一。你可以直接用它的API来处理本地的图片文件。

**准备你的图片**：比如，在你电脑的 `C:\Users\你的用户名\Pictures` 目录下，保存一张名为 `cat.jpg` 的图片。

**在 Python 代码中调用**：
```python
import ollama
import base64
from pathlib import Path

# 1. 读取图片并转换为 Base64 格式
image_path = Path("C:/Users/你的用户名/Pictures/cat.jpg")
with open(image_path, "rb") as f:
    image_data = base64.b64encode(f.read()).decode("utf-8")

# 2. 构建提问内容
prompt = "描述一下这张图片的内容。"

# 3. 调用模型进行图像理解
#    注意：将 model 参数指定为你已安装的模型名称 'gemma3:12b'
response = ollama.generate(
    model='gemma3:12b',
    prompt=prompt,
    images=[image_data]
)

# 4. 打印模型生成的回答
print(response['response'])
```
代码里我们通过`images`参数传入图片数据，模型就会分析并给出它“看到”的描述，你可以用这个功能去测试它对你手头图片的理解效果。

---

### 🎤 语音对话能力

语音交互的本质就是“你说→电脑理解→电脑思考→电脑说话”的流程，其中涉及了语音转文字（STT）和文字转语音（TTS）。目前的工具链还不算特别集成化，但我们可以通过组合几个优秀的开源项目来实现。

#### 流程图
```mermaid
flowchart LR
    A[🎤 你的语音输入] --> B[STT 语音识别<br>Faster-Whisper]
    B --> C[🎭 LLM 大脑处理<br>Gemma 3 12B (Ollama)]
    C --> D[🔊 TTS 语音合成<br>Kokoro / Edge-TTS]
    D --> E[🔉 电脑语音回答]
```

#### 第一步：语音转文字 (STT)
我们会用到**Faster-Whisper**。它是OpenAI Whisper的优化版本，识别速度快，对中文的支持也不错。

1.  在终端中安装它的Python库：`pip install faster-whisper`
2.  准备一个测试用的音频文件，例如`test.wav`。
3.  运行以下代码，它会把音频文件里的内容转成文字，并打印在屏幕上。

**示例代码**：
```python
from faster_whisper import WhisperModel

# 选择模型大小，'tiny'最快但精度稍低，'base'或'small'是效果与速度的平衡
model = WhisperModel("base", device="cpu", compute_type="int8")

segments, info = model.transcribe("test.wav", beam_size=5, language="zh")

print("识别到的文本: ", " ".join(seg.text for seg in segments))
```

#### 第二步：文字转语音 (TTS)
这是让电脑开口说话的关键。如果你的项目不要求复杂的本地部署，推荐先尝试`Edge-TTS`。它调用的是你电脑里Microsoft Edge浏览器的基础服务，无需额外下载大模型，实现起来最简单。

1.  安装：`pip install edge-tts`
2.  运行下面的代码，它就能把一段文字变成语音，并保存为一个MP3文件。

**示例代码**：
```python
import asyncio
import edge_tts

async def text_to_speech(text, output_file):
    # 设置语音为中文女声，你也可以换成 'zh-CN-YunxiNeural' 等试试看
    communicate = edge_tts.Communicate(text, "zh-CN-XiaoxiaoNeural")
    await communicate.save(output_file)

# 使用示例
asyncio.run(text_to_speech("你好，欢迎探索AI的世界！", "output.mp3"))
```
如果你想尝试效果更自然的本地TTS模型，可以搜索 `Qwen3-TTS`、`CosyVoice`或 `Edge-TTS`（入门首选）这些项目。

#### 第三步：整合起来
完成上述两步后，一个完整的语音对话流程就在你的Python程序里跑通了。你可以通过麦克风实时录音，再调用`Faster-Whisper`转为文字，然后把文字发给Gemma模型处理，最后把模型的回复文本用TTS转成语音播放出来。

---

### 🧩 其它AI能力模型

除了图像和语音，你之前提到的翻译和文本向量化，也有非常成熟的本地解决方案。这些轻量级的模型可以作为你现有AI能力很好的补充。

| AI能力 | 模型推荐 | 一句话亮点 | 部署方式 (Ollama) |
| :--- | :--- | :--- | :--- |
| **文本向量化** | `embeddinggemma` | Google出品，<200MB，专为本地设备设计，用于语义搜索、RAG等。 | `ollama pull embeddinggemma:300m-qat-q4_0` |
| **专业OCR** | `glm-ocr` | 仅0.9B参数，在表格/公式识别上表现优异，Ollama可直接部署。 | `ollama pull glm-ocr` |
| **高效翻译** | `Hunyuan-MT-Chimera-7B` | 腾讯混元出品，7B参数，可在Ollama本地运行，支持多语言。 | `ollama run SimonPu/Hunyuan-MT-Chimera-7B:Q8` |

# 参考资料

* any list
{:toc}