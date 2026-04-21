---
layout: post 
title: π RuView 将普通 WiFi 变成传感系统 检测人员、测量呼吸和心率、跟踪运动、监控房间 — 穿墙、在黑暗中、无需摄像头或可穿戴设备。仅凭物理原理。
date: 2026-04-21 21:01:55 +0800
categories: [Ai]
tags: [finance, ai, wifi]
published: true
---

# π RuView

> **Beta 软件** — 正在积极开发中。API 和固件可能发生变更。已知限制：
> - 不支持 ESP32-C3 和原始 ESP32（单核，不足以处理 CSI DSP）
> - 单个 ESP32 部署的空间分辨率有限 — 请使用 2 个以上节点或添加 [Cognitum Seed](https://cognitum.one) 以获得最佳效果
> - 无摄像头姿态精度有限 — 请使用[摄像头真值训练](docs/adr/ADR-079-camera-ground-truth-training.md)以获得 92.9% 的 PCK@20
>
## **用 WiFi 透视墙壁** ##

**将普通 WiFi 变成传感系统。** 检测人员、测量呼吸和心率、跟踪运动、监控房间 — 穿墙、在黑暗中、无需摄像头或可穿戴设备。仅凭物理原理。

### π RuView 是一个将无线电信号转化为空间智能的 WiFi 传感平台。

每个 WiFi 路由器都已经用无线电波填满了你的空间。当人们移动、呼吸甚至静坐时，他们会以可测量的方式扰动这些波。RuView 使用来自低成本 ESP32 传感器的信道状态信息 (CSI) 捕获这些扰动，并将其转化为可操作的数据：谁在那里、他们在做什么、以及他们是否安好。

**它能感知什么：**
- **存在和占用** — 穿墙检测人员、计数、跟踪进出
- **生命体征** — 呼吸频率和心率，非接触式，睡眠或静坐时
- **活动识别** — 行走、坐、手势、跌倒 — 基于时序 CSI 模式
- **环境映射** — 射频指纹识别房间、检测移动的家具、发现新物体
- **睡眠质量** — 夜间监测，包含睡眠阶段分类和呼吸暂停筛查

基于 [RuVector](https://github.com/ruvnet/ruvector/) 和 [Cognitum Seed](https://cognitum.one)，RuView 完全在边缘硬件上运行 — 一个 ESP32 网状网络（每个节点低至 9 美元）搭配 Cognitum Seed 用于持久内存、加密证明和 AI 集成。无需云、无需摄像头、无需互联网。

系统使用脉冲神经网络在本地学习每个环境，30 秒内完成适应，并通过 6 个 WiFi 信道进行多频网状扫描，利用邻居的路由器作为免费雷达照明源。每次测量都通过 Ed25519 见证链进行加密证明。

RuView 还支持姿态估计（通过 WiFlow 架构实现 17 个 COCO 关键点），完全无需摄像头，仅使用 10 个传感器信号进行训练 — 这项技术源于卡内基梅隆大学最初的 *DensePose From WiFi* 研究。

### 为低功耗边缘应用而构建

[边缘模块](#边缘智能-adr-041) 是直接在 ESP32 传感器上运行的小型程序 — 无需互联网、无云费用、即时响应。

> | 功能 | 原理 | 速度 |
> |------|-----|-------|
> | **姿态估计** | CSI 子载波幅度/相位 → 17 个 COCO 关键点 | 171K 嵌入/秒 (M4 Pro) |
> | **呼吸检测** | 带通 0.1-0.5 Hz → 过零 BPM | 6-30 BPM |
> | **心率** | 带通 0.8-2.0 Hz → 过零 BPM | 40-120 BPM |
> | **存在感知** | 训练模型 + PIR 融合 — 100% 准确率 | 0.012 ms 延迟 |
> | **穿墙** | 菲涅尔区几何 + 多径建模 | 穿透深度达 5m |
> | **边缘智能** | 8 维特征向量 + Cognitum Seed 上的 RVF 存储 | 总物料成本 $140 |
> | **无摄像头训练** | 10 个传感器信号，无需标签 | M4 Pro 上 84 秒 |
> | **摄像头监督训练** | MediaPipe + ESP32 CSI → 92.9% PCK@20 | 笔记本上 19 分钟 |
> | **多频网状网络** | 6 个频段跳频，邻居 AP 作为照明源 | 3 倍传感带宽 |

```bash
# 选项 1：Docker（模拟数据，无需硬件）
docker pull ruvnet/wifi-densepose:latest
docker run -p 3000:3000 ruvnet/wifi-densepose:latest
# 打开 http://localhost:3000

# 选项 2：使用 ESP32-S3 硬件进行实时传感（9 美元）
# 烧录固件、配置 WiFi 并开始传感：
python -m esptool --chip esp32s3 --port COM9 --baud 460800 \
  write_flash 0x0 bootloader.bin 0x8000 partition-table.bin \
  0xf000 ota_data_initial.bin 0x20000 esp32-csi-node.bin
python firmware/esp32-csi-node/provision.py --port COM9 \
  --ssid "YourWiFi" --password "secret" --target-ip 192.168.1.20

# 选项 3：带 Cognitum Seed 的完整系统（140 美元）
# ESP32 流式 CSI → 桥接转发至 Seed 进行持久存储 + kNN + 见证链
node scripts/rf-scan.js --port 5006           # 实时射频房间扫描
node scripts/snn-csi-processor.js --port 5006  # SNN 实时学习
node scripts/mincut-person-counter.js --port 5006  # 正确的人员计数
```

> [!NOTE]
> **推荐使用支持 CSI 的硬件。** 存在、生命体征、穿墙感知以及所有高级功能都需要来自 ESP32-S3（9 美元）或研究网卡的信道状态信息 (CSI)。Docker 镜像使用模拟数据进行评估。消费级 WiFi 笔记本电脑仅提供基于 RSSI 的存在检测。

> **用于实时 CSI 捕获的硬件选项：**
>
> | 选项 | 硬件 | 成本 | 完整 CSI | 功能 |
> |--------|----------|------|----------|-------------|
> | **ESP32 + Cognitum Seed**（推荐） | ESP32-S3 + [Cognitum Seed](https://cognitum.one) | ~$140 | 是 | 姿态、呼吸、心跳、运动、存在 + 持久向量存储、kNN 搜索、见证链、MCP 代理 |
> | **ESP32 网状网络** | 3-6 个 ESP32-S3 + WiFi 路由器 | ~$54 | 是 | 姿态、呼吸、心跳、运动、存在 |
> | **研究网卡** | Intel 5300 / Atheros AR9580 | ~$50-100 | 是 | 完整 CSI，支持 3x3 MIMO |
> | **任何 WiFi** | Windows、macOS 或 Linux 笔记本 | $0 | 否 | 仅 RSSI：粗粒度的存在和运动 |
>
> 没有硬件？使用确定性参考信号验证信号处理流水线：`python v1/data/proof/verify.py`
>
---

### 实时密集点云（新）

RuView 现在通过融合摄像头深度 + WiFi CSI + 毫米波雷达生成**实时 3D 点云**。所有传感器同时流式传输到一个统一的空间模型中。

| 传感器 | 数据 | 集成方式 |
|--------|------|-------------|
| **摄像头** | MiDaS 单目深度（GPU） | 640×480 → 每帧 19,200+ 深度点 |
| **ESP32 CSI** | ADR-018 二进制帧（UDP） | 射频断层扫描 → 8×8×4 占用网格 |
| **WiFlow 姿态** | 来自 CSI 的 17 个 COCO 关键点 | 点云上的骨骼叠加 |
| **生命体征** | 来自 CSI 相位的呼吸频率 | 每 60 秒存储到 ruOS 大脑 |
| **运动** | CSI 幅度方差 | 自适应捕获率（静止时跳过深度） |

**快速开始：**
```bash
cd rust-port/wifi-densepose-rs
cargo build --release -p wifi-densepose-pointcloud
./target/release/ruview-pointcloud serve --bind 127.0.0.1:9880
# 打开 http://localhost:9880 查看实时 3D 查看器
```

**CLI 命令：**
```bash
ruview-pointcloud demo                            # 合成演示
ruview-pointcloud serve --bind 127.0.0.1:9880     # 实时服务器 + Three.js 查看器
ruview-pointcloud capture --output room.ply       # 捕获到 PLY 文件
ruview-pointcloud train                           # 深度校准 + DPO 对
ruview-pointcloud cameras                         # 列出可用摄像头
ruview-pointcloud csi-test --count 100            # 发送测试 CSI 帧
ruview-pointcloud fingerprint office --seconds 5  # 记录带名称的 CSI 房间指纹
```

HTTP/查看器服务器默认使用**环回地址（`127.0.0.1`）** — 将实时摄像头/CSI/生命体征暴露在 `0.0.0.0` 上是显式的选择加入。大脑 URL 默认为 `http://127.0.0.1:9876`，可通过 `RUVIEW_BRAIN_URL` 环境变量或 `serve`/`train` 的 `--brain` 标志覆盖。

姿态叠加目前使用**幅度能量启发式**（`heuristic_pose_from_amplitude`）而非训练好的 WiFlow 推理 — 真正的 ONNX/Candle 推理将在后续跟进。

**性能：** 22ms 流水线，905 请求/秒 API，20 帧构建 40K 体素房间模型。

**大脑集成：** 空间观测数据（运动、生命体征、骨骼、占用）每 60 秒同步到 ruOS 大脑，供智能体推理。

详细信息请参见 [PR #405](https://github.com/ruvnet/RuView/pull/405)。

### v0.7.0 中的新功能

<details>
<summary><strong>摄像头真值训练 — 92.9% PCK@20</strong></summary>

**v0.7.0 添加了摄像头监督的姿态训练**，使用 MediaPipe + 真实 ESP32 CSI 数据：

| 功能 | 作用 | ADR |
|-----------|-------------|-----|
| **摄像头真值收集** | MediaPipe PoseLandmarker 以 30fps 捕获 17 个 COCO 关键点，与 ESP32 CSI 同步 | [ADR-079](docs/adr/ADR-079-camera-ground-truth-training.md) |
| **ruvector 子载波选择** | 基于方差的 top-K 将输入减少 50%（70 → 35 个子载波） | ADR-079 O6 |
| **Stoer-Wagner 最小割** | 针对多人员训练的人员特定子载波聚类分离 | ADR-079 O8 |
| **可扩展 WiFlow 模型** | 4 种预设：lite (189K) → small (474K) → medium (800K) → full (7.7M 参数) | ADR-079 |

```bash
# 收集真值（摄像头 + ESP32 同时）
python scripts/collect-ground-truth.py --duration 300 --preview
python scripts/record-csi-udp.py --duration 300

# 将 CSI 窗口与摄像头关键点对齐
node scripts/align-ground-truth.js --gt data/ground-truth/*.jsonl --csi data/recordings/*.csi.jsonl

# 训练 WiFlow 模型（从 lite 开始，随着数据增长扩展规模）
node scripts/train-wiflow-supervised.js --data data/paired/*.jsonl --scale lite

# 评估
node scripts/eval-wiflow.js --model models/wiflow-real/wiflow-v1.json --data data/paired/*.jsonl
```

**结果：** 使用一个 ESP32-S3 和一个网络摄像头进行 5 分钟数据收集会话，获得 **92.9% PCK@20**。

| 指标 | 之前（代理） | 之后（摄像头监督） |
|--------|----------------|--------------------------|
| PCK@20 | 0% | **92.9%** |
| 评估损失 | 0.700 | **0.082** |
| 骨骼约束 | 不适用 | **0.008** |
| 训练时间 | 不适用 | **19 分钟** |
| 模型大小 | 不适用 | **974 KB** |

预训练模型：[HuggingFace ruv/ruview/wiflow-v1](https://huggingface.co/ruv/ruview)

</details>

### 预训练模型（v0.6.0）— 无需训练

<details>
<summary><strong>从 HuggingFace 下载并立即开始感知</strong></summary>

预训练模型可在 HuggingFace 上获取：
> **https://huggingface.co/ruv/ruview**（主要）| [镜像](https://huggingface.co/ruvnet/wifi-densepose-pretrained)

基于 8 小时通宵收集的 60,630 个真实世界样本训练。只需下载并运行 — 无需数据集、无需 GPU、无需训练。

| 模型 | 大小 | 作用 |
|-------|------|-------------|
| `model.safetensors` | 48 KB | 对比编码器 — 用于存在、活动、环境的 128 维嵌入 |
| `model-q4.bin` | 8 KB | 4 位量化 — 适合 ESP32-S3 SRAM，用于边缘推理 |
| `model-q2.bin` | 4 KB | 2 位超紧凑型，适用于内存受限设备 |
| `presence-head.json` | 2.6 KB | 100% 准确的存在检测头 |
| `node-1.json` / `node-2.json` | 21 KB | 每房间 LoRA 适配器（更换房间时替换） |

```bash
# 下载并使用（Python）
pip install huggingface_hub
huggingface-cli download ruv/ruview --local-dir models/

# 或者直接与传感流水线一起使用
node scripts/train-ruvllm.js --data data/recordings/*.csi.jsonl  # 用自己的数据重新训练
node scripts/benchmark-ruvllm.js --model models/csi-ruvllm       # 基准测试
```

**基准测试（Apple M4 Pro，在通宵数据上重新训练）：**

| 测量指标 | 结果 | 重要性 |
|-----------------|--------|---------------|
| **存在检测** | **100% 准确率** | 从不漏掉人员，从不误报 |
| **推理速度** | **每嵌入 0.008 ms** | 比实时快 125,000 倍 |
| **吞吐量** | **164,183 嵌入/秒** | 一台 Mac Mini 可处理 1,600+ 个 ESP32 节点 |
| **对比学习** | **51.6% 提升** | 从真实通宵数据中学习到强模式 |
| **模型大小** | **8 KB**（4 位量化） | 适合 ESP32 SRAM — 无需服务器 |
| **总硬件成本** | **$140** | ESP32（9 美元）+ [Cognitum Seed](https://cognitum.one)（131 美元） |

</details>

### 17 个传感应用（v0.6.0）

<details>
<summary><strong>健康、环境、安全、多频网状网络感知</strong></summary>

所有应用都可在单个 ESP32 + 可选 Cognitum Seed 上运行。无需摄像头、无需云、无需互联网。

**健康与保健：**

| 应用 | 脚本 | 检测内容 |
|------------|--------|----------------|
| 睡眠监测器 | `node scripts/sleep-monitor.js` | 睡眠阶段（深/浅/REM/清醒）、效率、睡眠图 |
| 呼吸暂停检测器 | `node scripts/apnea-detector.js` | 呼吸暂停 >10 秒，AHI 严重程度评分 |
| 压力监测器 | `node scripts/stress-monitor.js` | 心率变异性，LF/HF 压力比 |
| 步态分析器 | `node scripts/gait-analyzer.js` | 步行节奏、步幅不对称、震颤检测 |

**环境与安全：**

| 应用 | 脚本 | 检测内容 |
|------------|--------|----------------|
| 人员计数器 | `node scripts/mincut-person-counter.js` | 正确的占用计数（修复 #348） |
| 房间指纹 | `node scripts/room-fingerprint.js` | 活动状态聚类、日常模式、异常 |
| 材料检测器 | `node scripts/material-detector.js` | 通过子载波零点变化检测新/移动的物体 |
| 设备指纹 | `node scripts/device-fingerprint.js` | 电子设备活动（打印机、路由器等） |

**多频网状网络**（需要 `--hop-channels` 配置）：

| 应用 | 脚本 | 检测内容 |
|------------|--------|----------------|
| 射频断层扫描 | `node scripts/rf-tomography.js` | 通过射频反投影进行 2D 房间成像 |
| 无源雷达 | `node scripts/passive-radar.js` | 邻居 WiFi AP 作为双基地雷达照明源 |
| 材料分类器 | `node scripts/material-classifier.js` | 从频率响应识别金属/水/木材/玻璃 |
| 穿墙 | `node scripts/through-wall-detector.js` | 利用低频穿透性检测墙后运动 |

所有脚本支持 `--replay data/recordings/*.csi.jsonl` 进行离线分析，以及 `--json` 用于程序化输出。

</details>

### v0.5.5 中的新功能

<details>
<summary><strong>高级感知：SNN + MinCut + WiFlow + 多频网状网络</strong></summary>

**v0.5.5 新增了四种感知能力**，基于 [ruvector](https://github.com/ruvnet/ruvector) 生态系统：

| 功能 | 作用 | ADR |
|-----------|-------------|-----|
| **脉冲神经网络** | 通过 STDP 在线学习在 <30 秒内适应您的房间 — 无需标签、无需批次，计算量减少 16-160 倍 | [ADR-074](docs/adr/ADR-074-spiking-neural-csi-sensing.md) |
| **MinCut 人员计数** | 在子载波相关图上执行 Stoer-Wagner 最小割 — **修复 #348**（之前总是 4，现在正确） | [ADR-075](docs/adr/ADR-075-mincut-person-separation.md) |
| **CNN 频谱图嵌入** | 将 CSI 视为 64×20 图像 → 128 维嵌入，用于环境指纹识别（相似度 0.95+） | [ADR-076](docs/adr/ADR-076-csi-spectrogram-embeddings.md) |
| **WiFlow SOTA 架构** | TCN + 轴向注意力 + 姿态解码器 → 17 个 COCO 关键点，1.8M 参数（4 位下 881 KB） | [ADR-072](docs/adr/ADR-072-wiflow-architecture.md) |
| **多频网状网络** | 在 6 个频段上跳频，邻居 WiFi 作为无源雷达照明源 | [ADR-073](docs/adr/ADR-073-multifrequency-mesh-scan.md) |

```bash
# 实时射频房间扫描（频谱可视化）
node scripts/rf-scan.js --port 5006 --duration 30

# 正确的人员计数（修复 #348）
node scripts/mincut-person-counter.js --port 5006

# SNN 实时适应
node scripts/snn-csi-processor.js --port 5006

# CNN 频谱图嵌入
node scripts/csi-spectrogram.js --replay data/recordings/*.csi.jsonl

# WiFlow 17 关键点姿态训练
node scripts/train-wiflow.js --data data/recordings/*.csi.jsonl

# 在 ESP32 上启用跳频
python firmware/esp32-csi-node/provision.py --port COM9 --hop-channels "1,6,11"
```

**验证基准：**

| 指标 | v0.5.4 | v0.5.5 |
|--------|--------|--------|
| 人员计数 | 损坏（总是 4） | **正确**（MinCut，24/24） |
| WiFi 信道 | 1 | **6**（多频跳频） |
| 空子载波 | 19% 被阻塞 | **16%**（频率分集） |
| 姿态模型 | 16K 参数（仅全连接） | **1.8M 参数**（WiFlow） |
| 在线适应 | 无 | **<30 秒**（SNN STDP） |
| 指纹维度 | 8 | **128**（CNN 频谱图） |
| 多节点融合 | 平均 | **GATv2 注意力** |
| 新脚本 | 0 | **15+** |
| 新 ADR | 3 | **8**（069-076） |

</details>

### v0.5.4 中的新功能

<details>
<summary><strong>Cognitum Seed 集成 + 无摄像头姿态训练</strong></summary>

**v0.5.4 将 RuView 从实时感知工具转变为持久的边缘 AI 系统。** 您的 ESP32 现在能记住它感知到的东西，无需摄像头即可学习，并加密证明其数据。

| 功能 | 详细信息 | 硬件 |
|-----------|---------|----------|
| **持久向量存储** | 每个感知事件以 RVF 格式存储为可搜索的 8 维向量 | ESP32 + [Cognitum Seed](https://cognitum.one)（140 美元） |
| **kNN 相似性搜索** | “查找与当前状态最相似的 10 个状态” — 异常检测、指纹识别 | Cognitum Seed |
| **见证链** | 每次测量的 SHA-256 防篡改审计跟踪（已验证 1,747 条记录） | Cognitum Seed |
| **无摄像头姿态训练** | 来自 10 个传感器信号的 17 个 COCO 关键点 — PIR、RSSI 三角测量、子载波不对称、振动、BME280 | 2x ESP32 + Seed |
| **预训练模型** | 82.8 KB（4 位量化下 8 KB），100% 存在准确率，0 骨骼违规 | 从发布版下载 |
| **亚毫秒推理** | 0.012 ms 延迟，M4 Pro 上 171,472 嵌入/秒 | 任何装有 Node.js 的机器 |
| **SONA 适应** | 无需重新训练即可在 <1ms 内适应新房间 | ruvllm 运行时 |
| **LoRA 房间适配器** | 每节点微调，每个适配器 2,048 个参数 | 自动 |
| **114 工具 MCP 代理** | AI 助手（Claude、GPT）通过 JSON-RPC 直接查询传感器 | Cognitum Seed |
| **多频网状网络** | 在信道 1/3/5/6/9/11 上跳频 — 邻居 WiFi 作为无源雷达 | 2x ESP32（18 美元） |
| **射频房间扫描器** | 实时频谱可视化：零点、反射器、运动、多径 | `node scripts/rf-scan.js` |
| **安全加固** | Bearer 令牌、TLS、源 IP 过滤、NaN 拒绝、凭证轮换 | 所有组件 |

**训练流水线（ruvllm，无需 PyTorch）：**

```bash
# 收集数据（2 分钟，ESP32 必须正在流式传输）
python scripts/collect-training-data.py --port 5006 --duration 120

# 训练 — 对比预训练 + 任务头 + LoRA + 量化 + EWC
node scripts/train-ruvllm.js --data data/recordings/pretrain-*.csi.jsonl

# 无摄像头 17 关键点姿态（使用 PIR + RSSI + 振动 + 子载波不对称）
node scripts/train-camera-free.js --data data/recordings/pretrain-*.csi.jsonl

# 基准测试
node scripts/benchmark-ruvllm.js --model models/csi-ruvllm
```

**基准测试 — 在真实硬件上验证（Apple M4 Pro + ESP32-S3 + Cognitum Seed）：**

| 测量指标 | 结果 | 重要性 |
|-----------------|--------|---------------|
| **存在检测** | **100% 准确率** | 从不漏掉人员，从不误报 |
| **人员计数** | **24/24 正确**（MinCut） | 修复了 #1 用户报告的问题 |
| **推理速度** | **每嵌入 0.012 ms** | 比实时快 83,000 倍 |
| **吞吐量** | **171,472 嵌入/秒** | 一台 Mac Mini 可处理 1,700+ 个 ESP32 节点 |
| **训练时间** | **84 秒** | 从零到训练模型不到 2 分钟 |
| **对比学习** | **33.9% 提升** | 模型从 CSI 学习有意义的模式 |
| **模型大小** | **8 KB**（4 位量化） | 适合 ESP32 SRAM — 无需服务器 |
| **骨骼物理** | 100 帧中 **0 违规** | 每个姿态在解剖学上都是有效的 |
| **姿态关键点** | **17 个 COCO 关键点** | 全身姿态，无需摄像头 |
| **WiFi 信道** | **6 个同时** | 比单信道多 3 倍传感数据 |
| **在线适应** | **<30 秒**（SNN） | 无需重新训练即可学习新房间 |
| **见证链** | **2,547 条记录**已验证 | 加密证明每次测量都是真实的 |
| **测试套件** | **1,463 个测试通过** | 坚实的基础 |
| **总硬件成本** | **$140** | ESP32（9 美元）+ [Cognitum Seed](https://cognitum.one)（131 美元） |

详细信息请参见 [ADR-069](docs/adr/ADR-069-cognitum-seed-csi-pipeline.md)、[ADR-071](docs/adr/ADR-071-ruvllm-training-pipeline.md) 和 [Cognitum Seed 教程](docs/tutorials/cognitum-seed-pretraining.md)。

</details>

---

## 📖 文档

| 文档 | 描述 |
|----------|-------------|
| [用户指南](docs/user-guide.md) | 分步指南：安装、首次运行、API 使用、硬件设置、训练 |
| [构建指南](docs/build-guide.md) | 从源代码构建（Rust 和 Python） |
| [架构决策](docs/adr/README.md) | 79 个 ADR — 每个技术选择的原因，按领域组织（硬件、信号处理、机器学习、平台、基础设施） |
| [领域模型](docs/ddd/README.md) | 7 个 DDD 模型（RuvSense、信号处理、训练流水线、硬件平台、传感服务器、WiFi-Mat、CHCI）— 有界上下文、聚合、领域事件、通用语言 |
| [桌面应用](rust-port/wifi-densepose-rs/crates/wifi-densepose-desktop/README.md) | **进行中** — 用于节点管理、OTA 更新、WASM 部署和网状网络可视化的 Tauri v2 桌面应用 |
| [医疗示例](examples/medical/README.md) | 通过 60 GHz 毫米波雷达实现非接触式血压、心率、呼吸频率 — 15 美元硬件，无需可穿戴设备 |

---


  <a href="https://ruvnet.github.io/RuView/">
    <img src="assets/v2-screen.png" alt="WiFi DensePose — 带设置指南的实时姿态检测" width="800">
  </a>
  <br>
  <em>来自 WiFi CSI 信号的实时姿态骨骼 — 无需摄像头，无需可穿戴设备</em>
  <br><br>
  <a href="https://ruvnet.github.io/RuView/"><strong>▶ 实时天文台演示</strong></a>
  &nbsp;|&nbsp;
  <a href="https://ruvnet.github.io/RuView/pose-fusion.html"><strong>▶ 双模态姿态融合演示</strong></a>

> [服务器](#-快速开始) 对于可视化和聚合是可选的 — ESP32 [独立运行](#esp32-s3-硬件流水线) 以进行存在检测、生命体征和跌倒警报。
>
> **实时 ESP32 流水线**：连接一个 ESP32-S3 节点 → 运行[传感服务器](#传感服务器) → 打开[姿态融合演示](https://ruvnet.github.io/RuView/pose-fusion.html) 进行实时双模态姿态估计（网络摄像头 + WiFi CSI）。参见 [ADR-059](docs/adr/ADR-059-live-esp32-csi-pipeline.md)。


## 🚀 主要特性

### 感知

仅使用房间内已有的 WiFi 信号，即可透视墙壁看到人、呼吸和心跳。

| | 特性 | 含义 |
|---|---------|---------------|
| 🔒 | **隐私优先** | 仅使用 WiFi 信号跟踪人体姿态 — 无需摄像头、无视频、不存储图像 |
| 💓 | **生命体征** | 无需任何可穿戴设备即可检测呼吸频率（6-30 次/分钟）和心率（40-120 bpm） |
| 👥 | **多人** | 同时跟踪多人，每个人具有独立的姿态和生命体征 — 无硬性软件限制（物理限制：每个 AP 约 3-5 人，使用 56 个子载波，多 AP 可更多） |
| 🧱 | **穿墙** | WiFi 可穿透墙壁、家具和碎片 — 可在摄像头无法工作的地方工作 |
| 🚑 | **灾难响应** | 通过废墟检测被困幸存者，并对伤情严重程度进行分类（START 分诊） |
| 📡 | **多基地网状网络** | 4-6 个低成本传感器节点协同工作，结合 12 条以上的重叠信号路径，实现 360 度全方位房间覆盖，亚英寸精度，无人员混淆（[ADR-029](docs/adr/ADR-029-ruvsense-multistatic-sensing-mode.md)） |
| 🌐 | **持久场模型** | 系统学习每个房间的射频特征 — 然后减去房间特征以隔离人体运动，检测数天内的漂移，在运动开始前预测意图，并标记欺骗尝试（[ADR-030](docs/adr/ADR-030-ruvsense-persistent-field-model.md)） |

### 智能

系统自主学习，随时间变得更聪明 — 无需手动调整，无需标记数据。

| | 特性 | 含义 |
|---|---------|---------------|
| 🧠 | **自学习** | 从原始 WiFi 数据中自我教学 — 无需标记训练集，无需摄像头启动（[ADR-024](docs/adr/ADR-024-contrastive-csi-embedding-model.md)） |
| 🎯 | **AI 信号处理** | 注意力网络、图算法和智能压缩取代手动调整的阈值 — 自动适应每个房间（[RuVector](https://github.com/ruvnet/ruvector)） |
| 🌍 | **随处工作** | 训练一次，部署到任何房间 — 对抗性领域泛化消除环境偏差，使模型能够在不同房间、建筑和硬件之间迁移（[ADR-027](docs/adr/ADR-027-cross-environment-domain-generalization.md)） |
| 👁️ | **跨视角融合** | AI 结合每个传感器从其自身角度看到的内容 — 填补任何单一视角无法解决的盲点和深度模糊（[ADR-031](docs/adr/ADR-031-ruview-sensing-first-rf-mode.md)） |
| 🔮 | **信号线协议** | 一个 6 阶段处理流水线，将原始 WiFi 信号转换为结构化的人体表示 — 从信号清理到基于图的空间推理，最终输出姿态（[ADR-033](docs/adr/ADR-033-crv-signal-line-sensing-integration.md)） |
| 🔒 | **QUIC 网状网络安全** | 所有传感器间通信均经过端到端加密，具有篡改检测、重放保护和节点移动或离线时的无缝重连（[ADR-032](docs/adr/ADR-032-multistatic-mesh-security-hardening.md)） |
| 🎯 | **自适应分类器** | 记录带标签的 CSI 会话，在纯 Rust 中训练 15 个特征的逻辑回归模型，并学习您房间独特的信号特征 — 用数据驱动的分类取代手动调整的阈值（[ADR-048](docs/adr/ADR-048-adaptive-csi-classifier.md)） |

### 性能与部署

足够快以满足实时使用，足够小以适应边缘设备，足够简单以实现一键设置。

| | 特性 | 含义 |
|---|---------|---------------|
| ⚡ | **实时** | 每帧在 100 微秒内分析 WiFi 信号 — 足够快以进行实时监控 |
| 🦀 | **810 倍更快** | 完整的 Rust 重写：54,000 帧/秒流水线、多架构 Docker 镜像、1,031+ 测试 |
| 🐳 | **一键设置** | `docker pull ruvnet/wifi-densepose:latest` — 30 秒内实时感知，无需工具链（amd64 + arm64 / Apple Silicon） |
| 📡 | **完全本地** | 完全在 9 美元的 ESP32 上运行 — 无需互联网连接、无需云账户、无经常性费用。在设备上检测存在、生命体征和跌倒，即时响应 |
| 📦 | **便携模型** | 训练好的模型打包成单个 `.rvf` 文件 — 可在边缘、云或浏览器（WASM）上运行 |
| 🔭 | **天文台可视化** | 电影级 Three.js 仪表板，带有 5 个全息面板 — 子载波流形、生命体征预言机、存在热图、相位星座、融合引擎 — 全部由实时或演示 CSI 数据驱动（[ADR-047](docs/adr/ADR-047-psychohistory-observatory-visualization.md)） |
| 📟 | **AMOLED 显示屏** | 带有内置 AMOLED 屏幕的 ESP32-S3 板可直接在传感器上显示实时存在、生命体征和房间状态 — 无需手机或电脑（[ADR-045](docs/adr/ADR-045-amoled-display-support.md)） |

---

## 🔬 工作原理

WiFi 路由器用无线电波充斥每个房间。当人移动 — 甚至呼吸时 — 这些波的散射方式会发生变化。WiFi DensePose 读取这种散射模式并重建发生的事情：

```
WiFi 路由器 → 无线电波穿过房间 → 击中人体 → 散射
    ↓
ESP32 网状网络（4-6 个节点）通过 TDM 协议捕获信道 1/6/11 上的 CSI
    ↓
多频段融合：3 个信道 × 56 个子载波 = 每条链路 168 个虚拟子载波
    ↓
多基地融合：N×(N-1) 条链路 → 注意力加权的跨视角嵌入
    ↓
相干门：接受/拒绝测量 → 无需调整即可稳定运行数天
    ↓
信号处理：Hampel、SpotFi、菲涅尔、BVP、频谱图 → 干净的特征
    ↓
AI 骨干（RuVector）：注意力、图算法、压缩、场模型
    ↓
信号线协议（CRV）：6 阶段 — 完形 → 感知 → 拓扑 → 相干 → 搜索 → 模型
    ↓
神经网络：处理后的信号 → 17 个身体关键点 + 生命体征 + 房间模型
    ↓
输出：实时姿态、呼吸、心率、房间指纹、漂移警报
```

无需训练摄像头 — [自学习系统（ADR-024）](docs/adr/ADR-024-contrastive-csi-embedding-model.md) 仅从原始 WiFi 数据中启动。[MERIDIAN（ADR-027）](docs/adr/ADR-027-cross-environment-domain-generalization.md) 确保模型在任何房间都能工作，而不仅仅是在它训练过的房间。

---

## 🏢 用例与应用

WiFi 传感可以在任何有 WiFi 的地方工作。大多数情况下无需新硬件 — 只需在现有接入点或 8 美元的 ESP32 附加组件上安装软件。由于没有摄像头，部署从设计上避免了隐私法规（GDPR 视频、HIPAA 成像）的约束。

**扩展性：** 每个 AP 可区分约 3-5 人（56 个子载波）。多 AP 线性扩展 — 一个 4 AP 的零售网状网络可覆盖约 15-20 人。没有硬性软件限制；实际上限是信号物理特性。

| | WiFi 传感的优势 | 传统替代方案 |
|---|----------------------|----------------------|
| 🔒 | **无视频，无 GDPR/HIPAA 成像规则** | 摄像头需要同意、标识、数据保留策略 |
| 🧱 | **可穿透墙壁、货架、碎片** | 摄像头需要每个房间的视线 |
| 🌙 | **可在完全黑暗中工作** | 摄像头需要红外或可见光 |
| 💰 | **每区域 0-8 美元**（现有 WiFi 或 ESP32） | 摄像头系统：每区域 200-2,000 美元 |
| 🔌 | **WiFi 已无处不在** | PIR/雷达传感器每个房间需要新布线 |

<details>
<summary><strong>🏥 日常</strong> — 医疗、零售、办公室、酒店（商用 WiFi）</summary>

| 用例 | 功能 | 硬件 | 关键指标 | 边缘模块 |
|----------|-------------|----------|------------|-------------|
| **老年人护理 / 辅助生活** | 跌倒检测、夜间活动监测、睡眠时呼吸频率 — 无需可穿戴设备依从性 | 每个房间 1 个 ESP32-S3（8 美元） | 跌倒警报 <2 秒 | [睡眠呼吸暂停](docs/edge-modules/medical.md)、[步态分析](docs/edge-modules/medical.md) |
| **医院病人监护** | 非重症床位持续呼吸 + 心率监测，无需有线传感器；异常时提醒护士 | 每个病房 1-2 个 AP | 呼吸：6-30 BPM | [呼吸窘迫](docs/edge-modules/medical.md)、[心律失常](docs/edge-modules/medical.md) |
| **急诊室分诊** | 自动占用计数 + 等待时间估计；在等候区检测患者痛苦（异常呼吸） | 现有医院 WiFi | 占用准确率 >95% | [队列长度](docs/edge-modules/retail.md)、[恐慌运动](docs/edge-modules/security.md) |
| **零售占用与客流** | 实时人流量、各区域停留时间、队列长度 — 无摄像头、无需选择加入、符合 GDPR | 现有商店 WiFi + 1 个 ESP32 | 停留分辨率约 1 米 | [顾客流](docs/edge-modules/retail.md)、[停留热图](docs/edge-modules/retail.md) |
| **办公空间利用率** | 哪些办公桌/房间实际被占用、会议室缺席、基于真实存在的 HVAC 优化 | 现有企业 WiFi | 存在延迟 <1 秒 | [会议室](docs/edge-modules/building.md)、[HVAC 存在](docs/edge-modules/building.md) |
| **酒店与款待** | 无需门磁的房间占用、迷你吧/浴室使用模式、空房间节能 | 现有酒店 WiFi | 15-30% HVAC 节省 | [能源审计](docs/edge-modules/building.md)、[照明区域](docs/edge-modules/building.md) |
| **餐厅与食品服务** | 餐桌周转跟踪、厨房员工存在、洗手间占用显示 — 用餐区无摄像头 | 现有 WiFi | 队列等待 ±30 秒 | [餐桌周转](docs/edge-modules/retail.md)、[队列长度](docs/edge-modules/retail.md) |
| **停车场** | 楼梯间和电梯内摄像头有盲区时的人员存在；有人逗留时发出安全警报 | 现有 WiFi | 穿透混凝土墙 | [逗留](docs/edge-modules/security.md)、[电梯计数](docs/edge-modules/building.md) |

</details>

<details>
<summary><strong>🏟️ 专业</strong> — 活动、健身、教育、市政（支持 CSI 的硬件）</summary>

| 用例 | 功能 | 硬件 | 关键指标 | 边缘模块 |
|----------|-------------|----------|------------|-------------|
| **智能家居自动化** | 穿墙工作的房间级存在触发器（灯光、HVAC、音乐）— 无死角、无运动传感器超时 | 2-3 个 ESP32-S3 节点（24 美元） | 穿墙范围约 5 米 | [HVAC 存在](docs/edge-modules/building.md)、[照明区域](docs/edge-modules/building.md) |
| **健身与运动** | 重复计数、姿势纠正、运动时呼吸节奏 — 无需可穿戴设备、更衣室无摄像头 | 3+ 个 ESP32-S3 网状网络 | 姿态：17 个关键点 | [呼吸同步](docs/edge-modules/exotic.md)、[步态分析](docs/edge-modules/medical.md) |
| **托儿所与学校** | 午睡呼吸监测、游乐场人数统计、限制区域警报 — 对未成年人隐私安全 | 每区域 2-4 个 ESP32-S3 | 呼吸：±1 BPM | [睡眠呼吸暂停](docs/edge-modules/medical.md)、[周界入侵](docs/edge-modules/security.md) |
| **活动场所与音乐会** | 人群密度映射、通过呼吸压缩检测拥挤风险、紧急疏散流量跟踪 | 多 AP 网状网络（4-8 AP） | 每平方米密度 | [顾客流](docs/edge-modules/retail.md)、[恐慌运动](docs/edge-modules/security.md) |
| **体育场与竞技场** | 用于动态定价、特许经营人员配备、紧急出口流量建模的区域级占用 | 企业 AP 网格 | 每个 AP 网状网络 15-20 人 | [停留热图](docs/edge-modules/retail.md)、[队列长度](docs/edge-modules/retail.md) |
| **礼拜场所** | 无需面部识别的出席计数 — 注重隐私的会众、多园区校园跟踪 | 现有 WiFi | 区域级准确率 | [电梯计数](docs/edge-modules/building.md)、[能源审计](docs/edge-modules/building.md) |
| **仓库与物流** | 工人安全区、叉车接近警报、危险区域占用 — 可穿透货架和托盘工作 | 工业 AP 网状网络 | 警报延迟 <500 毫秒 | [叉车接近](docs/edge-modules/industrial.md)、[密闭空间](docs/edge-modules/industrial.md) |
| **市政基础设施** | 公共洗手间占用（无法安装摄像头）、地铁站台拥挤、紧急情况下避难所人数统计 | 市政 WiFi + ESP32 | 实时人数统计 | [顾客流](docs/edge-modules/retail.md)、[逗留](docs/edge-modules/security.md) |
| **博物馆与画廊** | 参观者流量热图、展品停留时间、人群瓶颈警报 — 艺术品附近无摄像头（闪光/盗窃风险） | 现有 WiFi | 区域停留 ±5 秒 | [停留热图](docs/edge-modules/retail.md)、[货架互动](docs/edge-modules/retail.md) |

</details>

<details>
<summary><strong>🤖 机器人与工业</strong> — 自主系统、制造、机器人空间感知</summary>

WiFi 传感为机器人和自主系统提供了一层空间感知能力，可在激光雷达和摄像头失效的地方工作 — 穿透灰尘、烟雾、雾气，以及绕过角落。CSI 信号场充当了“第六感”，无需视线即可检测环境中的人。

| 用例 | 功能 | 硬件 | 关键指标 | 边缘模块 |
|----------|-------------|----------|------------|-------------|
| **协作机器人安全区** | 检测协作机器人附近的人 — 在接触前自动减速或停止，即使在障碍物后面 | 每个单元 2-3 个 ESP32-S3 | 存在延迟 <100 毫秒 | [叉车接近](docs/edge-modules/industrial.md)、[周界入侵](docs/edge-modules/security.md) |
| **仓库 AMR 导航** | 自主移动机器人感知盲角后、货架后的人 — 无激光雷达遮挡 | 沿过道的 ESP32 网状网络 | 穿透货架检测 | [叉车接近](docs/edge-modules/industrial.md)、[逗留](docs/edge-modules/security.md) |
| **安卓/人形机器人空间感知** | 社交机器人的环境人体姿态感知 — 无需摄像头始终开启即可检测手势、接近方向和个人空间 | 板载 ESP32-S3 模块 | 17 关键点姿态 | [手势语言](docs/edge-modules/exotic.md)、[情绪检测](docs/edge-modules/exotic.md) |
| **生产线监控** | 每个工位的工人存在、符合人体工学的姿势警报、轮班合规人数统计 — 可穿透设备工作 | 每个区域的工业 AP | 姿态 + 呼吸 | [密闭空间](docs/edge-modules/industrial.md)、[步态分析](docs/edge-modules/medical.md) |
| **施工现场安全** | 重型机械周围的禁区执行、脚手架跌倒检测、人员统计 | 加固型 ESP32 网状网络 | 警报 <2 秒，穿透灰尘 | [恐慌运动](docs/edge-modules/security.md)、[结构振动](docs/edge-modules/industrial.md) |
| **农业机器人** | 在多尘/多雾的田间条件下检测靠近自主收割机的农场工人，此时摄像头不可靠 | 防风雨 ESP32 节点 | 开阔地范围约 10 米 | [叉车接近](docs/edge-modules/industrial.md)、[雨水检测](docs/edge-modules/exotic.md) |
| **无人机着陆区** | 验证着陆区无人 — WiFi 传感可在雨天、灰尘和低光下工作，而向下摄像头会失效 | 地面 ESP32 节点 | 存在准确率 >95% | [周界入侵](docs/edge-modules/security.md)、[尾随](docs/edge-modules/security.md) |
| **洁净室监控** | 无摄像头的人员跟踪（摄像头风扇带来的颗粒污染风险）— 通过姿态验证工作服合规性 | 现有洁净室 WiFi | 无颗粒排放 | [洁净室](docs/edge-modules/industrial.md)、[牲畜监测](docs/edge-modules/industrial.md) |

</details>

<details>
<summary><strong>🔥 极端场景</strong> — 穿墙、灾难、国防、地下</summary>

这些场景利用了 WiFi 穿透固体材料（混凝土、碎石、泥土）的能力 — 光学或红外传感器无法到达的地方。WiFi-Mat 灾难模块（ADR-001）专门为此层级设计。

| 用例 | 功能 | 硬件 | 关键指标 | 边缘模块 |
|----------|-------------|----------|------------|-------------|
| **搜索与救援（WiFi-Mat）** | 通过呼吸特征检测废墟下的幸存者、START 分诊颜色分类、3D 定位 | 便携 ESP32 网状网络 + 笔记本 | 穿透 30 厘米混凝土 | [呼吸窘迫](docs/edge-modules/medical.md)、[癫痫检测](docs/edge-modules/medical.md) |
| **消防** | 进入前通过烟雾和墙壁定位 occupants；远程呼吸检测确认生命迹象 | 卡车上的便携网状网络 | 零能见度下工作 | [睡眠呼吸暂停](docs/edge-modules/medical.md)、[恐慌运动](docs/edge-modules/security.md) |
| **监狱与安全设施** | 牢房占用验证、痛苦检测（异常生命体征）、周界感知 — 无摄像头盲点 | 专用 AP 基础设施 | 7x24 生命体征 | [心律失常](docs/edge-modules/medical.md)、[逗留](docs/edge-modules/security.md) |
| **军事/战术** | 穿墙人员检测、房间清空确认、对峙距离的人质生命体征 | 定向 WiFi + 定制固件 | 穿墙范围：5 米 | [周界入侵](docs/edge-modules/security.md)、[武器检测](docs/edge-modules/security.md) |
| **边境与周界安全** | 检测隧道、围栏后、车辆内的人 — 无源感知，无主动照明暴露位置 | 隐蔽 ESP32 网状网络 | 无源/隐蔽 | [周界入侵](docs/edge-modules/security.md)、[尾随](docs/edge-modules/security.md) |
| **采矿与地下** | GPS/摄像头失效的隧道中的工人存在、坍塌后呼吸检测、安全点人数统计 | 加固型 ESP32 网状网络 | 穿透岩石/泥土 | [密闭空间](docs/edge-modules/industrial.md)、[呼吸窘迫](docs/edge-modules/medical.md) |
| **海事与海军** | 通过钢制舱壁的甲板下人员跟踪（范围有限，需调优）、人员落水检测 | 舰船 WiFi + ESP32 | 穿透 1-2 个舱壁 | [结构振动](docs/edge-modules/industrial.md)、[恐慌运动](docs/edge-modules/security.md) |
| **野生动物研究** | 围栏或巢穴中的非侵入式动物活动监测 — 无光污染、无视觉干扰 | 防风雨 ESP32 节点 | 零光发射 | [牲畜监测](docs/edge-modules/industrial.md)、[梦境阶段](docs/edge-modules/exotic.md) |

</details>

### 边缘智能（[ADR-041](docs/adr/ADR-041-wasm-module-collection.md)）

直接在 ESP32 传感器上运行的小型程序 — 无需互联网、无云费用、即时响应。每个模块是一个 tiny WASM 文件（5-30 KB），可通过无线方式上传到设备。它在本地读取 WiFi 信号数据并在 10 毫秒内做出决策。[ADR-041](docs/adr/ADR-041-wasm-module-collection.md) 定义了 13 个类别中的 60 个模块 — 所有 60 个均已实现，609 个测试通过。

| | 类别 | 示例 |
|---|----------|---------|
| 🏥 | [**医疗与健康**](docs/edge-modules/medical.md) | 睡眠呼吸暂停检测、心律失常、步态分析、癫痫检测 |
| 🔐 | [**安全与安保**](docs/edge-modules/security.md) | 入侵检测、周界入侵、逗留、恐慌运动 |
| 🏢 | [**智能建筑**](docs/edge-modules/building.md) | 区域占用、HVAC 控制、电梯计数、会议室跟踪 |
| 🛒 | [**零售与款待**](docs/edge-modules/retail.md) | 队列长度、停留热图、顾客流、餐桌周转 |
| 🏭 | [**工业**](docs/edge-modules/industrial.md) | 叉车接近、密闭空间监控、结构振动 |
| 🔮 | [**奇异与研究**](docs/edge-modules/exotic.md) | 睡眠分期、情绪检测、手语、呼吸同步 |
| 📡 | [**信号智能**](docs/edge-modules/signal-intelligence.md) | 清理和锐化原始 WiFi 信号 — 聚焦重要区域、过滤噪声、填补缺失数据、跟踪人员身份 |
| 🧠 | [**自适应学习**](docs/edge-modules/adaptive-learning.md) | 传感器随时间自主学习新的手势和模式 — 无需云，即使更新后也能记住所学内容 |
| 🗺️ | [**空间推理**](docs/edge-modules/spatial-temporal.md) | 确定房间内人的位置、哪些区域最重要，并使用基于图的空间逻辑跟踪区域间的移动 |
| ⏱️ | [**时序分析**](docs/edge-modules/spatial-temporal.md) | 学习日常规律，检测模式中断（某人未起床），并验证安全规则是否随时间得到遵守 |
| 🛡️ | [**AI 安全**](docs/edge-modules/ai-security.md) | 检测信号重放攻击、WiFi 干扰、注入尝试，并标记可能表明篡改的异常行为 |
| ⚛️ | [**量子启发**](docs/edge-modules/autonomous.md) | 使用量子启发的数学方法映射全房间信号相干性，并搜索最优传感器配置 |
| 🤖 | [**自主与奇异**](docs/edge-modules/autonomous.md) | 自我管理的传感器网状网络 — 自动修复掉线节点、规划自身行动、探索实验性信号表示 |

所有已实现的模块都是 `no_std` Rust，共享一个[通用工具库](rust-port/wifi-densepose-rs/crates/wifi-densepose-wasm-edge/src/vendor_common.rs)，并通过一个 12 函数 API 与主机通信。完整文档：[**边缘模块指南**](docs/edge-modules/README.md)。请参阅下面的[完整已实现模块列表](#边缘模块列表)。

<details id="边缘模块列表">
<summary><strong>🧩 边缘智能 — <a href="docs/edge-modules/README.md">全部 65 个模块已实现</a></strong>（ADR-041 完成）</summary>

所有 60 个模块均已实现、测试（609 个测试通过）并准备部署。它们编译为 `wasm32-unknown-unknown`，通过 WASM3 在 ESP32-S3 上运行，并共享一个[通用工具库](rust-port/wifi-densepose-rs/crates/wifi-densepose-wasm-edge/src/vendor_common.rs)。源代码：[`crates/wifi-densepose-wasm-edge/src/`](rust-port/wifi-densepose-rs/crates/wifi-densepose-wasm-edge/src/)

**核心模块**（ADR-040 旗舰 + 早期实现）：

| 模块 | 文件 | 功能 |
|--------|------|-------------|
| 手势分类器 | [`gesture.rs`](rust-port/wifi-densepose-rs/crates/wifi-densepose-wasm-edge/src/gesture.rs) | 用于手势的 DTW 模板匹配 |
| 相干滤波器 | [`coherence.rs`](rust-port/wifi-densepose-rs/crates/wifi-densepose-wasm-edge/src/coherence.rs) | 用于信号质量的相位相干门控 |
| 对抗检测器 | [`adversarial.rs`](rust-port/wifi-densepose-rs/crates/wifi-densepose-wasm-edge/src/adversarial.rs) | 检测物理上不可能的信号模式 |
| 入侵检测器 | [`intrusion.rs`](rust-port/wifi-densepose-rs/crates/wifi-densepose-wasm-edge/src/intrusion.rs) | 人与非人运动分类 |
| 占用计数器 | [`occupancy.rs`](rust-port/wifi-densepose-rs/crates/wifi-densepose-wasm-edge/src/occupancy.rs) | 区域级人员计数 |
| 生命体征趋势 | [`vital_trend.rs`](rust-port/wifi-densepose-rs/crates/wifi-densepose-wasm-edge/src/vital_trend.rs) | 长期呼吸和心率趋势 |
| RVF 解析器 | [`rvf.rs`](rust-port/wifi-densepose-rs/crates/wifi-densepose-wasm-edge/src/rvf.rs) | RVF 容器格式解析 |

**供应商集成模块**（24 个模块，ADR-041 类别 7）：

**📡 信号智能** — 实时 CSI 分析和特征提取

| 模块 | 文件 | 功能 | 预算 |
|--------|------|-------------|--------|
| 闪存注意力 | [`sig_flash_attention.rs`](rust-port/wifi-densepose-rs/crates/wifi-densepose-wasm-edge/src/sig_flash_attention.rs) | 在 8 个子载波组上进行分块注意力 — 查找空间焦点区域和熵 | S (<5ms) |
| 相干门 | [`sig_coherence_gate.rs`](rust-port/wifi-densepose-rs/crates/wifi-densepose-wasm-edge/src/sig_coherence_gate.rs) | 带滞后的 Z 得分相量门控：接受 / 仅预测 / 拒绝 / 重新校准 | L (<2ms) |
| 时序压缩 | [`sig_temporal_compress.rs`](rust-port/wifi-densepose-rs/crates/wifi-densepose-wasm-edge/src/sig_temporal_compress.rs) | 3 层自适应量化（8 位热 / 5 位温 / 3 位冷） | L (<2ms) |
| 稀疏恢复 | [`sig_sparse_recovery.rs`](rust-port/wifi-densepose-rs/crates/wifi-densepose-wasm-edge/src/sig_sparse_recovery.rs) | 用于丢失子载波的 ISTA L1 重建 | H (<10ms) |
| 人员匹配 | [`sig_mincut_person_match.rs`](rust-port/wifi-densepose-rs/crates/wifi-densepose-wasm-edge/src/sig_mincut_person_match.rs) | 用于多人跟踪的匈牙利式二分指派 | S (<5ms) |
| 最优传输 | [`sig_optimal_transport.rs`](rust-port/wifi-densepose-rs/crates/wifi-densepose-wasm-edge/src/sig_optimal_transport.rs) | 带 4 个投影的切片 Wasserstein-1 距离 | L (<2ms) |

**🧠 自适应学习** — 无需云连接的设备上学习

| 模块 | 文件 | 功能 | 预算 |
|--------|------|-------------|--------|
| DTW 手势学习 | [`lrn_dtw_gesture_learn.rs`](rust-port/wifi-densepose-rs/crates/wifi-densepose-wasm-edge/src/lrn_dtw_gesture_learn.rs) | 用户可教的手势识别 — 3 次排练协议，16 个模板 | S (<5ms) |
| 异常吸引子 | [`lrn_anomaly_attractor.rs`](rust-port/wifi-densepose-rs/crates/wifi-densepose-wasm-edge/src/lrn_anomaly_attractor.rs) | 带李雅普诺夫指数的 4D 动力系统吸引子分类 | H (<10ms) |
| 元适应 | [`lrn_meta_adapt.rs`](rust-port/wifi-densepose-rs/crates/wifi-densepose-wasm-edge/src/lrn_meta_adapt.rs) | 带安全回滚的爬山法自优化 | L (<2ms) |
| EWC 终身学习 | [`lrn_ewc_lifelong.rs`](rust-port/wifi-densepose-rs/crates/wifi-densepose-wasm-edge/src/lrn_ewc_lifelong.rs) | 弹性权重巩固 — 在学习新任务时记住旧任务 | S (<5ms) |

**🗺️ 空间推理** — 位置、接近度和影响映射

| 模块 | 文件 | 功能 | 预算 |
|--------|------|-------------|--------|
| PageRank 影响 | [`spt_pagerank_influence.rs`](rust-port/wifi-densepose-rs/crates/wifi-densepose-wasm-edge/src/spt_pagerank_influence.rs) | 带幂迭代 PageRank 的 4x4 互相关图 | L (<2ms) |
| 微型 HNSW | [`spt_micro_hnsw.rs`](rust-port/wifi-densepose-rs/crates/wifi-densepose-wasm-edge/src/spt_micro_hnsw.rs) | 用于最近邻搜索的 64 向量可导航小世界图 | S (<5ms) |
| 脉冲跟踪器 | [`spt_spiking_tracker.rs`](rust-port/wifi-densepose-rs/crates/wifi-densepose-wasm-edge/src/spt_spiking_tracker.rs) | 32 个 LIF 神经元 + 4 个输出区域神经元，带 STDP 学习 | S (<5ms) |

**⏱️ 时序分析** — 活动模式、逻辑验证、自主规划

| 模块 | 文件 | 功能 | 预算 |
|--------|------|-------------|--------|
| 模式序列 | [`tmp_pattern_sequence.rs`](rust-port/wifi-densepose-rs/crates/wifi-densepose-wasm-edge/src/tmp_pattern_sequence.rs) | 活动规律检测和偏差警报 | S (<5ms) |
| 时序逻辑守卫 | [`tmp_temporal_logic_guard.rs`](rust-port/wifi-densepose-rs/crates/wifi-densepose-wasm-edge/src/tmp_temporal_logic_guard.rs) | 在 CSI 事件流上的 LTL 公式验证 | S (<5ms) |
| GOAP 自主性 | [`tmp_goap_autonomy.rs`](rust-port/wifi-densepose-rs/crates/wifi-densepose-wasm-edge/src/tmp_goap_autonomy.rs) | 用于自主模块管理的目标导向行动规划 | S (<5ms) |

**🛡️ AI 安全** — 篡改检测和行为异常分析

| 模块 | 文件 | 功能 | 预算 |
|--------|------|-------------|--------|
| 提示盾 | [`ais_prompt_shield.rs`](rust-port/wifi-densepose-rs/crates/wifi-densepose-wasm-edge/src/ais_prompt_shield.rs) | FNV-1a 重放检测、注入检测（10 倍幅度）、干扰（SNR） | L (<2ms) |
| 行为分析器 | [`ais_behavioral_profiler.rs`](rust-port/wifi-densepose-rs/crates/wifi-densepose-wasm-edge/src/ais_behavioral_profiler.rs) | 带马氏距离异常评分的 6D 行为画像 | S (<5ms) |

**⚛️ 量子启发** — 应用于 CSI 分析的量子计算隐喻

| 模块 | 文件 | 功能 | 预算 |
|--------|------|-------------|--------|
| 量子相干 | [`qnt_quantum_coherence.rs`](rust-port/wifi-densepose-rs/crates/wifi-densepose-wasm-edge/src/qnt_quantum_coherence.rs) | 布洛赫球映射、冯·诺依曼熵、退相干检测 | S (<5ms) |
| 干涉搜索 | [`qnt_interference_search.rs`](rust-port/wifi-densepose-rs/crates/wifi-densepose-wasm-edge/src/qnt_interference_search.rs) | 16 个房间状态假设，带 Grover 启发式预言机 + 扩散 | S (<5ms) |

**🤖 自主系统** — 自我治理和自我修复行为

| 模块 | 文件 | 功能 | 预算 |
|--------|------|-------------|--------|
| 心理符号 | [`aut_psycho_symbolic.rs`](rust-port/wifi-densepose-rs/crates/wifi-densepose-wasm-edge/src/aut_psycho_symbolic.rs) | 带矛盾检测的 16 规则前向链接知识库 | S (<5ms) |
| 自愈网状网络 | [`aut_self_healing_mesh.rs`](rust-port/wifi-densepose-rs/crates/wifi-densepose-wasm-edge/src/aut_self_healing_mesh.rs) | 带健康跟踪、退化/恢复、覆盖修复的 8 节点网状网络 | S (<5ms) |

**🔮 奇异（供应商）** — 用于 CSI 解释的新颖数学模型

| 模块 | 文件 | 功能 | 预算 |
|--------|------|-------------|--------|
| 时间晶体 | [`exo_time_crystal.rs`](rust-port/wifi-densepose-rs/crates/wifi-densepose-wasm-edge/src/exo_time_crystal.rs) | 在 256 帧历史中的自相关次谐波检测 | S (<5ms) |
| 双曲空间 | [`exo_hyperbolic_space.rs`](rust-port/wifi-densepose-rs/crates/wifi-densepose-wasm-edge/src/exo_hyperbolic_space.rs) | 带 32 个参考位置的庞加莱球嵌入，双曲距离 | S (<5ms) |

**🏥 医疗与健康**（类别 1）— 非接触式健康监测

| 模块 | 文件 | 功能 | 预算 |
|--------|------|-------------|--------|
| 睡眠呼吸暂停 | [`med_sleep_apnea.rs`](rust-port/wifi-densepose-rs/crates/wifi-densepose-wasm-edge/src/med_sleep_apnea.rs) | 检测睡眠期间的呼吸暂停 | S (<5ms) |
| 心律失常 | [`med_cardiac_arrhythmia.rs`](rust-port/wifi-densepose-rs/crates/wifi-densepose-wasm-edge/src/med_cardiac_arrhythmia.rs) | 监测心率是否存在不规则节律 | S (<5ms) |
| 呼吸窘迫 | [`med_respiratory_distress.rs`](rust-port/wifi-densepose-rs/crates/wifi-densepose-wasm-edge/src/med_respiratory_distress.rs) | 对异常呼吸模式发出警报 | S (<5ms) |
| 步态分析 | [`med_gait_analysis.rs`](rust-port/wifi-densepose-rs/crates/wifi-densepose-wasm-edge/src/med_gait_analysis.rs) | 跟踪步行模式并检测变化 | S (<5ms) |
| 癫痫检测 | [`med_seizure_detect.rs`](rust-port/wifi-densepose-rs/crates/wifi-densepose-wasm-edge/src/med_seizure_detect.rs) | 用于强直-阵挛发作识别的 6 状态机 | S (<5ms) |

**🔐 安全与安保**（类别 2）— 周界和威胁检测

| 模块 | 文件 | 功能 | 预算 |
|--------|------|-------------|--------|
| 周界入侵 | [`sec_perimeter_breach.rs`](rust-port/wifi-densepose-rs/crates/wifi-densepose-wasm-edge/src/sec_perimeter_breach.rs) | 检测边界穿越，带接近/离开判断 | S (<5ms) |
| 武器检测 | [`sec_weapon_detect.rs`](rust-port/wifi-densepose-rs/crates/wifi-densepose-wasm-edge/src/sec_weapon_detect.rs) | 通过 CSI 幅度偏移检测金属异常 | S (<5ms) |
| 尾随 | [`sec_tailgating.rs`](rust-port/wifi-densepose-rs/crates/wifi-densepose-wasm-edge/src/sec_tailgating.rs) | 检测入口点的非法跟随 | S (<5ms) |
| 逗留 | [`sec_loitering.rs`](rust-port/wifi-densepose-rs/crates/wifi-densepose-wasm-edge/src/sec_loitering.rs) | 当某人在一个区域逗留过长时间时发出警报 | S (<5ms) |
| 恐慌运动 | [`sec_panic_motion.rs`](rust-port/wifi-densepose-rs/crates/wifi-densepose-wasm-edge/src/sec_panic_motion.rs) | 检测逃离、挣扎或恐慌性运动 | S (<5ms) |

**🏢 智能建筑**（类别 3）— 自动化和能源效率

| 模块 | 文件 | 功能 | 预算 |
|--------|------|-------------|--------|
| HVAC 存在 | [`bld_hvac_presence.rs`](rust-port/wifi-densepose-rs/crates/wifi-densepose-wasm-edge/src/bld_hvac_presence.rs) | 基于占用的 HVAC 控制，带离开倒计时 | S (<5ms) |
| 照明区域 | [`bld_lighting_zones.rs`](rust-port/wifi-densepose-rs/crates/wifi-densepose-wasm-edge/src/bld_lighting_zones.rs) | 基于区域活动自动调暗/关闭照明 | S (<5ms) |
| 电梯计数 | [`bld_elevator_count.rs`](rust-port/wifi-densepose-rs/crates/wifi-densepose-wasm-edge/src/bld_elevator_count.rs) | 统计进出人数，带超载警告 | S (<5ms) |
| 会议室 | [`bld_meeting_room.rs`](rust-port/wifi-densepose-rs/crates/wifi-densepose-wasm-edge/src/bld_meeting_room.rs) | 跟踪会议生命周期：开始、人数、结束、可用性 | S (<5ms) |
| 能源审计 | [`bld_energy_audit.rs`](rust-port/wifi-densepose-rs/crates/wifi-densepose-wasm-edge/src/bld_energy_audit.rs) | 跟踪非工作时间使用情况和房间利用率 | S (<5ms) |

**🛒 零售与款待**（类别 4）— 无摄像头的顾客洞察

| 模块 | 文件 | 功能 | 预算 |
|--------|------|-------------|--------|
| 队列长度 | [`ret_queue_length.rs`](rust-port/wifi-densepose-rs/crates/wifi-densepose-wasm-edge/src/ret_queue_length.rs) | 估计队列大小和等待时间 | S (<5ms) |
| 停留热图 | [`ret_dwell_heatmap.rs`](rust-port/wifi-densepose-rs/crates/wifi-densepose-wasm-edge/src/ret_dwell_heatmap.rs) | 显示人们在哪里花费时间（热/冷区域） | S (<5ms) |
| 顾客流 | [`ret_customer_flow.rs`](rust-port/wifi-densepose-rs/crates/wifi-densepose-wasm-edge/src/ret_customer_flow.rs) | 统计进出人数并跟踪净占用 | S (<5ms) |
| 餐桌周转 | [`ret_table_turnover.rs`](rust-port/wifi-densepose-rs/crates/wifi-densepose-wasm-edge/src/ret_table_turnover.rs) | 餐厅餐桌生命周期：入座、用餐、离开 | S (<5ms) |
| 货架互动 | [`ret_shelf_engagement.rs`](rust-port/wifi-densepose-rs/crates/wifi-densepose-wasm-edge/src/ret_shelf_engagement.rs) | 检测浏览、考虑和伸手取产品 | S (<5ms) |

**🏭 工业与专业**（类别 5）— 安全与合规

| 模块 | 文件 | 功能 | 预算 |
|--------|------|-------------|--------|
| 叉车接近 | [`ind_forklift_proximity.rs`](rust-port/wifi-densepose-rs/crates/wifi-densepose-wasm-edge/src/ind_forklift_proximity.rs) | 当人员过于接近车辆时发出警告 | S (<5ms) |
| 密闭空间 | [`ind_confined_space.rs`](rust-port/wifi-densepose-rs/crates/wifi-densepose-wasm-edge/src/ind_confined_space.rs) | 符合 OSHA 的工人监控，带撤离警报 | S (<5ms) |
| 洁净室 | [`ind_clean_room.rs`](rust-port/wifi-densepose-rs/crates/wifi-densepose-wasm-edge/src/ind_clean_room.rs) | 占用限制和湍流运动检测 | S (<5ms) |
| 牲畜监测 | [`ind_livestock_monitor.rs`](rust-port/wifi-densepose-rs/crates/wifi-densepose-wasm-edge/src/ind_livestock_monitor.rs) | 动物存在、静止和逃跑警报 | S (<5ms) |
| 结构振动 | [`ind_structural_vibration.rs`](rust-port/wifi-densepose-rs/crates/wifi-densepose-wasm-edge/src/ind_structural_vibration.rs) | 地震事件、机械共振、结构漂移 | S (<5ms) |

**🔮 奇异与研究**（类别 6）— 实验性传感应用

| 模块 | 文件 | 功能 | 预算 |
|--------|------|-------------|--------|
| 梦境阶段 | [`exo_dream_stage.rs`](rust-port/wifi-densepose-rs/crates/wifi-densepose-wasm-edge/src/exo_dream_stage.rs) | 非接触式睡眠阶段分类（清醒/浅睡/深睡/REM） | S (<5ms) |
| 情绪检测 | [`exo_emotion_detect.rs`](rust-port/wifi-densepose-rs/crates/wifi-densepose-wasm-edge/src/exo_emotion_detect.rs) | 从微运动中检测唤醒、压力和平静 | S (<5ms) |
| 手势语言 | [`exo_gesture_language.rs`](rust-port/wifi-densepose-rs/crates/wifi-densepose-wasm-edge/src/exo_gesture_language.rs) | 通过 WiFi 识别手语字母 | S (<5ms) |
| 音乐指挥 | [`exo_music_conductor.rs`](rust-port/wifi-densepose-rs/crates/wifi-densepose-wasm-edge/src/exo_music_conductor.rs) | 从指挥手势中跟踪节奏和动态 | S (<5ms) |
| 植物生长 | [`exo_plant_growth.rs`](rust-port/wifi-densepose-rs/crates/wifi-densepose-wasm-edge/src/exo_plant_growth.rs) | 监测植物生长、昼夜节律、枯萎检测 | S (<5ms) |
| 幽灵猎人 | [`exo_ghost_hunter.rs`](rust-port/wifi-densepose-rs/crates/wifi-densepose-wasm-edge/src/exo_ghost_hunter.rs) | 环境异常分类（气流/昆虫/风/未知） | S (<5ms) |
| 雨水检测 | [`exo_rain_detect.rs`](rust-port/wifi-densepose-rs/crates/wifi-densepose-wasm-edge/src/exo_rain_detect.rs) | 通过信号散射检测降雨开始、强度和停止 | S (<5ms) |
| 呼吸同步 | [`exo_breathing_sync.rs`](rust-port/wifi-densepose-rs/crates/wifi-densepose-wasm-edge/src/exo_breathing_sync.rs) | 检测多人之间的同步呼吸 | S (<5ms) |

</details>

---

<details>
<summary><strong>🧠 自学习 WiFi AI（ADR-024）</strong> — 自适应识别、自优化和智能异常检测</summary>

每个穿过房间的 WiFi 信号都会创建该空间的独特指纹。WiFi-DensePose 已经读取这些指纹来跟踪人员，但直到现在，它还在每次读取后丢弃内部的“理解”。自学习 WiFi AI 捕获并将这种理解保存为紧凑、可重用的向量 — 并持续为每个新环境进行自我优化。

**简单来说它能做什么：**
- 将任何 WiFi 信号转换为一个 128 个数字的“指纹”，唯一描述房间内发生的情况
- 完全从原始 WiFi 数据中自主学习 — 无需摄像头、无需标记、无需人工监督
- 仅使用 WiFi 识别房间、检测入侵者、识别人员、分类活动
- 在 8 美元的 ESP32 芯片上运行（整个模型适合 55 KB 内存）
- 在单次计算中同时输出身体姿态跟踪和环境指纹

**关键能力**

| 功能 | 工作原理 | 重要性 |
|------|-------------|----------------|
| **自监督学习** | 模型观察 WiFi 信号并自学“相似”和“不同”的样子，无需任何人工标记数据 | 随处部署 — 只需插入 WiFi 传感器并等待 10 分钟 |
| **房间识别** | 每个房间产生不同的 WiFi 指纹模式 | 无需 GPS 或信标即可知道某人在哪个房间 |
| **异常检测** | 意外的人或事件产生与之前见过的任何模式都不匹配的指纹 | 自动入侵和跌倒检测作为免费副产品 |
| **人员重识别** | 每个人以略微不同的方式扰动 WiFi，形成个人签名 | 无需摄像头即可跨会话跟踪个人 |
| **环境适应** | MicroLoRA 适配器（每个房间 1,792 个参数）为每个新空间微调模型 | 以最少的数据适应新房间 — 比从头重新训练少 93% |
| **记忆保存** | EWC++ 正则化记住预训练期间学到的内容 | 切换到新任务不会抹去先前的知识 |
| **困难负样本挖掘** | 训练聚焦于最令人困惑的示例以更快学习 | 使用相同数量的训练数据获得更高的准确率 |

**架构**

```
WiFi 信号 [56 通道] → Transformer + 图神经网络
                                  ├→ 128 维环境指纹（用于搜索 + 识别）
                                  └→ 17 关节身体姿态（用于人员跟踪）
```

**快速开始**

```bash
# 步骤 1：从原始 WiFi 数据学习（无需标签）
cargo run -p wifi-densepose-sensing-server -- --pretrain --dataset data/csi/ --pretrain-epochs 50

# 步骤 2：使用姿态标签进行微调以获得完整能力
cargo run -p wifi-densepose-sensing-server -- --train --dataset data/mmfi/ --epochs 100 --save-rvf model.rvf

# 步骤 3：使用模型 — 从实时 WiFi 提取指纹
cargo run -p wifi-densepose-sensing-server -- --model model.rvf --embed

# 步骤 4：搜索 — 查找相似环境或检测异常
cargo run -p wifi-densepose-sensing-server -- --model model.rvf --build-index env
```

**训练模式**

| 模式 | 你需要什么 | 你得到什么 |
|------|--------------|-------------|
| 自监督 | 仅原始 WiFi 数据 | 理解 WiFi 信号结构的模型 |
| 监督 | WiFi 数据 + 身体姿态标签 | 完整的姿态跟踪 + 环境指纹 |
| 跨模态 | WiFi 数据 + 摄像头画面 | 与视觉理解对齐的指纹 |

**指纹索引类型**

| 索引 | 存储内容 | 实际应用 |
|-------|---------------|----------------|
| `env_fingerprint` | 平均房间指纹 | “这是厨房还是卧室？” |
| `activity_pattern` | 活动边界 | “有人在做饭、睡觉还是锻炼？” |
| `temporal_baseline` | 正常条件 | “这个房间里刚刚发生了不寻常的事” |
| `person_track` | 个人移动特征 | “A 人刚刚进入客厅” |

**模型大小**

| 组件 | 参数 | 内存（在 ESP32 上） |
|-----------|-----------|-------------------|
| Transformer 骨干 | ~28,000 | 28 KB |
| 嵌入投影头 | ~25,000 | 25 KB |
| 每房间 MicroLoRA 适配器 | ~1,800 | 2 KB |
| **总计** | **~55,000** | **55 KB**（可用 520 KB 中） |

自学习系统建立在 [AI 骨干（RuVector）](#ai-骨干-ruvector) 信号处理层之上 — 注意力、图算法和压缩 — 并在其之上添加对比学习。

参见 [`docs/adr/ADR-024-contrastive-csi-embedding-model.md`](docs/adr/ADR-024-contrastive-csi-embedding-model.md) 了解完整的架构细节。

</details>

---

## 📦 安装

<details>
<summary><strong>引导安装程序</strong> — 交互式硬件检测和配置文件选择</summary>

```bash
./install.sh
```

安装程序逐步执行 7 个步骤：系统检测、工具链检查、WiFi 硬件扫描、配置文件推荐、依赖项安装、构建和验证。

| 配置文件 | 安装内容 | 大小 | 要求 |
|---------|-----------------|------|-------------|
| `verify` | 仅流水线验证 | ~5 MB | Python 3.8+ |
| `python` | 完整 Python API 服务器 + 感知 | ~500 MB | Python 3.8+ |
| `rust` | Rust 流水线（~810 倍更快） | ~200 MB | Rust 1.70+ |
| `browser` | 用于浏览器内执行的 WASM | ~10 MB | Rust + wasm-pack |
| `iot` | ESP32 传感器网状网络 + 聚合器 | 视情况而定 | Rust + ESP-IDF |
| `docker` | 基于 Docker 的部署 | ~1 GB | Docker |
| `field` | WiFi-Mat 灾难响应工具包 | ~62 MB | Rust + wasm-pack |
| `full` | 所有可用内容 | ~2 GB | 所有工具链 |

```bash
# 非交互式
./install.sh --profile rust --yes

# 仅硬件检查
./install.sh --check-only
```

</details>

<details>
<summary><strong>从源代码</strong> — Rust（主要）或 Python</summary>

```bash
git clone https://github.com/ruvnet/RuView.git
cd RuView

# Rust（主要 — 810 倍更快）
cd rust-port/wifi-densepose-rs
cargo build --release
cargo test --workspace

# Python（旧版 v1）
pip install -r requirements.txt
pip install -e .

# 或通过 pip
pip install wifi-densepose
pip install wifi-densepose[gpu]   # GPU 加速
pip install wifi-densepose[all]   # 所有可选依赖
```

</details>

<details>
<summary><strong>Docker</strong> — 预构建镜像，无需工具链</summary>

```bash
# Rust 感知服务器（132 MB — 推荐）
docker pull ruvnet/wifi-densepose:latest
docker run -p 3000:3000 -p 3001:3001 -p 5005:5005/udp ruvnet/wifi-densepose:latest

# Python 感知流水线（569 MB）
docker pull ruvnet/wifi-densepose:python
docker run -p 8765:8765 -p 8080:8080 ruvnet/wifi-densepose:python

# 通过 docker-compose 同时运行两者
cd docker && docker compose up

# 导出 RVF 模型
docker run --rm -v $(pwd):/out ruvnet/wifi-densepose:latest --export-rvf /out/model.rvf
```

| 镜像 | 标签 | 平台 | 端口 |
|-------|-----|-----------|-------|
| `ruvnet/wifi-densepose` | `latest`、`rust` | linux/amd64、linux/arm64 | 3000（REST）、3001（WS）、5005/udp（ESP32） |
| `ruvnet/wifi-densepose` | `python` | linux/amd64 | 8765（WS）、8080（UI） |

</details>

<details>
<summary><strong>系统要求</strong></summary>

- **Rust**：1.70+（主要运行时 — 通过 [rustup](https://rustup.rs/) 安装）
- **Python**：3.8+（用于验证和旧版 v1 API）
- **操作系统**：Linux（Ubuntu 18.04+）、macOS（10.15+）、Windows 10+
- **内存**：最低 4GB RAM，推荐 8GB+
- **存储**：模型和数据需要 2GB 可用空间
- **网络**：具有 CSI 能力的 WiFi 接口（可选 — 安装程序会检测你有什么）
- **GPU**：可选（NVIDIA CUDA 或 Apple Metal）

</details>

<details>
<summary><strong>Rust Crates</strong> — crates.io 上的各个 crate</summary>

Rust 工作区由 15 个 crate 组成，全部发布到 [crates.io](https://crates.io/)：

```bash
# 将各个 crate 添加到你的 Cargo.toml
cargo add wifi-densepose-core       # 类型、特征、错误
cargo add wifi-densepose-signal     # CSI 信号处理（6 个 SOTA 算法）
cargo add wifi-densepose-nn         # 神经推理（ONNX、PyTorch、Candle）
cargo add wifi-densepose-vitals     # 生命体征提取（呼吸 + 心率）
cargo add wifi-densepose-mat        # 灾难响应（MAT 幸存者检测）
cargo add wifi-densepose-hardware   # ESP32、Intel 5300、Atheros 传感器
cargo add wifi-densepose-train      # 训练流水线（MM-Fi 数据集）
cargo add wifi-densepose-wifiscan   # 多 BSSID WiFi 扫描
cargo add wifi-densepose-ruvector   # RuVector v2.0.4 集成层（ADR-017）
```

| Crate | 描述 | RuVector | crates.io |
|-------|-------------|----------|-----------|
| [`wifi-densepose-core`](https://crates.io/crates/wifi-densepose-core) | 基础类型、特征和工具 | -- | [![crates.io](https://img.shields.io/crates/v/wifi-densepose-core.svg)](https://crates.io/crates/wifi-densepose-core) |
| [`wifi-densepose-signal`](https://crates.io/crates/wifi-densepose-signal) | SOTA CSI 信号处理（SpotFi、FarSense、Widar 3.0） | `mincut`、`attn-mincut`、`attention`、`solver` | [![crates.io](https://img.shields.io/crates/v/wifi-densepose-signal.svg)](https://crates.io/crates/wifi-densepose-signal) |
| [`wifi-densepose-nn`](https://crates.io/crates/wifi-densepose-nn) | 多后端推理（ONNX、PyTorch、Candle） | -- | [![crates.io](https://img.shields.io/crates/v/wifi-densepose-nn.svg)](https://crates.io/crates/wifi-densepose-nn) |
| [`wifi-densepose-train`](https://crates.io/crates/wifi-densepose-train) | 使用 MM-Fi 数据集的训练流水线（NeurIPS 2023） | **全部 5 个** | [![crates.io](https://img.shields.io/crates/v/wifi-densepose-train.svg)](https://crates.io/crates/wifi-densepose-train) |
| [`wifi-densepose-mat`](https://crates.io/crates/wifi-densepose-mat) | 大规模伤亡评估工具（灾难幸存者检测） | `solver`、`temporal-tensor` | [![crates.io](https://img.shields.io/crates/v/wifi-densepose-mat.svg)](https://crates.io/crates/wifi-densepose-mat) |
| [`wifi-densepose-ruvector`](https://crates.io/crates/wifi-densepose-ruvector) | RuVector v2.0.4 集成层 — 7 个信号+MAT 集成点（ADR-017） | **全部 5 个** | [![crates.io](https://img.shields.io/crates/v/wifi-densepose-ruvector.svg)](https://crates.io/crates/wifi-densepose-ruvector) |
| [`wifi-densepose-vitals`](https://crates.io/crates/wifi-densepose-vitals) | 生命体征：呼吸（6-30 BPM）、心率（40-120 BPM） | -- | [![crates.io](https://img.shields.io/crates/v/wifi-densepose-vitals.svg)](https://crates.io/crates/wifi-densepose-vitals) |
| [`wifi-densepose-hardware`](https://crates.io/crates/wifi-densepose-hardware) | ESP32、Intel 5300、Atheros CSI 传感器接口 | -- | [![crates.io](https://img.shields.io/crates/v/wifi-densepose-hardware.svg)](https://crates.io/crates/wifi-densepose-hardware) |
| [`wifi-densepose-wifiscan`](https://crates.io/crates/wifi-densepose-wifiscan) | 多 BSSID WiFi 扫描（Windows、macOS、Linux） | -- | [![crates.io](https://img.shields.io/crates/v/wifi-densepose-wifiscan.svg)](https://crates.io/crates/wifi-densepose-wifiscan) |
| [`wifi-densepose-wasm`](https://crates.io/crates/wifi-densepose-wasm) | 用于浏览器部署的 WebAssembly 绑定 | -- | [![crates.io](https://img.shields.io/crates/v/wifi-densepose-wasm.svg)](https://crates.io/crates/wifi-densepose-wasm) |
| [`wifi-densepose-sensing-server`](https://crates.io/crates/wifi-densepose-sensing-server) | Axum 服务器：UDP 接收、WebSocket 广播 | -- | [![crates.io](https://img.shields.io/crates/v/wifi-densepose-sensing-server.svg)](https://crates.io/crates/wifi-densepose-sensing-server) |
| [`wifi-densepose-cli`](https://crates.io/crates/wifi-densepose-cli) | 用于 MAT 灾难扫描的命令行工具 | -- | [![crates.io](https://img.shields.io/crates/v/wifi-densepose-cli.svg)](https://crates.io/crates/wifi-densepose-cli) |
| [`wifi-densepose-api`](https://crates.io/crates/wifi-densepose-api) | REST + WebSocket API 层 | -- | [![crates.io](https://img.shields.io/crates/v/wifi-densepose-api.svg)](https://crates.io/crates/wifi-densepose-api) |
| [`wifi-densepose-config`](https://crates.io/crates/wifi-densepose-config) | 配置管理 | -- | [![crates.io](https://img.shields.io/crates/v/wifi-densepose-config.svg)](https://crates.io/crates/wifi-densepose-config) |
| [`wifi-densepose-db`](https://crates.io/crates/wifi-densepose-db) | 数据库持久化（PostgreSQL、SQLite、Redis） | -- | [![crates.io](https://img.shields.io/crates/v/wifi-densepose-db.svg)](https://crates.io/crates/wifi-densepose-db) |
| `wifi-densepose-pointcloud` | 来自摄像头 + WiFi CSI 融合的实时密集点云（Three.js 查看器、大脑桥接）。目前仅限工作区。 | -- | — |
| `wifi-densepose-geo` | 地理空间上下文（Sentinel-2 瓦片、SRTM 高程、OSM、天气、夜间模式）。目前仅限工作区。 | -- | — |

所有 crate 都与 [RuVector v2.0.4](https://github.com/ruvnet/ruvector) 集成 — 请参见下面的 [AI 骨干](#ai-骨干-ruvector)。

**[rUv Neural](rust-port/wifi-densepose-rs/crates/ruv-neural/)** — 一个独立的 12-crate 工作区，用于大脑网络拓扑分析、神经解码和医疗传感。请参见 [模型与训练](#ruv-neural) 中的 rUv Neural。

</details>

---

## 🚀 快速开始

<details open>
<summary><strong>3 条命令完成第一次 API 调用</strong></summary>

### 1. 安装

```bash
# 最快路径 — Docker
docker pull ruvnet/wifi-densepose:latest
docker run -p 3000:3000 ruvnet/wifi-densepose:latest

# 或从源代码（Rust）
./install.sh --profile rust --yes
```

### 2. 启动系统

```python
from wifi_densepose import WiFiDensePose

system = WiFiDensePose()
system.start()
poses = system.get_latest_poses()
print(f"检测到 {len(poses)} 人")
system.stop()
```

### 3. REST API

```bash
# 健康检查
curl http://localhost:3000/health

# 最新感知帧
curl http://localhost:3000/api/v1/sensing/latest

# 生命体征
curl http://localhost:3000/api/v1/vital-signs

# 姿态估计
curl http://localhost:3000/api/v1/pose/current

# 服务器信息
curl http://localhost:3000/api/v1/info
```

### 4. 实时 WebSocket

```python
import asyncio, websockets, json

async def stream():
    async with websockets.connect("ws://localhost:3001/ws/sensing") as ws:
        async for msg in ws:
            data = json.loads(msg)
            print(f"人数: {len(data.get('persons', []))}")

asyncio.run(stream())
```

</details>

---

## 📋 目录

<details open>
<summary><strong>📡 信号处理与感知</strong> — 从原始 WiFi 帧到生命体征</summary>

信号处理堆栈将原始 WiFi 信道状态信息转换为可操作的人体感知数据。从以 20 Hz 捕获的 56-192 个子载波复数值开始，流水线应用研究级算法（SpotFi 相位校正、Hampel 异常值剔除、菲涅尔区建模）来提取呼吸频率、心率、运动水平和多人身体姿态 — 全部在纯 Rust 中实现，零外部 ML 依赖。

| 章节 | 描述 | 文档 |
|---------|-------------|------|
| [主要特性](#主要特性) | 感知、智能、性能与部署能力 | — |
| [工作原理](#工作原理) | 端到端流水线：无线电波 → CSI 捕获 → 信号处理 → AI → 姿态 + 生命体征 | — |
| [ESP32-S3 硬件流水线](#esp32-s3-硬件流水线) | 20 Hz CSI 流式传输、二进制帧解析、烧录与配置 | [ADR-018](docs/adr/ADR-018-esp32-dev-implementation.md) · [教程 #34](https://github.com/ruvnet/RuView/issues/34) |
| [生命体征检测](#生命体征检测) | 呼吸 6-30 BPM、心跳 40-120 BPM、FFT 峰值检测 | [ADR-021](docs/adr/ADR-021-vital-sign-detection-rvdna-pipeline.md) |
| [WiFi 扫描领域层](#wifi-扫描领域层) | 8 阶段 RSSI 流水线、多 BSSID 指纹识别、Windows WiFi | [ADR-022](docs/adr/ADR-022-windows-wifi-enhanced-fidelity-ruvector.md) · [教程 #36](https://github.com/ruvnet/RuView/issues/36) |
| [WiFi-Mat 灾难响应](#wifi-mat-灾难响应) | 搜索与救援、START 分诊、通过废墟的 3D 定位 | [ADR-001](docs/adr/ADR-001-wifi-mat-disaster-detection.md) · [用户指南](docs/wifi-mat-user-guide.md) |
| [SOTA 信号处理](#sota-信号处理) | SpotFi、Hampel、菲涅尔、STFT 频谱图、子载波选择、BVP | [ADR-014](docs/adr/ADR-014-sota-signal-processing.md) |

</details>

<details>
<summary><strong>🧠 模型与训练</strong> — DensePose 流水线、RVF 容器、SONA 适应、RuVector 集成</summary>

神经流水线使用带有交叉注意力的图 Transformer 将 CSI 特征矩阵映射到 17 个 COCO 身体关键点和 DensePose UV 坐标。模型被打包为单文件 `.rvf` 容器，支持渐进加载（A 层即时、B 层预热、C 层完整）。SONA（自优化神经架构）通过微 LoRA + EWC++ 实现持续的设备上适应，而不会发生灾难性遗忘。信号处理由 5 个 [RuVector](https://github.com/ruvnet/ruvector) crate（v2.0.4）驱动，在 Rust 工作区中有 7 个集成点，此外还有 6 个用于推理和图智能的额外供应商 crate。

| 章节 | 描述 | 文档 |
|---------|-------------|------|
| [RVF 模型容器](#rvf-模型容器) | 带 Ed25519 签名的二进制打包、渐进式 3 层加载、SIMD 量化 | [ADR-023](docs/adr/ADR-023-trained-densepose-model-ruvector-pipeline.md) |
| [训练与微调](#训练与微调) | 8 阶段纯 Rust 流水线（7,832 行）、MM-Fi/Wi-Pose 预训练、6 项复合损失、SONA LoRA | [ADR-023](docs/adr/ADR-023-trained-densepose-model-ruvector-pipeline.md) |
| [RuVector Crates](#ruvector-crates) | 从 [ruvector](https://github.com/ruvnet/ruvector) 供应的 11 个 Rust crate：注意力、最小割、求解器、GNN、HNSW、时序压缩、稀疏推理 | [GitHub](https://github.com/ruvnet/ruvector) · [源代码](vendor/ruvector/) |
| [rUv Neural](#ruv-neural) | 12-crate 大脑拓扑分析生态系统：神经解码、量子传感器集成、认知状态分类、BCI 输出 | [README](rust-port/wifi-densepose-rs/crates/ruv-neural/README.md) |
| [AI 骨干（RuVector）](#ai-骨干-ruvector) | 5 项取代手动调整阈值的 AI 能力：注意力、图最小割、稀疏求解器、分层压缩 | [crates.io](https://crates.io/crates/wifi-densepose-ruvector) |
| [自学习 WiFi AI（ADR-024）](#自学习-wifi-ai-adr-024) | 对比自监督学习、房间指纹识别、异常检测、55 KB 模型 | [ADR-024](docs/adr/ADR-024-contrastive-csi-embedding-model.md) |
| [跨环境泛化（ADR-027）](docs/adr/ADR-027-cross-environment-domain-generalization.md) | 领域对抗训练、几何条件推理、硬件归一化、零样本部署 | [ADR-027](docs/adr/ADR-027-cross-environment-domain-generalization.md) |

</details>

<details>
<summary><strong>🖥️ 使用与配置</strong> — CLI 标志、API 端点、硬件设置</summary>

Rust 感知服务器是主要接口，提供全面的 CLI，包含用于数据源选择、模型加载、训练、基准测试和 RVF 导出的标志。REST API（Axum）和 WebSocket 服务器提供实时数据访问。Python v1 CLI 仍可用于旧版工作流。

| 章节 | 描述 | 文档 |
|---------|-------------|------|
| [CLI 使用](#cli-使用) | `--source`、`--train`、`--benchmark`、`--export-rvf`、`--model`、`--progressive` | — |
| [REST API 与 WebSocket](#rest-api--websocket) | 6 个 REST 端点（感知、生命体征、BSSID、SONA）、WebSocket 实时流 | — |
| [硬件支持](#硬件支持-1) | ESP32-S3（8 美元）、Intel 5300（15 美元）、Atheros AR9580（20 美元）、Windows RSSI（0 美元） | [ADR-012](docs/adr/ADR-012-esp32-csi-sensor-mesh.md) · [ADR-013](docs/adr/ADR-013-feature-level-sensing-commodity-gear.md) |

</details>

<details>
<summary><strong>⚙️ 开发与测试</strong> — 542+ 测试、CI、部署</summary>

项目维护 542+ 个纯 Rust 测试，涵盖 7 个 crate 套件，零模拟 — 每个测试都针对真实算法实现运行。无硬件模拟模式（`--source simulate`）支持在没有物理设备的情况下进行全栈测试。Docker 镜像发布在 Docker Hub 上，实现零设置部署。

| 章节 | 描述 | 文档 |
|---------|-------------|------|
| [测试](#测试) | 7 个测试套件：sensing-server（229）、signal（83）、mat（139）、wifiscan（91）、RVF（16）、vitals（18） | — |
| [部署](#部署) | Docker 镜像（132 MB Rust / 569 MB Python）、docker-compose、环境变量 | — |
| [贡献](#贡献) | Fork → 分支 → 测试 → PR 工作流、Rust 和 Python 开发设置 | — |

</details>

<details>
<summary><strong>📊 性能与基准</strong> — 实测吞吐量、延迟、资源使用</summary>

所有基准测试均在 Rust 感知服务器上使用 `cargo bench` 和内置的 `--benchmark` CLI 标志测量。Rust v2 实现比 Python v1 基线实现了 810 倍的端到端加速，运动检测达到 5,400 倍的改进。生命体征检测器在单线程基准测试中处理 11,665 帧/秒。

| 章节 | 描述 | 关键指标 |
|---------|-------------|------------|
| [性能指标](#性能指标) | 生命体征、CSI 流水线、运动检测、Docker 镜像、内存 | 11,665 fps 生命体征 · 54K fps 流水线 |
| [Rust vs Python](#python-vs-rust) | 5 个操作并排基准 | **810 倍** 完整流水线加速 |

</details>

<details>
<summary><strong>📄 元信息</strong> — 许可证、更新日志、支持</summary>

WiFi DensePose 是 MIT 许可的开源项目，由 [ruvnet](https://github.com/ruvnet) 开发。该项目自 2025 年 3 月以来一直在积极开发，已发布 3 个主要版本，带来了 Rust 移植、SOTA 信号处理、灾难响应模块和端到端训练流水线。

| 章节 | 描述 | 链接 |
|---------|-------------|------|
| [更新日志](#更新日志) | v3.0.0（AETHER AI + Docker）、v2.0.0（Rust 移植 + SOTA + WiFi-Mat） | [CHANGELOG.md](CHANGELOG.md) |
| [许可证](#许可证) | MIT 许可证 | [LICENSE](LICENSE) |
| [支持](#支持) | Bug 报告、功能请求、社区讨论 | [Issues](https://github.com/ruvnet/RuView/issues) · [Discussions](https://github.com/ruvnet/RuView/discussions) |

</details>

---

<details>
<summary><strong>🌍 跨环境泛化（ADR-027 — 项目 MERIDIAN）</strong> — 训练一次，部署到任何房间，无需重新训练</summary>

| 功能 | 工作原理 | 重要性 |
|------|-------------|----------------|
| **梯度反转层** | 一个对抗性分类器试图猜测信号来自哪个房间；主网络被训练来欺骗它 | 强制模型丢弃特定于房间的捷径 |
| **几何编码器（FiLM）** | 发射器/接收器位置通过傅里叶编码并作为缩放+偏移条件注入每一层 | 模型知道硬件*在哪里*，因此不需要记忆布局 |
| **硬件归一化器** | 将任何芯片组的 CSI 重采样为标准 56 子载波格式，幅度标准化 | Intel 5300 和 ESP32 数据对模型来说看起来相同 |
| **虚拟领域增强** | 生成具有随机房间尺度、墙壁反射、散射体和噪声分布的合成环境 | 即使只有 2-3 个房间的数据，训练也能看到数千个房间 |
| **快速适应（TTT）** | 使用来自少量未标记帧的 LoRA 权重生成进行对比测试时训练 | 零样本部署 — 模型到达时自我调整 |
| **跨领域评估器** | 在所有训练环境中进行留一评估，并给出每个环境的 PCK/OKS 指标 | 证明泛化能力，而不仅仅是记忆 |

**架构**

```
CSI 帧 [任何芯片组]
    │
    ▼
硬件归一化器 ──→ 标准 56 子载波，N(0,1) 幅度
    │
    ▼
CSI 编码器（现有）──→ 潜在特征
    │
    ├──→ 姿态头 ──→ 17 关节姿态（环境不变）
    │
    ├──→ 梯度反转层 ──→ 领域分类器（对抗性）
    │         λ 通过余弦/指数调度从 0 上升到 1
    │
    └──→ 几何编码器 ──→ FiLM 条件（缩放 + 偏移）
              傅里叶位置编码 → DeepSets → 每层调制
```

**安全加固：**
- 有界校准缓冲区（最多 10,000 帧）防止内存耗尽
- `adapt()` 返回 `Result<_, AdaptError>` — 对错误输入不会 panic
- 原子实例计数器确保线程间唯一的权重初始化
- 所有增强参数都有除零保护

参见 [`docs/adr/ADR-027-cross-environment-domain-generalization.md`](docs/adr/ADR-027-cross-environment-domain-generalization.md) 了解完整的架构细节。

</details>

<details>
<summary><strong>🔍 独立能力审计（ADR-028）</strong> — 1,031 个测试、SHA-256 证明、自验证见证包</summary>

一个[3 代理并行审计](docs/adr/ADR-028-esp32-capability-audit.md)独立验证了此仓库中的每项声明 — ESP32 硬件、信号处理、神经网络、训练流水线、部署和安全。结果：

```
Rust 测试：     1,031 通过，0 失败
Python 证明：   判决：通过（SHA-256：8c0680d7...）
包验证：       7/7 检查通过
```

**33 行证明矩阵：** 31 项能力验证为是，2 项在审计时未测量（基准吞吐量、Kubernetes 部署）。

**自己验证**（无需硬件）：
```bash
# 运行所有测试
cd rust-port/wifi-densepose-rs && cargo test --workspace --no-default-features

# 运行确定性证明
python v1/data/proof/verify.py

# 生成并验证见证包
bash scripts/generate-witness-bundle.sh
cd dist/witness-bundle-ADR028-*/ && bash VERIFY.sh
```

| 文档 | 内容 |
|----------|-----------------|
| [ADR-028](docs/adr/ADR-028-esp32-capability-audit.md) | 完整审计：ESP32 规格、信号算法、NN 架构、训练阶段、部署基础设施 |
| [见证日志](docs/WITNESS-LOG-028.md) | 11 个可重现的验证步骤 + 33 行证明矩阵，每行附带证据 |
| [`generate-witness-bundle.sh`](scripts/generate-witness-bundle.sh) | 创建包含测试日志、证明输出、固件哈希、crate 版本、VERIFY.sh 的自包含 tar.gz |

</details>

<details>
<summary><strong>📡 多基地感知（ADR-029/030/031 — 项目 RuvSense + RuView）</strong> — 多个 ESP32 节点融合视角，实现生产级姿态、跟踪和奇异感知</summary>

单个 WiFi 接收器可以跟踪人员，但有盲点 — 躯干后面的肢体不可见，深度模糊，并且距离相近的两个人会产生重叠信号。RuvSense 通过协调多个 ESP32 节点组成**多基地网状网络**来解决此问题，其中每个节点既作为发射器又作为接收器，从 N 个设备创建 N×(N-1) 条测量链路。

**简单来说它能做什么：**
- 4 个 ESP32-S3 节点（总计 48 美元）提供 12 条 TX-RX 测量链路，覆盖 360 度
- 每个节点在 WiFi 信道 1/6/11 上跳频，将有效带宽从 20 倍增至 60 MHz
- 相干门自动拒绝噪声帧 — 无需手动调整，稳定运行数天
- 以 20 Hz 跟踪两人，10 分钟内零身份交换
- 房间本身成为一个持久模型 — 系统记住、预测和解释

**三个 ADR，一条流水线：**

| ADR | 代号 | 新增功能 |
|-----|----------|-------------|
| [ADR-029](docs/adr/ADR-029-ruvsense-multistatic-sensing-mode.md) | **RuvSense** | 跳频、TDM 协议、多节点融合、相干门、17 关键点卡尔曼跟踪器 |
| [ADR-030](docs/adr/ADR-030-ruvsense-persistent-field-model.md) | **RuvSense 场** | 房间电磁本征结构（SVD）、射频断层扫描、纵向漂移检测、意图预测、手势识别、对抗检测 |
| [ADR-031](docs/adr/ADR-031-ruview-sensing-first-rf-mode.md) | **RuView** | 带几何偏差的跨视角注意力、视角多样性优化、嵌入级融合 |

**架构**

```
4x ESP32-S3 节点（48 美元）     TDM：每个依次发射，所有其他接收
        │                    跳频：每个 dwell（50ms） ch1→ch6→ch11
        ▼
每节点信号处理           相位清理 → Hampel → BVP → 子载波选择
        │                （ADR-014，每个视角不变）
        ▼
多频段帧融合             3 个信道 × 56 个子载波 = 168 个虚拟子载波
        │                通过 NeumannSolver 进行跨信道相位对齐
        ▼
多基地视角融合           N 个节点 → 注意力加权融合 → 单个嵌入
        │                来自节点放置角度的几何偏差
        ▼
相干门                 接受 / 仅预测 / 拒绝 / 重新校准
        │                防止模型漂移，稳定运行数天
        ▼
持久场模型             SVD 基线 → 身体 = 观测 - 环境
        │                射频断层扫描、漂移检测、意图信号
        ▼
姿态跟踪器 + DensePose   17 关键点卡尔曼，通过 AETHER 嵌入进行重识别
                        多人最小割分离，零身份交换
```

**七个奇异感知层级（ADR-030）**

| 层级 | 能力 | 检测内容 |
|------|-----------|-----------------|
| 1 | 场正常模式 | 通过 SVD 的房间电磁本征结构 |
| 2 | 粗射频断层扫描 | 来自链路衰减的 3D 占用体积 |
| 3 | 意图引导信号 | 动作前 200-500ms 的预运动预测 |
| 4 | 纵向生物力学 | 数天/数周内的个人运动变化 |
| 5 | 跨房间连续性 | 无需摄像头即可跨房间保留身份 |
| 6 | 无形交互 | 穿墙的多用户手势控制 |
| 7 | 对抗检测 | 识别物理上不可能的信号 |

**验收测试**

| 指标 | 阈值 | 证明内容 |
|--------|-----------|---------------|
| 躯干关键点抖动 | < 30mm RMS | 精度足以满足应用需求 |
| 身份交换 | 10 分钟（12,000 帧）内 0 次 | 可靠的多人跟踪 |
| 更新率 | 20 Hz（50ms 周期） | 实时响应 |
| 呼吸信噪比 | 3 米处 > 10 dB | 确认小运动灵敏度 |

**新的 Rust 模块（9,000+ 行）**

| Crate | 新模块 | 用途 |
|-------|------------|---------|
| `wifi-densepose-signal` | `ruvsense/`（10 个模块） | 多频段融合、相位对齐、多基地融合、相干性、场模型、断层扫描、纵向漂移、意图检测 |
| `wifi-densepose-ruvector` | `viewpoint/`（5 个模块） | 带几何偏差的跨视角注意力、多样性指数、相干门控、融合编排器 |
| `wifi-densepose-hardware` | `esp32/tdm.rs` | TDM 传感协议、同步信标、时钟漂移补偿 |

**固件扩展（C，向后兼容）**

| 文件 | 新增内容 |
|------|---------|
| `csi_collector.c` | 跳频表、定时器驱动的跳频、NDP 注入存根 |
| `nvs_config.c` | 5 个新的 NVS 键：hop_count、channel_list、dwell_ms、tdm_slot、tdm_node_count |

**DDD 领域模型** — 6 个有界上下文：多基地感知、相干性、姿态跟踪、场模型、跨房间身份、对抗检测。完整规范：[`docs/ddd/ruvsense-domain-model.md`](docs/ddd/ruvsense-domain-model.md)。

有关完整的架构细节、GOAP 集成计划和研究参考文献，请参见 ADR 文档。

</details>

<details>
<summary><b>🔮 信号线协议（CRV）</b></summary>

### 6 阶段 CSI 信号线

通过 `ruvector-crv` 将 CRV（坐标远程查看）信号线方法映射到 WiFi CSI 处理：

| 阶段 | CRV 名称 | WiFi CSI 映射 | ruvector 组件 |
|-------|----------|-----------------|-------------------|
| I | 表意文字 | 原始 CSI 完形（人造/自然/运动/能量） | 庞加莱球双曲嵌入 |
| II | 感知 | 幅度纹理、相位模式、频率颜色 | 多头注意力向量 |
| III | 维度 | AP 网状网络空间拓扑、节点几何 | GNN 图拓扑 |
| IV | 情感/AOL | 相干门控 — 信号与噪声分离 | SNN 时序编码 |
| V | 询问 | 跨阶段探测 — 根据 CSI 历史查询姿态 | 可微搜索 |
| VI | 3D 模型 | 复合人员估计、MinCut 分区 | 图分区 |

**跨会话收敛**：当多个 AP 集群观测同一个人时，CRV 收敛分析在其信号嵌入中找到一致性 — 直接映射到跨房间身份连续性。

```rust
use wifi_densepose_ruvector::crv::WifiCrvPipeline;

let mut pipeline = WifiCrvPipeline::new(WifiCrvConfig::default());
pipeline.create_session("room-a", "person-001")?;

// 通过 6 阶段流水线处理 CSI 帧
let result = pipeline.process_csi_frame("room-a", &amplitudes, &phases)?;
// result.gestalt = Movement, confidence = 0.87
// result.sensory_embedding = [0.12, -0.34, ...]

// 通过收敛进行跨房间身份匹配
let convergence = pipeline.find_cross_room_convergence("person-001", 0.75)?;
```

**架构**：
- `CsiGestaltClassifier` — 将 CSI 幅度/相位模式映射到 6 种完形类型
- `CsiSensoryEncoder` — 从子载波提取纹理/颜色/温度/亮度特征
- `MeshTopologyEncoder` — 将 AP 网状网络编码为 GNN 图（阶段 III）
- `CoherenceAolDetector` — 将相干门状态映射到 AOL 噪声检测（阶段 IV）
- `WifiCrvPipeline` — 将所有 6 个阶段编排成统一的感知会话

</details>

---

## 📡 信号处理与感知

<details>
<summary><a id="esp32-s3-硬件流水线"></a><strong>📡 ESP32-S3 硬件流水线（ADR-018）</strong> — 28 Hz CSI 流式传输、烧录与配置</summary>

单个 ESP32-S3 板（约 9 美元）以每秒 28 次的速度捕获 WiFi 信号数据，并通过 UDP 流式传输。主机服务器可以可视化和记录数据，但 ESP32 也可以独立运行 — 无需任何服务器即可检测存在、测量呼吸和心率以及发出跌倒警报。

```
ESP32-S3 节点                    UDP/5005        主机服务器（可选）
┌───────────────────────┐      ──────────>      ┌──────────────────────┐
│ 捕获 WiFi 信号        │      二进制帧         │ 解析帧               │
│ 28 Hz，每帧最多       │      或 32 字节        │ 可视化姿态           │
│ 192 个子载波          │      生命体征包        │ 记录 CSI 数据        │
│                        │                       │ REST API + WebSocket │
│ 设备上（可选）：       │                       └──────────────────────┘
│  存在检测             │
│  呼吸 + 心率          │
│  跌倒检测             │
│  WASM 自定义模块      │
└───────────────────────┘
```

| 指标 | 硬件实测 |
|--------|----------------------|
| CSI 帧率 | 28.5 Hz（信道 5，BW20） |
| 每帧子载波数 | 64 / 128 / 192（取决于 WiFi 模式） |
| UDP 延迟 | 局域网 < 1 ms |
| 存在检测范围 | 穿墙 3 米可靠 |
| 二进制大小 | 990 KB（8MB 闪存）/ 773 KB（4MB 闪存） |
| 启动到就绪 | ~3.9 秒 |

### 烧录和配置

下载预构建二进制文件 — 无需构建工具链：

| 版本 | 包含内容 | 标签 |
|---------|-----------------|-----|
| [v0.7.0](https://github.com/ruvnet/RuView/releases/tag/v0.7.0) | **最新** — 摄像头监督的 WiFlow 模型（92.9% PCK@20）、真值训练流水线、ruvector 优化 | `v0.7.0` |
| [v0.6.0](https://github.com/ruvnet/RuView/releases/tag/v0.6.0-esp32) | [HuggingFace 上的预训练模型](https://huggingface.co/ruv/ruview)、17 个传感应用、51.6% 对比改进、0.008ms 推理 | `v0.6.0-esp32` |
| [v0.5.5](https://github.com/ruvnet/RuView/releases/tag/v0.5.5-esp32) | SNN + MinCut（修复 #348）+ CNN 频谱图 + WiFlow + 多频网状网络 + 图 Transformer | `v0.5.5-esp32` |
| [v0.5.4](https://github.com/ruvnet/RuView/releases/tag/v0.5.4-esp32) | Cognitum Seed 集成（[ADR-069](docs/adr/ADR-069-cognitum-seed-csi-pipeline.md)）、8 维特征向量、RVF 存储、见证链、安全加固 | `v0.5.4-esp32` |
| [v0.5.0](https://github.com/ruvnet/RuView/releases/tag/v0.5.0-esp32) | 毫米波传感器融合（[ADR-063](docs/adr/ADR-063-mmwave-sensor-fusion.md)）、自动检测 MR60BHA2/LD2410、48 字节融合生命体征、所有 v0.4.3.1 修复 | `v0.5.0-esp32` |
| [v0.4.3.1](https://github.com/ruvnet/RuView/releases/tag/v0.4.3.1-esp32) | 跌倒检测修复（[#263](https://github.com/ruvnet/RuView/issues/263)）、4MB 闪存（[#265](https://github.com/ruvnet/RuView/issues/265)）、看门狗修复（[#266](https://github.com/ruvnet/RuView/issues/266)） | `v0.4.3.1-esp32` |
| [v0.4.1](https://github.com/ruvnet/RuView/releases/tag/v0.4.1-esp32) | CSI 构建修复、编译守卫、AMOLED 显示屏、边缘智能（[ADR-057](docs/adr/ADR-057-firmware-csi-build-guard.md)） | `v0.4.1-esp32` |
| [v0.3.0-alpha](https://github.com/ruvnet/RuView/releases/tag/v0.3.0-alpha-esp32) | Alpha — 添加设备上边缘智能和 WASM 模块（[ADR-039](docs/adr/ADR-039-esp32-edge-intelligence.md)、[ADR-040](docs/adr/ADR-040-wasm-programmable-sensing.md)） | `v0.3.0-alpha-esp32` |
| [v0.2.0](https://github.com/ruvnet/RuView/releases/tag/v0.2.0-esp32) | 原始 CSI 流式传输、多节点 TDM、跳频 | `v0.2.0-esp32` |

```bash
# 1. 将固件烧录到 ESP32-S3（8MB 闪存 — 大多数板）
python -m esptool --chip esp32s3 --port COM7 --baud 460800 \
  write_flash --flash-mode dio --flash-size 8MB --flash-freq 80m \
  0x0 bootloader.bin 0x8000 partition-table.bin \
  0xf000 ota_data_initial.bin 0x20000 esp32-csi-node.bin

# 1b. 对于 4MB 闪存板（例如 ESP32-S3 SuperMini 4MB）— 使用 4MB 二进制文件：
python -m esptool --chip esp32s3 --port COM7 --baud 460800 \
  write_flash --flash-mode dio --flash-size 4MB --flash-freq 80m \
  0x0 bootloader.bin 0x8000 partition-table-4mb.bin \
  0xF000 ota_data_initial.bin 0x20000 esp32-csi-node-4mb.bin

# 2. 设置 WiFi 凭据和服务器地址（存储在闪存中，重启后保留）
python firmware/esp32-csi-node/provision.py --port COM7 \
  --ssid "YourWiFi" --password "secret" --target-ip 192.168.1.20

# 3. （可选）启动主机服务器以可视化数据
cargo run -p wifi-densepose-sensing-server -- --http-port 3000 --source auto
# 打开 http://localhost:3000
```

### 多节点网状网络

为了提高准确性和房间覆盖范围，部署 3-6 个节点，采用时分多址（TDM），让它们轮流发射：

```bash
# 3 节点网状网络中的节点 0
python firmware/esp32-csi-node/provision.py --port COM7 \
  --ssid "YourWiFi" --password "secret" --target-ip 192.168.1.20 \
  --node-id 0 --tdm-slot 0 --tdm-total 3

# 节点 1
python firmware/esp32-csi-node/provision.py --port COM8 \
  --ssid "YourWiFi" --password "secret" --target-ip 192.168.1.20 \
  --node-id 1 --tdm-slot 1 --tdm-total 3
```

节点还可以在 WiFi 信道（1、6、11）上跳频以增加传感带宽 — 通过 [ADR-029](docs/adr/ADR-029-ruvsense-multistatic-sensing-mode.md) 跳频进行配置。

### Cognitum Seed 集成（ADR-069）

将 ESP32 连接到 [Cognitum Seed](https://cognitum.one)（131 美元）以获得持久向量存储、kNN 搜索、加密见证链和 AI 可访问的 MCP 代理：

```
ESP32-S3（9 美元）  ──UDP──>  主机桥接  ──HTTPS──>  Cognitum Seed（15 美元）
  CSI 捕获               seed_csi_bridge.py         RVF 向量存储
  1 Hz 的 8 维特征                                  kNN 相似性搜索
  生命体征 + 存在                                   Ed25519 见证链
                                                    114 工具 MCP 代理
```

```bash
# 1. 配置 ESP32 将特征发送到你的笔记本
python firmware/esp32-csi-node/provision.py --port COM9 \
  --ssid "YourWiFi" --password "secret" --target-ip 192.168.1.20 --target-port 5006

# 2. 运行桥接（通过 HTTPS 转发到 Seed）
export SEED_TOKEN="your-pairing-token"
python scripts/seed_csi_bridge.py \
  --seed-url https://169.254.42.1:8443 --token "$SEED_TOKEN" --validate

# 3. 检查 Seed 统计信息
python scripts/seed_csi_bridge.py --token "$SEED_TOKEN" --stats
```

8 维特征向量捕获：存在、运动、呼吸频率、心率、相位方差、人员计数、跌倒检测和 RSSI — 全部归一化到 [0.0, 1.0]。有关完整架构，请参见 [ADR-069](docs/adr/ADR-069-cognitum-seed-csi-pipeline.md)。

### 设备上智能（v0.3.0-alpha）

Alpha 固件可以在本地分析信号并发送紧凑结果，而不是原始数据。这意味着 ESP32 可以独立工作 — 基本感知无需服务器。为了向后兼容，默认禁用。

| 层级 | 功能 | 使用的 RAM |
|------|-------------|----------|
| **0** | 关闭 — 仅流式传输原始 CSI（与 v0.2.0 相同） | 0 KB |
| **1** | 清理信号、选择最佳子载波、压缩数据（节省 30-50% 带宽） | ~30 KB |
| **2** | 层级 1 的所有功能 + 检测存在、测量呼吸和心率、检测跌倒 | ~33 KB |
| **3** | 层级 2 的所有功能 + 运行自定义 WASM 模块（手势识别、入侵检测等 [63 个以上](docs/edge-modules/README.md)） | ~160 KB/模块 |

无需重新烧录即可启用 — 只需重新配置：

```bash
# 在已烧录的节点上打开层级 2（生命体征）
python firmware/esp32-csi-node/provision.py --port COM7 \
  --ssid "YourWiFi" --password "secret" --target-ip 192.168.1.20 \
  --edge-tier 2

# 微调检测阈值（fall-thresh 以毫单位表示：15000 = 15.0 rad/s²）
python firmware/esp32-csi-node/provision.py --port COM7 \
  --edge-tier 2 --vital-int 500 --fall-thresh 15000 --subk-count 16
```

当层级 2 激活时，节点每秒发送一个 32 字节的生命体征包，包含：存在、运动水平、呼吸 BPM、心率 BPM、置信度分数、跌倒警报标志和占用计数。

请参见 [firmware/esp32-csi-node/README.md](firmware/esp32-csi-node/README.md)、[ADR-039](docs/adr/ADR-039-esp32-edge-intelligence.md)、[ADR-044](docs/adr/ADR-044-provisioning-tool-enhancements.md) 和 [教程 #34](https://github.com/ruvnet/RuView/issues/34)。

</details>

<details>
<summary><strong>🦀 Rust 实现（v2）</strong> — 810 倍更快，54K fps 流水线</summary>

### 性能基准（已验证）

| 操作 | Python（v1） | Rust（v2） | 加速比 |
|-----------|-------------|-----------|---------|
| CSI 预处理（4x64） | ~5ms | **5.19 µs** | ~1000x |
| 相位清理（4x64） | ~3ms | **3.84 µs** | ~780x |
| 特征提取（4x64） | ~8ms | **9.03 µs** | ~890x |
| 运动检测 | ~1ms | **186 ns** | ~5400x |
| **完整流水线** | ~15ms | **18.47 µs** | ~810x |
| **生命体征** | 不适用 | **86 µs** | 11,665 fps |

| 资源 | Python（v1） | Rust（v2） |
|----------|-------------|-----------|
| 内存 | ~500 MB | ~100 MB |
| Docker 镜像 | 569 MB | 132 MB |
| 测试 | 41 | 542+ |
| WASM 支持 | 否 | 是 |

```bash
cd rust-port/wifi-densepose-rs
cargo build --release
cargo test --workspace
cargo bench --package wifi-densepose-signal
```

</details>

<details>
<summary><a id="生命体征检测"></a><strong>💓 生命体征检测（ADR-021）</strong> — 通过 FFT 进行呼吸和心跳</summary>

| 能力 | 范围 | 方法 |
|------------|-------|------------|
| **呼吸频率** | 6-30 BPM（0.1-0.5 Hz） | 带通滤波器 + FFT 峰值检测 |
| **心率** | 40-120 BPM（0.8-2.0 Hz） | 带通滤波器 + FFT 峰值检测 |
| **采样率** | 20 Hz（ESP32 CSI） | 实时流式传输 |
| **置信度** | 每个信号 0.0-1.0 | 谱相干性 + 信号质量 |

```bash
./target/release/sensing-server --source simulate --http-port 3000 --ws-port 3001 --ui-path ../../ui
curl http://localhost:3000/api/v1/vital-signs
```

请参见 [ADR-021](docs/adr/ADR-021-vital-sign-detection-rvdna-pipeline.md)。

</details>

<details>
<summary><a id="wifi-扫描领域层"></a><strong>📡 WiFi 扫描领域层（ADR-022/025）</strong> — 适用于 Windows、macOS 和 Linux WiFi 的 8 阶段 RSSI 流水线</summary>

| 阶段 | 用途 |
|-------|---------|
| **预测门控** | 使用时序预测预过滤扫描结果 |
| **注意力加权** | 按信号相关性对 BSSID 加权 |
| **空间相关** | 跨 AP 空间信号相关 |
| **运动估计** | 从 RSSI 方差检测运动 |
| **呼吸提取** | 从亚 Hz 振荡提取呼吸频率 |
| **质量门控** | 拒绝低置信度估计 |
| **指纹匹配** | 通过射频指纹进行位置和姿态分类 |
| **编排** | 将所有阶段融合为统一的感知输出 |

```bash
cargo test -p wifi-densepose-wifiscan
```

请参见 [ADR-022](docs/adr/ADR-022-windows-wifi-enhanced-fidelity-ruvector.md) 和 [教程 #36](https://github.com/ruvnet/RuView/issues/36)。

</details>

<details>
<summary><a id="wifi-mat-灾难响应"></a><strong>🚨 WiFi-Mat：灾难响应</strong> — 搜索与救援、START 分诊、3D 定位</summary>

WiFi 信号可以穿透非金属碎片（混凝土、木材、石膏板），而摄像头和热传感器无法到达。WiFi-Mat 模块（`wifi-densepose-mat`，139 个测试）使用 CSI 分析检测被困在废墟下的幸存者，使用 START 分诊协议对其状况进行分类，并估计其 3D 位置 — 在部署后几秒钟内为救援队提供可操作的情报。

| 能力 | 工作原理 | 性能目标 |
|------------|-------------|-------------------|
| **呼吸检测** | 带通 0.07-1.0 Hz + 菲涅尔区建模检测 5 GHz 下 5-10mm 的胸部位移 | 4-60 BPM，<500ms 延迟 |
| **心跳检测** | 从细粒度 CSI 相位变化中提取微多普勒频移 | 通过 ruvector-temporal-tensor |
| **3D 定位** | 多 AP 三角测量 + CSI 指纹匹配 + 通过废墟层的深度估计 | 3-5m 穿透 |
| **START 分诊** | 集成分类器对呼吸 + 运动 + 生命体征稳定性进行投票 → P1-P4 优先级 | <1% 假阴性 |
| **区域扫描** | 16+ 个并发扫描区域，定期重新扫描和审计日志记录 | 整个灾难现场 |

**分诊分类（兼容 START 协议）：**

| 状态 | 颜色 | 检测标准 | 优先级 |
|--------|-------|-------------------|--------|
| 立即 | 红色 | 检测到呼吸，无运动 | P1 |
| 延迟 | 黄色 | 运动 + 呼吸，生命体征稳定 | P2 |
| 轻微 | 绿色 | 强烈运动，有反应模式 | P3 |
| 死亡 | 黑色 | 连续扫描 >30 分钟无生命体征 | P4 |

**部署模式：** 便携式（单 TX/RX 手持）、分布式（坍塌点周围多个 AP）、无人机安装（UAV 扫描）、车载（移动指挥所）。

```rust
use wifi_densepose_mat::{DisasterResponse, DisasterConfig, DisasterType, ScanZone, ZoneBounds};

let config = DisasterConfig::builder()
    .disaster_type(DisasterType::Earthquake)
    .sensitivity(0.85)
    .max_depth(5.0)
    .build();

let mut response = DisasterResponse::new(config);
response.initialize_event(location, "Building collapse")?;
response.add_zone(ScanZone::new("North Wing", ZoneBounds::rectangle(0.0, 0.0, 30.0, 20.0)))?;
response.start_scanning().await?;
```

**安全保证：** 故障安全默认值（在模糊信号下假设生命存在）、冗余多算法投票、完整审计跟踪、离线能力（无需网络）。

- [WiFi-Mat 用户指南](docs/wifi-mat-user-guide.md) | [ADR-001](docs/adr/ADR-001-wifi-mat-disaster-detection.md) | [领域模型](docs/ddd/wifi-mat-domain-model.md)

</details>

<details>
<summary><a id="sota-信号处理"></a><strong>🔬 SOTA 信号处理（ADR-014）</strong> — 6 个研究级算法</summary>

信号处理层弥合了原始商用 WiFi 硬件输出与研究级传感精度之间的差距。每个算法都解决了朴素 CSI 处理的特定局限性 — 从硬件引起的相位损坏到环境依赖的多径干扰。所有六个算法都在 `wifi-densepose-signal/src/` 中实现，具有确定性测试且无模拟数据。

| 算法 | 功能 | 重要性 | 数学原理 | 来源 |
|-----------|-------------|----------------|------|--------|
| **共轭乘法** | 将 CSI 天线对相乘：`H₁[k] × conj(H₂[k])` | 消除损坏原始相位的 CFO、SFO 和包检测延迟 — 仅保留环境引起的相位差 | `CSI_ratio[k] = H₁[k] * conj(H₂[k])` | [SpotFi](https://dl.acm.org/doi/10.1145/2789168.2790124)（SIGCOMM 2015） |
| **Hampel 滤波器** | 使用运行中位数 ± 缩放 MAD 替换异常值 | Z 得分使用均值和标准差，这些会被其检测到的异常值破坏（掩蔽效应）。Hampel 使用中位数/MAD，抵抗高达 50% 的污染 | `σ̂ = 1.4826 × MAD` | 标准 DSP；WiGest（2015） |
| **菲涅尔区模型** | 模拟胸部位移穿过菲涅尔区边界引起的信号变化 | 零交叉计数在多径丰富的环境中失效。菲涅尔预测呼吸应*在哪里*出现，基于 TX-RX-身体几何 | `ΔΦ = 2π × 2Δd / λ`，`A = \|sin(ΔΦ/2)\|` | [FarSense](https://dl.acm.org/doi/10.1145/3300061.3345431)（MobiCom 2019） |
| **CSI 频谱图** | 每个子载波的滑动窗口 FFT（STFT）→ 2D 时频矩阵 | 呼吸 = 0.2-0.4 Hz 频带，行走 = 1-2 Hz，静态 = 噪声。2D 结构使 CNN 能够进行空间模式识别，这是 1D 特征所缺少的 | `S[t,f] = \|Σₙ x[n] w[n-t] e^{-j2πfn}\|²` | 2018 年以来标准 |
| **子载波选择** | 按运动灵敏度（方差比）对子载波排序，选择 top-K | 并非所有子载波都对运动有响应 — 有些位于多径零点。选择 10-20 个最敏感的子载波可将 SNR 提高 6-10 dB | `sensitivity[k] = var_motion / var_static` | [WiDance](https://dl.acm.org/doi/10.1145/3117811.3117826)（MobiCom 2017） |
| **身体速度剖面** | 从跨子载波的多普勒频移中提取速度分布 | BVP 是领域无关的 — 无论房间布局、家具或 AP 位置如何，速度剖面都相同。跨环境识别的基础 | `BVP[v,t] = Σₖ \|STFTₖ[v,t]\|` | [Widar 3.0](https://dl.acm.org/doi/10.1145/3328916)（MobiSys 2019） |

**处理流水线顺序：** 原始 CSI → 共轭乘法（相位清理）→ Hampel 滤波器（异常值剔除）→ 子载波选择（top-K）→ CSI 频谱图（时频）→ 菲涅尔模型（呼吸）+ BVP（活动）

有关完整的数学推导，请参见 [ADR-014](docs/adr/ADR-014-sota-signal-processing.md)。

</details>

---

## 🧠 模型与训练

<details>
<summary><a id="ai-骨干-ruvector"></a><strong>🤖 AI 骨干：RuVector</strong> — 为传感流水线提供动力的注意力、图算法和边缘 AI 压缩</summary>

原始 WiFi 信号嘈杂、冗余且依赖于环境。[RuVector](https://github.com/ruvnet/ruvector) 是 AI 智能层，将它们转换为干净、结构化的输入，供 DensePose 神经网络使用。它使用**注意力机制**学习信任哪些信号，使用**图算法**自动发现哪些 WiFi 信道对身体运动敏感，以及使用**压缩表示**使得在 8 美元微控制器上进行边缘推理成为可能。

如果没有 RuVector，WiFi DensePose 将需要手动调整的阈值、蛮力矩阵数学和 4 倍以上的内存 — 使得实时边缘推理不可能。

```
原始 WiFi CSI（56 个子载波，嘈杂）
    |
    +-- ruvector-mincut ---------- 哪些信道携带身体运动信号？（学习到的图分区）
    +-- ruvector-attn-mincut ----- 哪些时间帧是信号 vs 噪声？（注意力门控滤波）
    +-- ruvector-attention ------- 如何融合多天线数据？（学习到的加权聚合）
    |
    v
干净、结构化的信号 --> DensePose 神经网络 --> 17 关键点身体姿态
                         --> FFT 生命体征 -----------> 呼吸频率、心率
                         --> ruvector-solver ------------> 基于物理的定位
```

[`wifi-densepose-ruvector`](https://crates.io/crates/wifi-densepose-ruvector) crate（[ADR-017](docs/adr/ADR-017-ruvector-signal-mat-integration.md)）连接所有 7 个集成点：

| AI 能力 | 取代了什么 | RuVector Crate | 结果 |
|--------------|-----------------|----------------|--------|
| **自优化信道选择** | 当房间改变时会失效的手动调整阈值 | `ruvector-mincut` | 图最小割自动适应任何环境 |
| **基于注意力的信号清理** | 会错过细微呼吸的固定能量截止值 | `ruvector-attn-mincut` | 学习到的门控放大身体信号，抑制噪声 |
| **学习到的信号融合** | 一个坏信道会污染所有的简单平均 | `ruvector-attention` | Transformer 式注意力降低损坏信道的权重 |
| **基于物理的定位** | 昂贵的非线性求解器 | `ruvector-solver` | 实时菲涅尔几何的稀疏最小二乘法 |
| **O(1) 幸存者三角测量** | O(N^3) 矩阵求逆 | `ruvector-solver` | 用于即时位置更新的诺伊曼级数线性化 |
| **75% 内存压缩** | 会溢出边缘设备的 13.4 MB 呼吸缓冲区 | `ruvector-temporal-tensor` | 分层 3-8 位量化，将 60 秒的生命体征适配到 3.4 MB |

有关代码示例的深入探讨，请参见 [issue #67](https://github.com/ruvnet/RuView/issues/67)，或使用 [`cargo add wifi-densepose-ruvector`](https://crates.io/crates/wifi-densepose-ruvector) 直接使用。


# 参考资料

* any list
{:toc}