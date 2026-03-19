---
layout: post
title: Newton 是一个基于 GPU 加速的物理仿真引擎
date: 2026-03-19 21:01:55 +0800
categories: [AI]
tags: [ai]
published: true
---

# Newton

Newton 是一个基于 GPU 加速的物理仿真引擎，构建于 [NVIDIA Warp](https://github.com/NVIDIA/warp) 之上，主要面向机器人研究人员和仿真研究者。

Newton 对 Warp 的（[已弃用](https://github.com/NVIDIA/warp/discussions/735)）`warp.sim` 模块进行了扩展和泛化，并集成了 [MuJoCo Warp](https://github.com/google-deepmind/mujoco_warp) 作为其主要后端。Newton 强调基于 GPU 的计算、[OpenUSD](https://openusd.org/) 支持、可微分性（differentiability）以及用户自定义扩展能力，从而支持快速迭代和可扩展的机器人仿真。

Newton 是一个由 [Linux Foundation](https://www.linuxfoundation.org/) 托管的社区项目，由社区共同构建和维护。代码采用 [Apache-2.0](https://github.com/newton-physics/newton/blob/main/LICENSE.md) 许可，文档采用 [CC-BY-4.0](https://creativecommons.org/licenses/by/4.0/) 许可。

Newton 项目由 [Disney Research](https://www.disneyresearch.com/)、[Google DeepMind](https://deepmind.google/) 和 [NVIDIA](https://www.nvidia.com/) 发起。

---

## Requirements（环境要求）

* **Python** 3.10+
* **操作系统：** Linux（x86-64，aarch64）、Windows（x86-64）或 macOS（仅 CPU）
* **GPU：** NVIDIA GPU（Maxwell 或更新架构），驱动版本 545 或以上（CUDA 12）。无需本地安装 CUDA Toolkit。macOS 使用 CPU 运行。

关于详细系统要求和测试配置，请参阅 [安装指南](https://newton-physics.github.io/newton/latest/guide/installation.html)。

---

## Quickstart（快速开始）

```bash
pip install "newton[examples]"
python -m newton.examples basic_pendulum
```

使用 [uv](https://docs.astral.sh/uv/) 从源码安装，请参考 [安装指南](https://newton-physics.github.io/newton/latest/guide/installation.html)。

---

## Examples（示例）

在运行以下示例之前，请安装带有 examples 扩展的 Newton：

```bash
pip install "newton[examples]"
```

如果你使用 uv 从源码安装，请将下面命令中的 `python` 替换为 `uv run`。

---

### 基础示例（Basic Examples）

（保持命令不变，仅翻译说明）

```bash
python -m newton.examples basic_pendulum
python -m newton.examples basic_urdf
python -m newton.examples basic_viewer
python -m newton.examples basic_shapes
python -m newton.examples basic_joints
python -m newton.examples basic_conveyor
python -m newton.examples basic_heightfield
python -m newton.examples recording
python -m newton.examples replay_viewer
python -m newton.examples basic_plotting
```

---

### 机器人示例（Robot Examples）

```bash
python -m newton.examples robot_cartpole
python -m newton.examples robot_g1
python -m newton.examples robot_h1
python -m newton.examples robot_anymal_d
python -m newton.examples robot_anymal_c_walk
python -m newton.examples robot_policy
python -m newton.examples robot_ur10
python -m newton.examples robot_panda_hydro
python -m newton.examples robot_allegro_hand
```

---

### 缆线示例（Cable Examples）

```bash
python -m newton.examples cable_twist
python -m newton.examples cable_y_junction
python -m newton.examples cable_bundle_hysteresis
python -m newton.examples cable_pile
```

---

### 布料示例（Cloth Examples）

```bash
python -m newton.examples cloth_bending
python -m newton.examples cloth_hanging
python -m newton.examples cloth_style3d
python -m newton.examples cloth_h1
python -m newton.examples cloth_twist
python -m newton.examples cloth_franka
python -m newton.examples cloth_rollers
python -m newton.examples cloth_poker_cards
```

---

### 逆运动学示例（Inverse Kinematics Examples）

```bash
python -m newton.examples ik_franka
python -m newton.examples ik_h1
python -m newton.examples ik_custom
python -m newton.examples ik_cube_stacking
```

---

### MPM 示例（MPM Examples）

```bash
python -m newton.examples mpm_granular
python -m newton.examples mpm_anymal
python -m newton.examples mpm_twoway_coupling
python -m newton.examples mpm_grain_rendering
python -m newton.examples mpm_multi_material
```

---

### 传感器示例（Sensor Examples）

```bash
python -m newton.examples sensor_contact
python -m newton.examples sensor_tiled_camera
python -m newton.examples sensor_imu
```

---

### 选择示例（Selection Examples）

```bash
python -m newton.examples selection_cartpole
python -m newton.examples selection_materials
python -m newton.examples selection_articulations
python -m newton.examples selection_multiple
```

---

### 可微仿真示例（DiffSim Examples）

```bash
python -m newton.examples diffsim_ball
python -m newton.examples diffsim_cloth
python -m newton.examples diffsim_drone
python -m newton.examples diffsim_spring_cage
python -m newton.examples diffsim_soft_body
python -m newton.examples diffsim_bear
```

---

### 多物理场示例（Multi-Physics Examples）

```bash
python -m newton.examples softbody_gift
python -m newton.examples softbody_dropping_to_cloth
```

---

### 接触示例（Contacts Examples）

```bash
python -m newton.examples nut_bolt_hydro
python -m newton.examples nut_bolt_sdf
python -m newton.examples brick_stacking
python -m newton.examples pyramid
```

---

### 软体示例（Softbody Examples）

```bash
python -m newton.examples softbody_hanging
python -m newton.examples softbody_franka
```

---

## Example Options（示例参数）

这些示例支持以下命令行参数：

| 参数              | 描述                                                                | 默认值               |
| --------------- | ----------------------------------------------------------------- | ----------------- |
| `--viewer`      | 查看器类型：`gl`（OpenGL 窗口）、`usd`（USD 文件输出）、`rerun`（ReRun）、`null`（无查看器） | `gl`              |
| `--device`      | 使用的计算设备，例如 `cpu`、`cuda:0` 等                                       | `None`（Warp 默认设备） |
| `--num-frames`  | 模拟帧数（用于 USD 输出）                                                   | `100`             |
| `--output-path` | USD 文件输出路径（使用 `--viewer usd` 时必须指定）                               | `None`            |

部分示例可能包含额外参数（详见对应源码）。

---

## Example Usage（示例用法）

```bash
# 列出所有示例
python -m newton.examples

# 使用 USD viewer 并保存输出
python -m newton.examples basic_viewer --viewer usd --output-path my_output.usd

# 指定运行设备
python -m newton.examples basic_urdf --device cuda:0

# 组合参数
python -m newton.examples basic_viewer --viewer gl --num-frames 500 --device cpu
```

---

## Contributing and Development（贡献与开发）

关于如何为 Newton 做贡献，请参阅：

* [贡献指南](https://github.com/newton-physics/newton-governance/blob/main/CONTRIBUTING.md)
* [开发指南](https://newton-physics.github.io/newton/latest/guide/development.html)

---

## Support and Community Discussion（支持与社区讨论）

如有问题，请先查阅 [Newton 文档](https://newton-physics.github.io/newton/latest/guide/overview.html)，然后再在主仓库创建 [讨论](https://github.com/newton-physics/newton/discussions)。

---

## Code of Conduct（行为准则）

参与本社区即表示你同意遵守 Linux Foundation 的 [行为准则](https://lfprojects.org/policies/code-of-conduct/)。

---

## Project Governance, Legal, and Members（项目治理、法律与成员）

更多项目治理信息请参阅 [newton-governance 仓库](https://github.com/newton-physics/newton-governance)。


# 参考资料

* any list
{:toc}