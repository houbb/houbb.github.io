---
layout: post
title: Stable Diffusion-01-入门概览 
date: 2024-02-20 21:01:55 +0800
categories: [AI]
tags: [ai, aigc, sh]
published: true
---

# 稳定扩散版本2

![文本转图像示例](assets/stable-samples/txt2img/768/merged-0006.png)
![文本转图像示例](assets/stable-samples/txt2img/768/merged-0002.png)
![文本转图像示例](assets/stable-samples/txt2img/768/merged-0005.png)

此仓库包含从头开始训练的[Stable Diffusion](https://github.com/CompVis/stable-diffusion)模型，并将持续更新新的检查点。以下是当前可用模型的概述。更多内容即将发布。

## 最新动态

**2023年3月24日**

*Stable UnCLIP 2.1*

- 基于SD2.1-768，在768x768分辨率下的新的稳定扩散微调（_Stable unCLIP 2.1_，[Hugging Face](https://huggingface.co/stabilityai/)）。此模型允许进行图像变体和混合操作，如[*使用CLIP潜在空间的层次文本条件图像生成*](https://arxiv.org/abs/2204.06125)中所述，并且由于其模块化，可以与其他模型（如[KARLO](https://github.com/kakaobrain/karlo)）结合使用。有两种变体：[Stable unCLIP-L](https://huggingface.co/stabilityai/stable-diffusion-2-1-unclip/blob/main/sd21-unclip-l.ckpt)和[Stable unCLIP-H](https://huggingface.co/stabilityai/stable-diffusion-2-1-unclip/blob/main/sd21-unclip-h.ckpt)，分别以CLIP ViT-L和ViT-H图像嵌入为条件。说明文档见[此处](doc/UNCLIP.MD)。

- SD-unCLIP的公开演示已在[clipdrop.co/stable-diffusion-reimagine](https://clipdrop.co/stable-diffusion-reimagine)提供。

**2022年12月7日**

*版本 2.1*

- 基于相同参数数量和架构的新稳定扩散模型(_Stable Diffusion 2.1-v_，[Hugging Face](https://huggingface.co/stabilityai/stable-diffusion-2-1))在768x768分辨率和(_Stable Diffusion 2.1-base_，[HuggingFace](https://huggingface.co/stabilityai/stable-diffusion-2-1-base))在512x512分辨率上，均基于2.0并在2.0的基础上微调，使用较少限制的[LAION-5B](https://laion.ai/blog/laion-5b/)数据集进行NSFW过滤。默认情况下，如果未安装`xformers`，模型的注意操作将在全精度下评估。要启用fp16（这可能会导致v2.1模型的普通注意模块出现数值不稳定），请使用`ATTN_PRECISION=fp16 python <thescript.py>`运行脚本。

**2022年11月24日**

*版本 2.0*

- 新的稳定扩散模型(_Stable Diffusion 2.0-v_)在768x768分辨率下。U-Net参数数量与1.5相同，但使用[OpenCLIP-ViT/H](https://github.com/mlfoundations/open_clip)作为文本编码器并从头开始训练。_SD 2.0-v_是所谓的[v-prediction](https://arxiv.org/abs/2202.00512)模型。
- 上述模型从_SF 2.0-base_微调而来，后者作为标准噪声预测模型在512x512图像上训练，也提供。
- 增加了[x4上采样潜在文本引导扩散模型](#image-upscaling-with-stable-diffusion)。
- 新的[深度引导稳定扩散模型](#depth-conditional-stable-diffusion)，从_SD 2.0-base_微调而来。模型基于通过[MiDaS](https://github.com/isl-org/MiDaS)推断的单目深度估计，可以用于保持结构的img2img和形状条件合成。

  ![深度转图像示例](assets/stable-samples/depth2img/depth2img01.png)
- [文本引导修复模型](#image-inpainting-with-stable-diffusion)，从_SD 2.0-base_微调而来。

我们遵循[原始仓库](https://github.com/CompVis/stable-diffusion)并提供基础推理脚本来从模型中采样。

________________
*原始的Stable Diffusion模型是与[CompVis](https://arxiv.org/abs/2202.00512)和[RunwayML](https://runwayml.com/)合作创建的，基于以下工作：*

[**高分辨率图像合成与潜在扩散模型**](https://ommer-lab.com/research/latent-diffusion-models/)<br/>
[Robin Rombach](https://github.com/rromb)\*，
[Andreas Blattmann](https://github.com/ablattmann)\*，
[Dominik Lorenz](https://github.com/qp-qp)\，
[Patrick Esser](https://github.com/pesser)，
[Björn Ommer](https://hci.iwr.uni-heidelberg.de/Staff/bommer)<br/>
_[CVPR '22 口头报告](https://openaccess.thecvf.com/content/CVPR2022/html/Rombach_High-Resolution_Image_Synthesis_With_Latent_Diffusion_Models_CVPR_2022_paper.html) |
[GitHub](https://github.com/CompVis/latent-diffusion) | [arXiv](https://arxiv.org/abs/2112.10752) | [项目页面](https://ommer-lab.com/research/latent-diffusion-models/)_

以及[许多其他人](#shout-outs)。

Stable Diffusion是一个潜在的文本到图像扩散模型。
________________________________

## 要求

您可以通过运行以下命令来更新现有的[潜在扩散](https://github.com/CompVis/latent-diffusion)环境：

```
conda install pytorch==1.12.1 torchvision==0.13.1 -c pytorch
pip install transformers==4.19.2 diffusers invisible-watermark
pip install -e .
```

#### xformers高效注意
为了提高GPU上的效率和速度，
我们强烈推荐安装[xformers](https://github.com/facebookresearch/xformers)库。

已在带CUDA 11.4的A100上测试。
安装需要较新的nvcc和gcc/g++版本，可以通过以下命令获得：
```commandline
export CUDA_HOME=/usr/local/cuda-11.4
conda install -c nvidia/label/cuda-11.4.0 cuda-nvcc
conda install -c conda-forge gcc
conda install -c conda-forge gxx_linux-64==9.5.0
```

然后，运行以下命令（编译可能需要长达30分钟）。

```commandline
cd ..
git clone https://github.com/facebookresearch/xformers.git
cd xformers
git submodule update --init --recursive
pip install -r requirements.txt
pip install -e .
cd ../stablediffusion
```

成功安装后，代码将在U-Net和自动编码器中的自注意和交叉注意层自动使用[内存高效注意](https://github.com/facebookresearch/xformers)。

## 一般免责声明
Stable Diffusion模型是通用的文本到图像扩散模型，因此反映了其训练数据中的偏见和（误）概念。尽管已经努力减少明确的色情内容，但**我们不推荐在没有额外安全机制和考虑的情况下将提供的权重用于服务或产品。权重是研究成果，应如此对待。**
有关训练过程和数据的详细信息，以及模型的预期用途，请参见相应的[模型卡](https://huggingface.co/stabilityai/stable-diffusion-2)。
权重可通过[Hugging Face上的StabilityAI组织](https://huggingface.co/StabilityAI)根据[CreativeML Open RAIL++-M License](LICENSE-MODEL)获得。

## 稳定扩散v2

稳定扩散v2指的是使用下采样因子8自动编码器、865M UNet和OpenCLIP ViT-H/14文本编码器的特定模型配置。_SD 2-v_模型生成768x768像素的输出。

在不同的无分类器指导比例（1.5, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0）和50个DDIM采样步骤下的评估显示了检查点的相对改进：

![稳定扩散评估结果](assets/model-variants.jpg)

### 文本到图像
![文本到图像示例](assets/stable-samples/txt2img/merged-

0023.png)
![文本到图像示例](assets/stable-samples/txt2img/merged-0021.png)
![文本到图像示例](assets/stable-samples/txt2img/merged-0024.png)

#### 用法
以下展示了如何使用[diffusers](https://github.com/huggingface/diffusers)库从_SF 2.0-v_模型中采样：
```python
import torch
from diffusers import StableDiffusionPipeline

model_id = "stabilityai/stable-diffusion-2"
device = "cuda"
pipe = StableDiffusionPipeline.from_pretrained(model_id, torch_dtype=torch.float16)
pipe = pipe.to(device)

prompt = "the dog is walking"
image = pipe(prompt).images[0]

image.save("dog.png")
```
或者，可以使用我们提供的直接脚本：
```commandline
python scripts/txt2img.py --prompt "a beautiful cat" --H 768 --W 768 --seed 27 --n_samples 1 --n_iter 1
```

### 深度条件稳定扩散
![深度条件图像示例](assets/stable-samples/depth2img/depth2img02.png)
![深度条件图像示例](assets/stable-samples/depth2img/depth2img05.png)
![深度条件图像示例](assets/stable-samples/depth2img/depth2img06.png)

**Stable Diffusion 2 depth-conditioned model**对形状和深度信息敏感。其使用方式与文本到图像模型相似，不同的是需要额外的单目深度图。
我们提供了用于生成这种深度图的代码片段，可以集成到推理管道中。

```python
import torch
from diffusers import StableDiffusionDepth2ImgPipeline

model_id = "stabilityai/stable-diffusion-2-depth"
device = "cuda"
pipe = StableDiffusionDepth2ImgPipeline.from_pretrained(model_id, torch_dtype=torch.float16)
pipe = pipe.to(device)

prompt = "a luxurious mansion"
depth_map = get_depth_map("input_image.jpg")  # 生成深度图的函数
image = pipe(prompt, depth_map).images[0]

image.save("mansion.png")
```

### 图片修复
![图片修复示例](assets/stable-samples/inpainting/inpainting_4.png)
![图片修复示例](assets/stable-samples/inpainting/inpainting_1.png)
![图片修复示例](assets/stable-samples/inpainting/inpainting_3.png)

_Stable Diffusion 2.0 inpainting model_ 是一个专门用于图片修复任务的模型。其使用方法与其他模式相似，但需要额外的掩码信息。
我们提供了生成这种掩码的代码片段，可以集成到推理管道中。

```python
import torch
from diffusers import StableDiffusionInpaintPipeline

model_id = "stabilityai/stable-diffusion-2-inpainting"
device = "cuda"
pipe = StableDiffusionInpaintPipeline.from_pretrained(model_id, torch_dtype=torch.float16)
pipe = pipe.to(device)

prompt = "a beautiful beach"
init_image = "path_to_image.png"  # 初始图像
mask_image = "path_to_mask.png"   # 掩码图像
image = pipe(prompt, init_image=init_image, mask_image=mask_image).images[0]

image.save("beach.png")
```

### 图像上采样
![图像上采样示例](assets/stable-samples/upscaling/upscaling_1.png)
![图像上采样示例](assets/stable-samples/upscaling/upscaling_2.png)
![图像上采样示例](assets/stable-samples/upscaling/upscaling_3.png)

#### 用法
```python
import torch
from diffusers import StableDiffusionUpscalePipeline

model_id = "stabilityai/stable-diffusion-x4-upscaler"
device = "cuda"
pipe = StableDiffusionUpscalePipeline.from_pretrained(model_id, torch_dtype=torch.float16)
pipe = pipe.to(device)

prompt = "an ultra high resolution photo of a cat"
low_res_image = get_low_res_image("path_to_image.png")  # 生成低分辨率图像的函数
image = pipe(prompt, image=low_res_image).images[0]

image.save("high_res_cat.png")
```

### 参考

- 相关论文：[高分辨率图像合成与潜在扩散模型](https://arxiv.org/abs/2112.10752)
- 代码库：[https://github.com/CompVis/stable-diffusion](https://github.com/CompVis/stable-diffusion)
- 模型权重：[Hugging Face上的StabilityAI组织](https://huggingface.co/StabilityAI)

### 致谢
我们对以下人和组织表示感谢：
- [CompVis组](https://ommer-lab.com/)
- [RunwayML](https://runwayml.com/)
- [OpenCLIP](https://github.com/mlfoundations/open_clip)

更多信息和更新，请访问我们的[GitHub页面](https://github.com/stabilityai/stable-diffusion)和[Hugging Face页面](https://huggingface.co/stabilityai/stable-diffusion-2)。

## 快速入门

Stable Diffusion是一个强大的工具，可以用来生成高质量的图像。以下是一个快速入门指南：

1. 安装必要的依赖库。
2. 下载并加载模型。
3. 输入提示词生成图像。

更多详细信息，请参考上述每个部分的使用说明。祝您使用愉快！

# 参考资料

https://github.com/Stability-AI/stablediffusion/blob/main/README.md

* any list
{:toc}
