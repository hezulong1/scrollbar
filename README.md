# ui-scrollbar

一款基于 [gemini-scrollbar](https://github.com/noeldelgado/gemini-scrollbar) 的虚拟滚动条。

## 新特性

- 兼容横向滚动（shirt 键触发）

- 滚动条处可触发滚动

## 注意

- `.view` 滚动视图尽量不设置没边框，无内外边距

- 容器或者容器父级需要设定一个高度，即 `dom.style.height 不可为空`

- `.thumb` 不要对其添加 `width` 和 `height` 的 `transition`

## 使用

- esm:

```javascript
import Scrollbar from 'ui-scrollbar';

new Scrollbar(options)
```

- browser:

```html
<script src="your/path/ui.scrollbar.min.js"></script>

<script>
// 全局注入 UiScrollbar
new UiScrollbar(options)
</script>
```

## Options  

| 名称 | 类型 | 说明 | 默认值 |
| ---- | :--- | :--- | :--- |
| `element` | `HTMLElement` | 宿主，必填 | `null` |
| `horizontal` | `Boolean` | 水平滚动 | `false` |
| `minThumbSize` | `Number` | 最小滚动滑块宽度 | `20` |
| `forceRenderTrack` | `Boolean` | 强制渲染滚动条 | 默认情况当原始滚动条宽度为 `0`，不渲染虚拟滚动条 |
| `useRender` | `Boolean` | 启用渲染模式，默认打开渲染默认，关闭需要手动渲染 | `false` |
| `useResize` | `Boolean` | 启用监听模式，默认值根据滚动条宽度是否大于 `0` | `true` |
| `useShadow` | `Boolean` | 启用阴影模式，即当滚动条不在最上方或者最右侧则顶部或者右侧出现阴影效果，默认关闭 | `false` |

## Hooks

| 名称 | 说明 | 参数 |
| :--- | :--- | :--- |
| `beforeCreate` | 渲染滚动条之前 | |
| `created` | 渲染滚动条之后 | |
| `beforeDestroy` | 销毁滚动条之前 | |
| `destroyed` | 销毁滚动条之后 | |
| `onResize` | 发生宽高变化时 | |
| `onScroll` | 发生滚动时 | (`x`, `y`) |
| `onUpdate` | 发生宽高变化时，与 onResize 类似，却别在于它会在虚拟滚动条滚动之前调用，用于重新计算偏差 | |

## 与原版区别

todo

## 支持老版本浏览器

测试中支持到 `IE9+`，如果你需要再次降级，那么这些点需要满足。

- js 中：

1. `Function.prototype.bind` 方法

2. `[].forEach` 方法

3. `[NODE].addEventListener` 方法

4. `[NODE].querySelector` 方法

- css 中：

1. `calc()` 函数

2. `transform` 属性

其他属性不影响使用功能
