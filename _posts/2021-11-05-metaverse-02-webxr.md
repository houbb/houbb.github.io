---
layout: post
title: Metaverse 基础技术值 WEBXR
date: 2021-11-02 21:01:55 +0800
categories: [Metaverse]
tags: [Metaverse, sh]
published: true
---

# WebXR 设备 API 说明

[WebXR 设备 API](https://immersive-web.github.io/webxr/) 提供对通常与虚拟现实 (VR) 和增强现实 (AR) 设备相关联的输入和输出功能的访问。 

它允许您在网络上开发和托管 VR 和 AR 体验。

# 什么是 WebXR？

## 目标

通过允许页面执行以下操作，在 Web 上启用 XR 应用程序：

- 检测 XR 功能是否可用。

- 查询 XR 设备能力。

- 轮询 XR 设备和关联的输入设备状态。

- 以适当的帧速率在 XR 设备上显示图像。

## 非目标

- 定义虚拟现实或增强现实浏览器的工作方式。

- 展示每个 VR/AR 硬件的每个功能。

- 建立“元宇宙”。

## 目标硬件

支持的设备示例包括（但不限于）：

- [ARCore-compatible devices](https://developers.google.com/ar/discover/supported-devices)

- [Google Daydream](https://vr.google.com/daydream/)

- [HTC Vive](https://www.htcvive.com/)

- [Magic Leap One](https://www.magicleap.com/magic-leap-one)

- [Microsoft Hololens](https://www.microsoft.com/en-us/hololens/)

- [Oculus Rift](https://www3.oculus.com/rift/)

- [Samsung Gear VR](http://www.samsung.com/global/galaxy/gear-vr/)

- [Windows Mixed Reality headsets](https://developer.microsoft.com/en-us/windows/mixed-reality)

## XR 中的 X 是什么意思？

今天有很多“_____现实”流行语。 

虚拟现实、增强现实、混合现实……即使它们之间有很多相似之处，也很难跟踪。 

此 API 旨在提供执行上述所有操作的基础元素。 

由于我们不想仅限于 VR 或 AR（或介于两者之间的任何方面）的一个方面，我们使用“X”，不是作为首字母缩略词的一部分，而是作为某种代数变量来表示“你的现实在这里” . 

我们也听说过它被称为“扩展现实”和“交叉现实”，看起来也不错，但实际上 X 是您想要的任何东西！

## 这个 API 是否隶属于 OpenXR？

Khronos 即将推出的 [OpenXR API](https://www.khronos.org/openxr) 确实涵盖了与用于本机应用程序的 WebXR 设备 API 相同的基本功能。 

因此，看起来 WebXR 和 OpenXR 之间的关系类似于 WebGL 和 OpenGL，其中 Web API 是原生 API 的近乎 1:1 的映射。 

WebXR 和 OpenXR 的情况**不是**，因为它们是由不同标准机构开发的不同 API。

也就是说，鉴于共享的主题，许多相同的概念由两个 API 以不同的方式表示，我们确实希望一旦 OpenXR 公开可用，使用 OpenXR 作为多个可能的本机后端之一来实现 WebXR 的功能集将是合理的。

# 用例

鉴于早期 XR 硬件向游戏玩家的营销，人们自然会认为该 API 将主要用于游戏开发。

鉴于 WebGL API 的历史，这当然是我们期望看到的，它密切相关，但我们可能会看到比大型游戏更多的“长尾”风格的内容。

从广义上讲，网络上的 XR 内容可能涵盖不完全适合所有主要 VR/AR 硬件提供商用作主要分发方法的应用程序商店模型的区域，或者商店不允许内容本身的区域准则。

一些高级示例是：

## 视频

360° 和 3D 视频是人们非常感兴趣的领域（例如，参见 [ABC 的 360° 视频报道](http://abcnews.go.com/US/fullpage/abc-news-vr-virtual-reality-news-stories-33768357))，并且过去证明网络在分发视频方面非常有效。

启用 XR 的视频播放器会在检测到 XR 硬件的存在时显示“在 VR 中查看”按钮，类似于当今视频播放器中的“全屏”按钮。

当用户单击该按钮时，视频将在耳机中呈现并响应自然的头部运动。

传统的 2D 视频也可以在耳机中呈现，就像用户坐在剧院大小的屏幕前一样，提供更加身临其境的体验。

## 对象/数据可视化

站点可以通过 WebXR 提供简单的 3D 可视化，通常是对其更传统的渲染的渐进式改进。

查看 3D 模型（例如 [SketchFab](https://sketchfab.com/)）、建筑预可视化、医学成像、绘图和 [基本数据可视化](http://graphics.wsj.com/3d-nasdaq/ ) 都可以更有影响力，更容易理解，并在 VR 和 AR 中传达准确的规模感。

对于这些用例，很少有用户会证明安装本机应用程序是合理的，尤其是当 Web 内容只是一个链接或点击即可。

家庭购物应用程序（例如，[Matterport](https://matterport.com/try/)）作为特别有效的演示。根据设备功能，网站可以从简单的照片轮播扩展到屏幕上的交互式 3D 模型，再到在 VR 中查看演练，让用户感觉实际上是在房子里。为用户提供低摩擦体验的能力对于用户和开发人员来说都是一笔巨大的财富，因为他们不需要事先说服用户安装一个沉重的（可能是恶意的）可执行文件。

## 艺术体验

VR为寻求探索新媒体可能性的艺术家提供了一个有趣的画布。

较短、抽象和高度实验性的体验通常不适合应用商店模型，其中下载和安装本机可执行文件的感知开销可能与交付的内容不成比例。 

Web 的瞬态特性使这些类型的应用程序更具吸引力，因为它们提供了一种流畅的体验方式。

艺术家还可以更轻松地将人们吸引到内容中，并使用单一代码库定位最广泛的设备和平台。

# VR 网络应用的生命周期

大多数 WebXR 应用程序将经历的基本步骤是：

- **查询**以查看是否支持所需的 XR 模式。

- 如果支持可用，**向用户宣传 XR 功能**。

- [用户激活事件](https://html.spec.whatwg.org/multipage/interaction.html#activation) 表示用户希望使用 XR。

- **从设备请求沉浸式会话**

- 使用会话**运行渲染循环**，更新传感器数据，并生成要在 XR 设备上显示的图形帧。

- 继续**生产帧**，直到用户表示他们希望退出 XR 模式。

- **结束 XR 会话**。

在以下部分中，代码示例将首先使用沉浸式 VR 会话通过此生命周期序列演示核心 API 概念，然后介绍 [inline session](#inline-sessions) 引入的差异。 

代码示例应该都属于同一个应用程序。

## XR 硬件

UA 将识别可以向用户呈现沉浸式内容的 XR 硬件的可用物理单元。如果内容产生模拟或增强用户环境各个方面的视觉、音频、触觉或其他感官输出，则内容被认为是“沉浸式”的。

最常见的是，这涉及跟踪用户在空间中的运动并产生与用户运动同步的输出。在桌面客户端上，这通常是耳机外设；在移动客户端上，它可能代表移动设备本身与查看器工具（例如，Google Cardboard/Daydream 或 Samsung Gear VR）。

它还可以代表没有立体呈现功能但具有更高级跟踪功能的设备，例如与 ARCore/ARKit 兼容的设备。

对 XR 功能或功能的任何查询都是针对此设备隐式进行的。

> **非规范说明：** 如果有多个 XR 设备可用，则 UA 将需要选择要公开的一个。 UA 可以使用它希望选择使用哪个设备的任何标准，包括允许用户管理设备优先级的设置 UI。使用“inline”调用“navigator.xr.isSessionSupported”或“navigator.xr.requestSession”应该**不会**触发设备选择 UI，但是，因为这会导致许多站点在早期显示 XR 特定的对话框无需用户激活的文档生命周期。

即使最初没有可用的 XR 设备，也有可能在应用程序运行时变得可用，或者之前可用的设备变得不可用。

这在可以随时连接或断开的 PC 外围设备中最为常见。页面可以侦听在“navigator.xr”上发出的“devicechange”事件，以响应页面加载后设备可用性的变化。 

（当页面加载时 XR 设备已经可用，不会触发 `devicechange` 事件。）`devicechange` 会触发类型为 `Event` 的事件。

```js
navigator.xr.addEventListener('devicechange', checkForXRSupport);
```

## 检测和宣传 XR 功能

与 XR 设备的交互是通过“XRSession”接口完成的，但在任何支持 XR 的页面请求会话之前，它应该首先查询以确定当前硬件和 UA 是否支持所需的 XR 内容类型。

如果是，则页面可以向用户宣传 XR 功能。 

（例如，通过向页面添加一个按钮，用户可以单击该按钮以启动 XR 内容。）

`navigator.xr.isSessionSupported` 函数用于检查设备是否支持应用程序所需的 XR 功能。它采用“XR 模式”来描述所需的功能，并返回一个承诺，如果设备可以使用该模式成功创建一个“XRSession”，则该承诺以 _true_ 解析。否则调用会以 _false_ 解析。

以这种方式查询支持是必要的，因为它允许应用程序在请求“XRSession”之前检测可用的 XR 模式，这可能会使用 XR 设备传感器并开始呈现。

这可能会在某些系统上产生显着的功耗或性能开销，并可能产生副作用，例如接管用户的屏幕、启动状态托盘或店面，或终止其他应用程序对 XR 硬件的访问。

调用 `navigator.xr.isSessionSupported` 不得干扰系统上任何正在运行的 XR 应用程序，也不得有任何用户可见的副作用。

可以请求两种 XR 模式：

**内联**：使用模式枚举 `'inline'` 请求。内联会话无法在 XR 设备上显示内容，但可能允许访问设备跟踪信息并使用它在页面上呈现内容。 

（这种技术，其中呈现到页面的场景响应设备移动，有时被称为“魔术窗口”模式。）

实现 WebXR 设备 API 的 UA 必须保证可以创建内联会话，而不管 XR 设备是否存在，除非被页面功能策略阻止。

**沉浸式 VR**：使用模式枚举 `'immersive-vr'` 请求。沉浸式 VR 内容直接呈现给 XR 设备（例如：显示在 VR 耳机上）。

沉浸式 VR 会话必须在用户激活事件内或在已明确指示允许沉浸式会话请求的另一个回调内请求。

应该注意的是，沉浸式 VR 会话可能仍会在 HoloLens 等透视显示器上显示用户环境。有关更多详细信息，请参阅 [处理非不透明显示](#handling-non-opaque-displays)。

本文档将使用术语“沉浸式会话”来指代沉浸式 VR 会话。

在以下示例中，我们将首先使用沉浸式 VR 会话解释核心 API 概念，然后介绍 [inline session](#inline-sessions) 引入的差异。考虑到这一点，此代码检查是否支持沉浸式 VR 会话，因为我们希望能够在设备（如耳机）上显示内容。

```js
async function checkForXRSupport() {
  // Check to see if there is an XR device available that supports immersive VR
  // presentation (for example: displaying in a headset). If the device has that
  // capability the page will want to add an "Enter VR" button to the page (similar to
  // a "Fullscreen" button) that starts the display of immersive VR content.
  navigator.xr.isSessionSupported('immersive-vr').then((supported) => {
    if (supported) {
      var enterXrBtn = document.createElement("button");
      enterXrBtn.innerHTML = "Enter VR";
      enterXrBtn.addEventListener("click", beginXRSession);
      document.body.appendChild(enterXrBtn);
    } else {
      console.log("Session not supported: " + reason);
    }
  });
}
```

## 请求会话

在使用 `navigator.xr.isSessionSupported()` 确认所需模式可用后，应用程序将需要使用 `navigator.xr.requestSession()` 方法请求一个 `XRSession` 实例，以便与 XR 设备的演示进行交互或跟踪功能。

```js
function beginXRSession() {
  // requestSession must be called within a user gesture event
  // like click or touch when requesting an immersive session.
  navigator.xr.requestSession('immersive-vr')
      .then(onSessionStarted)
      .catch(err => {
        // May fail for a variety of reasons. Probably just want to
        // render the scene normally without any tracking at this point.
        window.requestAnimationFrame(onDrawFrame);
      });
}
```

在此示例中，假设通过单击前一个示例中的“进入 VR”按钮运行的 `beginXRSession` 函数请求在 `immersive-vr` 模式下运行的 `XRSession`。

 `requestSession` 方法返回一个在成功时解析为 `XRSession` 的承诺。
 
 除了 `XRSessionMode` 之外，开发人员还可以提供一个包含返回会话必须具有的功能的 `XRSessionInit` 字典。有关详细信息，请参阅 [功能依赖项](#feature-dependencies)。

如果 `isSessionSupported` 对于给定模式解析为 `_true_`，则应该合理地预期使用相同模式的会话会成功，除非外部因素（例如在沉浸式会话的用户激活事件中未调用 `requestSession`）。 

UA 最终负责确定它是否可以满足请求。

每个 XR 硬件设备一次只允许在整个 UA 中进行一个沉浸式会话。如果请求沉浸式会话并且 UA 已经有一个活动的沉浸式会话或一个未决的沉浸式会话请求，则必须拒绝新的请求。

当沉浸式会话处于活动状态时，所有内联会话都被 [暂停](#handling-suspended-sessions)。除非与另一个明确需要它的选项配对，否则不需要在用户激活事件中创建内联会话。

会话开始后，必须进行一些设置以准备渲染。

- 应该创建一个 `XRReferenceSpace` 来建立一个空间，在其中定义 `XRViewerPose` 数据。有关更多信息，请参阅 [空间跟踪解释器](spatial-tracking-explainer.md)。

- 必须创建一个 `XRWebGLLayer` 并将其设置为 `XRSession` 的 `renderState.baseLayer`。 （`baseLayer` 因为规范的未来版本可能会启用多个层。）

- 然后必须调用`XRSession.requestAnimationFrame` 来启动渲染循环泵。

在此示例中，假设通过单击前一个示例中的“进入 VR”按钮运行的 `beginXRSession` 函数请求在 `immersive-vr` 模式下运行的 `XRSession`。 

`requestSession` 方法返回一个在成功时解析为 `XRSession` 的承诺。

除了 `XRSessionMode` 之外，开发人员还可以提供一个包含返回会话必须具有的功能的 `XRSessionInit` 字典。有关详细信息，请参阅 [功能依赖项](#feature-dependencies)。

如果 `isSessionSupported` 对于给定模式解析为 _true_，则应该合理地预期使用相同模式的会话会成功，除非外部因素（例如在沉浸式会话的用户激活事件中未调用 `requestSession`）。 

UA 最终负责确定它是否可以满足请求。

每个 XR 硬件设备一次只允许在整个 UA 中进行一个沉浸式会话。如果请求沉浸式会话并且 UA 已经有一个活动的沉浸式会话或一个未决的沉浸式会话请求，则必须拒绝新的请求。

当沉浸式会话处于活动状态时，所有内联会话都被 [暂停](#handling-suspended-sessions)。除非与另一个明确需要它的选项配对，否则不需要在用户激活事件中创建内联会话。

会话开始后，必须进行一些设置以准备渲染。

- 应该创建一个 `XRReferenceSpace` 来建立一个空间，在其中定义 `XRViewerPose` 数据。有关更多信息，请参阅 [空间跟踪解释器](spatial-tracking-explainer.md)。

- 必须创建一个 `XRWebGLLayer` 并将其设置为 `XRSession` 的 `renderState.baseLayer`。 （`baseLayer` 因为规范的未来版本可能会启用多个层。）

- 然后必须调用 `XRSession.requestAnimationFrame` 来启动渲染循环泵。

```js
let xrSession = null;
let xrReferenceSpace = null;

function onSessionStarted(session) {
  // Store the session for use later.
  xrSession = session;

  xrSession.requestReferenceSpace('local')
  .then((referenceSpace) => {
    xrReferenceSpace = referenceSpace;
  })
  .then(setupWebGLLayer) // Create a compatible XRWebGLLayer
  .then(() => {
    // Start the render loop
    xrSession.requestAnimationFrame(onDrawFrame);
  });
}
```

## 设置 XRWebGLLayer

呈现给设备的内容由“XRWebGLLayer”定义。这是通过 `XRSession` 的 `updateRenderState()` 函数设置的。 

`updateRenderState()` 接受一个字典，其中包含影响会话渲染的各种选项的新值，包括 `baseLayer`。仅更新字典中指定的选项。

规范的未来扩展将定义新的层类型。例如：将添加一个新的图层类型，以便与添加到浏览器的任何新图形 API 一起使用。一次使用多个层并由 UA 合成它们的能力也可能会在未来的 API 修订版中添加。

为了将 WebGL 画布与“XRWebGLLayer”一起使用，其上下文必须与 XR 设备_兼容_。对于不同的环境，这可能意味着不同的事情。

例如，在台式计算机上，这可能意味着必须针对 XR 设备物理插入的图形适配器创建上下文。不过，在大多数移动设备上，这不是问题，因此上下文将始终兼容。在任何一种情况下，WebXR 应用程序都必须采取措施确保 WebGL 上下文兼容性，然后再将其与“XRWebGLLayer”一起使用。

在确保画布兼容性方面，应用程序将分为两大类。

**XR 增强：** 该应用程序可以利用 XR 硬件，但它被用作渐进增强而不是体验的核心部分。大多数用户可能不会与应用程序的 XR 功能进行交互，因此要求他们在应用程序生命周期的早期做出以 XR 为中心的决策是令人困惑和不恰当的。

一个例子是一个带有嵌入式 360 照片库或视频的新闻网站。 （我们预计大部分早期的 WebXR 内容都属于这一类。）

这种风格的应用程序应该调用`WebGLRenderingContextBase` 的`makeXRCompatible()` 方法。这将在允许使用它的上下文上设置一个兼容性位。

尝试使用它们创建“XRWebGLLayer”时，没有兼容性位的上下文将失败。

```js
let glCanvas = document.createElement("canvas");
let gl = glCanvas.getContext("webgl");
loadSceneGraphics(gl);

function setupWebGLLayer() {
  // 确保我们要使用的画布上下文与当前的 xr 设备兼容。
  return gl.makeXRCompatible().then(() => {
    // 将在设备上显示的内容由会话的 baseLayer 定义。
    xrSession.updateRenderState({ baseLayer: new XRWebGLLayer(xrSession, gl) });
  });
}
```

如果上下文与 XR 设备不兼容，[上下文将丢失并尝试重新创建自己](https://www.khronos.org/registry/webgl/specs/latest/1.0/#5.14. 13) 使用兼容的图形适配器。

页面有责任正确处理 WebGL 上下文丢失，重新创建任何必要的 WebGL 资源作为响应。

如果页面没有处理上下文丢失，`makeXRCompatible` 返回的承诺将失败。

承诺也可能由于各种其他原因而失败，例如上下文被不同的、不兼容的 XR 设备主动使用。

如果上下文与 XR 设备不兼容，[上下文将丢失并尝试重新创建自己](https://www.khronos.org/registry/webgl/specs/latest/1.0/#5.14. 13) 使用兼容的图形适配器。 

页面有责任正确处理 WebGL 上下文丢失，重新创建任何必要的 WebGL 资源作为响应。 

如果页面没有处理上下文丢失，`makeXRCompatible` 返回的承诺将失败。 

承诺也可能由于各种其他原因而失败，例如上下文被不同的、不兼容的 XR 设备主动使用。


```js
// Set up context loss handling to allow the context to be properly restored if needed.
glCanvas.addEventListener("webglcontextlost", (event) => {
  // Calling preventDefault signals to the page that you intent to handle context restoration.
  event.preventDefault();
});

glCanvas.addEventListener("webglcontextrestored", () => {
  // Once this function is called the gl context will be restored but any graphics resources
  // that were previously loaded will be lost, so the scene should be reloaded.
  loadSceneGraphics(gl);
});
```

**以 XR 为中心：** 该应用程序的主要用例是显示 XR 内容，因此它不介意以以 XR 为中心的方式初始化资源，其中可能包括要求用户在应用程序启动后立即选择耳机。 

一个例子是依赖于 XR 呈现和输入的游戏。 

这些类型的应用程序可以避免调用 `makeXRCompatible` 以及通过在 WebGL 上下文创建参数中设置 `xrCompatible` 标志可能触发的可能的上下文丢失。

```js
let gl = glCanvas.getContext("webgl", { xrCompatible: true });
loadSceneGraphics(gl);
```

通过任一方法确保与 XR 设备的上下文兼容性可能会对页面中的其他图形资源产生副作用，例如导致整个用户代理从使用集成 GPU 的渲染切换到离散 GPU。

> **注意：** `XRWebGLLayer` 使用由 Canvas 元素或 `OffscreenCanvas` 创建的 WebGL 上下文，而不是创建自己的上下文，以允许将相同的内容呈现到 XR 设备和页面，以及 允许页面在创建会话之前加载它的 WebGL 资源。

如果系统的底层 XR 设备发生变化（由 `navigator.xr` 对象上的 `devicechange` 事件发出信号）任何先前设置的上下文兼容性位将被清除，并且在使用上下文之前需要再次调用 `makeXRCompatible` 一个`XRWebGLLayer`。 

任何活动会话也将结束，因此需要创建具有相应新“XRWebGLLayer”的新“XRSession”。

## 主渲染循环

WebXR 设备 API 通过 `XRFrame` 对象提供有关要渲染的当前帧的信息，开发人员必须在渲染循环的每次迭代中检查这些信息。

可以从该对象查询帧的“XRViewerPose”，其中包含有关必须渲染的所有视图的信息，以便场景在 XR 设备上正确显示。

`XRWebGLLayer` 对象不会自动更新。要呈现新帧，开发人员必须使用 `XRSession` 的 `requestAnimationFrame()` 方法。

当 `requestAnimationFrame()` 回调函数运行时，它们会被传递一个时间戳和一个 `XRFrame`。它们将包含在回调期间必须用于绘制到 `XRWebGLLayer` 的 `framebuffer` 中的新渲染数据。

为每批“requestAnimationFrame()”回调或与跟踪数据关联的某些事件创建一个新的“XRFrame”。 

`XRFrame` 对象充当 XR 设备状态和所有相关输入的快照。状态可以代表历史数据、当前传感器读数或未来预测。由于它的时间敏感特性，“XRFrame”仅在它传入的回调执行期间有效。一旦控制权返回给浏览器，任何活动的“XRFrame”对象都被标记为非活动的。调用非活动 `XRFrame` 的任何方法都会抛出 [`InvalidStateError`](https://heycam.github.io/webidl/#invalidstateerror)。

`XRFrame` 还复制了 `XRSession` 的 `renderState`，例如 `depthNear/Far` 值和 `baseLayer`，就在被调用的当前批处理中的 `requestAnimationFrame()` 回调之前。在计算投影矩阵等视图信息以及由 XR 硬件合成帧时，将使用捕获的“renderState”。在处理下一个“XRFrame”的回调之前，开发人员对“updateRenderState()”所做的任何后续调用都不会被应用。

提供的时间戳是使用与 [处理`window.requestAnimationFrame()`回调相同的逻辑](https://html.spec.whatwg.org/multipage/imagebitmap-and-animations.html#run-the-animation-frame-callbacks）。

这意味着时间戳是一个`DOMHighResTimeStamp`，设置为帧回调开始处理的当前时间。单个帧中的多个回调将收到相同的时间戳，即使在处理先前回调的过程中已经过了时间。

将来，如果确定了 API 应提供的其他特定于 XR 的计时信息，建议通过“XRFrame”对象提供。

`XRWebGLLayer` 的帧缓冲区由 UA 创建，其行为类似于画布的默认帧缓冲区。

使用 `framebufferTexture2D`、`framebufferRenderbuffer`、`getFramebufferAttachmentParameter` 和 `getRenderbufferParameter` 都会产生 INVALID_OPERATION 错误。

此外，在 `XRSession` 的 `requestAnimationFrame()` 回调之外，帧缓冲区将被视为不完整，在调用 `checkFramebufferStatus` 时报告 FRAMEBUFFER_UNSUPPORTED。尝试绘制、清除或读取它会生成一个 INVALID_FRAMEBUFFER_OPERATION 错误，如 WebGL 规范所示。

一旦绘制到，XR 设备将继续显示“XRWebGLLayer”帧缓冲区的内容，可能会重新投影以匹配头部运动，无论页面是否继续处理新帧。未来的规范迭代可能会启用其他类型的层，例如视频层，这些层可以自动与设备的刷新率同步。

## 使用 WebGL 进行查看者跟踪

每个“XRFrame”场景都将从“查看者”的角度绘制，即查看场景的用户或设备，由“XRViewerPose”描述。

开发人员通过在 `XRFrame` 上调用 `getViewerPose()` 并为要返回的姿势提供一个 `XRReferenceSpace` 来检索当前的 `XRViewerPose`。

由于 XR 跟踪系统的性质，此函数不保证返回一个价值和开发人员将需要做出适当的回应。有关哪些情况会导致 `getViewerPose()` 失败的更多信息以及处理这种情况的推荐做法，请参阅 [Spatial Tracking Explainer](spatial-tracking-explainer.md)。

`XRViewerPose` 包含一个 `views` 属性，它是一个 `XRView`s 数组。每个 `XRView` 都有一个 `projectionMatrix` 和 `transform`，应该在使用 WebGL 渲染时使用。 

`XRView` 也被传递给 `XRWebGLLayer` 的 `getViewport()` 方法，以确定在渲染时 WebGL 视口应该设置为什么。

这确保了场景的适当透视被渲染到“XRWebGLLayer”的“帧缓冲区”上的正确部分，以便在 XR 硬件上正确显示。

```js
function onDrawFrame(timestamp, xrFrame) {
  // Do we have an active session?
  if (xrSession) {
    let glLayer = xrSession.renderState.baseLayer;
    let pose = xrFrame.getViewerPose(xrReferenceSpace);
    if (pose) {
      // Run imaginary 3D engine's simulation to step forward physics, animations, etc.
      scene.updateScene(timestamp, xrFrame);

      gl.bindFramebuffer(gl.FRAMEBUFFER, glLayer.framebuffer);

      for (let view of pose.views) {
        let viewport = glLayer.getViewport(view);
        gl.viewport(viewport.x, viewport.y, viewport.width, viewport.height);
        drawScene(view);
      }
    }
    // Request the next animation callback
    xrSession.requestAnimationFrame(onDrawFrame);
  } else {
    // No session available, so render a default mono view.
    gl.viewport(0, 0, glCanvas.width, glCanvas.height);
    drawSceneFromDefaultView();

    // Request the next window callback
    window.requestAnimationFrame(onDrawFrame);
  }
}
```

每个 `XRView` 的每个 `transform` 属性都是一个由 `position` 和 `orientation` 组成的 `XRRigidTransform`。 

（有关更多详细信息，请参阅空间跟踪解释器中的 [定义`XRRigidTransform`](spatial-tracking-explainer.md#rigid-transforms)。）

这些应该被视为场景中虚拟“相机”的位置。

如果应用程序使用库来辅助渲染，则将这些值直接应用于相机对象可能是最自然的，如下所示：


```js
// Apply the view transform to the camera of a fictional rendering library.
function drawScene(view) {
  camera.setPositionVector(
    view.transform.position.x,
    view.transform.position.y,
    view.transform.position.z,
  );

  camera.setOrientationQuaternion(
    view.transform.orientation.x,
    view.transform.orientation.y,
    view.transform.orientation.z,
    view.transform.orientation.w,
  );

  camera.setProjectionMatrix4x4(
    view.projectionMatrix[0],
    view.projectionMatrix[1],
    //...
    view.projectionMatrix[14],
    view.projectionMatrix[15]
  );
  
  scene.renderWithCamera(camera);
}
```

或者，将变换作为视图矩阵传入可能更容易，尤其是当应用程序直接进行 WebGL 调用时。 

在这种情况下，所需的矩阵通常是视图变换的逆矩阵，可以从“XRRigidTransform”的“inverse”属性轻松获取。

```js
// Get a view matrix and projection matrix appropriate for passing directly to a WebGL shader.
function drawScene(view) {
  viewMatrix = view.transform.inverse.matrix;
  projectionMatrix = view.projectionMatrix;

  // Set uniforms as appropriate for shaders being used

  // Draw Scene
}
```

在这两种情况下，`XRView` 的 `projectionMatrix` 都应该按原样使用。 

更改它可能会导致 XR 设备的输出不正确，并导致用户严重不适。

因为`XRViewerPose` 继承自`XRPose`，它还包含一个`transform`，描述了相对于`XRReferenceSpace` 原点的整体位置和方向。 

这主要用于为观众视图或多用户环境渲染查看器的视觉表示。

## 音频监听器跟踪

每个 `XRFrame` 都是 `viewerPos. transform.matrix` 需要修改以适应 [AudioContext.listener](<https://developer.mozilla.org/en-US/docs/Web/API/AudioListener>) 前端和向上值的方向值.

请注意，在 `viewer` `xrReferenceSpace` 中，位置和方向随着头显（也可能是用户的头部）移动。这意味着它始终在“viewerPos”处具有“原生来源”。 

transform.matrix`，所以只有音频侦听器的方向会在这个 `xrReferenceSpace` 中改变。

澄清没有听者位置这样的东西也很重要。场景可以有多个共存的坐标系。

在此示例中，您将获得特定 xrReferenceSpace 中的观察者姿势，并使用姿势变换矩阵使用该参考空间坐标系中的位置和方向更新 AudioListener。未说明的假设是音频源也将使用同一参考空间坐标系中的坐标，如果是这种情况，您将获得一致的体验。

在查看器空间中执行所有操作将是完全有效的（如果有点奇怪），将 AudioListener 保持在查看器空间原点，并在该空间中沿 -z 向前固定并沿 +y 向上，然后确保音频源的坐标相对于当前的头部位置和方向，位于相同的查看器空间中。

以下是如何连接`viewerPos` 的示例。 `transform.matrix` 到 `AudioContext.listener`：

```js
// initialize the audio context
const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContext();

function onDrawFrame(timestamp, xrFrame) {
  // Do we have an active session?
  if (xrSession) {
    let listener = audioCtx.listener;

    let pose = xrFrame.getViewerPose(xrReferenceSpace);
    if (pose) {
      // Run imaginary 3D engine's simulation to step forward physics, PannerNodes, etc.
      scene.updateScene(timestamp, xrFrame);

      // Set the audio listener to face where the XR view is facing
      /// The pose.matrix top left 3x3 elements provide unit column vectors in base space for the posed coordinate system's x/y/z axis directions,
      /// so we use the negative of the third column directly as a forward vector corresponding to the -z direction.
      // The given pose.transform.orientation is a quaternion and not a forward vector, so is not used with web audio
      const m = pose.transform.matrix;
      // Set forward facing position
      [ listener.forwardX.value, listener.forwardY.value, listener.forwardZ.value ] = [-m[8], -m[9], -m[10]];
      // set the horizontal position of the top of the listener's head
      [ listener.upX.value, listener.upY.value, listener.upZ.value ] = [ m[4], m[5], m[6] ];
      // Set the audio listener to travel with the WebXR user position
      // Note that pose.transform.position does equal [m[12], m[13], m[14]]
      [ listener.positionX.value, listener.positionY.value, listener.positionZ.value ] = [m[12], m[13], m[14]];

    }
    // Request the next animation callback
    xrSession.requestAnimationFrame(onDrawFrame);
  }
}
```

## 处理会话可见性

UA 可以随时暂时隐藏会话。

虽然隐藏会话限制了对 XR 设备状态的访问，并且不会处理帧。

可以合理地期望隐藏会话在某个时间点再次可见，通常是当用户完成了触发会话隐藏的任何操作时。但是，这不能保证，因此应用程序不应依赖它。

如果允许页面继续读取耳机位置代表安全或隐私风险，UA 可能会隐藏会话（例如当用户使用虚拟键盘输入密码或 URL 时，在这种情况下，头部运动可能会推断出用户的输入） ，或者如果 UA 外部的内容遮挡了页面的输出。

在其他情况下，UA也可以选择保持会话内容可见但“模糊”，表示会话内容仍然可见但不再在前台。虽然页面模糊时可能会以较慢的速度刷新 XR 设备或根本不刷新，但从设备查询的姿势可能不太准确，并且所有输入跟踪都将不可用。

如果用户戴着耳机，那么 UA 应该呈现一个被跟踪的环境（一个对用户头部运动保持响应的场景）或在页面被限制时重新投影被限制的内容以防止用户不适。

会话应在模糊时继续请求和绘制帧，但不应依赖于以正常的 XR 硬件设备帧速率处理它们。 UA 可能会使用这些帧作为其跟踪环境或页面组合的一部分，但由模糊会话生成的帧的确切呈现会因平台而异。

它们可能被部分遮挡、字面上模糊、变灰或以其他方式不再强调。

一些应用程序可能希望通过暂停游戏逻辑、故意遮蔽内容或暂停媒体来响应会话被隐藏或模糊。

为此，应用程序应侦听来自“XRSession”的“visibilitychange”事件。

例如，360 媒体播放器会执行此操作以在 UA 遮住视频/音频时暂停视频/音频。

```js
xrSession.addEventListener('visibilitychange', xrSessionEvent => {
  switch (xrSessionEvent.session.visibilityState) {
    case 'visible':
      resumeMedia();
      break;
    case 'visible-blurred':
      pauseMedia();
      // Allow the render loop to keep running, but just keep rendering the last
      // frame. Render loop may not run at full framerate.
      break;
    case 'hidden':
      pauseMedia();
      break;
  }
});
```

## 结束 XR 会话

当不再期望使用 `XRSession` 时，它会“结束”。 

结束的会话对象被分离，并且对对象的所有操作都将失败。 结束的会话无法恢复，如果需要新的活动会话，必须从 `navigator.xr.requestSession()` 请求。

要手动结束会话，应用程序调用 `XRSession` 的 `end()` 方法。 

这将返回一个承诺，当解决时，表明该会话向 XR 硬件设备的呈现已停止。 

一旦会话结束，应用程序需要的任何持续动画都应该使用`window.requestAnimationFrame()`来完成。

```js
function endXRSession() {
  // Do we have an active session?
  if (xrSession) {
    // End the XR session now.
    xrSession.end().then(onSessionEnd);
  }
}

// Restore the page to normal after an immersive session has ended.
function onSessionEnd() {
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);

  xrSession = null;

  // Ending the session stops executing callbacks passed to the XRSession's
  // requestAnimationFrame(). To continue rendering, use the window's
  // requestAnimationFrame() function.
  window.requestAnimationFrame(onDrawFrame);
}
```

UA 可能会因各种原因随时结束会话。 

例如：用户可能会通过对 UA 的手势强制结束演示，其他原生应用可能会独占 XR 硬件设备，或者 XR 硬件设备可能与系统断开连接。 

此外，如果系统的底层 XR 设备发生变化（由 `navigator.xr` 对象上的 `devicechange` 事件发出信号），任何活动的 `XRSession` 都将结束。 

这适用于沉浸式和内联会话。 

表现良好的应用程序应监视“XRSession”上的“end”事件，以检测 UA 何时强制会话结束。

```js
xrSession.addEventListener('end', onSessionEnd);
```

如果 UA 需要暂时停止会话的使用，会话应该被暂停而不是结束。 （见上一节。）

## 内联会话 Inline sessions

在创作要以沉浸式方式查看的内容时，使用“内联”会话在 2D 浏览器窗口中查看相同的内容可能是有益的。使用内联会话使内容能够为内联和沉浸式呈现模式使用单一渲染路径。

它还可以更轻松地在内联内容和该内容的沉浸式呈现之间切换。

使用 `inline` 会话创建的 `XRWebGLLayer` 不会分配新的 WebGL 帧缓冲区，而是将 `framebuffer` 属性设置为 `null`。

这样，当“framebuffer”被绑定时，所有 WebGL 命令都会自然地针对 WebGL 上下文的默认帧缓冲区执行，并像任何其他 WebGL 内容一样显示在页面上。

当该层设置为`XRRenderState` 的`baseLayer` 时，内联会话能够将其输出呈现到页面。

```js
function beginInlineXRSession() {
  // Request an inline session in order to render to the page.
  navigator.xr.requestSession('inline')
      .then((session) => {
        // Inline sessions must have an appropriately constructed WebGL layer
        // set as the baseLayer prior to rendering. (This code assumes the WebGL
        // context has already been made XR compatible.)
        let glLayer = new XRWebGLLayer(session, gl);
        session.updateRenderState({ baseLayer: glLayer });
        onSessionStarted(session);
      })
      .catch((reason) => { console.log("requestSession failed: " + reason); });
}
```

沉浸式和内联会话可能以不同的速率运行它们的渲染循环。在沉浸式会话期间，UA 以 XR 设备的本机刷新率运行渲染循环。

在内联会话期间，UA 以页面的刷新率运行渲染循环（与 `window.requestAnimationFrame` 对齐。）`XRView` 投影和视图矩阵的计算方法在沉浸式和内联会话之间也有所不同，内联会话考虑如果可以确定，则考虑输出画布尺寸以及用户头部相对于画布的位置。

`navigator.xr.isSessionSupported()` 在检查 `"inline"` 会话的支持时将始终解析为 `true`。 

UA 不应拒绝内联会话的请求，除非页面的功能策略阻止它，或者除非必需的功能不可用，如 [功能依赖项](#feature-dependencies)) 中所述。

例如，以下用例都依赖于需要通过 `XRSessionInit` 启用的额外引用空间类型：

 - 使用手机旋转查看全景内容。

 - 在没有关联耳机的设备上利用 6DoF 跟踪，例如启用 [ARCore](https://developers.google.com/ar/) 或 [ARKit](https://developer.apple.com/arkit/)电话。 （请注意，这不提供自动相机访问或合成）

 - 利用 [zSpace](http://zspace.com/) 系统等设备的头部跟踪功能。

 沉浸式和内联会话可能以不同的速率运行它们的渲染循环。 
 
 在沉浸式会话期间，UA 以 XR 设备的本机刷新率运行渲染循环。 
 
 在内联会话期间，UA 以页面的刷新率运行渲染循环（与 `window.requestAnimationFrame` 对齐。）
 
 `XRView` 投影和视图矩阵的计算方法在沉浸式和内联会话之间也有所不同，内联会话考虑 如果可以确定，则考虑输出画布尺寸以及用户头部相对于画布的位置。

`navigator.xr.isSessionSupported()` 在检查 `"inline"` 会话的支持时将始终解析为 `true`。 

UA 不应拒绝内联会话的请求，除非页面的功能策略阻止它，或者除非必需的功能不可用，如 [功能依赖项](#feature-dependencies)) 中所述。 

例如，以下用例都依赖于需要通过 `XRSessionInit` 启用的额外引用空间类型：

- 使用手机旋转查看全景内容。

- 在没有关联耳机的设备上利用 6DoF 跟踪，例如启用 [ARCore](https://developers.google.com/ar/) 或 [ARKit](https://developer.apple.com/arkit/) 电话。 （请注意，这不提供自动相机访问或合成）

- 利用 [zSpace](http://zspace.com/) 系统等设备的头部跟踪功能。

## 高级功能

除了上述核心 API 之外，WebXR 设备 API 还公开了多个选项，以更好地利用 XR 硬件的功能。

### 功能依赖

一旦开发人员掌握了会话的创建和渲染，他们通常会对使用可能并非普遍可用的其他 WebXR 功能感兴趣。

虽然通常鼓励开发人员为渐进增强设计，但某些体验可能对不保证普遍可用的功能有要求。

例如，需要用户在大型物理空间中移动的体验（例如导览）在 Oculus Go 上无法运行，因为它无法提供 [`无界` 参考空间](spatial-tracking-explainer. md#unbounded-reference-space）。

如果一个体验在没有特定功能的情况下完全无法使用，那么初始化底层 XR 平台并创建一个会话只是为了立即通知用户它不会工作，这将是一个糟糕的用户体验。

功能不可用的原因有很多，其中一个事实是并非所有支持 WebXR 的设备都能支持全套功能。

另一个考虑是某些功能会暴露[敏感信息](privacy-security-explainer.md#sensitive-information)，这可能需要在运行之前明确表明[用户意图](privacy-security-explainer.md#user-intent) .

任何需要通过 [明确同意](privacy-security-explainer.md#explicit-consent) 提供此信号的功能都必须在创建会话之前请求此同意。

这确保了所有硬件形式因素的一致体验，无论 UA 是否有 [可信沉浸式 UI](privacy-security-explainer.md#trusted-immersive-ui) 可用。

WebXR 允许请求以下功能：

*`本地`

*`本地楼层`

* `有界地板`

*`无界`

此列表目前仅限于参考空间类型的子集，但将来会扩展以包括其他功能。

正在讨论的一些潜在的未来功能将成为此列表的候选者：眼动追踪、平面检测、地理对齐等。


开发人员通过将它们归类为可以传递给 xr.requestSession() 的 `XRSessionInit` 中的以下序列之一来传达他们的功能需求：

* **`requiredFeatures`** 此功能必须可用，体验才能正常运行。

如果需要[明确同意](privacy-security-explainer.md#explicit-consent)，会提示用户响应`xr.requestSession()`。如果该功能对 XR 设备不可用，如果 UA 确定用户不希望启用该功能，或者如果 UA 无法识别正在请求的功能，则会话创建将被拒绝。

* **`optionalFeatures`** 体验想在整个会话中使用此功能，但没有它也能正常工作。

同样，如果 [明确同意](privacy-security-explainer.md#explicit-consent) 是必要的，用户将被提示响应 `xr.requestSession()`。

但是，无论功能的硬件支持或用户意图如何，会话创建都会成功。开发人员不得假设会话中提供可选功能并检查尝试使用它们的结果。

（注意：`xr.isSessionSupported()` 不接受 `XRSessionInit` 参数并且提供一个将没有效果）

以下示例代码表示仓库规模体验的可能行为。它取决于有一个 [`unbounded` 参考空间](spatial-tracking-explainer.md#unbounded-reference-space)，如果不可用，将拒绝创建会话。


```js
function onEnterXRClick() {
  navigator.xr.requestSession('immersive-vr', {
    requiredFeatures: [ 'unbounded' ]
  })
  .then(onSessionStarted)
  .catch(() => {
    // Display message to the user explaining that the experience could not
    // be started.
  });
}
```

以下示例代码显示了一种内联体验，如果可用，它更愿意使用运动跟踪，但如果没有，则将回退到使用触摸/鼠标输入。


```js
navigator.xr.requestSession('inline', {
  optionalFeatures: [ 'local' ]
})
.then(onSessionStarted);

function onSessionStarted(session) {
  session.requestReferenceSpace('local')
  .then(onLocalReferenceSpaceCreated)
  .catch(() => {
    session.requestReferenceSpace('viewer').then(onViewerReferenceSpaceCreated);
  });
}
```

默认情况下，将为会话启用 UA 识别但未在这些数组中明确列出的某些功能。 

仅当该功能不需要 [用户意图](privacy-security-explainer.md#user-intent) 信号或启用时不影响性能或其他功能的行为时，才会这样做。 

此时，默认情况下只会启用以下功能：

| Feature | Circumstances |
| ------ | ------- |
| `viewer` | Requested `XRSessionMode` is `inline` or`immersive-vr`|
| `local` | Requested `XRSessionMode` is `immersive-vr`|

## 通过 WebGL 控制渲染质量

在沉浸式会话中，UA 负责提供一个帧缓冲区，该缓冲区已正确优化以呈现给每个“XRFrame”中的“XRSession”。

开发人员可以选择请求缩放帧缓冲区大小，但 UA 可能不尊重该请求。即使 UA 接受扩展请求，结果也不能保证是请求的确切百分比。

帧缓冲区缩放是通过在“XRWebGLLayer”创建时指定“framebufferScaleFactor”来完成的。

每个 XR 设备都有一个默认的帧缓冲区大小，它对应于“1.0”的“framebufferScaleFactor”。

此默认大小由 UA 确定，应代表渲染质量和性能之间的合理平衡。它可能不是设备的“本机”大小（即，在最高放大倍数时与本机屏幕分辨率 1:1 匹配的缓冲区）。

例如，GearVR 或 Daydream 等移动平台经常建议使用低于其屏幕能够确保一致性能的分辨率。

如果 `framebufferScaleFactor` 设置为大于或小于 `1.0` 的数字，UA 应该创建一个帧缓冲区，该帧缓冲区是默认分辨率乘以给定的比例因子。

因此，一个 0.5 的 framebufferScaleFactor 将指定一个具有 50% 的默认高度和宽度的帧缓冲区，依此类推。 

UA 可以在它认为合适的情况下限制比例因子，或者可以根据需要将其四舍五入到所需的增量（例如，如果已知可以提高性能，则将缓冲区尺寸拟合为 2 的幂。）

```js
function setupWebGLLayer() {
  return gl.makeXRCompatible().then(() => {
    // Create a WebGL layer with a slightly lower than default resolution.
    let glLayer = new XRWebGLLayer(xrSession, gl, { framebufferScaleFactor: 0.8 });
    xrSession.updateRenderState({ baseLayer: glLayer });
  });
```

在某些情况下，开发人员可能希望确保他们的应用程序以设备的“本机”大小呈现。 

为此，开发人员可以使用 `XRWebGLLayer.getNativeFramebufferScaleFactor()` 函数查询在图层创建过程中应该传递的比例因子。 

（请注意，在某些情况下，如果系统配置为默认渲染“超缩放”，则原生比例实际上可能小于推荐的“1.0”比例。）

```js
function setupNativeScaleWebGLLayer() {
  return gl.makeXRCompatible().then(() => {
    // Create a WebGL layer that matches the device's native resolution.
    let nativeScaleFactor = XRWebGLLayer.getNativeFramebufferScaleFactor(xrSession);
    let glLayer = new XRWebGLLayer(xrSession, gl, { framebufferScaleFactor: nativeScaleFactor });
    xrSession.updateRenderState({ baseLayer: glLayer });
  });
```

应谨慎使用此技术，因为某些耳机的原始分辨率可能高于系统在不使用注视点渲染等其他技术的情况下以稳定帧速率渲染的能力。 

另请注意，如果认为有必要保持可接受的性能，则允许 UA 的比例钳制以防止分配原始分辨率帧缓冲区。

帧缓冲区缩放通常每个会话配置一次，但可以在会话期间通过创建新的“XRWebGLLayer”并更新渲染状态以将其应用于下一帧来更改：

```js
function rescaleWebGLLayer(scale) {
    let glLayer = new XRWebGLLayer(xrSession, gl, { framebufferScaleFactor: scale });
    xrSession.updateRenderState({ baseLayer: glLayer });
  });
```

重新调整帧缓冲区可能涉及重新分配渲染缓冲区，并且应该很少进行，例如在从游戏模式转换到文本繁重的菜单模式或类似模式时。 

如果您的应用程序需要更频繁的调整，请参阅 [动态视口缩放](#dynamic-viewport-scaling) 以获取替代方法。

## 动态视口缩放

动态视口缩放允许应用程序仅使用可用帧缓冲区的子集。 

这用于细粒度的性能调整，其中所需的渲染分辨率经常变化，并且可以逐帧调整。 

一个典型的用例是渲染具有高度可变复杂性的场景，例如，用户可能会移动他们的视点以仔细检查具有复杂着色器的模型。 

（如果应用程序希望在会话中保持此常量，则应改用 `framebufferScaleFactor`，请参阅 [控制渲染质量](#controlling-rendering-quality)。）

这是应用程序的一个选择加入功能，它通过在“XRView”上调用“requestViewportScale(scale)”来激活，然后调用“getViewport()”来应用更改并返回更新的视口：

```js
for (let view of pose.views) {
  view.requestViewportScale(scale);
  let viewport = glLayer.getViewport(view);
  gl.viewport(viewport.x, viewport.y, viewport.width, viewport.height);
  drawScene(view);
}
```

注意：动态视口缩放是最近添加到 WebXR 的，并且实现可能还没有提供 API。为了兼容性，请考虑添加“if (view.requestViewportScale)”检查以确保 API 存在。

该功能可能并非在所有系统上都可用，因为它取决于驱动程序支持。如果不受支持，系统将忽略请求的比例并继续使用全尺寸视口。如有必要，应用程序可以在动画帧之间比较 `getViewport()` 返回的大小，以确认该功能是否处于活动状态，例如，它是否希望使用替代性能调整方法，例如降低场景复杂性作为后备。

为了一致性，任何给定视图的 `getViewport()` 结果在动画帧的持续时间内总是固定的。

如果在第一次调用 getViewport() 之前使用了 requestViewportScale() ，则更改会立即应用于当前动画帧。否则，更改将推迟到在未来的动画帧中再次调用 `getViewport()`。

用户代理可以选择在“XRView”上提供“recommendedViewportScale”属性，并根据内部性能启发提供建议值。

如果用户代理不提供推荐，则此属性为 null。 

`requestViewportScale(null)` 调用无效，因此应用程序可以使用以下代码来应用启发式仅当它存在时：

```js
  view.requestViewportScale(view.recommendedViewportScale);
```

或者，应用程序可以修改推荐的比例，即将其限制为最小比例以避免文本变得不可读，或者使用基于当前可见场景复杂度和最近平均帧率等数据的启发式方法。

## 控制深度精度

`XRView`s 给出的投影矩阵不仅考虑了演示媒体的视野，还考虑了场景的深度范围，定义为近平面和远平面。渲染得比近平面更近或比远平面更远的 WebGL 片段将被丢弃。

默认情况下，近平面距离用户视点 0.1 米，远平面距离用户视点 1000 米。

某些场景可能会受益于更改该范围以更好地适应场景的内容。例如，如果一个场景中的所有可见内容预计都保持在用户视点的 100 米以内，并且所有内容预计出现在至少 1 米远的地方，那么将近平面和远平面的范围缩小到`[1 , 100]` 将导致更准确的深度精度。

这减少了 z 冲突（或混叠）的发生，这是一种在渲染紧密重叠的表面时表现为闪烁、移动模式的伪影。

相反，如果可见场景延伸很长的距离，您需要将远平面设置得足够远以覆盖整个可见范围以防止剪裁，权衡是进一步的绘制距离会增加 z 格斗伪影的发生。

最佳做法是始终将近平面和远平面设置在内容允许的范围内。

要调整近平面和远平面距离，可以在调用 `updateRenderState()` 时以米为单位给出 `depthNear` 和 `depthFar` 值。

```js
// This reduces the depth range of the scene to [1, 100] meters.
// The change will take effect on the next XRSession requestAnimationFrame callback.
xrSession.updateRenderState({
  depthNear: 1.0,
  depthFar: 100.0,
});
```

### 防止合成器使用深度缓冲区

默认情况下，`XRWebGLLayer` 的 `framebuffer` 的深度附件（如果存在）可用于辅助 XR 合成器。

例如，场景的深度值可以被高级重投影技术使用，或者在渲染平台/UA 界面时帮助避免深度冲突。当然，这假设深度缓冲区中的值代表场景内容。

某些应用程序可能会违反该假设，例如在使用某些延迟渲染技术或渲染立体视频时。

在这些情况下，如果合成器使用深度缓冲区的值，则可能会导致令人反感的伪像。为了避免这种情况，可以通过在图层创建时将 `ignoreDepthValues` 选项设置为 `true` 来指示合成器忽略 `XRWebGLLayer` 的深度值：

```js
let webglLayer = new XRWebGLLayer(xrSession, gl, { ignoreDepthValues: true });
```

如果 `ignoreDepthValues` 未设置为 `true`，则 UA 被允许（但不是必需）使用它认为合适的深度缓冲区。

因此，以这种方式禁止合成器访问深度缓冲区可能会导致某些平台或 UA 功能不可用或不那么健壮。

要检测合成器是否正在使用深度缓冲区，请在创建图层后检查“XRWebGLLayer”的“ignoreDepthValues”属性。 

“true”的值表示即使在图层创建期间将“ignoreDepthValues”设置为“false”，合成器也不会使用深度缓冲区。

## 更改内联会话的视野

只要有可能，`XRView` 的 `projectionMatrix` 属性给出的矩阵应该利用物理属性，例如头显光学器件或相机镜头，来确定要使用的视野。

 然而，大多数内嵌内容没有任何基于物理的值来推断视野。 
 
 为了为内嵌内容提供统一的渲染管道，必须选择任意视野。

默认情况下，内联会话使用 0.5π 弧度（90 度）的垂直视野。 

水平视野可以根据“XRWebGLLayer”相关画布的宽/高比从垂直视野中计算出来。

如果需要不同的默认视野，可以通过将新的“inlineVerticalFieldOfView”值（以弧度为单位）传递给“updateRenderState”方法来指定：

```js
// This changes the default vertical field of view for an inline session to
// 0.4 pi radians (72 degrees).
xrSession.updateRenderState({
  inlineVerticalFieldOfView: 0.4 * Math.PI,
});
```

允许 UA 限制该值，并且如果基于物理的视野可用，则必须始终使用它来支持默认值。

尝试在沉浸式会话中设置 `inlineVerticalFieldOfView` 值将导致 `updateRenderState()` 抛出 `InvalidStateError`。 `XRRenderState.inlineVerticalFieldOfView` 在沉浸式会话中必须返回 `null`。


# 附录 A：我不明白为什么这是一个新 API。为什么我们不能使用...

## `DeviceOrientation` 事件

`XRViewerPose` 实例提供的数据与非标准的 `DeviceOrientationEvent` 提供的数据类似，但有一些关键区别：

* 它是一个显式轮询接口，可确保每帧都有新的输入可用。事件驱动的“DeviceOrientation”数据可能会跳过一帧，或者可能会在单个帧中提供两次更新，这可能会导致 XR 应用程序中出现破坏性的抖动运动。
* `DeviceOrientation` 事件不提供位置数据，这是高端 XR 硬件的一个关键特性。
* 可以对 XR 设备数据的预期用例进行更多假设，因此可以应用运动预测等优化。
* `DeviceOrientation` 事件通常在桌面上不可用。

应该注意的是，`DeviceOrientation` 事件尚未标准化，浏览器之间存在行为差异，并且正在努力更改或删除 API。这使得开发人员难以依赖于需要准确跟踪以防止用户不适的用例。

`DeviceOrientation` 事件规范被 [Orientation Sensor](https://w3c.github.io/orientation-sensor/) 规范取代，
该规范定义了 [`RelativeOrientationSensor`](https://w3c.github.io/orientation-sensor/#relativeorientationsensor) 和 [`AbsoluteOrientationSensor`](https://w3c.github.io/orientation-sensor/#absoluteorientationsensor) 接口。这个下一代 API 是专门为 WebXR Device API polyfill 构建的。

它以 WebGL 兼容格式（四元数、旋转矩阵）表示方向数据，满足更严格的延迟要求，并通过明确定义哪些 [低级运动传感器](https://w3c. github.io/motion-sensors/#fusion-sensors) 用于获取方向数据。

## WebSockets

可以设置本地 [WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API) 服务以将耳机姿势中继到浏览器。

一些使用浏览器的早期 VR 实验尝试了这条路线，一些跟踪设备（最著名的是 [Leap Motion](https://www.leapmotion.com/)）围绕这个概念构建了他们的 JavaScript SDK。

不幸的是，这已被证明是一条高延迟路线。良好 XR 体验的一个关键要素是低延迟。对于头戴式显示器，理想情况下，您的头部运动应在 20 毫秒或更短的时间内导致设备更新（称为“运动到光子时间”）。

浏览器的渲染管道已经使实现这一目标变得困难，而为通过 WebSockets 进行的通信增加更多开销只会夸大问题。

此外，使用这种方法需要用户在他们的机器上安装一个单独的服务，可能是一个本地应用程序，这会侵蚀通过浏览器访问硬件的大部分好处。

它也适用于移动设备，因为用户没有明确的方法来安装此类服务。

## 游戏手柄 API

有人建议我们尝试通过 [Gamepad API](https://w3c.github.io/gamepad/) 公开 XR 数据，这似乎应该通过无限数量的潜在轴提供足够的灵活性。

虽然在技术上是可行的，但 API 的一些属性目前使其不太适合这种用途。

* 轴被规范化以始终报告 `[-1, 1]` 范围内的数据。这对于方向报告可能足够有效，但是在报告位置或加速度时，您必须选择规范化范围到物理范围的任意映射（即“1.0”等于 2 米或类似值）。然而，这迫使开发人员对未来 XR 硬件的功能做出假设，并且映射导致对数据的解释容易出错且不直观。

* 轴没有与任何给定的输入明确关联，这让用户很难记住轴“0”是否是设备位置、方向、加速度等的组成部分。

* XR 设备功能可能存在显着差异，并且 Gamepad API 当前未提供一种方式来传达设备的功能及其光学特性。

* 在描述 XR 耳机及其外围设备时，按钮等游戏手柄功能没有明确的含义。

通过添加“pose”属性和一些其他相关属性，通过 Gamepad API 公开运动感应控制器的相关工作。尽管这些添加将使 API 更适合耳机，但我们认为开发人员最好将关注点分离，以便可以合理地假设由 Gamepad API 公开的设备与由 WebXR 设备 API 公开的设备类似游戏手柄可以合理地假设为类似耳机。

## 这些替代方案不考虑演示

重要的是要意识到所有替代解决方案都没有提供在耳机本身上显示图像的方法，除了类似 Cardboard 的设备，您可以简单地渲染全屏拆分视图。

即便如此，这并没有考虑如何传达准确图像所需的投影或失真。

如果没有可靠的呈现方法，从耳机查询输入的能力就会变得不那么有价值。

## 与 WebVR 有什么关系？

可以理解，WebXR 和某些浏览器过去在不同时间点实现的称为 WebVR 的 API 之间存在一些混淆。

两者都处理与虚拟现实硬件的通信，并且名称非常相似。

那么这两个API有什么区别呢？

**WebVR** 是在当前这一代虚拟现实硬件/软件的早期开发的 API，大约在 Oculus DK2 发布时开始。

原生 VR API 仍处于形成阶段，商业设备的能力仍在确定中。因此，WebVR API 围绕一些长期不成立的假设而开发。

例如，API 假设应用程序总是需要渲染场景的单个左眼和右眼视图，眼睛之间的分离只涉及平移而不涉及旋转，并且只需要一个规范的跟踪空间来支持。

此外，API 设计使得与更新的设备类型（如移动 AR）向前兼容变得困难，以至于它可能需要一个单独的 API。 WebVR 还对与 Web 平台其余部分的集成做出了一些有问题的决定，特别是在它如何与 WebGL 和 Gamepad API 交互方面。

尽管如此，它在短期内运作良好，以至于一些 UA，尤其是那些专门为 VR 设备提供的用户，决定将 API 提供给他们的用户。

与此同时，开发 WebVR 的团队认识到了初始 API 的问题，部分是通过开发人员和标准机构的反馈，并致力于解决这些问题。

最终他们认识到，为了创建更具可扩展性和更符合人体工程学的 API，他们必须打破与 WebVR 的向后兼容性。这个 API 的新版本一度被称为 WebVR 2.0，但最终正式更名为 **WebXR**，以承认新 API 将同时支持 VR 和 AR 内容。

WebXR 的开发不仅受益于该集团在 WebVR 方面的经验，还受益于更成熟的沉浸式计算设备格局，现在包括多个商用耳机、移动和耳机 AR 的出现以及多个成熟的原生 API。

WebXR 旨在在未来几年完全取代 WebVR。一旦 API 设计完成，最初发布 WebVR 的所有浏览器都承诺在其位置发布 WebXR。

同时，开发人员可以针对 WebXR 进行编码，依靠 [WebXR Polyfill](https://github.com/immersive-web/webxr-polyfill) 来确保他们的代码在只有 WebVR 实现的浏览器中运行。

# Appendix B: Proposed IDL

```webidl
//
// Navigator
//

partial interface Navigator {
  readonly attribute XR xr;
};

dictionary XRSessionInit {
  sequence<DOMString> requiredFeatures;
  sequence<DOMString> optionalFeatures;
}

[SecureContext, Exposed=Window] interface XR : EventTarget {
  attribute EventHandler ondevicechange;
  Promise<boolean> isSessionSupported(XRSessionMode mode);
  Promise<XRSession> requestSession(XRSessionMode mode, optional XRSessionInit);
};

//
// Session
//

enum XRSessionMode {
  "inline",
  "immersive-vr"
}

[SecureContext, Exposed=Window] interface XRSession : EventTarget {
  readonly attribute XRRenderState renderState;

  attribute EventHandler onblur;
  attribute EventHandler onfocus;
  attribute EventHandler onend;

  void updateRenderState(optional XRRenderStateInit state);

  long requestAnimationFrame(XRFrameRequestCallback callback);
  void cancelAnimationFrame(long handle);

  Promise<void> end();
};

// Timestamp is passed as part of the callback to make the signature compatible
// with the window's FrameRequestCallback.
callback XRFrameRequestCallback = void (DOMHighResTimeStamp time, XRFrame frame);

dictionary XRRenderStateInit {
  double depthNear;
  double depthFar;
  double inlineVerticalFieldOfView;
  XRWebGLLayer? baseLayer;
};

[SecureContext, Exposed=Window] interface XRRenderState {
  readonly attribute double depthNear;
  readonly attribute double depthFar;
  readonly attribute double? inlineVerticalFieldOfView;
  readonly attribute XRWebGLLayer? baseLayer;
};

//
// Frame, Device Pose, and Views
//

[SecureContext, Exposed=Window] interface XRFrame {
  readonly attribute XRSession session;

  XRViewerPose? getViewerPose(XRReferenceSpace referenceSpace);
};

enum XREye {
  "none",
  "left",
  "right"
};

[SecureContext, Exposed=Window] interface XRView {
  readonly attribute XREye eye;
  readonly attribute Float32Array projectionMatrix;
  readonly attribute XRRigidTransform transform;
};

[SecureContext, Exposed=Window] interface XRViewerPose : XRPose {
  readonly attribute FrozenArray<XRView> views;
};

[SecureContext, Exposed=Window] interface XRViewport {
  readonly attribute long x;
  readonly attribute long y;
  readonly attribute long width;
  readonly attribute long height;
};

//
// Layers
//

dictionary XRWebGLLayerInit {
  boolean antialias = true;
  boolean depth = true;
  boolean stencil = false;
  boolean alpha = true;
  boolean ignoreDepthValues = false;
  double framebufferScaleFactor = 1.0;
};

typedef (WebGLRenderingContext or
         WebGL2RenderingContext) XRWebGLRenderingContext;

[SecureContext, Exposed=Window,
 Constructor(XRSession session,
             XRWebGLRenderingContext context,
             optional XRWebGLLayerInit layerInit)]
interface XRWebGLLayer {
  readonly attribute boolean antialias;
  readonly attribute boolean ignoreDepthValues;

  readonly attribute unsigned long framebufferWidth;
  readonly attribute unsigned long framebufferHeight;
  readonly attribute WebGLFramebuffer framebuffer;

  XRViewport? getViewport(XRView view);

  static double getNativeFramebufferScaleFactor(XRSession session);
};

//
// Events
//

[SecureContext, Exposed=Window, Constructor(DOMString type, XRSessionEventInit eventInitDict)]
interface XRSessionEvent : Event {
  readonly attribute XRSession session;
};

dictionary XRSessionEventInit : EventInit {
  required XRSession session;
};

//
// WebGL
//
partial dictionary WebGLContextAttributes {
    boolean xrCompatible = false;
};

partial interface WebGLRenderingContextBase {
    [NewObject] Promise<void> makeXRCompatible();
};
```

# 参考资料

https://github.com/immersive-web/webxr/blob/master/explainer.md

* any list
{:toc}