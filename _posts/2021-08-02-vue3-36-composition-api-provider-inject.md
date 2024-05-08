---
layout: post
title: VUE3-36-组合式 API 提供/注入
date: 2021-08-02 21:01:55 +0800
categories: [VUE]
tags: [vue, vue3, vue-learn, vue3-learn, sh]
published: true
---

# 提供/注入

我们也可以在组合式 API 中使用 provide/inject。两者都只能在当前活动实例的 setup() 期间调用。

# 设想场景

假设我们要重写以下代码，其中包含一个 MyMap 组件，该组件使用组合式 API 为 MyMarker 组件提供用户的位置。

```js
<!-- src/components/MyMap.vue -->
<template>
  <MyMarker />
</template>

<script>
import MyMarker from './MyMarker.vue'

export default {
  components: {
    MyMarker
  },
  provide: {
    location: 'North Pole',
    geolocation: {
      longitude: 90,
      latitude: 135
    }
  }
}
</script>
```

```js
<!-- src/components/MyMarker.vue -->
<script>
export default {
  inject: ['location', 'geolocation']
}
</script>
```

# 使用 Provide

在 setup() 中使用 provide 时，我们首先从 vue 显式导入 provide 方法。

这使我们能够调用 provide 时来定义每个 property。

provide 函数允许你通过两个参数定义 property：

1. property 的 name (`<String>` 类型)

2. property 的 value

使用 MyMap 组件，我们提供的值可以按如下方式重构：

```js
<!-- src/components/MyMap.vue -->
<template>
  <MyMarker />
</template>

<script>
import { provide } from 'vue'
import MyMarker from './MyMarker.vue

export default {
  components: {
    MyMarker
  },
  setup() {
    provide('location', 'North Pole')
    provide('geolocation', {
      longitude: 90,
      latitude: 135
    })
  }
}
</script>
```

# 使用注入

在 setup() 中使用 inject 时，还需要从 vue 显式导入它。

一旦我们这样做了，我们就可以调用它来定义如何将它暴露给我们的组件。

inject 函数有两个参数：

1. 要注入的 property 的名称

2. 一个默认的值 (可选)

使用 MyMarker 组件，可以使用以下代码对其进行重构：

```js
<!-- src/components/MyMarker.vue -->
<script>
import { inject } from 'vue'

export default {
  setup() {
    const userLocation = inject('location', 'The Universe')
    const userGeolocation = inject('geolocation')

    return {
      userLocation,
      userGeolocation
    }
  }
}
</script>
```

# 响应性

## 添加响应性

为了增加提供值和注入值之间的响应性，我们可以在提供值时使用 ref 或 reactive。

使用 MyMap 组件，我们的代码可以更新如下：

```js
<!-- src/components/MyMap.vue -->
<template>
  <MyMarker />
</template>

<script>
import { provide, reactive, ref } from 'vue'
import MyMarker from './MyMarker.vue

export default {
  components: {
    MyMarker
  },
  setup() {
    const location = ref('North Pole')
    const geolocation = reactive({
      longitude: 90,
      latitude: 135
    })

    provide('location', location)
    provide('geolocation', geolocation)
  }
}
</script>
```

现在，如果这两个 property 中有任何更改，MyMarker 组件也将自动更新！

## 修改响应式 property

当使用响应式提供/注入值时，建议尽可能，在提供者内保持响应式 property 的任何更改。

例如，在需要更改用户位置的情况下，我们最好在 MyMap 组件中执行此操作。

```js
<!-- src/components/MyMap.vue -->
<template>
  <MyMarker />
</template>

<script>
import { provide, reactive, ref } from 'vue'
import MyMarker from './MyMarker.vue

export default {
  components: {
    MyMarker
  },
  setup() {
    const location = ref('North Pole')
    const geolocation = reactive({
      longitude: 90,
      latitude: 135
    })

    provide('location', location)
    provide('geolocation', geolocation)

    return {
      location
    }
  },
  methods: {
    updateLocation() {
      this.location = 'South Pole'
    }
  }
}
</script>
```

然而，有时我们需要在注入数据的组件内部更新注入的数据。在这种情况下，我们建议提供一个方法来负责改变响应式 property。

```js
<!-- src/components/MyMap.vue -->
<template>
  <MyMarker />
</template>

<script>
import { provide, reactive, ref } from 'vue'
import MyMarker from './MyMarker.vue

export default {
  components: {
    MyMarker
  },
  setup() {
    const location = ref('North Pole')
    const geolocation = reactive({
      longitude: 90,
      latitude: 135
    })

    const updateLocation = () => {
      location.value = 'South Pole'
    }

    provide('location', location)
    provide('geolocation', geolocation)
    provide('updateLocation', updateLocation)
  }
}
</script>
```

```js
<!-- src/components/MyMarker.vue -->
<script>
import { inject } from 'vue'

export default {
  setup() {
    const userLocation = inject('location', 'The Universe')
    const userGeolocation = inject('geolocation')
    const updateUserLocation = inject('updateLocation')

    return {
      userLocation,
      userGeolocation,
      updateUserLocation
    }
  }
}
</script>
```

最后，如果要确保通过 provide 传递的数据不会被注入的组件更改，我们建议对提供者的 property 使用 readonly。

```js
<!-- src/components/MyMap.vue -->
<template>
  <MyMarker />
</template>

<script>
import { provide, reactive, readonly, ref } from 'vue'
import MyMarker from './MyMarker.vue

export default {
  components: {
    MyMarker
  },
  setup() {
    const location = ref('North Pole')
    const geolocation = reactive({
      longitude: 90,
      latitude: 135
    })

    const updateLocation = () => {
      location.value = 'South Pole'
    }

    provide('location', readonly(location))
    provide('geolocation', readonly(geolocation))
    provide('updateLocation', updateLocation)
  }
}
</script>
```

# 参考资料

https://vue3js.cn/docs/zh/guide/composition-api-provide-inject.html

* any list
{:toc}